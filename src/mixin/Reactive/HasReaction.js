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

  const parsedObserving = observing.map(ob => parseObservingStr(ob, equal))

  const name = `${fn.name || 'anonymous-reaction'}(${observing.join(', ')})`
  const ret = {
    fn,
    name,
    observing: parsedObserving,
    rawObserving: observing
  }

  return ret
}

function execReaction (reaction, context, values) {
  const { name, fn } = reaction
  let reactionRet

  try {
    context.probe.beginReaction(name)
    fn.call(context, values)
  } catch (err) {
    context.probe.endReaction()
    return Promise.reject(err)
  }

  if (reactionRet && reactionRet.then && reactionRet.catch) {
    // 异步
    return reactionRet.then(_ => {
      context.probe.endReaction(name)
      return Promise.resolve()
    }).catch(err => {
      context.probe.endReaction(name)
      return Promise.reject(err)
    })
  }

  // 同步
  context.probe.endReaction()
  return Promise.resolve()
}

function execReactions (reactions, context, values) {
  const chain = reactions.reduce((prev, reaction) => {
    return prev.then(_ => execReaction(reaction, context, values))
  }, Promise.resolve())

  return chain
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
    return this.addClearer(this.on('changes-internal', this.handlerForReaction.bind(this)))
  }

  handlerForReaction (evt) {
    // console.log('---- handlerForReaction invoked ----')

    const reactions = this.reactions_
    const { changes } = evt

    const invokingReactions = reactions.filter(reaction => {
      return reaction.observing.some(el => !!changes.find(change => {
        const { observing, differenceChecker: checker } = el
        const { name, former, value } = change

        if (name !== observing) {
          return false
        }

        const match = !checker || checker(former, value)
        return match
      }))
    })

    // console.log(`---- invokingReactions.length === ${invokingReactions.length} ----`)

    if (!invokingReactions.length) {
      this.probe.endUpdate()
      return
    }

    const values = changes.reduce((prev, el) => {
      prev[el.name] = el
      return prev
    }, {})

    this.beginAction()
    execReactions(invokingReactions, this, values).then(_ => {
      if (!this.pendingChanges_.length) {
        this.probe.endUpdate()
      }

      this.endAction()
    }).catch(err => {
      if (!this.pendingChanges_.length) {
        this.probe.endUpdate()
      }

      this.endAction()
      throw err // FIXME
    })
  }
}
