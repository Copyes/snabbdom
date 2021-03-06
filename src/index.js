import init from './snabbdom'
import h from './helper/h'
import classModule from './modules/class'
import styleModule from './modules/style'
import propsModule from './modules/props'
import attrsModule from './modules/attrs'

const patch = init([classModule, styleModule, propsModule, attrsModule])
const container = document.getElementById('container')

var nextKey = 11
var margin = 8
var sortBy = 'rank'
var totalHeight = 0
var originalData = [
  {
    rank: 1,
    title: 'The Shawshank Redemption',
    desc:
      'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    elmHeight: 0
  },
  {
    rank: 2,
    title: 'The Godfather',
    desc:
      'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    elmHeight: 0
  },
  {
    rank: 3,
    title: 'The Godfather: Part II',
    desc:
      'The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.',
    elmHeight: 0
  },
  {
    rank: 4,
    title: 'The Dark Knight',
    desc:
      'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.',
    elmHeight: 0
  },
  {
    rank: 5,
    title: 'Pulp Fiction',
    desc:
      "The lives of two mob hit men, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    elmHeight: 0
  },
  {
    rank: 6,
    title: "Schindler's List",
    desc:
      'In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.',
    elmHeight: 0
  },
  {
    rank: 7,
    title: '12 Angry Men',
    desc:
      'A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.',
    elmHeight: 0
  },
  {
    rank: 8,
    title: 'The Good, the Bad and the Ugly',
    desc:
      'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.',
    elmHeight: 0
  },
  {
    rank: 9,
    title: 'The Lord of the Rings: The Return of the King',
    desc:
      "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
    elmHeight: 0
  },
  {
    rank: 10,
    title: 'Fight Club',
    desc:
      'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...',
    elmHeight: 0
  }
]
var data = [
  originalData[0],
  originalData[1],
  originalData[2],
  originalData[3],
  originalData[4],
  originalData[5],
  originalData[6],
  originalData[7],
  originalData[8],
  originalData[9]
]

function movieView(movie) {
  return h(
    'div.row',
    {
      key: movie.rank,
      style: {
        opacity: '0',
        transform: 'translate(100px)',
        delayed: { transform: `translateY(${movie.offset}px)`, opacity: '1' },
        remove: {
          opacity: '0',
          transform: `translateY(${movie.offset}px) translateX(200px)`
        }
      },
      hook: {
        insert: vnode => {
          movie.elmHeight = vnode.elem.offsetHeight
        }
      }
    },
    [
      h('div', { style: { fontWeight: 'bold' } }, movie.rank),
      h('div', movie.title),
      h('div', movie.desc),
      h('div.btn.rm-btn', 'x'),
      h('a', { props: { href: '/foo' } }, 'take you places!')
    ]
  )
}

const vnode = h('div', [
  h('h1', { attrs: { 'data-src': 'xxxxx' } }, 'Top 10 movies'),
  h('div', [
    h('a.btn.add', 'Add'),
    'Sort by: ',
    h('span.btn-group', [
      h(
        'a.btn.rank',
        {
          class: { active: sortBy === 'rank' }
        },
        'Rank'
      ),
      h(
        'a.btn.title',
        {
          class: { active: sortBy === 'title' }
        },
        'Title'
      ),
      h(
        'a.btn.desc',
        {
          class: { active: sortBy === 'desc' }
        },
        'Description'
      )
    ])
  ]),
  h('div.list', { style: { height: totalHeight + 'px' } }, data.map(movieView))
])

const vnode1 = h('div.a', [
  h('h1', { attrs: { 'data-src': 'xxxxx' } }, 'Top 10 movies'),
  h('h1', { attrs: { 'data-src': 'xxxxx' } }, 'Top 10 movies')
])

const vnode2 = h('div.a', [
  h('h2', { attrs: { 'data-src': 'yyyyy' } }, 'Top 20 movies'),
  h('h2', { attrs: { 'data-src': 'yyyyy' } }, 'Top 30 beautys')
])
let a = patch(container, vnode2)
patch(a, vnode1)
// patch(container, vnode)
