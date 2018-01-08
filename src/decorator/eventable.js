import mix from '../mix'
import Disposable from '../mixin/Disposable'
import Eventable from '../mixin/Eventable'

export default function decoratorReactive (target) {
  return class DecoratedEventableClass extends mix(target).with(Disposable, Eventable) {}
}
