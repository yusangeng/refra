/* global describe it */

import 'babel-polyfill'
import chai from 'chai'

import { sleep } from 'polygala'
import {
  obx,
  action,
  reaction,
  refra,
  on
} from '../src/decorator'

chai.should()

@refra
class TestRefra {
  reactionTimes = 0
  autoReactionTimes = 0
  propChangesEventHandlerTimes = 0

  @obx testProp1 = 1
  @obx testProp2 = 2
  @obx testProp3 = null

  @obx testProp4 = {
    a: {
      b: {
        c: 1
      }
    }
  }

  @obx testProp5 = '555'

  @obx get testComputed () {
    return (this.testProp1 + this.testProp2) * 2
  }

  constructor () {
    this.testProp5 = '666'
  }

  testMethod () {
    this.testProp1 = 2
    this.testProp2 = 4
  }

  @action
  testAction () {
    this.testProp1 = 3
    this.testProp2 = 6
  }

  @action
  async testAsyncAction () {
    this.testProp1 = 3
    await sleep(100)
    this.testProp2 = 6
  }

  @reaction('testProp1')
  testReaction () {
    this.reactionTimes += 1
  }

  @reaction('testProp4.a.b.c')
  testReaction2 () {
    this.reactionTimes += 1
  }

  @on('changes')
  onPropChanges (evt) {
    this.propChangesEventHandlerTimes++
  }
}

describe('@refra', _ => {
  describe('#constructor', _ => {
    it('should NOT throw', done => {
      void new TestRefra()
      done()
    })

    it('should have right props', done => {
      const tr = new TestRefra()

      tr.testProp1.should.be.equal(1)
      tr.testProp2.should.be.equal(2)
      tr.testComputed.should.be.equal(6)

      done()
    })
  })

  describe('#dispose', _ => {
    it('should NOT throw', done => {
      const tr = new TestRefra()
      tr.dispose()
      done()
    })

    it('should throw when call method after dispose', done => {
      const tr = new TestRefra()
      tr.dispose()
      tr.getPropValue.bind(tr, 'testProp1').should.throw()
      done()
    })
  })

  describe('#get & set obx prop', _ => {
    it('should be equal to obj', done => {
      const obj = { a: null, b: 1, c: [1, 2, 3], d: { x: void 0, y: 123 } }

      const tr = new TestRefra()

      tr.testProp3 = obj
      JSON.stringify(obj).should.be.equal(JSON.stringify(tr.testProp3))
      done()
    })
  })

  describe('#method', _ => {
    it('should have right props after testMethod', done => {
      const tr = new TestRefra()

      tr.testMethod()

      tr.testProp1.should.be.equal(2)
      tr.testProp2.should.be.equal(4)
      tr.testComputed.should.be.equal(12)

      done()
    })
  })

  describe('#action', _ => {
    it('should trigger changes ONLY once', async () => {
      @refra
      class TR {
        @obx a = 0

        @action
        testAction () {
          this.a = 1
        }
      }

      const tr = new TR()
      let i = 0

      tr.on('changes', _ => i++)
      tr.testAction()

      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props after testAction', async () => {
      const tr = new TestRefra()

      tr.testAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#async action', _ => {
    it('should trigger changes ONLY once', async () => {
      @refra
      class TR {
        @obx a = 0

        @action
        async testAsyncAction () {
          sleep(50)
          this.a = 1
        }
      }

      const tr = new TR()
      let i = 0

      tr.on('changes', _ => i++)
      await tr.testAsyncAction()
      await sleep(100)

      i.should.be.equal(1)
    })

    it('should have right props after testAsyncAction', async () => {
      const tr = new TestRefra()

      await tr.testAsyncAction()
      tr.testProp1.should.be.equal(3)
      tr.testProp2.should.be.equal(6)
      tr.testComputed.should.be.equal(18)
    })
  })

  describe('#reaction', _ => {
    it('should have right reactionTimes value after reaction 1', async () => {
      const tr = new TestRefra()

      tr.beginAction()
      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4
      tr.endAction()

      await sleep(100)

      tr.reactionTimes.should.be.equal(1)
    })

    it('should have right reactionTimes value after reaction 2', async () => {
      const tr = new TestRefra()

      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4

      await sleep(100)

      tr.reactionTimes.should.be.equal(2)
    })

    it('should trigger reaction when the decorator is @reaction("testProp.a.b.c")', async () => {
      const tr = new TestRefra()

      tr.testProp4 = { a: { b: { c: 2 } } }

      await sleep(100)

      tr.testProp4 = { a: { b: { c: 2 }, d: 3 } }

      await sleep(100)

      tr.reactionTimes.should.be.equal(1)
    })
  })

  describe('#changes event handler', _ => {
    it('should have right propChangesEventHandlerTimes', async () => {
      @refra
      class TR {
        propChangesEventHandlerTimes = 0

        @obx testProp1 = 1

        @on('changes')
        handleChanges () {
          this.propChangesEventHandlerTimes++
        }
      }

      const tr = new TR()

      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4

      await sleep(100)

      tr.propChangesEventHandlerTimes.should.be.equal(3)
    })

    it('should have right propChangesEventHandlerTimes in batch mode', async () => {
      @refra
      class TR {
        propChangesEventHandlerTimes = 0

        @obx testProp1 = 1

        @on('changes')
        handleChanges () {
          this.propChangesEventHandlerTimes++
        }
      }

      const tr = new TR()

      tr.beginAction()
      tr.testProp1 = 2
      tr.testProp1 = 3
      tr.testProp1 = 4
      tr.endAction()

      await sleep(100)

      tr.propChangesEventHandlerTimes.should.be.equal(1)
    })
  })
})
