/**
 * Action支持.
 *
 * @author Y3G
 */

import undisposed from '../../decorator/undisposed'

export default superclass => class HasAction extends superclass {
  @undisposed
  get isActing () {
    return this.isActing_
  }

  initHasAction () {
    this.isActing_ = false
  }

  @undisposed
  beginAction () {
    this.isActing_ = true
    return this
  }

  @undisposed
  endAction () {
    this.isActing_ = false
    this.doTriggerChanges()
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
      fnRet.then(_ => {
        this.endAction()
        resolve()
      }).catch(err => {
        this.endAction()
        reject(err)
      })
    })
  }
}
