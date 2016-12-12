import Bench from 'benchmark'
import React, { PropTypes } from 'react'
import { Button, ScrollView, Text, View } from 'react-native'
import uuid from 'uuid'

class Case extends React.Component {
  static propTypes = {
    cfg: PropTypes.object.isRequired
  }
  constructor (props, ctx) {
    super(props, ctx)
    this.state = {
      result: ''
    }
  }
  render () {
    const cfg = this.props.cfg
    return <View style={{ borderBottomWidth: 1, borderBottomColor: 'gray' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', flex: 1 }}>{cfg.name}</Text>
        <Button title='Run' onPress={this.run} />
      </View>
      <Text style={{ fontSize: 8 }}>{this.state.result}</Text>
    </View>
  }
  run = () => {
    const {post, ...tests} = this.props.cfg.test()
    let result = ''
    const suite = new Bench.Suite()
    suite.on('cycle', (e) => {
      result += String(e.target) + '\n'
      if (e.target.error) {
        result += 'Error: ' + e.target.error + '\n'
      }
    })
    suite.on('complete', () => {
      post && post()
      this.setState({result})
    })
    for (let name in tests) {
      suite.add(name, tests[name])
    }
    suite.run()
  }
}

const case1 = {
  name: 'Map vs Object. Create empty',
  test: function () {
    let m
    return {
      'new Map': () => {
        m = new Map()
      },
      'Object literal': () => {
        m = {}
      },
      post: () => {
        if (m === undefined) throw new Error('This should not happen')
      }
    }
  }
}
const case2 = {
  name: 'Map vs Object. Search',
  test: function () {
    const m = new Map()
    const o = {}
    let key
    for (let i = 0; i < 10000; i++) {
      key = uuid.v4()
      m.set(key, i)
      o[key] = i
    }
    let val
    return {
      'Map.get': function () {
        val = m.get(key)
      },
      'Object get': function () {
        val = o[key]
      },
      post: () => {
        if (val === undefined) throw new Error('This should not happen')
      }
    }
  }
}
const case3 = {
  name: 'Object.assign vs handcoded',
  test: function () {
    let target
    const obj = { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e', f: 'f' }
    return {
      'Object.assign': function () {
        target = Object.assign({}, obj)
      },
      'for...in': function () {
        const o = {}
        for (let k in obj) {
          o[k] = obj[k]
        }
        target = o
      },
      'Object.keys, for loop': function () {
        const keys = Object.keys(obj)
        const o = {}
        for (let i = 0; i < keys.length; ++i) {
          o[keys[i]] = obj[keys[i]]
        }
        target = o
      },
      post: function () {
        if (target === undefined) throw new Error('This should not happen')
      }
    }
  }
}

export default class JsPerf extends React.Component {
  render () {
    return <ScrollView>
      <Case cfg={case1} />
      <Case cfg={case2} />
      <Case cfg={case3} />
    </ScrollView>
  }
}
