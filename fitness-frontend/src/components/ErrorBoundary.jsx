import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px',
          padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 style={{ color: '#D4FF33', fontSize: '24px', fontWeight: 'bold' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#888', maxWidth: '400px' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{
              backgroundColor: '#D4FF33',
              color: '#000',
              fontWeight: 'bold',
              padding: '12px 28px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
            }}>
            Back to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;