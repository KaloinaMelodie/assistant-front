import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '@fortawesome/fontawesome-free/css/all.min.css';
// import './App.css'
import TopBar from './components/layout/TopBar';

import { Outlet } from 'react-router-dom'
function App() {

  return (
    <>
      <div id="main">
        <TopBar />
        <Outlet />
      </div>
    </>
  );
}

export default App
