import type { OrderStatus } from "../model/orders.types";

const map: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  shipped: "Shipped",
  cancelled: "Cancelled",
};

const classes: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  shipped: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        classes[status],
      ].join(" ")}
    >
      {map[status]}
    </span>
  );
}
