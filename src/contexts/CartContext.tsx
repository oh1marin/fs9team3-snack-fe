"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { setCartCountStore } from "@/lib/cartCountStore";
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
  const [cartCount, setCartCount] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);
  const itemsRef = useRef<CartItem[]>(items);
  const cartCountRef = useRef(cartCount);
  itemsRef.current = items;
  cartCountRef.current = cartCount;

  const refetchCart = useCallback(async () => {
    const res = await fetchCart();
    const nextItems = (res.items ?? []).map(dtoToItem);
    const count = getTotalCount(nextItems);
    setItems(nextItems);
    setCartCount(count);
    setCartCountStore(count);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((res) => {
        if (!cancelled) {
          const nextItems = (res.items ?? []).map(dtoToItem);
          const count = getTotalCount(nextItems);
          setItems(nextItems);
          setCartCount(count);
          setCartCountStore(count);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([]);
          setCartCount(0);
          setCartCountStore(0);
        }
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
      const optimisticCount = cartCountRef.current + quantity;
      setCartCount(optimisticCount);
      setCartCountStore(optimisticCount);
      try {
        const res = await addCartItemApi({
          itemId,
          quantity,
          title: snapshot?.title,
          price: snapshot?.price,
          image: snapshot?.image,
        });
        const nextItems = (res.items ?? []).map(dtoToItem);
        if (nextItems.length > 0) {
          setItems(nextItems);
          const synced = getTotalCount(nextItems);
          setCartCount(synced);
          setCartCountStore(synced);
        } else {
          await refetchCart();
        }
      } catch {
        const rollback = cartCountRef.current - quantity;
        setCartCount(Math.max(0, rollback));
        setCartCountStore(Math.max(0, rollback));
        throw new Error("장바구니 담기에 실패했습니다.");
      }
    },
    [refetchCart]
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      try {
        const res = await removeCartItemApi(itemId);
        const nextItems = (res.items ?? []).map(dtoToItem);
        const cnt = getTotalCount(nextItems);
        setItems(nextItems);
        setCartCount(cnt);
        setCartCountStore(cnt);
      } catch {
        const next = itemsRef.current.filter((it) => it.id !== itemId);
        const cnt = getTotalCount(next);
        setItems(next);
        setCartCount(cnt);
        setCartCountStore(cnt);
        throw new Error("삭제에 실패했습니다.");
      }
      return;
    }
    let prevItems: CartItem[] = [];
    setItems((current) => {
      prevItems = current;
      return current.map((it) =>
        it.id === itemId ? { ...it, quantity } : it
      );
    });
    const nextCnt = (() => {
      const prev = prevItems.find((it) => it.id === itemId);
      return cartCountRef.current - (prev?.quantity ?? 0) + quantity;
    })();
    setCartCount(nextCnt);
    setCartCountStore(nextCnt);
    try {
      const res = await updateCartItemQuantityApi(itemId, quantity);
      if (res.items && res.items.length > 0) {
        const nextItems = res.items.map(dtoToItem);
        const cnt = getTotalCount(nextItems);
        setItems(nextItems);
        setCartCount(cnt);
        setCartCountStore(cnt);
      }
    } catch {
      const cnt = getTotalCount(prevItems);
      setItems(prevItems);
      setCartCount(cnt);
      setCartCountStore(cnt);
      throw new Error("수량 변경에 실패했습니다.");
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const res = await removeCartItemApi(itemId);
      const nextItems = (res.items ?? []).map(dtoToItem);
      const cnt = getTotalCount(nextItems);
      setItems(nextItems);
      setCartCount(cnt);
      setCartCountStore(cnt);
    } catch {
      const next = itemsRef.current.filter((it) => it.id !== itemId);
      const cnt = getTotalCount(next);
      setItems(next);
      setCartCount(cnt);
      setCartCountStore(cnt);
      throw new Error("삭제에 실패했습니다.");
    }
  }, []);

  const removeAll = useCallback(async () => {
    try {
      await clearCartApi();
      setItems([]);
      setCartCount(0);
      setCartCountStore(0);
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
      const nextItems = (res.items ?? []).map(dtoToItem);
      const cnt = getTotalCount(nextItems);
      setItems(nextItems);
      setCartCount(cnt);
      setCartCountStore(cnt);
    } catch {
      const next = itemsRef.current.filter((it) => !set.has(it.id));
      const cnt = getTotalCount(next);
      setItems(next);
      setCartCount(cnt);
      setCartCountStore(cnt);
      throw new Error("선택 삭제에 실패했습니다.");
    }
  }, []);

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
