import React, { Component } from 'react';
import Sidebar from './components/Layout/Sidebar/Sidebar';
import Header from './components/Layout/Header/Header';
import Map from './components/Layout/Map/Map';
import Risk from './components/Layout/Risk/Risk';
import './App.scss';

import MapParent from './containers/MapParent'
import EbolaChartComponent from './containers/Chart/EbolaChartComponent'

class App extends Component {
  render() {
    return (
      <div className="app">
        <Sidebar />
        <Header />
        <MapParent />
        {/* <Risk /> */}
        <EbolaChartComponent />
      </div>
    );
  }
}

export default App;
