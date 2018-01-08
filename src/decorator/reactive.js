import mix from '../mix'
import Reactive from '../mixin/Reactive'

export default function decoratorReactive (target) {
  return class DecoratedReactiveClass extends mix(target).with(Reactive) {
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
