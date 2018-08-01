import Base from './Base'
import mix from './mix'
import Clearable from './mixin/Clearable'
import Eventable from './mixin/Eventable'

export default class EventableClass extends mix(Base).with(Clearable, Eventable) {}
