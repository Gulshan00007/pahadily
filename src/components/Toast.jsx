import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
        maxWidth: '400px',
        backgroundColor: isError ? '#C62828' : '#0A251B',
        color: '#FFFFFF',
        padding: '14px 20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(142, 228, 154, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13.5px',
        lineHeight: '1.4',
        animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      role="alert"
    >
      <div style={{ flexShrink: 0 }}>
        {isError ? (
          <AlertCircle size={20} color="#FFCDD2" />
        ) : isSuccess ? (
          <CheckCircle2 size={20} color="#8EE49A" />
        ) : (
          <Info size={20} color="#8EE49A" />
        )}
      </div>
      <div style={{ flex: 1, fontWeight: '500' }}>{toast.message}</div>
    </div>
  );
}
