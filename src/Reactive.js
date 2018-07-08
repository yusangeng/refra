import Eventable from './Eventable'
import reactive from './decorator/reactive'

@reactive
export default class ReactiveClass extends Eventable {}
