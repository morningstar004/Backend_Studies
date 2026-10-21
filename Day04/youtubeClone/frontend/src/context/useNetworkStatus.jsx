import { useEffect, useState } from "react";
import {
  backendStatusEvent,
  getBackendReachability,
} from "./networkStatus.js";
import { checkApiHealth } from "../api/apiClient.js";

export function useNetworkStatus() {
  const [status, setStatus] = useState(() => ({
    browserOnline: navigator.onLine,
    backendReachable: getBackendReachability(),
  }));

  useEffect(() => {
    const updateStatus = () => {
      setStatus({
        browserOnline: navigator.onLine,
        backendReachable: getBackendReachability(),
      });
    };
    const checkBackend = () => {
      if (navigator.onLine) {
        checkApiHealth().catch(() => {});
      }
    };
    const handleOnline = () => {
      updateStatus();
      checkBackend();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", updateStatus);
    window.addEventListener(backendStatusEvent, updateStatus);
    checkBackend();
    const healthCheckTimer = window.setInterval(checkBackend, 30_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", updateStatus);
      window.removeEventListener(backendStatusEvent, updateStatus);
      window.clearInterval(healthCheckTimer);
    };
  }, []);

  return {
    isOffline:
      !status.browserOnline || status.backendReachable === false,
    browserOnline: status.browserOnline,
  };
}
