import { Eye } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useHighContrast } from '@/hooks/useHighContrast';

const ThemeToggle = () => {
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 text-primary-foreground hover:bg-white/10">
        <Eye className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="w-9 h-9 text-primary-foreground hover:bg-white/10"
      onClick={toggleHighContrast}
      title={isHighContrast ? 'Désactiver contraste élevé' : 'Activer contraste élevé'}
    >
      <Eye className={`w-4 h-4 ${isHighContrast ? 'text-secondary' : ''}`} />
      <span className="sr-only">
        {isHighContrast ? 'Désactiver contraste élevé' : 'Activer contraste élevé'}
      </span>
    </Button>
  );
};

export default ThemeToggle;
