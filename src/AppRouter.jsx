import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import App from './components/demo/demo.jsx'
import App from './App.jsx'
import Login from './components/contents/Login.jsx'
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import AppDemo from './components/demo/demo.jsx';


const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        } >
          <Route path="login" element={
            <DndProvider backend={HTML5Backend}>
              <Login />
            </DndProvider>
          } />
        </Route>
        <Route path="/1" element={
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        } />


        <Route path="/demo" element={
          <DndProvider backend={HTML5Backend}>
            <AppDemo />
          </DndProvider>
        } />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
