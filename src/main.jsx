import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Loop root render failed', error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background: '#f8f7ff',
          color: '#26215C',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{
            width: 'min(760px, 100%)',
            background: '#fff',
            border: '1px solid #D6D3F7',
            borderRadius: 20,
            boxShadow: '0 16px 36px rgba(83, 74, 183, 0.08)',
            padding: 24,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#534AB7' }}>
              Loop Error
            </div>
            <h1 style={{ margin: '12px 0 8px', fontSize: 28, lineHeight: 1.1 }}>
              The app loaded, but a runtime error stopped the page from rendering.
            </h1>
            <p style={{ margin: 0, color: '#6B63B5', lineHeight: 1.6 }}>
              Copy the error below and we can fix it directly.
            </p>
            <pre style={{
              marginTop: 18,
              padding: 16,
              borderRadius: 14,
              background: '#F4F3FF',
              color: '#26215C',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
