import mix from 'mix-with'
import Eventable from '../mixin/Eventable'
import Clearable from '../mixin/Clearable'

export default function eventable (target) {
  return class DecoratoredEventableClass extends mix(target).with(Eventable, Clearable) {
    constructor (...params) {
      super(...params)

      const decoratedListeners = this.constructor.prototype.__decorated_listeners__

      if (decoratedListeners) {
        decoratedListeners.forEach(listener => {
          const { eventType, callback } = listener
          this.on(eventType, callback.bind(this))
        })
      }
    }
  }
}
