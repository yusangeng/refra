/**
 * 调试探针支持.
 *
 * @author Y3G
 */

import undisposed from '../../decorator/undisposed'
import eventable from '../../decorator/eventable'
import on from '../../decorator/on'

const UpdateStatus = {
  Waiting: 'waiting',
  Updating: 'updating'
}

@eventable
class Probe {
  static UpdateStatus = UpdateStatus

  status = UpdateStatus.Waiting
  statusCounter = 0
  stack = []
  print= false

  constructor (context, options = {}) {
    this.print = !!options.print
  }

  beginUpdate () {
    this._setStatus(UpdateStatus.Updating)
  }

  update (prop, reason) {
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
    if (this.decStatusCounter > 0) {
      this.decStatusCounter--
    }
  }

  _setStatus (status) {
    const prev = this.statusCounter

    if (status === UpdateStatus.Updating) {
      this._incStatusCounter()

      if (prev !== 0) {
        return
      }
    } else if (status === UpdateStatus.Waiting) {
      this._decStatusCounter()

      if (prev !== 1) {
        return
      }
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

    console.log(`[PROBE] **** ${evt.type} **** ${text}`)
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
    this.probe = new Probe(this, { print: false })
  }
}
