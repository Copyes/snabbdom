import vnode from './vnode'
import is from '../utils/is'
// 包装函数，将包装过的对象转换成对应的vnode对象
// 第一个参数是选择器，第二个参数是属性，第三个属性是子对象
// 主要是通过判断第三个和第二个参数是否为空来走不通的初始化流程。
export default function h(sel, b, c) {
  let data = {},
    children,
    text
  // 第三个参数不为空的时候
  if (c !== undefined) {
    data = b
    if (is.Arr(c)) {
      children = c
    } else if (is.primitive(c)) {
      // 是否是基本数据类型
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
  // 判断子对象如果是基本数据类型，那么就直接渲染为一个基本数据类型的vnode
  if (is.Arr(children)) {
    for (let i = 0, l = children.length; i < l; ++i) {
      if (is.primitive(children[i])) {
        children[i] = vnode(undefined, undefined, undefined, children[i])
      }
    }
  }
  // 初始化的时候最后的节点设为undefined
  return vnode(sel, data, children, text, undefined)
}
