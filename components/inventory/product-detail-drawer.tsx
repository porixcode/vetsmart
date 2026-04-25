"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  X, Package, ArrowDown, ArrowUp, AlertTriangle, Lock, FileText, Shield, Beaker,
  Phone, Mail, Building2, TrendingDown, TrendingUp,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  type Product,
  categoryColors,
  statusConfig,
} from "@/lib/data/inventory"
import { cn } from "@/lib/utils"

interface ProductDetailDrawerProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onRegisterMovement: (productId: string) => void
}

const CURRENCY = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })

function StatusDot({ status }: { status: Product["status"] }) {
  const cfg = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", cfg.bg, cfg.text)}>
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  )
}

export function ProductDetailDrawer({ product, isOpen, onClose, onRegisterMovement }: ProductDetailDrawerProps) {
  if (!product) return null

  const catCfg = categoryColors[product.category]
  const margin = ((product.salePrice - product.purchasePrice) / product.salePrice * 100).toFixed(1)

  const chartData = product.stockHistory.map(p => ({
    date: format(p.date, "d MMM", { locale: es }),
    stock: p.stock,
  })).filter((_, i) => i % 3 === 0) // thin to ~30 points

  const daysToExpiry = product.lots.length > 0
    ? Math.ceil((product.lots[0].expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 z-50 flex w-[600px] flex-col border-l bg-background shadow-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-xl border bg-muted">
              <Package className="size-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold leading-tight">{product.name}</h2>
                {product.controlled && (
                  <span title="Sustancia controlada">
                    <Lock className="size-4 text-amber-500" strokeWidth={1.5} />
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{product.code}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", catCfg.bg, catCfg.text)}>
                  {product.category}
                </span>
                <StatusDot status={product.status} />
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={onClose}>
            <X className="size-4" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-5 py-0 h-auto">
              {["overview", "lotes", "movimientos", "proveedores", "comercial"].map(tab => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-none border-b-2 border-transparent pb-3 pt-3 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none capitalize"
                >
                  {tab === "overview" ? "Resumen" : tab === "lotes" ? "Lotes" : tab === "movimientos" ? "Movimientos" : tab === "proveedores" ? "Proveedores" : "Comercial"}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* RESUMEN */}
            <TabsContent value="overview" className="m-0 p-5 space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Stock actual</p>
                  <p className={cn("text-2xl font-semibold tabular-nums", product.currentStock <= product.minimumStock && "text-amber-600")}>
                    {product.currentStock}
                  </p>
                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Mínimo</p>
                  <p className="text-2xl font-semibold tabular-nums">{product.minimumStock}</p>
                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Reorden</p>
                  <p className="text-2xl font-semibold tabular-nums">{product.reorderQuantity}</p>
                  <p className="text-xs text-muted-foreground">{product.unit}</p>
                </div>
              </div>

              {/* Alerts */}
              {daysToExpiry !== null && daysToExpiry <= 90 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
                  <span>Lote <span className="font-medium">{product.lots[0].lotNumber}</span> vence en <span className="font-medium">{daysToExpiry} días</span> ({format(product.lots[0].expiryDate, "d 'de' MMMM, yyyy", { locale: es })})</span>
                </div>
              )}

              {/* Stock chart */}
              <div>
                <p className="mb-3 text-sm font-medium">Nivel de stock — últimos 90 días</p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        interval={Math.floor(chartData.length / 5)}
                      />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 6 }}
                        formatter={(v: number) => [`${v} ${product.unit}`, "Stock"]}
                      />
                      <ReferenceLine
                        y={product.minimumStock}
                        stroke="#F59E0B"
                        strokeDasharray="4 4"
                        label={{ value: "Mínimo", fontSize: 10, fill: "#92400E" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stock"
                        stroke="#2563EB"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Marca</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{product.location}</p>
                </div>
                {product.invima && (
                  <div>
                    <p className="text-xs text-muted-foreground">Reg. INVIMA</p>
                    <p className="font-mono text-xs font-medium">{product.invima}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Prescripción</p>
                  <p className="font-medium">{product.requiresPrescription ? "Requerida" : "No requerida"}</p>
                </div>
              </div>

              {/* Documentation */}
              <div>
                <p className="mb-2 text-sm font-medium">Documentación</p>
                <div className="space-y-1">
                  {[
                    { icon: FileText, label: "Ficha técnica" },
                    { icon: Shield, label: "Registro INVIMA" },
                    { icon: Beaker, label: "Hoja de seguridad (MSDS)" },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Icon className="size-4 shrink-0" strokeWidth={1.5} />
                      <span>{label}</span>
                      <span className="ml-auto text-xs text-primary">Descargar</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* LOTES */}
            <TabsContent value="lotes" className="m-0 p-5">
              <p className="mb-4 text-sm font-medium">Lotes activos ({product.lots.length})</p>
              {product.lots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay lotes activos registrados.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lote</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Proveedor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.lots.map(lot => {
                      const days = Math.ceil((lot.expiryDate.getTime() - Date.now()) / 86400000)
                      const isExpiringSoon = days <= 90
                      return (
                        <TableRow key={lot.id}>
                          <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">{lot.quantity}</TableCell>
                          <TableCell>
                            <span className={cn("text-sm", isExpiringSoon && "text-amber-600 font-medium")}>
                              {format(lot.expiryDate, "d MMM yyyy", { locale: es })}
                            </span>
                            {isExpiringSoon && (
                              <p className="text-xs text-amber-600">{days} días</p>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{lot.supplier}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* MOVIMIENTOS */}
            <TabsContent value="movimientos" className="m-0 p-5">
              <p className="mb-4 text-sm font-medium">Últimos movimientos ({product.movements.length})</p>
              <div className="space-y-2">
                {[...product.movements]
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .slice(0, 20)
                  .map(mov => (
                    <div key={mov.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "flex size-7 items-center justify-center rounded-full shrink-0",
                          mov.type === "Entrada" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                          {mov.type === "Entrada"
                            ? <ArrowUp className="size-3.5" strokeWidth={2} />
                            : <ArrowDown className="size-3.5" strokeWidth={2} />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium">{mov.type}</span>
                            <Badge variant="outline" className="text-xs px-1.5 py-0">{mov.reason}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {mov.performedBy}
                            {mov.reference && <span> · Ref: {mov.reference}</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          "text-sm font-semibold tabular-nums",
                          mov.type === "Entrada" ? "text-green-600" : "text-red-600"
                        )}>
                          {mov.type === "Entrada" ? "+" : "-"}{mov.quantity}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(mov.date, "d MMM yyyy", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          {mov.stockBefore} → {mov.stockAfter}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>

            {/* PROVEEDORES */}
            <TabsContent value="proveedores" className="m-0 p-5 space-y-4">
              <p className="text-sm font-medium">Proveedores ({product.suppliers.length})</p>
              {product.suppliers.map(s => (
                <div key={s.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                      <p className="font-medium text-sm">{s.name}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{CURRENCY.format(s.unitPrice)} / {product.unit}</span>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">Contacto:</span>
                      <span>{s.contact}</span>
                    </div>
                    <a href={`tel:${s.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Phone className="size-3.5" strokeWidth={1.5} />
                      {s.phone}
                    </a>
                    <a href={`mailto:${s.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="size-3.5" strokeWidth={1.5} />
                      {s.email}
                    </a>
                    {s.lastPurchaseDate && (
                      <p className="text-xs">Última compra: {format(s.lastPurchaseDate, "d 'de' MMMM, yyyy", { locale: es })}</p>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* COMERCIAL */}
            <TabsContent value="comercial" className="m-0 p-5 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Precio de compra</p>
                  <p className="text-xl font-semibold tabular-nums">{CURRENCY.format(product.purchasePrice)}</p>
                  <p className="text-xs text-muted-foreground">por {product.unit}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Precio de venta</p>
                  <p className="text-xl font-semibold tabular-nums">{CURRENCY.format(product.salePrice)}</p>
                  <p className="text-xs text-muted-foreground">por {product.unit}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Margen</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xl font-semibold tabular-nums">{margin}%</p>
                    {parseFloat(margin) > 40
                      ? <TrendingUp className="size-4 text-green-500" strokeWidth={1.5} />
                      : <TrendingDown className="size-4 text-amber-500" strokeWidth={1.5} />
                    }
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">Valor en stock</p>
                  <p className="text-xl font-semibold tabular-nums">
                    {CURRENCY.format(product.currentStock * product.purchasePrice)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2 text-sm">
                <p className="font-medium">Sugerido de reorden</p>
                <p className="text-muted-foreground">
                  Cantidad recomendada: <span className="font-medium text-foreground">{product.reorderQuantity} {product.unit}</span>
                </p>
                <p className="text-muted-foreground">
                  Costo estimado: <span className="font-medium text-foreground">{CURRENCY.format(product.reorderQuantity * product.purchasePrice)}</span>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t p-4">
          <Button variant="outline" size="sm" onClick={() => onRegisterMovement(product.id)}>
            <ArrowDown className="mr-2 size-4" strokeWidth={1.5} />
            Registrar salida
          </Button>
          <Button size="sm" onClick={() => onRegisterMovement(product.id)}>
            <ArrowUp className="mr-2 size-4" strokeWidth={1.5} />
            Registrar entrada
          </Button>
        </div>
      </div>
    </>
  )
}
