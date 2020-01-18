import React, {Fragment} from 'react';
import './App.css';
import Navbar from './Components/layout/Navbar';
import Landing from './Components/layout/Landing';


const App = () => {
  return (
    <Fragment>
      <Navbar />
      <Landing />
    </Fragment>
  );
}

export default App;
