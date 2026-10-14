import { useAuth } from '../context/AuthContext';

export default function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        maxWidth: '420px',
        backgroundColor: isError ? '#8b2500' : isSuccess ? '#10251D' : '#174D39',
        color: '#F7F5EE',
        padding: '14px 20px',
        borderRadius: '12px',
        boxShadow: '0 12px 32px rgba(10, 37, 27, 0.25)',
        border: '1px solid rgba(142, 228, 154, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideUp 0.3s ease-out',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '14px',
        lineHeight: '1.4',
      }}
      role="alert"
    >
      <span style={{ fontSize: '18px' }}>
        {isError ? '⚠️' : isSuccess ? '🌲' : 'ℹ️'}
      </span>
      <div style={{ flex: 1 }}>{toast.message}</div>
    </div>
  );
}
