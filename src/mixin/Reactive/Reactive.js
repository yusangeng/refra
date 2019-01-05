/**
 * 属性依赖关系支持, 可类比为没有界面的VUE.
 *
 * @author Y3G
 */

import mix from 'mix-with'
import fastDeepEqual from 'fast-deep-equal'
import fastClone from '../../utils/clone'
import mapValue from '../../utils/mapValue'
import Eventable from '../Eventable'
import Clearable from '../Clearable'
import HasObservable from './HasObservable'
import HasAction from './HasAction'
import HasChildren from './HasChildren'
import HasReaction from './HasReaction'
import undisposed from '../../decorator/undisposed'

const { assign, freeze, key } = Object

const Base = superclass => mix(superclass).with(Clearable, Eventable)

function shouldUpdate (includes, changes = {}) {
  if (!includes) {
    return true
  }

  return key(changes).some(name => includes.includes(name))
}

export default superclass => class Reactive extends mix(superclass)
  .with(Base, HasObservable, HasAction, HasChildren, HasReaction) {
  static get isReactive () {
    return true
  }

  @undisposed
  get isReactive () {
    return true
  }

  @undisposed
  initReactive ({ props = {}, computed = {}, reactions = [], children = {},
    equal = fastDeepEqual, clone = fastClone }) {
    this.initHasObservable(props, computed, equal, clone)
    this.initHasAction()
    this.initHasChildren(children)
    this.initHasReaction(reactions)

    return this
  }

  @undisposed
  getSnapshot (freezed = true) {
    const propSnapshot = mapValue(this.observableProps_, (_, key) => this.getPropValue(key))
    const childrenSnapshot = this.getChildrenSnapshot(false)
    const data = assign({}, propSnapshot, childrenSnapshot)

    return freezed ? freeze(data) : data
  }

  @undisposed
  connectReactComponent (component, eventType = 'update', includes = null) {
    const off = this.on(eventType, evt => {
      if (!shouldUpdate(includes, evt.changes)) {
        return
      }

      component.setState({
        __reactive_ts__: Date.now()
      })
    })

    const originalHook =
      component.hasOwnProperty('componentWillUnmount')
        ? component.componentWillUnmount
        : component.constructor.prototype.componentWillUnmount

    component.componentWillUnmount = function () {
      off()
      if (originalHook) {
        originalHook.call(component)
      }
    }
  }
}
