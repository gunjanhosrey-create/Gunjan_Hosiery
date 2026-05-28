import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types/index';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  getWishlistCount: () => number;
  isWishlisted: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const storageKey = 'gunjan-wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(wishlist));
  }, [wishlist]);

  const wishlistIds = useMemo(
    () => new Set(wishlist.map((product) => product.id)),
    [wishlist]
  );

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.some((item) => item.id === product.id)
        ? prev.filter((item) => item.id !== product.id)
        : [product, ...prev]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const getWishlistCount = () => wishlist.length;
  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        toggleWishlist,
        removeFromWishlist,
        getWishlistCount,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
