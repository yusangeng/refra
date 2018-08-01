/**
 * 批量清理支持
 *
 * @author Y3G
 */

import check from 'param-check'
import undisposed from '../decorator/undisposed'

export default superclass => class extends superclass {
  constructor (...params) {
    super(...params)
    this.clearerQueue_ = []
  }

  dispose () {
    this.runClearers()
    super.dispose()
  }

  @undisposed
  runClearers () {
    this.clearerQueue_.forEach(fn => fn())
    this.clearerQueue_ = []
  }

  @undisposed
  addClearer (fn) {
    check(fn, 'fn').isFunction()
    this.clearerQueue_.push(fn)
  }
}
