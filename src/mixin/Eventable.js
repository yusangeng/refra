/**
 * 事件收发支持
 *
 * @author Y3G
 */

import isString from 'lodash/isString'
import check from 'param-check'
import Logger from 'chivy'
import { microTask, macroTask } from 'polygala'

const { assign, keys } = Object
const { isArray } = Array
const log = new Logger('litchy/mixin/Eventable')
var lastHandleValue = Number.MIN_SAFE_INTEGER

function inv (fn, that, ...params) {
  if (fn) {
    return fn.apply(that, params || [])
  }
}

export default superclass => class extends superclass {
  get eventPaused () {
    inv(this.assertUndisposed, this, 'eventPaused getter')
    return this.eventPaused_
  }

  constructor (...params) {
    super(...params)

    this.emap_ = {}
    this.eventQueue_ = []
    this.eventPaused_ = false
  }

  dispose () {
    this.eventQueue_ = null
    this.emap_ = null

    inv(super.dispose, this)
  }

  on (type, callback) {
    check(type, 'type').is('string', 'array')
    check(callback, 'callback').isFunction()

    inv(this.assertUndisposed, this, 'on')

    if (isArray(type)) {
      // 同时监听多个事件
      const offs = type.map(el => this.on(el, callback))
      return _ => offs.forEach(off => off())
    }

    log.debug(`Eventable.on, type=${type}, callback = ${callback.name}.`)

    const map = this.emap_[type] || (this.emap_[type] = {})
    const handle = lastHandleValue++

    map[handle] = callback

    return _ => delete this.emap_[type][handle]
  }

  trigger (event, sync = false) {
    check(event, 'event').is('object', 'string')
    inv(this.assertUndisposed, this, 'trigger')

    const e = (isString(event)) ? {type: event} : event

    log.debug(`Triggering event: ${e.type}`, e)

    this.eventQueue_.push(e)
    macroTask(_ => {
      const queue = this.eventQueue_

      if (!queue.length) return

      this.doAfterEvents(queue)
      this.eventQueue_ = []
    })()

    if (this.eventPaused) {
      log.debug(`Event paused, current event(${e.type}) would NOT invoke callbacks.`, e)
      return Promise.resolve(e)
    }

    // `*`表示监听所有事件
    const snapshot = assign({}, this.emap_[e.type], this.emap_['*'])

    if (!keys(snapshot).length) {
      log.debug(`No callback on ${e.type}.`, e)
      return Promise.resolve(e)
    }

    if (sync) {
      return this.invoke(e, snapshot)
    }

    return new Promise((resolve, reject) => {
      microTask(evt => this.invoke(evt, snapshot).then(evt => resolve(evt)).catch(err => reject(err)))(e)
    })
  }

  pauseEvent () {
    inv(this.assertUndisposed, this, 'pauseEvent')
    this.eventPaused_ = true
  }

  resumeEvent () {
    inv(this.assertUndisposed, this, 'resumeEvent')
    this.eventPaused_ = false
  }

  afterEvents (events) {
    // 由子类重写
    log.debug(`Eventable.afterEvents`, events)
  }

  doAfterEvents (events) {
    if (this.disposed) {
      log.debug(`Object has been disposed, doAfterEvents return.`)
      return
    }

    this.afterEvents(events)
  }

  invoke (event, snapshot) {
    const eventWithTarget = assign({target: this}, event)

    if (this.disposed) {
      log.warn(`Object has been disposed, invoke return.`)
      return Promise.resolve(eventWithTarget)
    }

    try {
      keys(snapshot).forEach(key => snapshot[key](eventWithTarget))
    } catch (err) {
      log.error(`Exception thrown in event callback: ${err}.`)
      return Promise.reject(err)
    }

    return Promise.resolve(eventWithTarget)
  }
}
