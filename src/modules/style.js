const raf =
  (typeof window !== 'undefined' && window.requestAnimationFrame) ||
  window.webkitRequestAnimationFrame ||
  setTimeout
// nest frame
const nextFrame = fn => {
  raf(() => {
    raf(fn)
  })
}
// set next frame
const setNextFrame = (obj, prop, value) => {
  nextFrame(() => {
    obj[prop] = value
  })
}

// update current node's style
const updateStyle = (oldNode, vnode) => {
  let oldStyle = oldNode.data.style
  let style = oldNode.data.style

  const elem = vnode.elem
  let cur, name

  if (!oldStyle && !style) return
  if (oldStyle === style) return

  oldStyle = oldStyle || {}
  style = style || {}

  let oldHasDel = 'delayed' in oldStyle
  // delete the prop not in Style
  for (name in oldStyle) {
    if (!style[name]) {
      elem.style[name] = ''
    }
  }

  for (name in style) {
    cur = style[name]
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name]
        // if vnode's delayed is different to the oldNode, update the vnode's style
        if (!oldHasDel || !oldStyle.delayed[name]) {
          setNextFrame(elem.style, name, cur)
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      //
      elem.style[name] = cur
    }
  }
}
// when the node is been destroyed, set the style
const applyDestroyedStyle = vnode => {
  let style,
    elem = vnode.elem,
    s = vnode.data.style,
    name
  if (!s || !(style = s.destroy)) return
  for (name in style) {
    elem.style[name] = style[name]
  }
}

const applyRemoveStyle = (vnode, rm) => {
  let s = vnode.data.style
  if (!s || !s.remove) {
    // global remove hook
    rm()
    return
  }
  let name,
    elem = vnode.elem,
    idx,
    maxDuring = 0,
    computedStyle,
    style = s.remove,
    amount = 0,
    applied = []
  //设置并记录remove动作后删除节点前的样式
  for (name in style) {
    applied.push(name)
    elem.style[name] = style[name]
  }

  computedStyle = getComputedStyle(elem)
  // 拿到所有需要过度的属性
  let props = compStyle['transition-property'].split(', ')
  // 对过渡属性计数，这里applied.length >=amount，因为有些属性是不需要过渡的
  for (let i, l = props.length; i < l; ++i) {
    if (applied.indexOf(props[i] > -1)) amount++
  }
  // 当过度效果完成之后，再执行删除节点的操作
  elem.addEventListener('transitionend', function(e) {
    if (e.target === elem) --amount
    if (amount) rm()
  })
}

export default {
  create: updateStyle,
  update: updateStyle,
  destroy: applyDestroyedStyle,
  remove: applyRemoveStyle
}
