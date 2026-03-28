import { Share2 } from 'lucide-react';

const CircleLimitsIndicator = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Share2 className="w-4 h-4" />
        <span>Partages illimités inclus dans tous les forfaits</span>
      </div>
    </div>
  );
};

export default CircleLimitsIndicator;
