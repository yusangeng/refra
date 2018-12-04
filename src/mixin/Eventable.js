/**
 * 事件收发支持.
 *
 * @author Y3G
 */

import mix from 'mix-with'
import isString from 'lodash.isstring'
import { micro, macro } from 'polygala/lib/task'
import Disposable from './Disposable'
import undisposed from '../decorator/undisposed'

const { assign, keys } = Object
const { isArray } = Array
var lastHandleValue = Number.MIN_SAFE_INTEGER

export default superclass => class Eventable extends mix(superclass).with(Disposable) {
  @undisposed
  get eventPaused () {
    return this.eventPaused_
  }

  constructor (...params) {
    super(...params)
    this.initEventable()
  }

  dispose () {
    this.eventQueue_ = null
    this.emap_ = null

    super.dispose()
  }

  @undisposed
  on (type, callback) {
    if (isArray(type)) {
      // 同时监听多个事件
      const offs = type.map(el => this.on(el, callback))
      return _ => offs.forEach(off => off())
    }

    const map = this.emap_[type] || (this.emap_[type] = {})
    const handle = lastHandleValue++

    map[handle] = callback

    return _ => {
      const { emap_: emap } = this
      if (emap && emap[type]) {
        delete emap[type][handle]
      }
    }
  }

  @undisposed
  once (type, callback) {
    const off = this.on(type, evt => {
      callback(evt)
      off()
    })

    return off
  }

  @undisposed
  trigger (event, sync = false) {
    const e = isString(event) ? { type: event } : event
    this.eventQueue_.push(e)

    macro(_ => {
      const queue = this.eventQueue_
      if (!queue || !queue.length) return

      this.doAfterEvents(queue)
      this.eventQueue_ = []
    })()

    if (this.eventPaused) {
      return Promise.resolve(e)
    }

    // `*`表示监听所有事件
    const snapshot = assign({}, this.emap_[e.type], this.emap_['*'])

    if (!keys(snapshot).length) {
      return Promise.resolve(e)
    }

    if (sync) {
      return this.invokeEvent(e, snapshot)
    }

    return new Promise((resolve, reject) => {
      const fn = micro(evt => {
        this.invokeEvent(evt, snapshot).then(evt => resolve(evt)).catch(err => reject(err))
      })

      fn(e)
    })
  }

  @undisposed
  pauseEvent () {
    this.eventPaused_ = true
  }

  @undisposed
  resumeEvent () {
    this.eventPaused_ = false
  }

  @undisposed
  afterEvents (events) {
    // 由子类重写
  }

  // private

  initEventable () {
    if (this.emap_) {
      return
    }

    this.emap_ = {}
    this.eventQueue_ = []
    this.eventPaused_ = false
  }

  doAfterEvents (events) {
    if (this.disposed) {
      return
    }

    this.afterEvents(events)
  }

  invokeEvent (event, snapshot) {
    const eventWithTarget = assign({ target: this }, event)

    if (this.disposed) {
      return Promise.resolve(eventWithTarget)
    }

    try {
      keys(snapshot).forEach(key => snapshot[key](eventWithTarget))
    } catch (err) {
      return Promise.reject(err)
    }

    return Promise.resolve(eventWithTarget)
  }
}
