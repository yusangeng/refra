/**
 * Action支持.
 *
 * @author Y3G
 */

import undisposed from '../../decorator/undisposed'

export default superclass => class HasAction extends superclass {
  @undisposed
  get isActing() {
    return !!this.actionCounter_
  }

  @undisposed
  get runningActionName() {
    return this.runningActionName_ || 'none'
  }

  initHasAction() {
    this.actionCounter_ = 0
    this.runningActionName_ = ''
  }

  @undisposed
  beginAction(name = '') {
    // this.probe.log(`Try to begin action, name: ${name}, counter: ${this.actionCounter_}, running: ${this.runningActionName}`)
    this.actionCounter_ += 1

    if (this.actionCounter_ === 1) {
      this.probe.beginAction(name)
      this.runningActionName_ = name
    } else {
      // this.probe.log(`Already acting, counter: ${this.actionCounter_}, trying: ${name}, running: ${this.runningActionName}`)
    }

    return this
  }

  @undisposed
  endAction(name = '') {
    // this.probe.log(`Try to end action, name: ${name}, counter: ${this.actionCounter_}, running: ${this.runningActionName}`)

    if (this.actionCounter_ === 0) {
      return this
    }

    this.actionCounter_ -= 1

    if (this.actionCounter_ === 0) {
      this.runningActionName_ = ''
      this.probe.endAction(name)
      this.doTriggerChanges()
    }

    return this
  }

  @undisposed
  act(fn, actionName) {
    const name = actionName || fn.name
    this.beginAction(name)

    return new Promise((resolve, reject) => {
      let fnRet
      try {
        fnRet = fn(this)
      } catch (err) {
        this.endAction(name)
        reject(err)
        return
      }

      if (!fnRet || !fnRet.then || !fnRet.catch) {
        // 同步方法
        this.endAction(name)
        resolve(fnRet)
        return
      }

      // 异步方法
      fnRet.then(shouldNOTbeAnything => {
        this.endAction(name)
        resolve(shouldNOTbeAnything)
      }).catch(err => {
        this.endAction(name)
        reject(err)
      })
    })
  }
}
