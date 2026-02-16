import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { memoryCategories, type MemoryCategory } from '@/lib/memoryCategories';

export const useMemoryPrompts = () => {
  const { user } = useAuth();
  const [usedPromptIds, setUsedPromptIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsedPrompts = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_memory_prompts')
          .select('prompt_id')
          .eq('user_id', user.id);
        if (error) throw error;
        if (data) {
          setUsedPromptIds(new Set(data.map((p) => p.prompt_id)));
        }
      } catch (error) {
        console.error('Error fetching used prompts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsedPrompts();
  }, [user]);

  const getCategoryProgress = (category: MemoryCategory) => {
    const usedCount = category.prompts.filter((p) => usedPromptIds.has(p.id)).length;
    return {
      used: usedCount,
      total: category.prompts.length,
      percentage: (usedCount / category.prompts.length) * 100,
    };
  };

  const getTotalProgress = () => {
    const totalPrompts = memoryCategories.reduce((sum, cat) => sum + cat.prompts.length, 0);
    const usedPrompts = memoryCategories.reduce(
      (sum, cat) => sum + cat.prompts.filter((p) => usedPromptIds.has(p.id)).length,
      0
    );
    return { used: usedPrompts, total: totalPrompts };
  };

  const getUnusedPrompts = (category: MemoryCategory) => {
    return category.prompts.filter((p) => !usedPromptIds.has(p.id));
  };

  return {
    usedPromptIds,
    loading,
    memoryCategories,
    getCategoryProgress,
    getTotalProgress,
    getUnusedPrompts,
  };
};
