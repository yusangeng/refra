import mix from './mix'
import Eventable from './class/Eventable'
import DisposableMixin from './mixin/Disposable'
import EventableMixin from './mixin/Eventable'
import ReactiveMixin from './mixin/Reactive'
import Reactive from './class/Reactive'
import reactive from './reactive'
import decorator from './decorator'
// import '../test/Reactive.spec'

const mixin = {
  Disposable: DisposableMixin,
  Eventable: EventableMixin,
  Reactive: ReactiveMixin
}

export {
  mix,
  Eventable,
  Reactive,
  reactive,
  mixin,
  decorator
}
