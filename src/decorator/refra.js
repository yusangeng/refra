import mix from 'mix-with'
import Reactive from '../mixin/Reactive'
import { mixinRefraClass } from '../dynamicRefraClass'

export default function refra (target) {
  class DecoratoredRefraClass extends mix(target).with(Reactive) {
    static displayName = `${target.displayName || target.name || 'ReactComponent'}WithRefra`

    constructor (...params) {
      super(...params)

      const decoratedListeners = this.constructor.prototype.__decorated_listeners__

      if (decoratedListeners) {
        decoratedListeners.forEach(listener => {
          const { eventType, callback } = listener
          this.on(eventType, callback.bind(this))
        })
      }

      const proto = this.constructor.prototype

      this.initReactive({
        props: proto.__decorated_props__,
        computed: proto.__decorated_computed__,
        reactions: proto.__decorated_reactions__,
        children: proto.__decorated_children__
      })

      const { refraDidInitialized } = this

      if (refraDidInitialized) {
        refraDidInitialized.call(this)
      }
    }
  }

  return DecoratoredRefraClass
}

refra.mixin = function (...options) {
  return function decorator (target) {
    const refraTarget = refra(target)
    return mixinRefraClass(refraTarget, ...options)
  }
}
