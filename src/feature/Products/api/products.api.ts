import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "@/lib/firebace";
import type { ProductCreateInput } from "../types/types";

type UploadResult = {
  imageUrl: string;
  imagePath: string;
};

function buildImagePath(file: File) {
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  return `products/${crypto.randomUUID()}-${safeName}`;
}

export async function uploadProductImage(file: File): Promise<UploadResult> {
  const imagePath = buildImagePath(file);
  const storageRef = ref(storage, imagePath);

  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);

  return { imageUrl, imagePath };
}

export async function createProductDoc(input: {
  data: Omit<ProductCreateInput, "image">;
  imageUrl?: string;
  imagePath?: string;
}) {
  const col = collection(db, "products");

  const docRef = await addDoc(col, {
    ...input.data,
    imageUrl: input.imageUrl ?? null,
    imagePath: input.imagePath ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef;
}
