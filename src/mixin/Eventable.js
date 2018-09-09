/**
 * 事件收发支持
 *
 * @author Y3G
 */

import { microTask, macroTask } from '../utils/browserTask'
import undisposed from '../decorator/undisposed'
import mix from '../mix'
import Disposable from './Disposable'
import isString from '../utils/isString'

const { assign, keys } = Object
const { isArray } = Array
var lastHandleValue = Number.MIN_SAFE_INTEGER

export default superclass => class extends mix(superclass).with(Disposable) {
  @undisposed
  get eventPaused () {
    this.initEventable()
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
    this.initEventable()

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
    this.initEventable()

    const e = isString(event) ? {type: event} : event
    this.eventQueue_.push(e)

    macroTask(_ => {
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
      return this.invoke(e, snapshot)
    }

    return new Promise((resolve, reject) => {
      const fn = microTask(evt => {
        this.invoke(evt, snapshot).then(evt => resolve(evt)).catch(err => reject(err))
      })

      fn(e)
    })
  }

  @undisposed
  pauseEvent () {
    this.initEventable()
    this.eventPaused_ = true
  }

  @undisposed
  resumeEvent () {
    this.initEventable()
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

  invoke (event, snapshot) {
    const eventWithTarget = assign({target: this}, event)

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
