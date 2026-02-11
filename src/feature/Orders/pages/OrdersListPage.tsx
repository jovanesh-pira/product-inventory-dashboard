import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  limitToLast,
  orderBy,
  query,
  startAfter,
  endBefore,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "@/lib/firebace";


import { orderDomainSchema } from "../model/order.schema";


const PAGE_SIZE = 12;

export default function OrdersListPage() {
  const ordersCol = collection(db, "orders");

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paging, setPaging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [firstDoc, setFirstDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);

 
  const [history, setHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>(
    [],
  );
  const [page, setPage] = useState(1);

  const [hasNext, setHasNext] = useState(true);
  const [hasPrev, setHasPrev] = useState(false);

  async function fetchFirstPage() {
    setError(null);
    setLoading(true);
    setPage(1);
    setHistory([]);
    setHasPrev(false);

    const q = query(ordersCol, orderBy("createdAt", "desc"), limit(PAGE_SIZE));

    const snap = await getDocs(q);
    const docs = snap.docs;

    const list = docs.map((d) =>
      orderDomainSchema.parse({ id: d.id, ...d.data() }),
    );

    setOrders(list);
    setFirstDoc(docs[0] ?? null);
    setLastDoc(docs[docs.length - 1] ?? null);

    
    setHasNext(docs.length === PAGE_SIZE);
    setLoading(false);
  }

  async function nextPage() {
    if (!lastDoc || !hasNext) return;

    setError(null);
    setPaging(true);


    if (firstDoc) setHistory((prev) => [...prev, firstDoc]);

    const q = query(
      ordersCol,
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(PAGE_SIZE),
    );

    const snap = await getDocs(q);
    const docs = snap.docs;

    const list = docs.map((d) =>
      orderDomainSchema.parse({ id: d.id, ...d.data() }),
    );

    setOrders(list);
    setFirstDoc(docs[0] ?? null);
    setLastDoc(docs[docs.length - 1] ?? null);

    setPage((p) => p + 1);
    setHasPrev(true);
    setHasNext(docs.length === PAGE_SIZE);

    setPaging(false);
  }

  async function prevPage() {
    if (!firstDoc || !hasPrev) return;

    setError(null);
    setPaging(true);

    const q = query(
      ordersCol,
      orderBy("createdAt", "desc"),
      endBefore(firstDoc),
      limitToLast(PAGE_SIZE),
    );

    const snap = await getDocs(q);
    const docs = snap.docs;

    const list = docs.map((d) =>
      orderDomainSchema.parse({ id: d.id, ...d.data() }),
    );

    setOrders(list);
    setFirstDoc(docs[0] ?? null);
    setLastDoc(docs[docs.length - 1] ?? null);

    setPage((p) => Math.max(1, p - 1));

    setHistory((prev) => prev.slice(0, -1));

   
    const newHasPrev = history.length - 1 > 0; 
    setHasPrev(newHasPrev);

   
    setHasNext(true);

    setPaging(false);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await fetchFirstPage();
      } catch (e) {
        console.log(e);
        if (alive) setError("Failed to load orders. Please try again.");
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-4">
      {/* Header + CTA */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-500">View and manage orders</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/app/customers/new"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Create Customer
          </Link>

          <Link
            to="/app/orders/new"
            className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
          >
            Create Order
          </Link>

          <Link
            to="/app/orders/seed"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Seed Orders
          </Link>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">
          Latest orders
        </div>

        {error ? (
          <div className="p-6 space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchFirstPage}
              className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 text-sm text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 space-y-3">
            <p className="text-sm text-gray-500">No orders yet.</p>
            <div className="flex gap-2">
              <Link
                to="/app/orders/new"
                className="rounded-xl bg-black text-white px-4 py-2 text-sm hover:opacity-90"
              >
                Create Order
              </Link>
              <Link
                to="/app/orders/seed"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Seed Orders
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr className="border-b">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3">
                        <Link to={`/app/orders/${o.id}`}>
                        <span className="font-medium">
                          {o.id.slice(0, 8)}...
                        </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        {(o as any).customer?.name ?? "-"}
                      </td>
                      <td className="px-4 py-3">{(o as any).totalPrice}</td>
                      <td className="px-4 py-3">{(o as any).status}</td>
                      <td className="px-4 py-3">{(o as any).source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={prevPage}
                disabled={!hasPrev || paging}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>

              <div className="text-sm text-gray-600">
                Page <span className="font-medium">{page}</span>
              </div>

              <button
                onClick={nextPage}
                disabled={!hasNext || paging}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
