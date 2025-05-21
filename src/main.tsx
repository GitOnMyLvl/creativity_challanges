import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Import FontAwesome CSS before other styles
import '@fortawesome/fontawesome-svg-core/styles.css'
import { config } from '@fortawesome/fontawesome-svg-core'
import './index.css'
import App from './App.tsx'

// Prevent FontAwesome from dynamically adding its CSS
config.autoAddCss = false

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
