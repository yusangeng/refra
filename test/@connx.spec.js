/* global describe it */

import 'babel-polyfill'
import chai from 'chai'

import { sleep } from 'polygala'
import {
  refra,
  obx,
  connx,
  reaction
} from '../src/decorator'

chai.should()

let i = 0

@refra
class MySubModel {
  @obx prop1 = 0
  @obx prop2 = 1
}

@refra
class MyModel {
  @connx child = new MySubModel()

  @reaction('child')
  onChildChange () {
    console.log('onChildChange')
    i += this.child.prop2
  }
}

describe('@connx', async () => {
  it('reaction should be invoked', async () => {
    const mdl = new MyModel()
    const chd = mdl.getChild('child')

    chd.prop1 = 9

    await sleep(100)

    i.should.be.equal(1)
  })
})
