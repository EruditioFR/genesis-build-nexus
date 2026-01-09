import { useGoogleAnalytics } from "@/hooks/useGoogleAnalytics";

/**
 * Composant wrapper qui initialise Google Analytics
 * Doit être utilisé à l'intérieur du BrowserRouter
 */
const GoogleAnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useGoogleAnalytics();
  return <>{children}</>;
};

export default GoogleAnalyticsProvider;
