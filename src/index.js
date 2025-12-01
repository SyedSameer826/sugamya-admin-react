import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import 'bootstrap/dist/css/bootstrap.min.css';
import "antd/dist/antd.css";
import "antd/dist/antd.min.css";

const resizeObserverLoopErrFn = () => {
  const resizeObserverErr = Error.prototype.toString.call(new Error()).replace('Error', 'ResizeObserver loop limit exceeded');
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop limit exceeded' || e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div');
      const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay');
      if (resizeObserverErrDiv) {
        resizeObserverErrDiv.style.display = 'none';
      }
      if (resizeObserverErr) {
        resizeObserverErr.style.display = 'none';
      }
      console.log('ResizeObserver loop error suppressed');
    }
  });
};
resizeObserverLoopErrFn();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
