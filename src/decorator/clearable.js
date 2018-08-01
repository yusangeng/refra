import mix from '../mix'
import Clearable from '../mixin/Clearable'

export default function clearerable (target) {
  return class DecoratedClearableClass extends mix(target).with(Clearable) {}
}
