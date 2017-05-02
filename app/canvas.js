import React from 'react'
import brush from './brush'
import Cursor from './cursor'
import { domEl } from './dom'
import { trackDrag, trackMove } from './track'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    this.context = this.canvas.getContext('2d')
    this.paintbrush = brush(this.context)

    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    })

    const element = domEl(this.canvas)

    trackMove(element, position => this.setState({ position }))
    trackDrag(element, this.handleDrag.bind(this))
    this.draw()
  }

  handleDrag (drag) {
    let { lines } = this.props;

    if (drag.dragging) {
      lines[lines.length - 1] = {
        points: drag.points,
        color: this.props.color,
        radius: this.props.radius
      }
    } else {
      lines.push({})
    }

    this.props.onDraw({
      type: 'FINGERPAINTING',
      payload: lines,
      connected: true
    })
  }

  componentDidUpdate () {
    this.draw()
  }

  draw () {
    this.context.clearRect(0,0,this.state.width,this.state.height)
    this.paintbrush.lines(this.props.lines)
  }

  render () {
    const { color, radius } = this.props
    const { height, width, position } = this.state
    return (
      <div>
        <canvas
          width={width}
          height={height}
          ref={canvas => this.canvas = canvas} />
        <Cursor
          radius={radius}
          color={color}
          position={position} />
      </div>
    )
  }
}

