const createElement = tagName => {
  return document.createElement(tagName)
}
const createTextNode = text => {
  return document.createTextNode(text)
}
const insertBefore = (parentNode, newNode, referenceNode) => {
  parentNode.insertBefore(newNode, referenceNode)
}
const removeChild = (node, child) => {
  node.removeChild(child)
}
const appendChild = (node, child) => {
  node.appendChild(child)
}
const parentNode = node => {
  return node.parentElement
}
const nextSibling = node => {
  return node.nextSibling
}
const tagName = node => {
  return node.tagName
}
export default {
  createElement,
  createTextNode,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName
}
