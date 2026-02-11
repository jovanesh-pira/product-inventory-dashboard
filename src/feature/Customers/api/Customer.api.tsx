
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  QueryDocumentSnapshot,
 type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebace"
import { customerDocSchema, customerDomainSchema } from "../model/Customer.schema";

const customersCol = collection(db, "customers");

export async function listCustomers(opts?: {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
}) {
  const pageSize = opts?.pageSize ?? 20;

  const base = query(customersCol, orderBy("updatedAt", "desc"), limit(pageSize));

  const q = opts?.cursor ? query(base, startAfter(opts.cursor)) : base;

  const snap = await getDocs(q);

  const customers = snap.docs.map((d) => {
    const parsed = customerDocSchema.parse(d.data());
    return customerDomainSchema.parse({ id: d.id, ...parsed });
  });

  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1] : null;

  return { customers, nextCursor };
}
