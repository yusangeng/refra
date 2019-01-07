/**
 * 可监听属性支持.
 *
 * @author Y3G
 */

import isFunction from 'lodash.isfunction'
import undisposed from '../../decorator/undisposed'

const { keys, defineProperties, assign } = Object

function noop () {}

const spy = {
  spyingObserved: false,
  spyingName: noop,
  runningGetterName: noop,
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
    this.spyingName = noop
  },

  foundNames () {
    return this.foundObserved
  },

  setRunningGetterName (name) {
    this.runningGetterName = name
  }
}

export default superclass => class HasObservable extends superclass {
  @undisposed
  dispose () {
    delete this.clone_
    delete this.equal_
    delete this.observableProps_

    super.dispose()
  }

  @undisposed
  initHasObservable (props, computed, equal, clone) {
    if (this.equal_) {
      throw new Error('initReactive should ONLY be invoked once.')
    }

    this.observableProps_ = {}
    this.pendingChanges_ = []

    this.equal_ = equal
    this.clone_ = clone
    this.defineProps(props)
    this.defineComputedProps(computed)

    return this
  }

  @undisposed
  getPropValue (name) {
    const prop = this.observableProps_[name]

    if (!prop) {
      throw new Error(`Bad prop name: ${name}.`)
    }

    spy.addObserved(name)

    const { getter } = prop
    if (getter) {
      // 计算属性
      return this.runPropGetter(name, getter, prop)
    }

    return prop.value
  }

  @undisposed
  setPropValue (name, value) {
    const prop = this.observableProps_[name]
    const { getter, validator } = prop

    if (!prop) {
      throw new Error(`Bad prop name: ${name}.`)
    }

    if (getter) {
      throw new Error(`Prop ${name} is a computed prop, which should NOT be setted by setPropValue().`)
    }

    if (validator && validator(value, this)) {
      return this
    }

    const former = this.getPropValue(name)
    if (this.equal_(value, former)) return this

    this.observableProps_[name].value = this.clone_(value)
    this.probe.update({ name, value, former })
    this.addPendingPropChange(name, value, former)

    if (!this.isActing) {
      this.doTriggerChanges()
    }

    return this
  }

  @undisposed
  setPropValues (map) {
    this.beginAction()

    try {
      keys(map).forEach(key => this.setPropValue(key, map[key]))
    } finally {
      this.endAction()
    }

    return this
  }

  @undisposed
  hasProp (name) {
    return this.observableProps_.hasOwnProperty(name)
  }

  @undisposed
  defineProps (props) {
    const names = keys(props)
    defineProperties(this, names.reduce((prev, name) => {
      if (this.hasProp(name)) {
        throw new Error(`Prop ${name} should NOT be defined repeatedly.`)
      }

      if (this.hasChild(name)) {
        throw new Error(`The name '${name}' has been use by a child model.`)
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

  // private

  addPendingPropChange (name, value, former) {
    const pending = this.pendingChanges_
    const item = pending.find(el => el.name === name)
    if (!item) {
      pending.push({ name, value, former })
    } else {
      item.value = value
    }

    return this.addPendingComputedPropChange(name, value, former)
  }

  addPendingComputedPropChange (name, value, former) {
    const { observableProps_: props } = this
    keys(props).filter(key => {
      return props[key].getter && props[key].observing.includes(name)
    }).forEach(key => {
      // 缓存失效
      const prop = props[key]
      prop.dirty = true
      prop.cache = void 0

      // 对于computed属性, 只发出change事件即可, 避免冗余计算
      this.addPendingPropChange(key)
      this.probe.update({ name: key }, { name, value, former })
    })

    return this
  }

  doTriggerChanges () {
    const pending = this.pendingChanges_
    this.pendingChanges_ = []

    if (!pending.length) {
      return this
    }

    pending.forEach(el => {
      this.trigger(assign({ type: 'change' }, el), true)
      this.trigger(assign({ type: `change:${el.name}` }, el), true)
    })

    this.trigger({ type: 'changes', changes: pending }, true)
    this.trigger({ type: 'changes-internal', changes: pending }, true)

    return this
  }

  initProp (name, def) {
    const { validator } = def
    const initValue = isFunction(def) ? def.call(this) : this.clone_(def)

    if (validator && !validator(initValue)) {
      throw new Error(`The initial value(${initValue}) of prop ${name} is NOT valid.`)
    }

    this.observableProps_[name] = {
      value: initValue,
      validator
    }

    return this
  }

  initComputedProp (name, getter) {
    const prop = this.observableProps_[name] = {}

    try {
      prop.getter = getter.bind(this)
      prop.dirty = true
      prop.cache = void 0

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

  runPropGetter (name, getter, prop) {
    if (!prop.dirty) {
      return prop.cache
    }

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
      spy.setRunningGetterName(noop)
    }

    prop.cache = ret
    prop.dirty = false

    return ret
  }
}
