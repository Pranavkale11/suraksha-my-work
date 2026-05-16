import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { JudgeModeProvider } from './contexts/JudgeModeContext.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JudgeModeProvider>
      <App />
    </JudgeModeProvider>
  </React.StrictMode>,
)
