import isFunction from 'lodash.isfunction'
import mix from 'mix-with'
import Reactive from './mixin/Reactive'
import refra from './decorator/refra'

function noop () {}
const { keys } = Object

function getProps (obx) {
  return keys(obx)
    .filter(key => !isFunction(obx[key]))
    .reduce((prev, key) => {
      prev[key] = obx[key]
      return prev
    }, {})
}

function getComputed (obx) {
  return keys(obx)
    .filter(key => isFunction(obx[key]))
    .reduce((prev, key) => {
      prev[key] = obx[key]
      return prev
    }, {})
}

function getReactions (raw) {
  return raw.map(el => {
    const elKeys = keys(el)
    const fn = el.fn || el[elKeys.find(key => isFunction(el[key]))]

    return {
      observing: el.obx || el.observing,
      fn
    }
  })
}

function _createRefraClass ({
  obx = {}, action = {}, method = {}, reaction = [],
  actions, methods, reactions,
  init = noop, dispose = noop,
  equal, clone
}) {
  class RefraClass extends mix().with(Reactive) {
    constructor (...args) {
      super()

      // 兼容单复数(新项目是使用单数形式的)
      action = action || actions
      method = method || methods
      reaction = reaction || reactions

      this.initReactive({
        props: getProps(obx),
        computed: getComputed(obx),
        reactions: getReactions(reaction),
        equal,
        clone
      })

      keys(action).forEach(key => {
        const item = action[key]

        this[key] = (...args) => {
          return this.act(_ => item.call(this, ...args), key)
        }
      })

      keys(method).forEach(key => {
        const item = method[key]

        this[key] = (...args) => {
          return item.call(this, ...args)
        }
      })

      init.call(this, ...args)
    }

    dispose () {
      dispose.call(this)
      super.dispose()
    }
  }

  return RefraClass
}

export function createRefraClass (...options) {
  const initFns = []
  const disposeFns = []

  const opt = {
    obx: {},
    action: {},
    reaction: [],
    method: {},

    init (...args) {
      initFns.forEach(el => {
        el.call(this, ...args)
      })
    },

    dispose () {
      disposeFns.reverse().forEach(el => {
        el.call(this)
      })
    }
  }

  options.forEach(option => {
    const {
      obx = {}, action = {}, reaction = [], method = {}, init = noop, dispose = noop
    } = option

    keys(obx).forEach(key => {
      if (opt.obx[key]) {
        throw new Error(`Duplicate obx name: ${key}.`)
      }

      opt.obx[key] = obx[key]
    })

    keys(action).forEach(key => {
      if (opt.action[key]) {
        throw new Error(`Duplicate action name: ${key}.`)
      }

      opt.action[key] = action[key]
    })

    keys(method).forEach(key => {
      if (opt.method[key]) {
        throw new Error(`Duplicate method name: ${key}.`)
      }

      opt.method[key] = method[key]
    })

    opt.reaction = opt.reaction.concat(reaction)

    initFns.push(init)
    disposeFns.push(dispose)
  })

  return _createRefraClass(opt)
}

function _mixinRefraClass (BaseClass, {
  obx = {}, action = {}, reaction = [],
  actions, reactions,
  init = noop, dispose = noop
}) {
  const BaseRefraClass = BaseClass.isReactive ? BaseClass : refra(BaseClass)

  // 兼容单复数(新项目是使用单数形式的)
  actions = action || actions
  reactions = getReactions(reaction || reactions)

  class RefraClass extends BaseRefraClass {
    constructor (...args) {
      super(...args)
      init.call(this)
    }

    dispose () {
      dispose.call(this)
      super.dispose()
    }
  }

  const proto = RefraClass.prototype

  keys(actions).forEach(key => {
    const item = actions[key]

    if (typeof proto[key] !== 'undefined') {
      throw new Error(`Duplicate action name: ${key}.`)
    }

    proto[key] = function (...args) {
      return this.act(() => item.call(this, ...args), key)
    }
  })

  const decoratedProps = proto.__decorated_props__ || (proto.__decorated_props__ = {})
  const decoratedComputedProps = proto.__decorated_computed__ || (proto.__decorated_computed__ = {})
  const decoratedReactions = proto.__decorated_reactions__ || (proto.__decorated_reactions__ = [])
  const props = getProps(obx)
  const computedProps = getComputed(obx)

  keys(props).forEach(key => {
    if (typeof decoratedProps[key] !== 'undefined') {
      throw new Error(`Duplicate prop name: ${key}.`)
    }

    decoratedProps[key] = () => props[key]
  })

  keys(computedProps).forEach(key => {
    if (typeof decoratedComputedProps[key] !== 'undefined') {
      throw new Error(`Duplicate computed prop name: ${key}.`)
    }

    decoratedComputedProps[key] = computedProps[key]
  })

  reactions.forEach(el => {
    decoratedReactions.push(el)
  })

  return RefraClass
}

export function mixinRefraClass (BaseClass, ...options) {
  const initFns = []
  const disposeFns = []

  const opt = {
    obx: {},
    action: {},
    reaction: [],
    method: {},

    init (...args) {
      initFns.forEach(el => {
        el.call(this, ...args)
      })
    },

    dispose () {
      disposeFns.reverse().forEach(el => {
        el.call(this)
      })
    }
  }

  options.forEach(option => {
    const {
      obx = {}, action = {}, reaction = [], init = noop, dispose = noop
    } = option

    keys(obx).forEach(key => {
      if (opt.obx[key]) {
        throw new Error(`Duplicate obx name: ${key}.`)
      }

      opt.obx[key] = obx[key]
    })

    keys(action).forEach(key => {
      if (opt.action[key]) {
        throw new Error(`Duplicate action name: ${key}.`)
      }

      opt.action[key] = action[key]
    })

    opt.reaction = opt.reaction.concat(reaction)

    initFns.push(init)
    disposeFns.push(dispose)
  })

  return _mixinRefraClass(BaseClass, opt)
}
