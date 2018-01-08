import ReactiveMixin from './mixin/Reactive'
import mix from './mix'

class Reactive extends mix().with(ReactiveMixin) {}

export default function reactive ({props, computed, reactions, equal}) {
  const ret = new Reactive()
  ret.initReactive({props, computed, reactions, equal})
  return ret
}
