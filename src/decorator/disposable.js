import mix from '../mix'
import Disposable from '../mixin/Disposable'

export default function disposable (target) {
  return class DecoratedDisposableClass extends mix(target).with(Disposable) {}
}
