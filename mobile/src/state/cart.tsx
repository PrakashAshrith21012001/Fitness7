import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { coupons, delivery, productById, type Coupon, type Product } from "@f7/content";

/**
 * Store cart — the Zepto model. Quantities per product, one coupon, a tip,
 * delivery instructions, the "no bag" toggle, and the orders placed so far.
 * Totals are derived here so the cart page, the floating pill and the
 * payment sheet all agree to the rupee.
 */

export type CartLine = { productId: string; qty: number };
export type Order = {
  id: string;
  placedAt: string;
  lines: CartLine[];
  toPayINR: number;
  savedINR: number;
  /** "paid" after a successful UPI, "cod" for pay-on-delivery */
  status: "paid" | "cod";
  tipINR: number;
};

type State = { lines: CartLine[]; coupon: string | null; tipINR: number; instructions: string[]; noBag: boolean; orders: Order[] };

export type Bill = {
  itemsINR: number;
  mrpINR: number;
  discountINR: number;
  deliveryINR: number;
  deliveryWaived: boolean;
  handlingINR: number;
  couponINR: number;
  tipINR: number;
  toPayINR: number;
  savedINR: number;
  /** rupees still needed for free delivery, 0 when unlocked */
  toFreeDeliveryINR: number;
  count: number;
};

type Ctx = State & {
  /** true once the saved cart has been read from the phone */
  ready: boolean;
  qty: (productId: string) => number;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (code: string | null) => void;
  setTip: (inr: number) => void;
  toggleInstruction: (id: string) => void;
  setNoBag: (v: boolean) => void;
  bill: Bill;
  items: { product: Product; qty: number }[];
  coupon: string | null;
  couponOf: (code: string | null) => Coupon | undefined;
  placeOrder: (status: Order["status"]) => Promise<Order>;
};

const KEY = "f7-cart";
const CartCtx = createContext<Ctx | null>(null);
const empty: State = { lines: [], coupon: null, tipINR: 0, instructions: [], noBag: true, orders: [] };

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(empty);
  const [ready, setReady] = useState(false);
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v) setState({ ...empty, ...(JSON.parse(v) as Partial<State>) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const persist = useCallback((next: State) => {
    ref.current = next;
    setState(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const setQty = useCallback(
    (productId: string, qty: number) => {
      const lines = ref.current.lines.filter((l) => l.productId !== productId);
      if (qty > 0) lines.push({ productId, qty: Math.min(qty, 10) });
      persist({ ...ref.current, lines: lines.sort((a, b) => a.productId.localeCompare(b.productId)) });
    },
    [persist],
  );
  const add = useCallback((id: string) => setQty(id, (ref.current.lines.find((l) => l.productId === id)?.qty ?? 0) + 1), [setQty]);
  const remove = useCallback((id: string) => setQty(id, (ref.current.lines.find((l) => l.productId === id)?.qty ?? 0) - 1), [setQty]);
  const clear = useCallback(() => persist({ ...ref.current, lines: [], coupon: null, tipINR: 0, instructions: [] }), [persist]);
  const applyCoupon = useCallback((code: string | null) => persist({ ...ref.current, coupon: code }), [persist]);
  const setTip = useCallback((inr: number) => persist({ ...ref.current, tipINR: inr }), [persist]);
  const setNoBag = useCallback((v: boolean) => persist({ ...ref.current, noBag: v }), [persist]);
  const toggleInstruction = useCallback(
    (id: string) => {
      const on = ref.current.instructions.includes(id);
      persist({ ...ref.current, instructions: on ? ref.current.instructions.filter((x) => x !== id) : [...ref.current.instructions, id] });
    },
    [persist],
  );

  const value = useMemo<Ctx>(() => {
    const items = state.lines.map((l) => ({ product: productById(l.productId)!, qty: l.qty })).filter((x) => !!x.product);
    const itemsINR = items.reduce((s, x) => s + x.product.priceINR * x.qty, 0);
    const mrpINR = items.reduce((s, x) => s + x.product.mrpINR * x.qty, 0);
    const discountINR = mrpINR - itemsINR;
    const deliveryWaived = itemsINR >= delivery.freeAboveINR;
    const deliveryINR = items.length === 0 || deliveryWaived ? 0 : delivery.feeINR;
    const handlingINR = 0; // always waived for members — shown struck through
    const c = coupons.find((k) => k.code === state.coupon);
    const couponINR = c && itemsINR >= c.minOrderINR ? c.offINR : 0;
    const toPayINR = Math.max(0, itemsINR + deliveryINR + handlingINR - couponINR + (items.length ? state.tipINR : 0));
    const savedINR = discountINR + (deliveryWaived && items.length ? delivery.feeINR : 0) + delivery.handlingINR + couponINR;
    const bill: Bill = { itemsINR, mrpINR, discountINR, deliveryINR, deliveryWaived, handlingINR, couponINR, tipINR: state.tipINR, toPayINR, savedINR, toFreeDeliveryINR: Math.max(0, delivery.freeAboveINR - itemsINR), count: items.reduce((s, x) => s + x.qty, 0) };
    const placeOrder = async (status: Order["status"]) => {
      const order: Order = { id: `F7-${Date.now().toString(36).toUpperCase()}`, placedAt: new Date().toISOString(), lines: ref.current.lines, toPayINR, savedINR, status, tipINR: ref.current.tipINR };
      persist({ ...ref.current, lines: [], coupon: null, tipINR: 0, instructions: [], orders: [order, ...ref.current.orders] });
      return order;
    };
    return {
      ...state,
      ready,
      qty: (id) => state.lines.find((l) => l.productId === id)?.qty ?? 0,
      add,
      remove,
      setQty,
      clear,
      applyCoupon,
      setTip,
      toggleInstruction,
      setNoBag,
      bill,
      items,
      couponOf: (code) => coupons.find((k) => k.code === code),
      placeOrder,
    };
  }, [state, ready, add, remove, setQty, clear, applyCoupon, setTip, toggleInstruction, setNoBag, persist]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart outside CartProvider");
  return ctx;
}
