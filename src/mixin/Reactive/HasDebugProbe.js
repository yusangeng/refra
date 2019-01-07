/**
 * 调试探针支持.
 *
 * @author Y3G
 */

import isString from 'lodash.isstring'
import undisposed from '../../decorator/undisposed'
import eventable from '../../decorator/eventable'
import on from '../../decorator/on'

const { assign } = Object

const UpdateStatus = {
  Waiting: 'waiting',
  Updating: 'updating'
}

let currId = 0

@eventable
class Probe {
  static UpdateStatus = UpdateStatus

  status = UpdateStatus.Waiting
  statusCounter = 0
  stack = []
  print= false
  id = currId++
  waterNo = 0

  constructor (context, options = {}) {
    this.print = !!options.print
  }

  update (prop, reason) {
    this._setStatus(UpdateStatus.Updating)

    this.trigger({
      type: 'update',
      prop,
      reason
    }, true)

    this.stack.push({ type: 'update', prop, reason })
  }

  endUpdate () {
    this._setStatus(UpdateStatus.Waiting)
  }

  beginReaction (name) {
    this.trigger({
      type: 'begin-reaction',
      name
    }, true)
    this.stack.push({ type: 'begin-reaction', name })
  }

  endReaction (name) {
    this.trigger({
      type: 'end-reaction',
      name
    }, true)
    this.stack.push({ type: 'end-reaction', name })
  }

  beginAction (name) {
    this.trigger({
      type: 'begin-action',
      name
    }, true)
    this.stack.push({ type: 'begin-action', name })
  }

  endAction (name) {
    this.trigger({
      type: 'end-action',
      name
    }, true)
    this.stack.push({ type: 'end-action', name })
  }

  _incStatusCounter () {
    this.statusCounter++
  }

  _decStatusCounter () {
    this.statusCounter = 0
  }

  _setStatus (status) {
    // console.log(`${this.id}-${this.waterNo} _setStatus, status=${status}, statusCounter=${this.statusCounter}`)
    const prev = this.statusCounter

    if (status === UpdateStatus.Updating) {
      this._incStatusCounter()

      if (prev !== 0) {
        return
      }
    } else if (status === UpdateStatus.Waiting) {
      this._decStatusCounter()
    } else {
      throw new Error(`Bad status:${status}.`)
    }

    const former = this.status
    this.status = status

    this.trigger({
      type: 'status-change',
      current: status,
      former
    }, true)

    if (status === UpdateStatus.Updating) {
      this.trigger('begin-update', true)
    } else if (status === UpdateStatus.Waiting) {
      this.trigger({
        type: 'end-update',
        stack: this.stack
      }, true)

      this.stack = []
      this.waterNo++
    }
  }

  @on(['begin-update', 'end-update', 'update',
    'begin-reaction', 'end-reaction',
    'begin-action', 'end-action'])
  handleEvents (evt) {
    if (!this.print) return

    let text = ''

    if (evt.type.startsWith('begin') || evt.type.startsWith('end')) {
      text = evt.name || ''
    } else if (evt.type === 'update') {
      text = `${evt.prop.name} <- ${evt.reason ? evt.reason.name : 'none'}`
    }

    console.log(`[PROBE] ${evt.waterNo} **** ${evt.type} **** ${text}`)
  }
}

class ProbeX extends Probe {
  trigger (evt, sync) {
    let e = evt
    if (isString(e)) {
      e = { type: e }
    }

    return super.trigger(assign({},
      evt, { waterNo: `${this.id}-${this.waterNo}` }), sync)
  }
}

export default superclass => class HasDebugProbe extends superclass {
  @undisposed
  get probe () {
    return this.probe_
  }

  @undisposed
  set probe (probe) {
    this.probe_ = probe
  }

  initHasDebugProbe () {
    this.probe = new ProbeX(this, { print: false })
  }
}
