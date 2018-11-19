import mix from 'mix-with'
import Reactive from './mixin/Reactive'
import { polyfill, resume } from './utils/safeDefineProperty'

export default class Refra extends mix().with(Reactive) {
  static afterRefra () {
    resume()
  }

  constructor () {
    super()

    this.initReactive({
      props: this.constructor.prototype.__decorated_props__,
      computed: this.constructor.prototype.__decorated_computed__,
      reactions: this.constructor.prototype.__decorated_reactions__
    })

    polyfill()
  }
}
