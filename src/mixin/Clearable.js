/**
 * 批量清理支持
 *
 * @author Y3G
 */

import undisposed from '../decorator/undisposed'

export default superclass => class extends superclass {
  constructor (...params) {
    super(...params)
    this.clearerQueue_ = []
  }

  dispose () {
    this.runClearers()
    if (super.dispose) {
      super.dispose()
    }
  }

  @undisposed
  runClearers () {
    if (this.clearerQueue_.length) {
      this.clearerQueue_.forEach(fn => fn())
      this.clearerQueue_ = []
    }

    return this
  }

  @undisposed
  addClearer (fn) {
    this.clearerQueue_.push(fn)
    return this
  }
}
