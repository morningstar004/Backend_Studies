const BACKEND_STATUS_EVENT = "app:backend-status";
let backendReachable = null;

export const getBackendReachability = () => backendReachable;

export const reportBackendReachability = (reachable) => {
  backendReachable = reachable;
  window.dispatchEvent(
    new CustomEvent(BACKEND_STATUS_EVENT, { detail: reachable }),
  );
};

export const backendStatusEvent = BACKEND_STATUS_EVENT;
