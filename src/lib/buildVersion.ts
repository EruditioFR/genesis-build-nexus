declare const __APP_BUILD_VERSION__: string;

const VERSION_KEY = 'fg_app_build_version_v1';
const REFRESHING_KEY = 'fg_app_build_refreshing_v1';

const getCurrentVersion = () => {
  try {
    return typeof __APP_BUILD_VERSION__ === 'string' ? __APP_BUILD_VERSION__ : 'development';
  } catch {
    return 'development';
  }
};

const addFreshParam = (href: string, version: string) => {
  const url = new URL(href);
  url.searchParams.set('fg_v', version.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24));
  return url.toString();
};

const clearBrowserCaches = async () => {
  if ('caches' in window) {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  }

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }
};

export const refreshStaleAppShell = async () => {
  if (typeof window === 'undefined' || import.meta.env.DEV) {
    return false;
  }

  const currentVersion = getCurrentVersion();

  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    const refreshingVersion = localStorage.getItem(REFRESHING_KEY);

    if (!storedVersion) {
      localStorage.setItem(VERSION_KEY, currentVersion);
      return false;
    }

    if (storedVersion !== currentVersion && refreshingVersion !== currentVersion) {
      localStorage.setItem(VERSION_KEY, currentVersion);
      localStorage.setItem(REFRESHING_KEY, currentVersion);
      await clearBrowserCaches();
      window.location.replace(addFreshParam(window.location.href, currentVersion));
      return true;
    }

    if (refreshingVersion === currentVersion) {
      localStorage.removeItem(REFRESHING_KEY);
    }

    localStorage.setItem(VERSION_KEY, currentVersion);
  } catch {
    return false;
  }

  return false;
};