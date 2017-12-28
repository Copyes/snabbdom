import h from './helper/h'
console.log(h('div.hero.header-title', { style: { width: 100 } }, 1111))
console.log(
  h('div#test.test', { style: { width: 11, height: 22 } }, [
    h('div#child', { style: { width: 11 } }, 'aaaaa')
  ])
)
