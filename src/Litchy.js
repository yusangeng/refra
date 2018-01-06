/**
 * Litchy
 *
 * @author Y3G
 */

import Logger from 'chivy'
import Disposable from './mixin/Disposable'
import Eventable from './mixin/Eventable'
import HasId from './mixin/HasId'
import mix from './mix'

const log = new Logger('litchy/litchy')

export default class Litchy extends mix().with(Disposable, Eventable, HasId) {
  constructor () {
    super()
    log.debug('Litchy instance created.')
  }

  dispose () {
    log.debug('Litchy instance disposed.')
    super.dispose()
  }
}
