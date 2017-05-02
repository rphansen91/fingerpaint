import React from 'react'
import ReactDOM from 'react-dom'
import Main from './main'

const dispatch = (action) => {
  console.log('Dispatching', action)
}

ReactDOM.render(
  <Main dispatch={dispatch}  />,
  document.getElementById('root')
)
