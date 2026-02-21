import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ButcherShopApp } from './ButcherShopApp'
import { setupChunkLoadRecovery } from './utils/chunkLoadRecovery'
import './index.css'

setupChunkLoadRecovery()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ButcherShopApp />
  </StrictMode>,
)
