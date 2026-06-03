import { Component } from 'react'
import './app.scss'

class App extends Component {
  componentDidShow() {}

  componentDidHide() {}

  render() {
    return this.props.children
  }
}

export default App
