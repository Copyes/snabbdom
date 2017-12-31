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
// 这个函数的主要作用就是将一个真是的dom节点转化成为一个vnode形式
// 例如如<div id='a' class='b c'></div>
// 将转换为
// {sel:'div#a.b.c',data:{},children:[],text:undefined,elm:<div id='a' class='b c'>}
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
const createRmCb = (childElm, listeners) => {
  return function() {
    if (--listeners === 0) {
      let parent = domApi.parentNode(childElm)
      domApi.removeChild(parent, childElm)
    }
  }
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
  console.log(cbs)
  // 手动触发destroy hook
  // 首先是触发每个节点自己的destroy hook
  // 然后是触发全局的destroy hook
  // 最后是递归触发当前vnode的子节点上面的相关destroy hook
  const invokeDestroyHook = vnode => {
    let data = vnode.data,
      i,
      j,
      l

    if (is.Def(data)) {
      if (is.Def((i = data.hook)) && is.Def((i = i.destroy))) i(vnode)
      for (i = 0, l = cbs.destroy.length; i < l; ++i) {
        cbs.destroy[i](vnode)
      }
      if (vnode.children) {
        for (j = 0; j < vnode.children.length; ++j) {
          let temp = vnode.children[j]
          if (temp && typeof temp !== 'string') {
            invokeDestroyHook(temp)
          }
        }
      }
    }
  }
  const addVnodes = (
    parentElem,
    before,
    vnodes,
    startIdx,
    endIdx,
    insertVnodeQueue
  ) => {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(
        parentElem,
        createElem(vnodes[startIdx], insertVnodeQueue),
        before
      )
    }
  }
  const removeVnodes = (parentElem, vnodes, startIdx, endIdx) => {
    for (; startIdx <= endIdx; ++startIdx) {
      let i,
        listeners,
        rm,
        vnode = vnodes[startIdx]
      if (is.Def(vnode)) {
        if (is.Def(vnode.sel)) {
          // 触发destroy hook
          invokeDestroyHook(vnode)
          // 对全局的remove钩子计数
          listeners = cbs.remove.length + 1
          rm = createRmCb(vnode.elem, listeners)
          // 调用全局remove回调函数，并且每次减少一个remove钩子的计数
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](vnode, rm)
          //调用内部vnode.data.hook中的remove钩子（只有一个）
          if (
            is.Def((i = vnode.data)) &&
            is.Def((i = i.hook)) &&
            is.Def((i = i.remove))
          ) {
            i(vnode, rm)
          } else {
            //如果没有内部remove钩子，需要调用rm，确保能够remove节点
            rm()
          }
        } else {
          // 普通的text 节点
          domApi.removeChild(parentElem, vnode)
        }
      }
    }
  }
  /**
   * 初始化vnode，调用init钩子
   * 创建对应tagname的DOM element节点，并将vnode.sel中的id名和class名挂载上去
   * 如果有子vnode，递归创建DOM element节点，并添加到父vnode对应的element节点上去，
   * 否则如果有text属性，则创建text节点，并添加到父vnode对应的element节点上去
   * vnode转换成dom节点操作完成后，调用create钩子
   * 如果vnode上有insert钩子，那么就将这个vnode放入insertedVnodeQueue中作记录，到时
   * 再在全局批量调用insert钩子回调
   * @param {*} vnode
   * @param {*} insertedVnodeQueue
   */
  const createElem = (vnode, insertedVnodeQueue) => {
    let data = vnode.data,
      i
    if (is.Def(data)) {
      if (is.Def((i = data.hook)) && is.Def((i = i.init))) {
        // 调用节点自身的init hook， 调用后该节点的data可能会发生改变
        i(vnode)
        // data 可能在 init hook 中被改变，重新获取。
        data = vnode.data
      } else {
        data = {}
      }
    }

    let elem,
      children = vnode.children,
      sel = vnode.sel
    if (is.Def(sel)) {
      let hashIdx = sel.indexOf('#')
      let dotIdx = sel.indexOf('.', hashIdx)
      let hash = hashIdx > 0 ? hashIdx : sel.length
      let dot = dotIdx > 0 ? dotIdx : sel.length
      // 获取tagname
      let tag =
        hashIdx !== -1 || dotIdx !== -1
          ? sel.slice(0, Math.min(hash, dot))
          : sel
      elem = vnode.elem = is.Def(data) && api.createElement(tag)
      // 获取id名 #a --> a
      if (hash < dot) elem.id = sel.slice(hash + 1, dot)
      // 获取类名，并格式化  .a.b --> a b
      if (dotIdx > 0) elem.className = sel.slice(dot + 1).replace(/\./g, ' ')
      // 插入当前dom对应的子节点对应的真是dom
      if (is.Arr(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elem, createElem(children[i], insertedVnodeQueue))
        }
      } else if (is.primitive(vnode.text)) {
        //如果存在子文本节点，则直接将其插入到当前Vnode节点
        api.appendChild(elem, api.createTextNode(vnode.text))
      }
      // 调用全局的create hook
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode)
      if (is.Def((i = vnode.data.hook))) {
        if (is.Def(i.create)) i.create(emptyNode, vnode)
        //如果有insert钩子，则推进insertedVnodeQueue中作记录，从而实现批量插入触发insert回调
        if (is.Def(i.insert)) insertedVnodeQueue.push(vnode)
      }
    } else {
      //如果没声明选择器，则说明这个是一个text节点
      elem = vnode.elem = api.createTextNode(vnode.text)
    }
    return vnode.elem
  }

  const patchVnode = (oldVNode, vnode, insertedVnodeQueue) => {
    let i, hook
    // 调用prepatch hook
    if (
      is.Def((i = vnode.data)) &&
      is.Def((hook = i.hook)) &&
      is.Def((i = hook.prepatch))
    ) {
      i(oldVNode, vnode)
    }

    let elem = (vnode.elem = oldVNode.elem),
      oldCh = oldVNode.children,
      ch = vnode.children
    //如果oldvnode和vnode的引用相同，说明没发生任何变化直接返回，避免性能浪费
    if (oldVNode === vnode) return
    //如果oldvnode和vnode不同，说明vnode有更新
    //如果vnode和oldvnode不相似则直接用vnode引用的DOM节点去替代oldvnode引用的旧节点
    if (!isSameNode(oldVNode, vnode)) {
      let parentElem = api.parentNode(oldVNode.elem)
      elem = createElem(vnode, insertedVnodeQueue)
      api.insertBefore(parentElem, elem, oldVNode.elem)
      removeNodes(parentElem, [oldVNode], 0, 0)
      return
    }
    //如果vnode和oldvnode相似，那么我们要对oldvnode本身进行更新
    if (is.Def(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVNode, vnode)
      }
      i = vnode.data.hook
      if (is.Def(i) && is.Def((i = i.update))) i.update(oldVNode, vnode)
    }
    // 如果vnode不是text节点
    if (is.unDef(vnode.text)) {
      //如果vnode和oldVnode都有子节点
      if (is.Def(oldCh) && is.Def(ch)) {
        //当Vnode和oldvnode的子节点不同时，调用updatechilren函数，diff子节点
        if (oldCh !== ch) updateChildren(elem, oldch, ch, insertedVnodeQueue)
        //如果vnode有子节点，oldvnode没子节点
      } else if (is.Def(ch)) {
        //oldvnode是text节点，则将elm的text清除
        if (is.Def(oldVNode.text)) api.setTextContent(oldVNode.elem, '')
        //并添加vnode的children
        addVnodes(elem, null, ch, 0, ch.length, insertedVnodeQueue)
        //如果oldvnode有children，而vnode没children，则移除elm的children
      } else if (is.Def(oldCh)) {
        removeNodes(elem, oldCh, 0, oldCh.length - 1)
      } else if (is.Def(oldVNode.text)) {
        api.setTextContent(elem, '')
      }
    } else if (oldVNode.text !== vnode.text) {
      api.setTextContent(elem, vnode.text)
    }
    //patch完，触发postpatch钩子
    if (is.Def(hook) && is.Def((i = hook.postpatch))) {
      i(oldVnode, vnode)
    }
  }
  const updateChildren = (parentElem, oldCh, newCh, insertedVnodeQueue) => {
    let oldStartIdx = 0,
      newStartIdx = 0
    let oldEndIdx = oldCh.length - 1,
      newEndIdx = newCh.length - 1
    let oldStartNode = oldCh[0],
      newStartNode = newCh[0]
    let oldEndNode = oldCh[oldEndIdx],
      newEndNode = newCh[newEndIdx]
    let oldKeyToIdx, before, idxInOld, elemToMove

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (is.unDef(oldStartNode)) {
        oldStartNode = oldCh[++oldStartIdx]
      } else if (is.unDef(oldEndNode)) {
        oldEndNode = oldCh[--oldEndIdx]
      } else if (isSameNode(oldStartNode, newStartNode)) {
        patchVode(oldStartNode, newStartNode, insertedVnodeQueue)
        oldStartNode = oldCh[++oldStartIdx]
        newStartNode = newCh[++newStartIdx]
      } else if (isSameNode(oldEndNode, newEndNode)) {
        patchVnode(oldEndNode, newEndNode, insertedVnodeQueue)
        oldEndNode = oldCh[--oldEndIdx]
        newEndNode = newCh[--newEndIdx]
      } else if (isSameNode(oldStartNode, newEndNode)) {
        patchVnode(oldStartNode, newEndNode, insertedVnodeQueue)
        api.insertBefore(
          parentElem,
          oldStartNode.elem,
          api.nextSibling(oldEndNode.elem)
        )
        oldStartNode = oldCh[++oldStartIdx]
        newEndNode = newCh[--newEndIdx]
      } else if (isSameNode(oldEndNode, newStartNode)) {
        patchVnode(oldEndNode, newStartNode, insertedVnodeQueue)
        api.insertBefore(parentElem, oldEndNode.elem, oldStartNode.elem)
        oldEndNode = oldCh[--oldEndIdx]
        newStartNode = newCh[++newStartIdx]
      } else {
        if (is.unDef(oldKeyToIdx)) {
          //如果不存在旧节点的key-index表，则创建
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
          //找到新节点在旧节点组中对应节点的位置
          idxInOld = oldKeyToIdx[newStartNode.key]
          if (is.unDef(idxInOld)) {
            // 新加入的节点
            api.insertBefore(
              parentElem,
              createElem(newStartNode, insertedVnodeQueue),
              oldStartNode.elem
            )
            newStartNode = newCh[++newStartIdx]
          } else {
            //如果新节点在就旧节点组中存在，先找到对应的旧节点
            elemToMove = oldCh[idxInOld]
            //先将新节点和对应旧节点作更新
            patchVnode(elemToMove, newStartNode, insertedVnodeQueue)
            //然后将旧节点组中对应节点设置为undefined,代表已经遍历过了，不在遍历，否则可能存在重复插入的问题
            oldCh[idxInOld] = undefined
            //插入到旧头索引节点之前
            api.insertBefore(parentElem, elemToMove.elem, oldStartNode.elem)
            newStartNode = newCh[++newStartIdx]
          }
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      //当旧头索引大于旧尾索引时，代表旧节点组已经遍历完，将剩余的新Vnode添加到最后一个新节点的位置后
      before = is.unDef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elem
      addVnodes(
        parentElem,
        before,
        newCh,
        newStartNode,
        newEndIdx,
        insertedVnodeQueue
      )
    } else if (newStartIdx > newEndIdx) {
      //如果新节点组先遍历完，那么代表旧节点组中剩余节点都不需要，所以直接删除
      removeVnodes(parentElem, oldCh, oldStartIdx, oldEndIdx)
    }
  }

  return function(oldVnode, vnode) {
    let i, elem, parent
    let insertedVnodeQueue = []
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]()

    if (is.unDef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode)
    }
    console.log(oldVnode, vnode)
    //如果oldvnode与vnode相似，进行更新
    if (isSameNode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode)
    } else {
      elem = oldVnode.elem
      console.log(elem)
      parent = api.parentNode(elem)
      createElem(vnode, insertedVnodeQueue)
      if (parent !== null) {
        api.insertBefore(parent, vnode.elem, api.nextSibling(elem))
        removeVnodes(parent, [oldVnode], 0, 0)
      }
    }
    //插入完后，调用被插入的vnode的insert钩子
    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i])
    }
    //然后调用全局下的post钩子
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]()
    //返回vnode用作下次patch的oldvnode
    return vnode
  }
}
