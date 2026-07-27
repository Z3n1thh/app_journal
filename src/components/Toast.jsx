export default function Toast({ message, action, onAction, onDismiss }) {
  if (!message) return null
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      {action && <button className="toast-action" onClick={onAction}>{action}</button>}
      <button className="toast-close" onClick={onDismiss} aria-label="Dismiss">✕</button>
    </div>
  )
}
