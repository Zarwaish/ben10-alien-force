import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('local_session');
    localStorage.removeItem('admin_session');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#050505',
          color: '#00ff00',
          fontFamily: 'monospace',
          padding: '20px',
          textAlign: 'center'
        }}>
          <AlertTriangle size={64} color="#ff3333" style={{ marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(255,0,0,0.5))' }} />
          <h1 style={{ fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase', color: '#ff3333' }}>
            CRITICAL SYSTEM ERROR
          </h1>
          <p style={{ color: '#888', maxWidth: '500px', margin: '15px 0 30px', fontSize: '14px', lineHeight: '1.6' }}>
            The Plumber Command Console encountered an unhandled exception. DNA registry sync or session data might be corrupted.
          </p>
          <div style={{
            background: 'rgba(255, 0, 0, 0.05)',
            border: '1px solid rgba(255, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#ff8888',
            maxWidth: '600px',
            marginBottom: '30px',
            overflowX: 'auto',
            textAlign: 'left',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error && this.state.error.toString()}
          </div>
          <button 
            onClick={this.handleReset}
            style={{
              background: '#ff3333',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '30px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '1px',
              transition: '0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#ff5555'}
            onMouseOut={(e) => e.target.style.background = '#ff3333'}
          >
            <RefreshCw size={16} />
            Reboot Command Hub
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
