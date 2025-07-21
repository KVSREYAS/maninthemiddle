import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React from "react";
import { BrowserRouter } from 'react-router-dom';
import ReactDOMClient from 'react-dom/client';


ReactDOMClient.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <App />
    </BrowserRouter>
  </StrictMode>
);
