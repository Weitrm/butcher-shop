import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CarniceriaApp } from './CarniceriaApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CarniceriaApp />
  </StrictMode>,
)
