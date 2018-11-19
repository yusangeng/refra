import mix from 'mix-with'
import Reactive from '../mixin/Reactive'

export default function refra (target) {
  return class DecoratoredRefraClass extends mix(target).with(Reactive) {
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
        reactions: target.prototype.__decorated_reactions__
      })
    }
  }
}
