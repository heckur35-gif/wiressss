import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Product } from '@/lib/products-data';

export const useRealtimeProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'Unknown',
        category: p.category || 'General',
        color: p.colors || [],
        description: p.description || '',
        specifications: p.specifications || {},
        basePrice: Number(p.price || p.base_price || 0),
        unitType: p.unit_type || 'units' as any,
        stockQuantity: p.stock || p.stock_quantity || 0,
        imageUrl: p.image_url || '',
        brochureUrl: p.brochure_url || undefined,
        isActive: p.is_active !== false,
      }));

      setProducts(mappedProducts);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();

    if (!isSupabaseConfigured) return;

    // Subscribe to real-time changes
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        (payload) => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [loadProducts]);

  return { products, loading, error, refetch: loadProducts };
};
