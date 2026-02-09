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

function dtoToItem(d: { id: string; title: string; price: number; image: string; quantity: number }): CartItem {
  return {
    id: d.id,
    title: d.title ?? "",
    price: d.price ?? 0,
    image: d.image ?? "",
    quantity: d.quantity ?? 1,
  };
}

/** 테스트용 더미 장바구니 아이템 (API 응답 앞에 붙임) */
const DUMMY_CART_ITEMS: CartItem[] = [
  { id: "dummy-cart-1", title: "코카콜라 제로", price: 2000, image: "", quantity: 2 },
  { id: "dummy-cart-2", title: "포카리스웨트", price: 1500, image: "", quantity: 1 },
  { id: "dummy-cart-3", title: "칠성사이다", price: 1800, image: "", quantity: 1 },
];

interface CartContextValue {
  cartCount: number;
  items: CartItem[];
  cartLoaded: boolean;
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

  useEffect(() => {
    let cancelled = false;
    fetchCart()
      .then((res) => {
        if (!cancelled) {
          const apiItems = (res.items ?? []).map(dtoToItem);
          setItems([...DUMMY_CART_ITEMS, ...apiItems]);
        }
      })
      .catch(() => {
        if (!cancelled) setItems([...DUMMY_CART_ITEMS]);
      })
      .finally(() => {
        if (!cancelled) setCartLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const mergeWithDummy = useCallback((apiItems: CartItem[]) => {
    setItems([...DUMMY_CART_ITEMS, ...apiItems]);
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
      mergeWithDummy((res.items ?? []).map(dtoToItem));
    },
    [mergeWithDummy]
  );

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      try {
        const res = await removeCartItemApi(itemId);
        mergeWithDummy((res.items ?? []).map(dtoToItem));
      } catch {
        setItems((prev) => prev.filter((it) => it.id !== itemId));
        throw new Error("삭제에 실패했습니다.");
      }
      return;
    }
    try {
      const res = await updateCartItemQuantityApi(itemId, quantity);
      mergeWithDummy((res.items ?? []).map(dtoToItem));
    } catch {
      if (itemId.startsWith("dummy-")) {
        setItems((prev) =>
          prev.map((it) => (it.id === itemId ? { ...it, quantity } : it))
        );
        return;
      }
      throw new Error("수량 변경에 실패했습니다.");
    }
  }, [mergeWithDummy]);

  const removeItem = useCallback(async (itemId: string) => {
    if (itemId.startsWith("dummy-")) {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      return;
    }
    try {
      const res = await removeCartItemApi(itemId);
      mergeWithDummy((res.items ?? []).map(dtoToItem));
    } catch {
      setItems((prev) => prev.filter((it) => it.id !== itemId));
      throw new Error("삭제에 실패했습니다.");
    }
  }, [mergeWithDummy]);

  const removeAll = useCallback(async () => {
    try {
      await clearCartApi();
      setItems([...DUMMY_CART_ITEMS]);
    } catch {
      setItems([...DUMMY_CART_ITEMS]);
      throw new Error("장바구니 비우기에 실패했습니다.");
    }
  }, []);

  const removeSelected = useCallback(async (itemIds: string[]) => {
    const set = new Set(itemIds);
    const apiIds = [...set].filter((id) => !id.startsWith("dummy-"));
    if (apiIds.length === 0) {
      setItems((prev) => prev.filter((it) => !set.has(it.id)));
      return;
    }
    try {
      await Promise.all(apiIds.map((id) => removeCartItemApi(id)));
      const res = await fetchCart();
      const apiItems = (res.items ?? []).map(dtoToItem);
      setItems([
        ...DUMMY_CART_ITEMS.filter((d) => !set.has(d.id)),
        ...apiItems,
      ]);
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
