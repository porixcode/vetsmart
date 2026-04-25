"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Search, Plus, ArrowDown, ArrowUp, MoreHorizontal,
  Package, AlertTriangle, TrendingDown, DollarSign, ChevronDown,
} from "lucide-react"
import {
  products,
  getInventoryStats,
  categoryColors,
  statusConfig,
  type Product,
  type ProductCategory,
  type ProductStatus,
  type MovementType,
} from "@/lib/data/inventory"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProductDetailDrawer } from "@/components/inventory/product-detail-drawer"
import { MovementModal } from "@/components/inventory/movement-modal"
import { cn } from "@/lib/utils"

const CURRENCY = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })

const ALL_CATEGORIES: ProductCategory[] = [
  "Medicamentos", "Vacunas", "Antiparasitarios", "Alimentos",
  "Accesorios", "Instrumental", "Consumibles",
]
const ALL_STATUSES: ProductStatus[] = ["Activo", "Stock bajo", "Agotado", "Descontinuado"]

export default function InventarioPage() {
  const [search, setSearch] = React.useState("")
  const [selectedCategories, setSelectedCategories] = React.useState<ProductCategory[]>([])
  const [selectedStatuses, setSelectedStatuses] = React.useState<ProductStatus[]>([])
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)
  const [movementModal, setMovementModal] = React.useState<{ open: boolean; type: MovementType; productId?: string }>({
    open: false, type: "Salida",
  })

  const stats = getInventoryStats()

  const filtered = React.useMemo(() => {
    return products.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q)) return false
      }
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(p.status)) return false
      return true
    })
  }, [search, selectedCategories, selectedStatuses])

  const toggleCategory = (c: ProductCategory) =>
    setSelectedCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const toggleStatus = (s: ProductStatus) =>
    setSelectedStatuses(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const openDrawer = (product: Product) => {
    setSelectedProduct(product)
    setIsDrawerOpen(true)
  }

  const openMovement = (type: MovementType, productId?: string) => {
    setIsDrawerOpen(false)
    setMovementModal({ open: true, type, productId })
  }

  return (
    <AppShell>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">Inventario</h1>
            <p className="text-sm text-muted-foreground">
              {stats.total} productos · {stats.lowStock} con stock bajo · {stats.outOfStock} agotados
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <ArrowDown className="mr-2 size-4" strokeWidth={1.5} />
                  Registrar salida
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openMovement("Salida")}>Salida de producto</DropdownMenuItem>
                <DropdownMenuItem onClick={() => openMovement("Entrada")}>Entrada de producto</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button>
              <Plus className="mr-2 size-4" strokeWidth={1.5} />
              Nuevo producto
            </Button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 divide-x border-b">
          {[
            { label: "Total productos", value: stats.total, icon: Package, color: "text-blue-500" },
            { label: "Stock bajo", value: stats.lowStock, icon: TrendingDown, color: "text-amber-500" },
            { label: "Agotados", value: stats.outOfStock, icon: AlertTriangle, color: "text-red-500" },
            { label: "Valor total", value: CURRENCY.format(stats.totalValue), icon: DollarSign, color: "text-green-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-3">
              <Icon className={cn("size-5 shrink-0", color)} strokeWidth={1.5} />
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-semibold tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 border-b bg-background px-6 py-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Buscar por nombre, código o marca..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Categoría
                {selectedCategories.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {selectedCategories.length}
                  </span>
                )}
                <ChevronDown className="ml-2 size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ALL_CATEGORIES.map(cat => (
                <DropdownMenuCheckboxItem
                  key={cat}
                  checked={selectedCategories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                >
                  {cat}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                Estado
                {selectedStatuses.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                    {selectedStatuses.length}
                  </span>
                )}
                <ChevronDown className="ml-2 size-3" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {ALL_STATUSES.map(s => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={selectedStatuses.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="ml-auto text-sm text-muted-foreground">
            {filtered.length} de {products.length} productos
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background">
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Mínimo</TableHead>
                <TableHead className="text-right">Precio compra</TableHead>
                <TableHead className="text-right">Precio venta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último mov.</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(product => {
                const stCfg = statusConfig[product.status]
                const catCfg = categoryColors[product.category]
                const isLow = product.currentStock <= product.minimumStock
                return (
                  <TableRow
                    key={product.id}
                    className="cursor-pointer"
                    onClick={() => openDrawer(product)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md border bg-muted shrink-0">
                          <Package className="size-4 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{product.code} · {product.brand}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", catCfg.bg, catCfg.text)}>
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-semibold tabular-nums", isLow && "text-amber-600")}>
                        {product.currentStock}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">{product.unit}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground text-sm">
                      {product.minimumStock}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {CURRENCY.format(product.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-sm">
                      {CURRENCY.format(product.salePrice)}
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", stCfg.bg, stCfg.text)}>
                        <span className={cn("size-1.5 rounded-full", stCfg.dot)} />
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.lastMovement
                        ? format(product.lastMovement, "d MMM", { locale: es })
                        : "—"
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" strokeWidth={1.5} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); openDrawer(product) }}>
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); openMovement("Salida", product.id) }}>
                            <ArrowDown className="mr-2 size-4" strokeWidth={1.5} />
                            Registrar salida
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => { e.stopPropagation(); openMovement("Entrada", product.id) }}>
                            <ArrowUp className="mr-2 size-4" strokeWidth={1.5} />
                            Registrar entrada
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Editar producto</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="mb-3 size-10 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No se encontraron productos con esos filtros.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Mostrando {filtered.length} de {products.length} productos
          </p>
          <p className="text-sm text-muted-foreground tabular-nums">
            Valor total en stock: <span className="font-medium text-foreground">{CURRENCY.format(stats.totalValue)}</span>
          </p>
        </div>
      </div>

      {/* Detail drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRegisterMovement={id => openMovement("Salida", id)}
      />

      {/* Movement modal */}
      <MovementModal
        open={movementModal.open}
        onOpenChange={open => setMovementModal(prev => ({ ...prev, open }))}
        type={movementModal.type}
        initialProductId={movementModal.productId}
      />
    </AppShell>
  )
}
