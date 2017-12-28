import vnode from './vnode'
import is from '../utils/is'
// 包装函数，将包装过的对象转换成对应的vnode对象
export default function h(sel, b, c) {
  let data = {},
    children,
    text

  if (c !== undefined) {
    data = b
    if (is.Arr(c)) {
      children = c
    } else if (is.primitive(c)) {
      text = c
    }
  } else if (b !== undefined) {
    if (is.Arr(b)) {
      children = b
    } else if (is.primitive(b)) {
      text = b
    } else {
      data = b
    }
  }

  if (is.Arr(children)) {
    for (let i = 0, l = children.length; i < l; ++i) {
      if (is.primitive(children[i])) {
        children[i] = vnode(undefined, undefined, undefined, children[i])
      }
    }
  }

  return vnode(sel, data, children, text, undefined)
}
