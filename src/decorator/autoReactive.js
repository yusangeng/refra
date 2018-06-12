import mix from '../mix'
import Eventable from '../mixin/Eventable'
import Reactive from '../mixin/Reactive'

export default function autoReactive (target) {
  return class DecoratedEventableReactiveClass extends mix(target).with(Eventable, Reactive) {
    constructor (...params) {
      super(...params)

      this.initReactive({
        props: target.prototype.__decorated_props__,
        computed: target.prototype.__decorated_computed__,
        reactions: target.prototype.__decorated_reactions__
      })
    }
  }
}
