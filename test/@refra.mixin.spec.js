/* global describe it */

import chai from 'chai'

import { sleep } from 'polygala'
import {
  obx,
  action,
  reaction,
  refra
} from '../src/decorator'

chai.should()

@refra.mixin({
  obx: {
    a: 1,
    b: 2,
    d: 0,
    c () {
      return this.a + this.b
    }
  },

  action: {
    async aPlus1 () {
      await sleep(10)
      this.a += 1
    }
  },

  reaction: [
    {
      obx: ['c'],
      onChange () {
        this.d += 1
      }
    }
  ]
})
class TestClass {
  @obx x = 1
  @obx y = 2
  @obx get z () {
    return this.y - this.x
  }
  @obx w = 0

  @action xPlus1 () {
    this.x += 1
  }

  @reaction('z')
  onZChange () {
    this.w += 1
  }
}

describe('@refra.mixin', () => {
  describe('#constructor', () => {
    it('should NOT throw', async () => {
      void new TestClass()
    })

    it('should have right props', async () => {
      const obj = new TestClass()

      obj.x.should.be.eq(1)
      obj.y.should.be.eq(2)
      obj.z.should.be.eq(1)
      obj.w.should.be.eq(0)
      obj.a.should.be.eq(1)
      obj.b.should.be.eq(2)
      obj.c.should.be.eq(3)
      obj.d.should.be.eq(0)
    })

    it('should have right actions', async () => {
      const obj = new TestClass()

      obj.xPlus1()
      obj.x.should.be.eq(2)
      obj.z.should.be.eq(0)
      await sleep(100)
      obj.w.should.be.eq(1)
    })

    it('should have right actions2', async () => {
      const obj = new TestClass()

      obj.aPlus1()
      await sleep(100)
      obj.a.should.be.eq(2)
      obj.c.should.be.eq(4)
      obj.d.should.be.eq(1)
    })
  })
})
