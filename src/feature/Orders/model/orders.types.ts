import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
export type OrderSource = "online" | "manual" | "seed";

export type OrderItem = {
  productId: string;
  name: string; // snapshot at purchase time
  price: number; // snapshot at purchase time
  qty: number;
  subtotal: number; // price * qty
};

export type CustomerInfo = {
  name: string;
  phone?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  qty: number;
  subtotal: number;
};

export type CustomerSnapshot = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
};

export type CustomerDoc = {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastOrderAt?: Timestamp;
  ordersCount?: number;
};

export type OrderDoc = {
  customer: CustomerSnapshot;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  source: "manual";
  createdAt: Timestamp;
  inventoryApplied: boolean;
};

export type OrderMainItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  subtotal: number;
  imageUrl?: string | null;
};

export type OrderMain = {
  customerId: string;
  customer: CustomerDoc;
  items: OrderMainItem[];
  totalPrice: number;
  status: OrderStatus;
  source: "manual" | "pos" | "website";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
