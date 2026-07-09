import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg)  => addToast(msg, 'success'),
    error:   (msg)  => addToast(msg, 'error'),
    info:    (msg)  => addToast(msg, 'info'),
  };

  const bgColor = (type) => {
    if (type === 'success') return '#1a2e00';
    if (type === 'error')   return '#2e0000';
    return '#1a1a2e';
  };

  const borderColor = (type) => {
    if (type === 'success') return '#D4FF33';
    if (type === 'error')   return '#f87171';
    return '#60a5fa';
  };

  const icon = (type) => {
    if (type === 'success') return '✅';
    if (type === 'error')   return '❌';
    return 'ℹ️';
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div style={{
        position:  'fixed',
        bottom:    '90px',
        right:     '16px',
        zIndex:    9999,
        display:   'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '320px',
        width: '100%',
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            backgroundColor: bgColor(t.type),
            border:          `1px solid ${borderColor(t.type)}`,
            borderRadius:    '12px',
            padding:         '12px 16px',
            display:         'flex',
            alignItems:      'center',
            gap:             '10px',
            animation:       'slideIn 0.2s ease',
            boxShadow:       '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            <span>{icon(t.type)}</span>
            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
              {t.message}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};