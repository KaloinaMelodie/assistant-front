import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import '@fortawesome/fontawesome-free/css/all.min.css';
// import './App.css'
import TopBar from './components/layout/TopBar';

import SideBar from './components/layout/SideBar';
import Login from './components/contents/Login';
import { Outlet } from 'react-router-dom'
function App() {


  // return (
  //   <>
  //     <div>
  //       <a href="https://vite.dev" target="_blank">
  //         <img src={viteLogo} classNameName="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} classNameName="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div classNameName="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.jsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p classNameName="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )

  return (
    <>
      <div id="main">
        <TopBar />
        <div>
          <div className="resource-guide">
            <SideBar />
            <div className="resource-guide-right-content">
              <div class="resource-guide-content-area">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
