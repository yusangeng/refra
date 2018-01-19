/* global describe it */

import 'babel-polyfill'
import chai from 'chai'
import mix from 'mix-with'
import reactive from '../src/decorator/reactive'
import computed from '../src/decorator/computed'
import { action, asyncAction } from '../src/decorator/action'
import reaction from '../src/decorator/reaction'
import props from '../src/decorator/props'
import Eventable from '../src/Eventable'

chai.should()

@reactive
class MyClass extends Eventable {
  @props({
    a: 0,
    b: 0
  })

  @computed
  get c () {
    return this.a + this.b
  }

  @reaction
  someReaction () {
    console.log('someReaction', this.a, this.b, this.c)
  }

  @action
  somAction (aa, bb) {
    this.a += aa
    this.b += bb
  }

  @asyncAction 
  someAsyncAction(end, aa, bb) {
    setTimeout(_ => {
      this.a += aa, 
      this.b += bb
      end()
    })
  }
}

// FIXME: 单元测试待补充
describe('Reactive', _ => {
  describe('#overview', _ => {
    it('should be alright.', done => {
      const obj = new MyClass()
      var c = 0
      obj.on('prop-change:c', _ => c += 1)

      obj.getPropValues().should.be.deep.eq({
        a: 0,
        b: 0,
        c: 0
      })

      obj.hasProp('a').should.be.eq(true)
      obj.hasProp('e').should.be.eq(false)

      obj.somAction(1, -1)

      obj.a += 1
      obj.b += -1

      obj.setPropValues({
        a: obj.a + 5,
        b: obj.b + -5
      })

      obj.getPropValues().should.be.deep.eq({
        a: 7,
        b: -7,
        c: 0
      })

      obj.setPropValues({
        a: 7,
        b: -7
      })

      obj.someAsyncAction(1, -2)
  
      setTimeout(_ => {
        obj.c.should.be.eq(-1)
        c.should.be.eq(6)
        obj.dispose()
        done()
      }, 100)
    })
  })
})
