import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebace";

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
