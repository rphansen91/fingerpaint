import React from 'react'

export default ({ position, color, radius }) =>
  <div className="cursor"
    style={{
      backgroundColor: color,
      width: (radius * 2) + 'px',
      height: (radius * 2) + 'px',
      left: position ? (position.x - radius) + 'px': 0,
      top: position ? (position.y - radius) + 'px' : 0,
      visibility: position ? 'visible' : 'hidden'
    }} />
