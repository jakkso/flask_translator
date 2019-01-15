import React, { Component } from 'react';
import './App.css';

import MainView from './comps/main/main';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/*<header className="App-header">*/}
        {/*Translate some stuff*/}
        {/*</header>*/}
        <MainView/>
      </div>
    );
  }
}

export default App;
