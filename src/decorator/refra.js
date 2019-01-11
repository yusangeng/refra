import mix from 'mix-with'
import Reactive from '../mixin/Reactive'

export default function refra (target) {
  class DecoratoredRefraClass extends mix(target).with(Reactive) {
    static get displayName () {
      return `${target.displayName || target.name || 'ReactComponent'}WithRefra`
    }

    constructor (...params) {
      super(...params)

      const decoratedListeners = this.constructor.prototype.__decorated_listeners__

      if (decoratedListeners) {
        decoratedListeners.forEach(listener => {
          const { eventType, callback } = listener
          this.on(eventType, callback.bind(this))
        })
      }

      this.initReactive({
        props: target.prototype.__decorated_props__,
        computed: target.prototype.__decorated_computed__,
        reactions: target.prototype.__decorated_reactions__,
        children: target.prototype.__decorated_children__
      })

      const { refraDidInitialized } = this

      if (refraDidInitialized) {
        refraDidInitialized.call(this)
      }
    }
  }

  if (target.prototype.isReactComponent) {
    DecoratoredRefraClass.prototype.isReactComponent = true
  }

  return DecoratoredRefraClass
}
