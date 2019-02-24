import isFunction from 'lodash.isfunction'
import mix from 'mix-with'
import { Reactive } from './mixin/Reactive'

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
  obx = {}, action = {}, reaction = [],
  actions, reactions,
  init = noop, dispose = noop,
  equal, clone
}) {
  class RefraClass extends mix().with(Reactive) {
    constructor (...args) {
      super()

      // 兼容单复数(新项目是使用单数形式的)
      action = action | actions
      reaction = reaction | reactions

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
          this.act(_ => item.call(this, ...args))
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

export default function createRefraClass (...options) {
  const initFns = []
  const disposeFns = []

  const opt = {
    obx: {},
    action: {},
    reaction: [],

    init () {
      initFns.forEach(el => {
        el.call(this)
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
        throw new Error(`duplicate obx name: ${key}.`)
      }

      opt.obx[key] = obx[key]
    })

    keys(action).forEach(key => {
      if (opt.action[key]) {
        throw new Error(`duplicate action name: ${key}.`)
      }

      opt.action[key] = action[key]
    })

    opt.reaction = opt.reaction.concat(reaction)

    initFns.push(init)
    disposeFns.push(dispose)
  })

  return _createRefraClass(opt)
}
