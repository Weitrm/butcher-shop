import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ButcherShopApp } from './ButcherShopApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ButcherShopApp />
  </StrictMode>,
)
