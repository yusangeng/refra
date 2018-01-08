/**
 * 简单版Mobx
 *
 * @author Y3G
 */

import check from 'param-check'
import clone from 'clone'
import fastDeepEqual from 'fast-deep-equal'
import Logger from 'chivy'
import mapValues from 'lodash/mapValues'
import isFunction from 'lodash/isFunction'
import isString from 'lodash/isString'
import mix from '../mix'
import Eventable from './Eventable'

const { keys, defineProperties, assign } = Object
const log = new Logger('litchy/Reactive')

function nope () {}

let spyingObserved = false
let spyingName = nope
let runningGetterName = nope
let foundObserved = []

function updateObserved (name) {
  if (spyingObserved &&
    spyingName !== name &&
    runningGetterName === spyingName &&
    !foundObserved.find(el => el === name)) {
    foundObserved.push(name)
  }
}

function inv (fn, that, ...params) {
  if (fn) {
    return fn.apply(that, params || [])
  }
}

function Reactive (superclass) {
  return class extends mix(superclass).with(Eventable) {
    get batchMode () {
      inv(this.assertUndisposed, this, 'batchMode getter')
      return this.batchMode_
    }

    constructor (...params) {
      super(...params)

      this.reactiveProps_ = {}
      this.reactions_ = []
      this.pendingChanges_ = []
      this.batchMode_ = false
    }

    dispose () {
      this.propChangesForReactionListenrOff_()
      this.propChangesForReactionListenrOff_ = null
      this.pendingChanges_ = []
      this.reactiveProps_ = {}
      this.equal_ = null

      inv(super.dispose, this)
    }

    initReactive ({props = {}, computed = {}, reactions = [], equal = fastDeepEqual}) {
      check(props, 'props').isObject()
      check(reactions, 'reactions').isArray()
      check(equal, 'equal').isFunction()
      inv(this.assertUndisposed, this, 'initReactive')

      if (this.equal_) {
        throw new Error('initReactive should ONLY be invoked once.')
      }

      this.equal_ = equal
      this.defineProps(props)
      this.defineComputedProps(computed)
      this.defineReactions(reactions)

      return this
    }

    startBatch () {
      inv(this.assertUndisposed, this, 'startBatch')
      this.batchMode_ = true
      return this
    }

    endBatch () {
      inv(this.assertUndisposed, this, 'endBatch')
      this.batchMode_ = false
      this.doTriggerChanges()

      return this
    }

    getPropValue (name) {
      check(name, 'name').isString()
      inv(this.assertUndisposed, this, 'getPropValue')

      const prop = this.reactiveProps_[name]

      if (!prop) {
        throw new Error(`Bad prop name: ${name}.`)
      }

      updateObserved(name)

      if (prop.getter) {
        return this.runGetter(name, prop.getter)
      }

      return clone(prop.value)
    }

    getPropValues () {
      inv(this.assertUndisposed, this, 'getPropValues')
      return mapValues(this.reactiveProps_, (_, key) => this.getPropValue(key))
    }

    setPropValue (name, value) {
      check(name, 'name').isString()
      inv(this.assertUndisposed, this, 'setPropValue')

      const prop = this.reactiveProps_[name]
      if (!prop) {
        throw new Error(`Bad prop name: ${name}.`)
      }

      if (prop.getter) {
        throw new Error(`Prop ${name} is a computed prop, witch should NOT be setted by setPropValue().`)
      }

      const former = this.getPropValue(name)
      if (this.equal_(value, former)) return this

      this.reactiveProps_[name].value = clone(value)
      this.addPendingPropChange(name, value, former)

      if (!this.batchMode) {
        this.doTriggerChanges()
      }

      return this
    }

    setPropValues (map) {
      check(map, 'map').isObject()
      inv(this.assertUndisposed, this, 'setPropValues')

      keys(map).forEach(key => this.setPropValue(key, map[key]))
      return this
    }

    get (name) {
      check(name, 'name').or(
        check.policy.isString().got('length').gt(0),
        check.policy.isUndefined())
      inv(this.assertUndisposed, this, 'get')

      if (!name) {
        // 没有参数 => getPropValues
        return this.getPropValues()
      }

      return this.getPropValue(name)
    }

    set (nameOrMap, value) {
      check(nameOrMap, 'nameOrMap').is('object', 'string')
      inv(this.assertUndisposed, this, 'set')

      if (isString(nameOrMap)) {
        return this.setPropValue(nameOrMap, value)
      }

      return this.setPropValues(nameOrMap)
    }

    has (name) {
      check(name, 'name').isString()
      inv(this.assertUndisposed, this, 'hasProp')

      return this.reactiveProps_.hasOwnProperty(name)
    }

    // private

    addPendingPropChange (name, value, former) {
      const pending = this.pendingChanges_

      if (!pending.find(el => el.name === name)) {
        pending.push({name: name, value: value, former: former})
      }

      this.addPendingComputedPropChange(name, value, former)

      return this
    }

    addPendingComputedPropChange (name, value, former) {
      const {reactiveProps_: props} = this
      keys(props).filter(key => {
        return props[key].getter && props[key].observing.includes(name)
      }).forEach(key => {
        // 对于computed属性, 只发出change事件即可, 避免冗余计算
        log.debug(`Triggering computed prop change event: ${name} -> ${key}`)
        this.addPendingPropChange(key)
      })

      return this
    }

    doTriggerChanges () {
      const pending = this.pendingChanges_

      pending.forEach(el => {
        this.trigger(assign({type: 'prop-change'}, el))
        this.trigger(assign({type: `prop-change:${el.name}`}, el))
      })

      this.trigger({type: 'prop-changes', changes: pending})
      this.pendingChanges_ = []

      return this
    }

    defineProps (props) {
      const names = keys(props)
      defineProperties(this, names.reduce((prev, name) => {
        return assign({}, prev, {
          [`${name}`]: {
            enumerable: true,
            get: this.getPropValue.bind(this, name),
            set: this.setPropValue.bind(this, name)
          }
        })
      }, {}))

      names.forEach(name => this.initProp(name, props[name]))
      return this
    }

    defineComputedProps (props) {
      const names = keys(props)
      defineProperties(this, names.reduce((prev, name) => {
        return assign({}, prev, {
          [`${name}`]: {
            enumerable: true,
            get: this.getPropValue.bind(this, name),
            set: this.setPropValue.bind(this, name)
          }
        })
      }, {}))

      names.forEach(name => this.initComputedProp(name, props[name]))
      return this
    }

    initProp (name, def) {
      check(name, 'name').isString().got('length').gt(0)

      this.reactiveProps_[name] = {
        value: isFunction(def) ? def.call(this) : clone(def)
      }

      return this
    }

    initComputedProp (name, getter) {
      check(name, 'name').isString().got('length').gt(0)

      const prop = this.reactiveProps_[name] = {}

      try {
        prop.getter = getter.bind(this)
        spyingObserved = true
        spyingName = name
        this.getPropValue(name)
      } catch (err) {
        log.error(`Exception caught in getPropValue('${name}'), Oberserved prop spy failed.`, err)
      } finally {
        spyingObserved = false
        spyingName = nope
      }

      prop.observing = foundObserved
      foundObserved = []

      return this
    }

    defineReactions (reactions) {
      reactions.forEach(reaction => {
        this.reactions_.push(this.initReaction(reaction))
      })

      this.listenPropChangesForReaction()
      return this
    }

    initReaction (fn) {
      const item = {fn: fn.bind(this)}

      try {
        spyingObserved = true
        spyingName = nope
        // 注意, 这里暂不支持异步函数
        fn.call(this)
      } catch (err) {
        log.error(`Exception caught in fn, Oberserved prop spy failed.`, err, fn)
      } finally {
        spyingObserved = false
      }

      item.observing = foundObserved
      foundObserved = []

      return item
    }

    listenPropChangesForReaction () {
      this.propChangesForReactionListenrOff_ = this.on('prop-changes', evt => {
        const reactions = this.reactions_
        const {changes} = evt

        const invokingReactions = reactions.filter(reaction => {
          return reaction.observing.some(el => changes.find(change => {
            return change.name === el
          }))
        })

        invokingReactions.forEach(reaction => reaction.fn())
      })

      return this
    }

    runGetter (name, getter) {
      runningGetterName = name
      let ret = void 0

      try {
        ret = getter()
      } catch (err) {
        this.trigger({
          type: 'computed-prop-getter-error',
          error: err
        }, true)
      } finally {
        runningGetterName = nope
      }

      return ret
    }
  }
}

export default Reactive
