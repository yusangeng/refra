/**
 * 属性依赖关系支持, 可类比为简单版Mobx
 *
 * @author Y3G
 */

import mix from 'mix-with'
import fastDeepEqual from 'fast-deep-equal'
import clone from '../utils/clone'
import mapValue from '../utils/mapValue'
import isFunction from '../utils/isFunction'
import Eventable from './Eventable'
import Clearable from './Clearable'
import undisposed from '../decorator/undisposed'

const { keys, defineProperties, assign } = Object

function nope () {}

const spy = {
  spyingObserved: false,
  spyingName: nope,
  runningGetterName: nope,
  foundObserved: [],

  addObserved (name) {
    if (this.spyingObserved &&
      this.spyingName !== name &&
      this.runningGetterName === this.spyingName &&
      !this.foundObserved.find(el => el === name)) {
      this.foundObserved.push(name)
    }
  },

  start (name) {
    this.spyingObserved = true
    this.spyingName = name
    this.foundObserved = []
  },

  end () {
    this.spyingObserved = false
    this.spyingName = nope
  },

  foundNames () {
    return this.foundObserved
  },

  setRunningGetterName (name) {
    this.runningGetterName = name
  }
}

export default superclass => class extends mix(superclass).with(Eventable, Clearable) {
  @undisposed
  get batch () {
    return this.reactiveBatch_
  }

  constructor (...params) {
    super(...params)

    this.reactiveProps_ = {}
    this.reactions_ = []
    this.pendingChanges_ = []
    this.reactiveBatch_ = false
    this.reactionHandlerBinded_ = false
  }

  @undisposed
  dispose () {
    this.pendingChanges_ = []
    this.reactiveProps_ = {}
    this.equal_ = null

    super.dispose()
  }

  @undisposed
  initReactive ({ props = {}, computed = {},
    reactions = [], equal = fastDeepEqual }) {
    if (this.equal_) {
      throw new Error('initReactive should ONLY be invoked once.')
    }

    this.equal_ = equal
    this.defineProps(props)
    this.defineComputedProps(computed)
    this.defineReactions(reactions)

    return this
  }

  @undisposed
  startBatch () {
    this.reactiveBatch_ = true
    return this
  }

  @undisposed
  endBatch () {
    this.reactiveBatch_ = false
    this.doTriggerChanges()
    return this
  }

  @undisposed
  getPropValue (name) {
    const prop = this.reactiveProps_[name]

    if (!prop) {
      throw new Error(`Bad prop name: ${name}.`)
    }

    spy.addObserved(name)

    if (prop.getter) {
      return this.runPropGetter(name, prop.getter)
    }

    return clone(prop.value)
  }

  @undisposed
  getSnapshot () {
    return mapValue(this.reactiveProps_,
      (_, key) => this.getPropValue(key))
  }

  @undisposed
  setPropValue (name, value) {
    const prop = this.reactiveProps_[name]

    if (!prop) {
      throw new Error(`Bad prop name: ${name}.`)
    }

    if (prop.getter) {
      throw new Error(`Prop ${name} is a computed prop, which should NOT be setted by setPropValue().`)
    }

    const former = this.getPropValue(name)
    if (this.equal_(value, former)) return this

    this.reactiveProps_[name].value = clone(value)
    this.addPendingPropChange(name, value, former)

    if (!this.batch) {
      this.doTriggerChanges()
    }

    return this
  }

  @undisposed
  setProps (map) {
    this.startBatch()
    keys(map).forEach(key => this.setPropValue(key, map[key]))
    this.endBatch()

    return this
  }

  @undisposed
  hasProp (name) {
    return this.reactiveProps_.hasOwnProperty(name)
  }

  @undisposed
  defineProps (props) {
    const names = keys(props)
    defineProperties(this, names.reduce((prev, name) => {
      if (this.hasProp(name)) {
        throw new Error(`Prop ${name} should NOT be defined repeatedly.`)
      }

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

  @undisposed
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

  @undisposed
  defineReactions (reactions) {
    reactions.forEach(reaction => {
      this.reactions_.push(this.initReaction(reaction))
    })

    return this.listenToPropChanges()
  }

  // private

  addPendingPropChange (name, value, former) {
    const pending = this.pendingChanges_

    if (!pending.find(el => el.name === name)) {
      pending.push({ name, value, former })
    }

    return this.addPendingComputedPropChange(name, value, former)
  }

  addPendingComputedPropChange (name, value, former) {
    const { reactiveProps_: props } = this
    keys(props).filter(key => {
      return props[key].getter && props[key].observing.includes(name)
    }).forEach(key => {
      // 对于computed属性, 只发出change事件即可, 避免冗余计算
      this.addPendingPropChange(key)
    })

    return this
  }

  doTriggerChanges () {
    const pending = this.pendingChanges_

    pending.forEach(el => {
      this.trigger(assign({ type: 'prop-change' }, el))
      this.trigger(assign({ type: `prop-change:${el.name}` }, el))
    })

    this.trigger({ type: 'prop-changes', changes: pending })
    this.pendingChanges_ = []

    return this
  }

  initProp (name, def) {
    this.reactiveProps_[name] = {
      value: isFunction(def) ? def.call(this) : clone(def)
    }

    return this
  }

  initComputedProp (name, getter) {
    const prop = this.reactiveProps_[name] = {}

    try {
      prop.getter = getter.bind(this)
      spy.start(name)
      this.getPropValue(name)
    } catch (err) {
      this.trigger({
        type: '__error__',
        message: `Exception caught in getPropValue('${name}'), Oberserved prop spy failed.`,
        error: err
      }, true)

      throw err
    } finally {
      spy.end()
    }

    prop.observing = spy.foundNames()
    return this
  }

  initReaction (desc) {
    if (isFunction(desc)) {
      throw new Error('Refra does NOT support @autoReaction decorator.')
    }

    const item = {
      fn: desc.fn.bind(this),
      observing: desc.observing
    }

    return item
  }

  listenToPropChanges () {
    if (this.reactionHandlerBinded_) {
      return
    }

    this.reactionHandlerBinded_ = true
    return this.addClearer(this.on('prop-changes', this.propChangesHandlerForReaction.bind(this)))
  }

  propChangesHandlerForReaction (evt) {
    const reactions = this.reactions_
    const { changes } = evt

    const invokingReactions = reactions.filter(reaction => {
      return reaction.observing.some(el => !!changes.find(change => {
        return change.name === el
      }))
    })

    const values = changes.reduce((prev, el) => {
      prev[el.name] = el
      return prev
    }, {})

    invokingReactions.forEach(reaction => reaction.fn(values))
  }

  runPropGetter (name, getter) {
    spy.setRunningGetterName(name)
    let ret = void 0

    try {
      ret = getter()
    } catch (err) {
      this.trigger({
        type: '__error__',
        message: `Exception caught in getter of prop(${name}).`,
        error: err
      }, true)
    } finally {
      spy.setRunningGetterName(nope)
    }

    return ret
  }
}
