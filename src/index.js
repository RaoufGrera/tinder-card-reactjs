import { render } from 'react-dom'
import React, { useState } from 'react'
import { useSprings, animated, interpolate } from 'react-spring'
import { useGesture } from 'react-use-gesture'
import './index.css'

const cards = [
  'https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/0/0f/Wands02.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wands03.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a4/Wands04.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/9/9d/Wands05.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/3/3b/Wands06.jpg'
]

//  These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = i => ({ x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100 })
const from = i => ({ x: 0, rot: 0, scale: 1.5, y: -1000 })
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`

function Deck() {
  const [gone] = useState(() => new Set()) // The set flags all the cards that are flicked out
  const [props, set] = useSprings(cards.length, i => ({ ...to(i), from: from(i) })) // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity

  const determineDirCard = (x, index) => {
    console.log("Index:", index, "Direction:", x < 0 ? "Left ❌" : "Right ❤️")
  }
  const bind = useGesture(({ args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity }) => {
    const trigger = velocity > 0.2 // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1 // Direction should either point left or right
    if (!down && trigger) gone.add(index) // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    set(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index)
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0 // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0) // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1 // Active cards lift up a bit
      if (!down && trigger)
        determineDirCard(x, index)

      return { x, rot, scale, delay: undefined, config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 } }
    })
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || set(i => to(i)), 600)
  })
  // Now we're just mapping the animated values to our view, that's it. Btw, this component only renders once. :-)
  return props.map(({ x, y, rot, scale }, i) => (
    <animated.div key={i} style={{ transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`) }}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div {...bind(i)} style={{ transform: interpolate([rot, scale], trans), backgroundImage: `url(${cards[i]})` }} >


        <animated.svg

          className="tinder-icon  reject"
          style={{
            opacity: interpolate([x, y], (x, y) => `${x / -80} `),
            transform: interpolate([x, scale], (x, scale) => `translate(${x / 10}px, -50%) scale(${(x > -140) ? x / -80 : 1.6})`),
          }}
          viewBox="0 0 96 96"><path d="M19.716 69.213C17.763 71.165 17.763 74.331 19.716 76.284C21.668 78.237 24.834 78.237 26.787 76.284L48.000 55.071L69.213 76.284C71.166 78.237 74.332 78.237 76.284 76.284C78.237 74.332 78.237 71.166 76.284 69.213L55.071 48.000L76.284 26.787C78.237 24.834 78.237 21.668 76.284 19.715C74.332 17.763 71.166 17.763 69.213 19.715L48.000 40.929L26.787 19.716C24.834 17.763 21.668 17.763 19.716 19.716C17.763 21.668 17.763 24.834 19.716 26.787L40.929 48.000L19.716 69.213Z"></path>
        </animated.svg>
        <animated.svg

          className="tinder-icon interest"
          style={{
            opacity: interpolate([x, y], (x, y) => `${x / 80} `),
            transform: interpolate([x, scale], (x, scale) => `translate(${x / 10}px, -50%) scale(${(x < 140) ? x / 80 : 1.6})`),
          }}
          viewBox="0 0 96 96"><path d="M68.661 15.923C59.769 15.923 53.384 20.706 48.445 29.217C48.248 29.556 47.752 29.556 47.555 29.217C42.616 20.706 36.231 15.923 27.339 15.923C15.597 15.923 6 25.858 6 38.165C6 59.802 35.672 79.763 45.136 85.580C46.905 86.667 49.095 86.667 50.864 85.580C60.328 79.766 90 59.819 90 38.278C90 25.858 80.403 15.923 68.661 15.923Z"></path>

        </animated.svg>


      </animated.div>

    </animated.div>
  ))
}
render(<Deck />, document.getElementById('root'))
