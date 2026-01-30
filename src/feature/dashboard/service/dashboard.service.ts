import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebace";

export type DashboardKpis = {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};

export type RecentProduct = {
  id: string;
  name: string;
  stock: number;
  price?: number;
  createdAt?: any;
  imageUrl?: string;
  sku?: string;
  createdAtText:string
};

export async function fetchDashboardData(lowStockThreshold = 5) {
  const colRef = collection(db, "products");
  
 
  const allSnap = await getDocs(colRef);

  let totalProducts = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;

  allSnap.forEach((doc) => {
    totalProducts += 1;
    const data = doc.data() as any;
    const stock = Number(data.stock ?? 0);

    if (stock <= 0) outOfStock += 1;
    else inStock += 1;

    if (stock > 0 && stock <= lowStockThreshold) lowStock += 1;
  });

  
  const recentQ = query(colRef, orderBy("createdAt", "desc"), limit(5));
  const recentSnap = await getDocs(recentQ);

  const recent: RecentProduct[] = recentSnap.docs.map((d) => {
    const data = d.data() as any;
    console.log(data)
    return {
      id: d.id,
      name: data.name ?? "Untitled",
      stock: Number(data.stock ?? 0),
      price: data.price != null ? Number(data.price) : undefined,
      createdAt: data.createdAt,
      sku:data.sku,
      imageUrl:data.imageUrl,
      createdAtText:data.createdAt.toDate().toLocaleDateString(),
    };
  });

  const kpis: DashboardKpis = { totalProducts, inStock, lowStock, outOfStock };
  return { kpis, recent };
}
