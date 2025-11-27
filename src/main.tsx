import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Main from './Scene.tsx'
import { ScrollingHeader } from './ScrollingHeader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScrollingHeader/>
    <Main />
  </StrictMode>
)
