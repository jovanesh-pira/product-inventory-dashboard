import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebace";
import type { Timestamp } from "firebase/firestore";
export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl?: string;
  createdAt?: Timestamp | undefined;
  updatedAt?: Timestamp | undefined;
  description: string;
  // ownerId?: string;
  // optional fields:
};

export async function listAllProducts() {

  const q = query(collection(db, "products"), orderBy("updatedAt", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({


    id: d.id,
    ...(d.data() as Omit<Product, "id">),
  })) as Product[];
}

export async function getProductById(id: string): Promise<Product> {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Product not found");
  }

  const data = snap.data() as Omit<Product, "id">;
  return { id: snap.id, ...data };
}


export const GetProductWithId_myver = async (id: string) => {
  let refdoc = doc(db, "products", id)
  let doc_snap = await getDoc(refdoc)
  return { doc_snap }


}