/* global describe it */

import chai from 'chai'

import { sleep } from 'polygala'
import createRefraClass from '../src/createRefraClass'

chai.should()

const Clazz = createRefraClass({
  obx: {
    a: 1,
    b: function () {
      return this.a + 1
    },
    c: 0
  },

  action: {
    plus1 () {
      this.a += 1
    }
  },

  reaction: [
    {
      obx: ['a'],
      onAChange () {
        console.log(`reaction: a changed, a = ${this.a}`)
        this.c += 1
      }
    }
  ],

  method: {
    aandb () {
      return this.a + this.b
    }
  }
})

describe('createRefraClass', async () => {
  it('#createRefraClass', async () => {
    const inst = new Clazz()

    inst.probe.print = true
    inst.plus1()
    inst.plus1()
    inst.plus1()
    inst.plus1()

    await sleep(10)

    inst.a.should.be.eq(5)
    inst.b.should.be.eq(6)
    inst.c.should.be.eq(1)
    inst.aandb().should.be.eq(11)
  })
})
