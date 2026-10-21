import { dehydrate, hydrate } from "@tanstack/react-query";

const QUERY_CACHE_KEY = "youtube-clone:query-cache";
const QUERY_CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const OFFLINE_USER_KEY = "youtube-clone:offline-user";

export const readOfflineUser = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(OFFLINE_USER_KEY) || "null");
    if (
      !saved?.user ||
      Date.now() - saved.savedAt > QUERY_CACHE_MAX_AGE ||
      typeof saved.user._id !== "string"
    ) {
      localStorage.removeItem(OFFLINE_USER_KEY);
      return null;
    }
    return saved.user;
  } catch {
    return null;
  }
};

export const saveOfflineUser = (user) => {
  try {
    if (!user?._id) {
      localStorage.removeItem(OFFLINE_USER_KEY);
      return;
    }

    const cachedUser = Object.fromEntries(
      [
        "_id",
        "username",
        "fullName",
        "avatar",
        "coverImage",
        "createdAt",
        "subscribersCount",
        "videosCount",
        "viewsCount",
      ]
        .filter((key) => user[key] !== undefined)
        .map((key) => [key, user[key]]),
    );
    localStorage.setItem(
      OFFLINE_USER_KEY,
      JSON.stringify({ savedAt: Date.now(), user: cachedUser }),
    );
  } catch (error) {
    console.warn("Unable to save the offline account state.", error);
  }
};

export const clearOfflineCache = () => {
  try {
    localStorage.removeItem(QUERY_CACHE_KEY);
    localStorage.removeItem(OFFLINE_USER_KEY);
  } catch (error) {
    console.warn("Unable to clear the offline content cache.", error);
  }
};

export const restoreQueryCache = (queryClient) => {
  try {
    const saved = JSON.parse(localStorage.getItem(QUERY_CACHE_KEY) || "null");
    if (!saved || Date.now() - saved.savedAt > QUERY_CACHE_MAX_AGE) {
      localStorage.removeItem(QUERY_CACHE_KEY);
      return;
    }
    hydrate(queryClient, saved.state);
  } catch (error) {
    console.warn("Unable to restore offline content cache.", error);
    try {
      localStorage.removeItem(QUERY_CACHE_KEY);
    } catch (storageError) {
      console.warn(
        "Unable to remove the invalid offline content cache.",
        storageError,
      );
    }
  }
};

export const persistQueryCache = (queryClient) => {
  let saveTimer;
  const save = () => {
    window.clearTimeout(saveTimer);
    try {
      const state = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) => query.state.status === "success",
      });
      localStorage.setItem(
        QUERY_CACHE_KEY,
        JSON.stringify({ savedAt: Date.now(), state }),
      );
    } catch (error) {
      console.warn("Unable to save offline content cache.", error);
    }
  };
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(save, 300);
  });
  window.addEventListener("pagehide", save);

  return () => {
    window.clearTimeout(saveTimer);
    window.removeEventListener("pagehide", save);
    unsubscribe();
  };
};
