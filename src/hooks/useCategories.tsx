import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  slug: string;
  name_fr: string;
  description_short: string;
  description_long: string | null;
  icon: string;
  color: string;
  order_index: number;
  is_standard: boolean;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
}

export interface SubCategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string | null;
  order_index: number | null;
}

export interface CapsuleCategory {
  id: string;
  capsule_id: string;
  category_id: string;
  is_primary: boolean;
  created_at: string;
  category?: Category;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (categoriesError) throw categoriesError;

      const { data: subCategoriesData, error: subCategoriesError } = await supabase
        .from('sub_categories')
        .select('*')
        .order('order_index');

      if (subCategoriesError) throw subCategoriesError;

      setCategories(categoriesData || []);
      setSubCategories(subCategoriesData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCapsuleCategories = useCallback(async (capsuleId: string): Promise<CapsuleCategory[]> => {
    const { data, error } = await supabase
      .from('capsule_categories')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('capsule_id', capsuleId);

    if (error) {
      console.error('Error fetching capsule categories:', error);
      return [];
    }

    return (data || []).map(item => ({
      ...item,
      category: item.category as Category
    }));
  }, []);

  const setCapsuleCategories = useCallback(async (
    capsuleId: string,
    primaryCategoryId: string,
    secondaryCategoryIds: string[] = []
  ): Promise<boolean> => {
    try {
      // Delete existing categories
      await supabase
        .from('capsule_categories')
        .delete()
        .eq('capsule_id', capsuleId);

      // Insert primary category
      const inserts = [
        { capsule_id: capsuleId, category_id: primaryCategoryId, is_primary: true }
      ];

      // Insert secondary categories (max 2)
      secondaryCategoryIds.slice(0, 2).forEach(categoryId => {
        if (categoryId !== primaryCategoryId) {
          inserts.push({ capsule_id: capsuleId, category_id: categoryId, is_primary: false });
        }
      });

      const { error } = await supabase
        .from('capsule_categories')
        .insert(inserts);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error setting capsule categories:', err);
      return false;
    }
  }, []);

  const createCustomCategory = useCallback(async (
    userId: string,
    name: string,
    description: string,
    icon: string = '📁',
    color: string = '#9E9E9E'
  ): Promise<Category | null> => {
    try {
      const slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const { data, error } = await supabase
        .from('categories')
        .insert({
          slug: `custom-${userId.slice(0, 8)}-${slug}`,
          name_fr: name,
          description_short: description,
          icon,
          color,
          order_index: 100,
          is_standard: false,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh categories
      await fetchCategories();
      
      return data;
    } catch (err: any) {
      console.error('Error creating custom category:', err);
      return null;
    }
  }, [fetchCategories]);

  const getSubCategoriesForCategory = useCallback((categoryId: string): SubCategory[] => {
    return subCategories.filter(sub => sub.category_id === categoryId);
  }, [subCategories]);

  const getCategoryBySlug = useCallback((slug: string): Category | undefined => {
    return categories.find(cat => cat.slug === slug);
  }, [categories]);

  return {
    categories,
    subCategories,
    loading,
    error,
    fetchCategories,
    getCapsuleCategories,
    setCapsuleCategories,
    createCustomCategory,
    getSubCategoriesForCategory,
    getCategoryBySlug,
  };
};
