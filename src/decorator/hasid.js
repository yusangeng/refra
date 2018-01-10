import mix from '../mix'
import HasId from '../mixin/HasId'

export default function hasid (target) {
  return class DecoratedHasIdClass extends mix(target).with(HasId) {}
}
