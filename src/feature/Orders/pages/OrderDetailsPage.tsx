
// get single order with ID
import { useParams } from "react-router-dom";
import { type OrderStatus } from "../model/orders.types";
import React, { useEffect, useState } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebace";
import type { OrderDomain } from "../model/order.schema";
import { orderDomainSchema } from "../model/order.schema";
import { useNavigate } from "react-router-dom";
import { setOrderStatusTransactional } from "../api/order.api";
const Status_Of_Order_List: OrderStatus[] = [
  "pending",
  "paid",
  "shipped",
  "cancelled",
];
function OrderDetailsPage() {
  const [savingStatus, setSavingStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();
  const [order, setOrder] = useState<OrderDomain | null>(null);
  const param = useParams();
  const Order_ID = (param.id ?? "").trim();
  useEffect(() => {
    (async () => {
      try {
        if (!Order_ID) return;
        let ref_doc = doc(db, "orders", Order_ID);
        let snap_doc = await getDoc(ref_doc);
        if (!snap_doc.exists()) throw new Error("Not Founded Order !!!");
        let tested_doc_with_schema = orderDomainSchema.parse({
          id: snap_doc.id,
          ...snap_doc.data(),
        });
        setOrder(tested_doc_with_schema);
        console.log(snap_doc.data());
      } catch (err) {
        console.log(err);
      } finally {
      }
    })();
  }, [Order_ID]);
  async function changeStatus(next: OrderStatus) {
    if (!order) return;

    setError(null);

    const prev = order.status;
    setOrder({ ...order, status: next });
    setSavingStatus(next);

    try {
      await setOrderStatusTransactional(order.id, next);
    } catch (e) {
      setOrder({ ...order, status: prev });
      setError("The changes could not be saved. Please try again");
    } finally {
      setSavingStatus(null);
    }
  }

  if (!order) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-sm text-gray-500">Order not found.</p>
        <button
          onClick={() => nav("/app/orders")}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
        </button>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Order{" "}
            <span className="text-gray-400">{order.id.slice(0, 8)}...</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {/* <OrderStatusBadge status={order.status} /> */}
            {/* <span className="text-sm text-gray-500">
              source: {order.source}
            </span> */}
          </div>
        </div>

        <button
          onClick={() => nav("/app/orders")}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4 space-y-2">
          <div className="text-sm font-medium">Customer</div>
          {/* <img src={order.customer.vatar}  alt={order.customer?.name}/> */}
          <div className="text-sm text-gray-700">{order.customer.name}</div>
          {order.customer.phone ? (
            <div className="text-sm text-gray-500">{order.customer.phone}</div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Status</div>
            <span className="text-xs text-gray-400">
              {/* {saving ? "Saving..." : ""} */}
            </span>
          </div>
          {/* this thing some real chaleng!!!! */}
          <div className="flex flex-wrap gap-2">
            {Status_Of_Order_List?.map((s) => {
              return (
                <button
                  onClick={() => changeStatus(s)}
                  disabled={savingStatus !== null}
                  className={[
                    "rounded-xl border px-3 py-2 text-sm relative",
                    order.status === s
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-50",
                    savingStatus !== null
                      ? "opacity-60 cursor-not-allowed"
                      : "",
                  ].join(" ")}
                >
                  {savingStatus === s ? "Saving..." : s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">Items</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr className="border-b">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it, idx) => (
                <tr key={idx} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-gray-400">{it.productId}</div>
                  </td>
                  <td className="px-4 py-3">{it.price}</td>
                  <td className="px-4 py-3">{it.qty}</td>
                  <td className="px-4 py-3">{it.subtotal}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-4 py-4 text-right font-semibold" colSpan={3}>
                  Total
                </td>
                <td className="px-4 py-4 font-semibold">{order.totalPrice}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
