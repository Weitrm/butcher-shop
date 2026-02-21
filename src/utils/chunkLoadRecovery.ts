const CHUNK_RELOAD_KEY = "chunk-load-retry";

const DYNAMIC_IMPORT_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\d]+ failed/i,
];

const getErrorMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "";
};

const isDynamicImportError = (value: unknown) => {
  const message = getErrorMessage(value);
  return DYNAMIC_IMPORT_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

const reloadPageOnce = () => {
  const hasRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true";

  if (hasRetried) {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    return;
  }

  sessionStorage.setItem(CHUNK_RELOAD_KEY, "true");
  window.location.reload();
};

export const setupChunkLoadRecovery = () => {
  if (import.meta.env.DEV) return;

  if (sessionStorage.getItem(CHUNK_RELOAD_KEY) === "true") {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadPageOnce();
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (!isDynamicImportError(event.reason)) return;

    event.preventDefault();
    reloadPageOnce();
  });
};
