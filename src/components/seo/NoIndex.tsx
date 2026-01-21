import { useEffect } from 'react';

/**
 * Component that adds noindex, nofollow meta tag to prevent search engines
 * from indexing private/authenticated pages.
 */
const NoIndex = () => {
  useEffect(() => {
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  return null;
};

export default NoIndex;
