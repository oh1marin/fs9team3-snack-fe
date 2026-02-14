/**
 * 장바구니 개수만 모듈 레벨에서 보관·구독.
 * 구독 콜백에 count 값을 직접 전달해 setState로 확실히 반영.
 */
export const CART_COUNT_EVENT = "cart-count-changed";

let _count = 0;
const _listeners = new Set<(count: number) => void>();

export function getCartCount(): number {
  return _count;
}

export function setCartCountStore(count: number): void {
  _count = count;
  _listeners.forEach((fn) => fn(_count));
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CART_COUNT_EVENT, { detail: { count: _count } })
    );
  }
}

export function subscribeCartCount(fn: (count: number) => void): () => void {
  _listeners.add(fn);
  fn(_count);
  return () => {
    _listeners.delete(fn);
  };
}
