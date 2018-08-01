import Eventable from './Eventable'
import mix from './mix'
import Reactive from './mixin/Reactive'

export default class ReactiveClass extends mix(Eventable).with(Reactive) {
  constructor (...params) {
    super(...params)
    this.initDecoratedReactive()
  }
}
