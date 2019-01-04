/**
 * 监听属性变化的副作用支持.
 *
 * @author Y3G
 */

import isFunction from 'lodash.isfunction'
import undisposed from '../../decorator/undisposed'

const { isArray } = Array

function get (target, segments) {
  const currentSegments = segments.slice()
  let currentTarget = target
  let ret = void 0

  try {
    while (currentSegments.length) {
      const seg = currentSegments.shift()
      currentTarget = currentTarget[seg]

      if (!currentSegments.length) {
        ret = currentTarget
      }
    }
  } catch (err) {
    return void 0
  }

  return ret
}

function differenceChecker (segments, equal, former, current) {
  const formerValue = get(former, segments)
  const currentValue = get(current, segments)

  return !equal(formerValue, currentValue)
}

function parseObservingStr (str, equal) {
  const segments = str.split('.')
  const realObserving = segments.shift()

  if (segments.length === 0) {
    return {
      observing: realObserving,
      differenceChecker: void 0
    }
  }

  return {
    observing: realObserving,
    differenceChecker: (former, current) =>
      differenceChecker(segments, equal, former, current)
  }
}

function createReactionItem (desc, equal) {
  if (isFunction(desc)) {
    throw new Error('Refra does NOT support @autoReaction decorator.')
  }

  let { observing, fn } = desc

  if (!isArray(observing)) {
    observing = [observing]
  }

  observing = observing.map(ob => parseObservingStr(ob, equal))

  const ret = {
    fn,
    observing
  }

  return ret
}

export default superclass => class HasReaction extends superclass {
  @undisposed
  dispose () {
    delete this.reactions_

    super.dispose()
  }

  @undisposed
  initHasReaction (reactions) {
    this.listenedForReaction_ = false
    this.reactions_ = []
    this.defineReactions(reactions)
    return this
  }

  @undisposed
  defineReactions (reactions) {
    reactions.forEach(reaction => {
      this.reactions_.push(createReactionItem(reaction, this.equal_))
    })

    return this.listenForReaction()
  }

  // private

  listenForReaction () {
    if (this.listenedForReaction_) {
      return
    }

    this.listenedForReaction_ = true
    return this.addClearer(this.on('changes', this.handlerForReaction.bind(this)))
  }

  handlerForReaction (evt) {
    const reactions = this.reactions_
    const { changes } = evt

    const invokingReactions = reactions.filter(reaction => {
      return reaction.observing.some(el => !!changes.find(change => {
        const { observing, differenceChecker: checker } = el
        const { name, former, value } = change

        if (name !== observing) {
          return false
        }

        return !checker || checker(former, value)
      }))
    })

    const values = changes.reduce((prev, el) => {
      prev[el.name] = el
      return prev
    }, {})

    invokingReactions.forEach(reaction => reaction.fn.call(this, values))
  }
}
