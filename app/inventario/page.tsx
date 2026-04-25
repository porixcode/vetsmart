import { listProducts, getInventoryStats } from "@/lib/queries/inventory"
import { InventarioPageClient } from "./inventario-page-client"

export const dynamic = "force-dynamic"

export default async function InventarioPage() {
  const [products, stats] = await Promise.all([
    listProducts({ q: "", categories: [], statuses: [] }),
    getInventoryStats(),
  ])
  return <InventarioPageClient initialProducts={products} initialStats={stats} />
}
