import mix from '../mix'
import HasId from '../mixin/HasId'

export default function hasid (target) {
  return class DecoratedHasIdClass extends mix(target).with(HasId) {
    constructor (...params) {
      super(...params)
      this.initId() // 此处不支持设置id
    }
  }
}
