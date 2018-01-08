import Disposable from '../mixin/Disposable'
import Eventable from '../mixin/Eventable'
import mix from '../mix'

export default class EventableClass extends mix().with(Disposable, Eventable) {}
