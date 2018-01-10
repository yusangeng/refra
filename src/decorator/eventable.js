import mix from '../mix'
import Eventable from '../mixin/Eventable'

export default function eventable (target) {
  return class DecoratedEventableClass extends mix(target).with(Eventable) {}
}
