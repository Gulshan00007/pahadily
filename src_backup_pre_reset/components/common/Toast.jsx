import { useAuth } from "../../context/AuthContext";

function Toast() {
  const { toast } = useAuth();
  if (!toast) return null;

  const isSuccess = toast.type === "success" || !toast.type;
  const isError = toast.type === "error";

  return (
    <div className={`pahadily-toast ${toast.type || "success"}`} role="alert">
      <div className="toast-icon">
        {isSuccess && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {isError && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}
        {!isSuccess && !isError && (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>
      <div className="toast-message">{toast.message}</div>
    </div>
  );
}

export default Toast;
