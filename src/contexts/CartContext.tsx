"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const CART_STORAGE_KEY = "snack_cart";

export interface CartItemSnapshot {
  id: string;
  title: string;
  price: number;
  image: string;
}

export interface CartItem extends CartItemSnapshot {
  quantity: number;
}

/** 기존 형식(id만) 호환용 */
type CartItemsLegacy = Record<string, number>;

function isLegacyFormat(
  parsed: CartItem[] | CartItemsLegacy
): parsed is CartItemsLegacy {
  if (!Array.isArray(parsed)) {
    const first = Object.values(parsed)[0];
    return typeof first === "number";
  }
  return false;
}

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[] | CartItemsLegacy;
    if (isLegacyFormat(parsed)) {
      return Object.entries(parsed).map(([id, quantity]) => ({
        id,
        quantity,
        title: "",
        price: 0,
        image: "",
      }));
    }
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function getTotalCount(items: CartItem[]): number {
  return items.reduce((sum, it) => sum + it.quantity, 0);
}

/** 장바구니 비어 있을 때 보여줄 더미 상품 */
function getDummyCart(): CartItem[] {
  return [
    {
      id: "dummy-1",
      title: "코카콜라 제로",
      price: 2000,
      image: "",
      quantity: 16,
    },
    {
      id: "dummy-2",
      title: "포카리스웨트",
      price: 1500,
      image: "",
      quantity: 8,
    },
    {
      id: "dummy-3",
      title: "칠성사이다",
      price: 1800,
      image: "",
      quantity: 10,
    },
    {
      id: "dummy-4",
      title: "핫식스",
      price: 2200,
      image: "",
      quantity: 6,
    },
    {
      id: "dummy-5",
      title: "웰치스 포도",
      price: 1300,
      image: "",
      quantity: 4,
    },
    {
      id: "dummy-6",
      title: "밀키스",
      price: 1200,
      image: "",
      quantity: 12,
    },
    {
      id: "dummy-7",
      title: "제로 콜라",
      price: 1900,
      image: "",
      quantity: 5,
    },
    {
      id: "dummy-8",
      title: "비타오백",
      price: 1100,
      image: "",
      quantity: 10,
    },
  ];
}

interface CartContextValue {
  cartCount: number;
  items: CartItem[];
  addToCart: (itemId: string, quantity?: number, snapshot?: CartItemSnapshot) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  removeAll: () => void;
  removeSelected: (itemIds: string[]) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loaded = loadCart();
    const dummies = getDummyCart();
    if (loaded.length === 0) {
      setItems(dummies);
      return;
    }
    // 더미만 있으면 항상 4개로 맞춤 (삭제 후에도 복구)
    const allDummy = loaded.every((it) => it.id.startsWith("dummy-"));
    if (allDummy && loaded.length < dummies.length) {
      setItems(dummies);
      return;
    }
    setItems(loaded);
  }, []);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addToCart = useCallback(
    (itemId: string, quantity = 1, snapshot?: CartItemSnapshot) => {
      setItems((prev) => {
        const existing = prev.find((it) => it.id === itemId);
        const next = existing
          ? prev.map((it) =>
              it.id === itemId
                ? {
                    ...it,
                    quantity: it.quantity + quantity,
                    ...(snapshot && {
                      title: snapshot.title,
                      price: snapshot.price,
                      image: snapshot.image,
                    }),
                  }
                : it
            )
          : [
              ...prev,
              {
                id: itemId,
                quantity,
                title: snapshot?.title ?? "",
                price: snapshot?.price ?? 0,
                image: snapshot?.image ?? "",
              },
            ];
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) return prev.filter((it) => it.id !== itemId);
      return prev.map((it) =>
        it.id === itemId ? { ...it, quantity } : it
      );
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  }, []);

  const removeAll = useCallback(() => {
    setItems([]);
  }, []);

  const removeSelected = useCallback((itemIds: string[]) => {
    const set = new Set(itemIds);
    setItems((prev) => prev.filter((it) => !set.has(it.id)));
  }, []);

  const cartCount = getTotalCount(items);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        items,
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
