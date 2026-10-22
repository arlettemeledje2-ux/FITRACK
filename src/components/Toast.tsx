"use client";

export default function Toast({ message, action, onAction }: { message: string; action?: string; onAction?: () => void }) {
  if (!message) return null;
  return <div className="fitrack-toast" role="status" aria-live="polite"><span>{message}</span>{action && onAction && <button type="button" onClick={onAction}>{action}</button>}</div>;
}
