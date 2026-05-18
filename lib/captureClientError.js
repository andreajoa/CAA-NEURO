export function initClientErrorCapture() {
  if (typeof window === "undefined") return;

  window.onerror = (message, source, lineno, colno, error) => {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        source: "frontend",
        message: String(message),
        details: { source, lineno, colno, stack: error?.stack },
      }),
    }).catch(() => {});
    return false;
  };

  window.onunhandledrejection = (event) => {
    fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "error",
        source: "frontend-promise",
        message: String(event.reason),
        details: { stack: event.reason?.stack },
      }),
    }).catch(() => {});
  };
}
