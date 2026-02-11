// src/features/orders/api/orders.api.ts

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebace";
import { orderDocSchema, orderDomainSchema } from "../model/order.schema";
import type { OrderStatus ,CartItem ,OrderDoc,CustomerSnapshot} from "../model/orders.types";

/* ------------------------------------------------------------------ */
/* Collection Ref */
/* ------------------------------------------------------------------ */

const ordersCol = collection(db, "orders");

/* ------------------------------------------------------------------ */
/* READ: List Orders */
/* ------------------------------------------------------------------ */

export async function listOrders(opts?: { pageSize?: number }) {
  const pageSize = opts?.pageSize ?? 20;

  const q = query(ordersCol, orderBy("createdAt", "desc"), limit(pageSize));

  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const parsed = orderDocSchema.parse(d.data());
    return orderDomainSchema.parse({
      id: d.id,
      ...parsed,
    });
  });
}

/* ------------------------------------------------------------------ */
/* READ: Single Order */
/* ------------------------------------------------------------------ */

export async function getOrderById(orderId: string) {
  const ref = doc(db, "orders", orderId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  const parsed = orderDocSchema.parse(snap.data());

  return orderDomainSchema.parse({
    id: snap.id,
    ...parsed,
  });
}

/* ------------------------------------------------------------------ */
/* UPDATE: Status (simple – no stock logic) */
/* ------------------------------------------------------------------ */

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const ref = doc(db, "orders", orderId);

  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/* ------------------------------------------------------------------ */
/* TRANSACTION: Mark Order as PAID + Reduce Stock */
/* ------------------------------------------------------------------ */

export async function markOrderAsPaid(orderId: string) {
  const orderRef = doc(db, "orders", orderId);

  await runTransaction(db, async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");

    const order = orderDocSchema.parse(orderSnap.data());

    // دوباره کم نکن
    if (order.status === "paid") return;

    // فقط از pending اجازه paid شدن
    if (order.status !== "pending")
      throw new Error("Only pending orders can be paid");

    // کم کردن stock
    for (const item of order.items) {
      if (!item.productId) throw new Error("Order item missing productId");

      const productRef = doc(db, "products", item.productId);
      const productSnap = await tx.get(productRef);

      if (!productSnap.exists())
        throw new Error(`Product not found: ${item.productId}`);

      const product = productSnap.data() as any;

      if (typeof product.stock !== "number")
        throw new Error("Product stock is not a number");

      if (product.stock < item.qty)
        throw new Error(`Not enough stock for ${product.name}`);

      tx.update(productRef, {
        stock: product.stock - item.qty,
        updatedAt: serverTimestamp(),
      });
    }

    // آپدیت order
    tx.update(orderRef, {
      status: "paid",
      updatedAt: serverTimestamp(),
    });
  });
}

/* ------------------------------------------------------------------ */
/* CREATE: Seed / Manual Order (Admin only) */
/* ------------------------------------------------------------------ */

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedOrdersFromProducts(count = 10) {
  const productsSnap = await getDocs(
    query(collection(db, "products"), limit(50)),
  );

  const products = productsSnap.docs.map((d) => {
    const p = d.data() as any;
    return {
      id: d.id,
      name: String(p.name ?? "Unknown"),
      price: Number(p.price ?? 0),
    };
  });

  if (products.length === 0) {
    throw new Error("No products found. Seed products first.");
  }

  const ordersCol = collection(db, "orders");

  for (let i = 0; i < count; i++) {
    const pick = products[randInt(0, products.length - 1)];
    const qty = randInt(1, 3);

    const items = [
      {
        productId: pick.id,
        name: pick.name,
        price: pick.price,
        qty,
        subtotal: pick.price * qty,
      },
    ];

    const totalPrice = items.reduce((s, it) => s + it.subtotal, 0);

    await addDoc(ordersCol, {
      customer: { name: `Seed Customer ${i + 1}`, phone: "+7 777 123 45 67" },
      items,
      totalPrice,
      status: "pending",
      source: "seed",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function setOrderStatusTransactional(
  orderId: string,
  next: OrderStatus,
) {
  const orderRef = doc(db, "orders", orderId);

  await runTransaction(db, async (tx) => {
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error("Order not found");

    const order = orderSnap.data() as any;

    const current: OrderStatus = order.status;
    const items: Array<{ productId: string; qty: number }> = order.items ?? [];
    const inventoryApplied: boolean = !!order.inventoryApplied;

    // ✅ قوانین transition ساده
    if (current === "cancelled")
      throw new Error("Cancelled orders cannot be changed.");

    // اگر قراره paid بشه:
    if (next === "paid") {
      // اگر قبلاً اعمال شده، دوباره کم نکن (idempotent)
      if (!inventoryApplied) {
        for (const it of items) {
          const productRef = doc(db, "products", it.productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists())
            throw new Error("Product not found: " + it.productId);

          const product = productSnap.data() as any;
          const stock = Number(product.stock ?? 0);

          if (stock < it.qty) {
            throw new Error(`Not enough stock for product ${it.productId}`);
          }

          tx.update(productRef, {
            stock: stock - it.qty,
            updatedAt: serverTimestamp(),
          });
        }
      }

      tx.update(orderRef, {
        status: "paid",
        inventoryApplied: true, // make sure that the paid ben chosen once !!!!
        updatedAt: serverTimestamp(),
      });

      return;
    }

    // اگر قراره cancelled بشه:
    if (next === "cancelled") {
      // اگر قبلاً paid بوده و inventoryApplied=true → برگردون
      if (inventoryApplied) {
        for (const it of items) {
          const productRef = doc(db, "products", it.productId);
          const productSnap = await tx.get(productRef);
          if (!productSnap.exists())
            throw new Error("Product not found: " + it.productId);

          const product = productSnap.data() as any;
          const stock = Number(product.stock ?? 0);

          tx.update(productRef, {
            stock: stock + it.qty,
            updatedAt: serverTimestamp(),
          });
        }
      }

      tx.update(orderRef, {
        status: "cancelled",
        inventoryApplied: false, // یا بذار true و یک field جدا مثل inventoryState داشته باشی
        updatedAt: serverTimestamp(),
      });

      return;
    }

    // shipped یا pending فقط status رو عوض کنن
    tx.update(orderRef, { status: next, updatedAt: serverTimestamp() });
  });
}

const EMAIL_DOMAINS = ["gmail.com", "outlook.com", "yahoo.com"];

const EMAIL_USERNAMES = [
  "user1023",
  "customer87",
  "alpha_user",
  "beta.client",
  "test_account",
  "demo.user",
];

let list_of_name = [
  // Arabic
  "Ali Ahmadi",
  "Mohammad Rezaei",
  "Zahra Rahimi",

  // Russian
  "Алексей Иванов",
  "Мария Петрова",
  "Дмитрий Смирнов",

  // Kazakh
  "Айжан Қасым",
  "Нурлан Тлеубаев",
  "Алия Сагындыкова",

  // English
  "John Miller",
  "Emma Wilson",
  "David Brown",
];

// we have one function to generate random

export function pick_me<T>(anylist: T[]) {
  return anylist?.[Math.floor(Math.random() * anylist.length)];
}

export function pick_any_name() {
  return pick_me(list_of_name);
}

export function create_random_email() {
  let domain = pick_me(EMAIL_DOMAINS);
  let username = pick_me(EMAIL_USERNAMES);
  return `${username}@${domain}`;
}

function randomDigits(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function generatePhone() {
  const country = Math.floor(Math.random() * 3);
  console.log(country);

  switch (country) {
    case 0: // 🇰🇿 Kazakhstan
      return `+7 7${randomDigits(2)} ${randomDigits(3)} ${randomDigits(2)} ${randomDigits(2)}`;

    case 1: // 🇷🇺 Russia
      return `+7 9${randomDigits(2)} ${randomDigits(3)} ${randomDigits(2)} ${randomDigits(2)}`;

    default: // 🌍 Generic
      return `+1 ${randomDigits(3)} ${randomDigits(3)} ${randomDigits(4)}`;
  }
}


export function generateAvatar(seed?: string) {
  const s = seed ?? Math.random().toString(36).slice(2);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`;
}



export function addToCart(cart: CartItem[], p: {id:string; name:string; price:number; stock:number; imageUrl?:string|null}) {
  const idx = cart.findIndex(x => x.productId === p.id);

  if (idx === -1) {
    const item: CartItem = {
      productId: p.id,
      name: p.name,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl ?? null,
      qty: 1,
      subtotal: p.price,
    };
    return [...cart, item];
  }

  const next = [...cart]; //craete new list to have all cart in one place
  const cur = next[idx];
  const newQty = Math.min(cur.qty + 1, cur.stock); //make sure !!! this is one like magice math
  next[idx] = { ...cur, qty: newQty, subtotal: newQty * cur.price }; // update this is so good 
  return next; //remember this is one is the list of product that ben choosed by customer
}

// Totall Price for the hole cart product
export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, it) => sum + it.subtotal, 0);
}


export async function createOrder(customer: CustomerSnapshot, cart: CartItem[]) {
  const items = cart.map(it => ({
    productId: it.productId,
    name: it.name,
    price: it.price,
    qty: it.qty,
    subtotal: it.subtotal,
  }));

  const payload: Omit<OrderDoc, "createdAt" | "updatedAt"> & { createdAt:any; updatedAt:any } = {
    customer,
    items,
    totalPrice: items.reduce((s, i) => s + i.subtotal, 0),
    status: "pending",
    source: "manual",
    inventoryApplied: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, "orders"), payload);
  return ref.id;
}




type SetCart = React.Dispatch<React.SetStateAction<CartItem[]>>;
export function inc(productId: string,setCart: SetCart) {
  setCart((prev) => {
    const idx = prev.findIndex((x) => x.productId === productId);
    if (idx === -1) return prev;

    const next = [...prev];
    const cur = next[idx];
    const newQty = Math.min(cur.qty + 1, cur.stock);

    next[idx] = {
      ...cur,
      qty: newQty,
      subtotal: newQty * cur.price,
    };

    return next;
  });
}
