import Base from './Base'
import mix from './mix'
import Disposable from './mixin/Disposable'

export default class DisposableClass extends mix(Base).with(Disposable) {}
