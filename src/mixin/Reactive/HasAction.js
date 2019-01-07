/**
 * Action支持.
 *
 * @author Y3G
 */

import undisposed from '../../decorator/undisposed'

export default superclass => class HasAction extends superclass {
  @undisposed
  get isActing () {
    return !!this.actionCounter_
  }

  initHasAction () {
    this.actionCounter_ = 0
  }

  @undisposed
  beginAction () {
    this.actionCounter_ += 1
    return this
  }

  @undisposed
  endAction () {
    if (this.actionCounter_ === 0) {
      return this
    }

    this.actionCounter_ -= 1

    if (this.actionCounter_ === 0) {
      this.doTriggerChanges()
    }

    return this
  }

  @undisposed
  act (fn) {
    this.beginAction()

    return new Promise((resolve, reject) => {
      let fnRet
      try {
        fnRet = fn(this)
      } catch (err) {
        this.endAction()
        reject(err)
        return
      }

      if (!fnRet || !fnRet.then || !fnRet.catch) {
        // 同步方法
        this.endAction()
        return
      }

      // 异步方法
      fnRet.then(shouldNOTbeAnything => {
        this.endAction()
        resolve(shouldNOTbeAnything)
      }).catch(err => {
        this.endAction()
        reject(err)
      })
    })
  }
}
