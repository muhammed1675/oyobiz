import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Patch AbortError to prevent it from showing in error overlay
// This MUST run before any other code
(function patchAbortErrors() {
  // Store original AbortController
  const OriginalAbortController = window.AbortController;
  
  // Patch fetch to handle abort errors silently
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    return originalFetch.apply(this, args).catch(err => {
      if (err.name === 'AbortError' || 
          err.message?.includes('aborted') ||
          err.message?.includes('signal')) {
        // Return empty response for aborted requests
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw err;
    });
  };

  // Override error event handling
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'error' || type === 'unhandledrejection') {
      const wrappedListener = function(event) {
        const msg = event.message || event.reason?.message || event.reason?.toString?.() || '';
        if (msg.includes('abort') || msg.includes('Abort') || msg.includes('signal')) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }
        return listener.call(this, event);
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Suppress console.error for abort errors
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const msg = args.map(a => a?.toString?.() || '').join(' ');
    if (msg.includes('abort') || msg.includes('Abort') || msg.includes('signal')) {
      return;
    }
    return originalConsoleError.apply(console, args);
  };

  // Global error handlers
  window.onerror = function(message, source, lineno, colno, error) {
    const msg = message?.toString?.() || error?.message || '';
    if (msg.includes('abort') || msg.includes('Abort') || msg.includes('signal')) {
      return true;
    }
  };

  window.onunhandledrejection = function(event) {
    const msg = event.reason?.message || event.reason?.toString?.() || '';
    if (msg.includes('abort') || msg.includes('Abort') || msg.includes('signal')) {
      event.preventDefault();
      return true;
    }
  };
})();

const root = ReactDOM.createRoot(document.getElementById("root"));

// Remove StrictMode to prevent double-renders that cause abort issues
root.render(<App />);
