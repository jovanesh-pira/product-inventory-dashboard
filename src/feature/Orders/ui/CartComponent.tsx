import React from "react";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  qty: number;
  subtotal: number;
  imageUrl?: string | null;
};

type Props = {
  cartList: CartItem[];
  setCartList: React.Dispatch<React.SetStateAction<CartItem[]>>;
  handleCheckout:()=>Promise<void>
};

export function CartDrawer({ cartList, setCartList,handleCheckout }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const cartCount = cartList.reduce((sum, it) => sum + it.qty, 0);
  const totalPrice = cartList.reduce((sum, it) => sum + it.subtotal, 0);

  function inc(productId: string) {
    setCartList((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx === -1) return prev;

      const next = [...prev];
      const cur = next[idx];

      const newQty = Math.min(cur.qty + 1, cur.stock);
      next[idx] = { ...cur, qty: newQty, subtotal: newQty * cur.price };
      return next;
    });
  }

  function dec(productId: string) {
    setCartList((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx === -1) return prev;

      const next = [...prev];
      const cur = next[idx];

      if (cur.qty <= 1) {
        return next.filter((x) => x.productId !== productId);
      }

      const newQty = cur.qty - 1;
      next[idx] = { ...cur, qty: newQty, subtotal: newQty * cur.price };
      return next;
    });
  }

  function removeItem(productId: string) {
    setCartList((prev) => prev.filter((x) => x.productId !== productId));
  }

  function clearCart() {
    setCartList([]);
  }

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black text-white shadow-lg hover:opacity-90 flex items-center justify-center"
        aria-label="Open cart"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6h15l-1.5 9h-12L6 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 6 5 3H2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            fill="currentColor"
          />
        </svg>

        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-6 h-6 px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-0 right-0 h-full w-full max-w-md bg-gray-50 border-l shadow-xl flex flex-col">
            <div className="shrink-0 p-4 flex items-center justify-between border-b bg-white">
              <div>
                <h3 className="text-lg font-semibold">Cart</h3>
                <p className="text-sm text-gray-500">{cartCount} items</p>
              </div>

              <button
                className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!cartList.length && (
                <div className="text-sm text-gray-500">Cart is empty.</div>
              )}

              {cartList.map((it) => (
                <div
                  key={it.productId}
                  className="rounded-2xl border bg-white p-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={it.imageUrl ?? "/placeholder_image.png"}
                      className="w-14 h-14 rounded-xl object-cover"
                      alt=""
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium truncate">{it.name}</p>
                        <p className="font-semibold whitespace-nowrap">
                          {it.subtotal} ₸
                        </p>
                      </div>

                      <p className="text-sm text-gray-500">
                        {it.price} ₸ • Stock: {it.stock}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-2 rounded-xl border bg-gray-50 p-1">
                          <button
                            className="w-9 h-9 rounded-lg hover:bg-white border border-transparent hover:border-gray-200"
                            onClick={() => dec(it.productId)}
                            title="Decrease"
                          >
                            −
                          </button>

                          <span className="w-10 text-center font-semibold">
                            {it.qty}
                          </span>

                          <button
                            className="w-9 h-9 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-40"
                            onClick={() => inc(it.productId)}
                            disabled={it.qty >= it.stock}
                            title="Increase"
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                          onClick={() => removeItem(it.productId)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 p-4 border-t bg-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-lg font-semibold">{totalPrice} ₸</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  className="w-1/2 px-4 py-3 rounded-2xl border hover:bg-gray-50 disabled:opacity-50"
                  disabled={!cartList.length}
                  onClick={clearCart}
                >
                  Clear
                </button>

                <button
                  className="w-1/2 px-4 py-3 rounded-2xl bg-black text-white hover:opacity-90 disabled:opacity-50"
                  disabled={!cartList.length}
                  onClick={() => {
                   handleCheckout()
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
