"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchCart,
  addCartItem as addCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
  removeCartItem as removeCartItemApi,
  clearCart as clearCartApi,
} from "@/lib/api/cart";

export interface CartItemSnapshot {
  id: string;
  /** 상품 ID (주문 시 사용). 없으면 id 사용 */
  itemId?: string;
  title: string;
  price: number;
  image: string;
}

export interface CartItem extends CartItemSnapshot {
  quantity: number;
}

function getTotalCount(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

function dtoToItem(d: { id: string; itemId?: string; title: string; price: number; image: string; quantity: number }): CartItem {
  return {
    id: d.id,
    itemId: d.itemId,
    title: d.title ?? "",
    price: d.price ?? 0,
    image: d.image ?? "",
    quantity: d.quantity ?? 1,
  };
}

interface CartContextValue {
  cartCount: number;
  items: CartItem[];
  cartLoaded: boolean;
  refetchCart: () => Promise<void>;
  addToCart: (itemId: string, quantity?: number, snapshot?: CartItemSnapshot) => void | Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => void | Promise<void>;
  removeItem: (itemId: string) => void | Promise<void>;
  removeAll: () => void | Promise<void>;
  removeSelected: (itemIds: string[]) => void | Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const refetchCart = useCallback(async () => {
    const res = await fetchCart();
    setItems((res.items ?? []).map(dtoToItem));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((res) => {
        if (!cancelled) {
          setItems((res.items ?? []).map(dtoToItem));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setCartLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = useCallback(
    async (itemId: string, quantity = 1, snapshot?: CartItemSnapshot) => {
      const res = await addCartItemApi({
        itemId,
        quantity,
        title: snapshot?.title,
        price: snapshot?.price,
        image: snapshot?.image,
      });
      setItems((res.items ?? []).map(dtoToItem));
    },
    []
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      try {
        const res = await removeCartItemApi(itemId);
        setItems((res.items ?? []).map(dtoToItem));
      } catch {
        setItems((prev) => prev.filter((it) => it.id !== itemId));
        throw new Error("삭제에 실패했습니다.");
      }
      return;
    }
    try {
      const res = await updateCartItemQuantityApi(itemId, quantity);
      setItems((res.items ?? []).map(dtoToItem));
    } catch {
      throw new Error("수량 변경에 실패했습니다.");
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const res = await removeCartItemApi(itemId);
      setItems((res.items ?? []).map(dtoToItem));
    } catch {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      throw new Error("삭제에 실패했습니다.");
    }
  }, []);

  const removeAll = useCallback(async () => {
    try {
      await clearCartApi();
      setItems([]);
    } catch {
      throw new Error("장바구니 비우기에 실패했습니다.");
    }
  }, []);

  const removeSelected = useCallback(async (itemIds: string[]) => {
    const set = new Set(itemIds);
    if (set.size === 0) return;
    try {
      await Promise.all([...set].map((id) => removeCartItemApi(id)));
      const res = await fetchCart();
      setItems((res.items ?? []).map(dtoToItem));
    } catch {
      setItems((prev) => prev.filter((it) => !set.has(it.id)));
      throw new Error("선택 삭제에 실패했습니다.");
    }
  }, []);

  const cartCount = getTotalCount(items);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        items,
        cartLoaded,
        refetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        removeAll,
        removeSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
