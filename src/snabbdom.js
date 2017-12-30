import domApi from './utils/htmldomapi'
import vnode, { isSameNode, isVnode } from './helper/vnode'
import is from './utils/is'
// 创建key到对应的index的映射关系
const createKeyToOldIdx = (children, beginIdx, endIdx) => {
  let map = {},
    key
  for (let i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (is.Def(children[i])) map[key] = i
  }
  return map
}
const emptyNode = vnode('', {}, [], undefined, undefined)
const hooks = ['create', 'update', 'destroy', 'remove', 'pre', 'post']
// 转化真实的dom为
const emptyNodeAt = elem => {
  let id = elem.id ? '#' + elem.id : ''
  let c = elem.className ? '.' + elem.className.split(' ').join('.') : ''
  return vnode(
    domApi.tagName(elem).toLowerCase() + id + c,
    {},
    [],
    undefined,
    elem
  )
}

export default function init(modules = [], api) {
  if (is.unDef(api)) api = domApi
  let cbs = {},
    i,
    j
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
}
