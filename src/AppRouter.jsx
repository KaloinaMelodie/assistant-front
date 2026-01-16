import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import App from './components/demo/demo.jsx'
import App from './App.jsx'
import Login from './components/contents/Login.jsx'
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import AppDemo from './components/demo/demo.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import Forbidden from './components/contents/Forbidden.jsx';
import { AuthProvider } from './components/auth/AuthContext.jsx';
import Navigation from './components/contents/Navigation.jsx';
import NotFound from './components/contents/NotFound.jsx';
import Traduction from './components/contents/Traduction.jsx';
import Mess from './components/contents/Mess.jsx';
import Conv from './components/contents/Conv.jsx';
import Admins from './components/contents/Admins.jsx';
import Logs from './components/contents/Log.jsx';
import Console from './components/contents/Console.jsx';

const AppRouter = () => (
  <BrowserRouter>
    <AuthProvider>

      <Routes>
        <Route path="/" element={<DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>}>
          <Route index element={<Navigate to="index" replace />} />

          <Route path="login" element={<Login />} />

          <Route
            path="index"
            element={<ProtectedRoute allowedRoles={['admin', 'user']}>
                <Navigation />
            </ProtectedRoute>} />
          <Route
            path="traduction"
            element={<ProtectedRoute allowedRoles={['admin']}>
                <Traduction />
            </ProtectedRoute>} />
          <Route
            path="admins"
            element={<ProtectedRoute allowedRoles={['admin']}>
                <Admins />
            </ProtectedRoute>} />
          <Route
            path="logs"
            element={<ProtectedRoute allowedRoles={['admin']}>
                <Logs />
            </ProtectedRoute>} />

            <Route
            path="console"
            element={<ProtectedRoute allowedRoles={['admin']}>
                <Console />
            </ProtectedRoute>} />


          <Route path="demo" element={<ProtectedRoute allowedRoles={['admin','user']}>
            <AppDemo />
          </ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        <Route path="403" element={<Forbidden homeTo="/index" />} />
        <Route path="mess" element={<Mess />} />
        <Route path="conv" element={<Conv />} />
        </Route>

        {/* <Route path="*" element={<Navigate to="/index" replace />} /> */}

      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
