import test from 'ava'
import tp from '../'

test('run string src', t => {
  t.log('!')
  tp('test/posts', 'test/dest')
  t.pass();
})

test('run string[] src', t => {
  t.log('!!')
  // tp(['test/posts', 'test/drafts'], 'test/dest')
  t.pass();
})