/* global describe it */

import 'babel-polyfill'
import chai from 'chai'

import { sleep } from 'polygala'
import {
  eventable,
  on
} from '../src/decorator'

chai.should()

let i = 0

@eventable
class MyClass {
  @on('click')
  onclick () {
    i += 1
  }
}

describe('@eventable', async () => {
  it('should be invoked', async () => {
    const m = new MyClass()

    m.trigger('click')

    await sleep(100)

    i.should.be.equal(1)
  })
})
