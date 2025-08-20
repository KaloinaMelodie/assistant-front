import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppRouter from './AppRouter';
import './index.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import "./i18n";

createRoot(document.getElementById('root')).render(
  <StrictMode>    
      <AppRouter />
  </StrictMode>,
)
