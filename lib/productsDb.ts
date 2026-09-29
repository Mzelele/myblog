import { connectDB } from "@/lib/mongodb";

export async function getProductsCollection() {
  const db = await connectDB();
  return db.collection("products");
}
