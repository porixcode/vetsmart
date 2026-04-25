"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, Upload, Globe, Phone, Mail, Instagram, Facebook, MapPin } from "lucide-react"
import { clinicInfo, SPECIES_OPTIONS, TAX_REGIMES, CLINIC_TYPES, type TaxRegime, type ClinicType } from "@/lib/data/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="border-b border-border px-5 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-start gap-4">
      <Label className="text-sm pt-2 text-muted-foreground">
        {label}{optional && <span className="ml-1 text-[11px] text-muted-foreground/60">(opcional)</span>}
      </Label>
      <div>{children}</div>
    </div>
  )
}

export function SectionGeneral() {
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaved, setIsSaved] = React.useState(true)

  // Form state derived from clinicInfo
  const [legalName, setLegalName] = React.useState(clinicInfo.legalName)
  const [tradeName, setTradeName] = React.useState(clinicInfo.tradeName)
  const [nit, setNit] = React.useState(clinicInfo.nit)
  const [taxRegime, setTaxRegime] = React.useState<TaxRegime>(clinicInfo.taxRegime)
  const [slogan, setSlogan] = React.useState(clinicInfo.slogan)
  const [website, setWebsite] = React.useState(clinicInfo.website)
  const [phone, setPhone] = React.useState(clinicInfo.phone)
  const [whatsapp, setWhatsapp] = React.useState(clinicInfo.whatsapp)
  const [emailGeneral, setEmailGeneral] = React.useState(clinicInfo.emailGeneral)
  const [emailSupport, setEmailSupport] = React.useState(clinicInfo.emailSupport)
  const [emailBilling, setEmailBilling] = React.useState(clinicInfo.emailBilling)
  const [instagram, setInstagram] = React.useState(clinicInfo.instagram)
  const [facebook, setFacebook] = React.useState(clinicInfo.facebook)
  const [department, setDepartment] = React.useState(clinicInfo.department)
  const [city, setCity] = React.useState(clinicInfo.city)
  const [address, setAddress] = React.useState(clinicInfo.address)
  const [postal, setPostal] = React.useState(clinicInfo.postalCode)
  const [foundingYear, setFoundingYear] = React.useState(String(clinicInfo.foundingYear))
  const [employees, setEmployees] = React.useState(String(clinicInfo.employees))
  const [clinicType, setClinicType] = React.useState<ClinicType>(clinicInfo.clinicType)
  const [species, setSpecies] = React.useState<string[]>(clinicInfo.species)

  const markDirty = () => { setIsDirty(true); setIsSaved(false) }

  const handleSave = () => { setIsDirty(false); setIsSaved(true) }
  const handleDiscard = () => {
    setLegalName(clinicInfo.legalName); setTradeName(clinicInfo.tradeName); setNit(clinicInfo.nit)
    setTaxRegime(clinicInfo.taxRegime); setSlogan(clinicInfo.slogan); setWebsite(clinicInfo.website)
    setPhone(clinicInfo.phone); setWhatsapp(clinicInfo.whatsapp); setEmailGeneral(clinicInfo.emailGeneral)
    setEmailSupport(clinicInfo.emailSupport); setEmailBilling(clinicInfo.emailBilling)
    setInstagram(clinicInfo.instagram); setFacebook(clinicInfo.facebook)
    setDepartment(clinicInfo.department); setCity(clinicInfo.city)
    setAddress(clinicInfo.address); setPostal(clinicInfo.postalCode)
    setFoundingYear(String(clinicInfo.foundingYear)); setEmployees(String(clinicInfo.employees))
    setClinicType(clinicInfo.clinicType); setSpecies(clinicInfo.species)
    setIsDirty(false); setIsSaved(true)
  }

  const input = (val: string, set: (v: string) => void) => ({
    value: val,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { set(e.target.value); markDirty() },
  })

  const toggleSpecies = (s: string) => {
    setSpecies(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
    markDirty()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Section header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-base font-semibold">Información general de la clínica</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Datos legales, de contacto y operativos de SERMEC.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {isSaved
            ? <><CheckCircle2 className="size-3.5 text-emerald-500" strokeWidth={1.5} /><span className="text-emerald-600">Guardado hace 5 min</span></>
            : <><AlertCircle className="size-3.5 text-amber-500" strokeWidth={1.5} /><span className="text-amber-600">Cambios sin guardar</span></>}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl space-y-6 p-6">

          {/* Card 1 — Identidad */}
          <Card title="Identidad de la clínica">
            {/* Logo upload */}
            <div className="grid grid-cols-[180px_1fr] items-start gap-4">
              <Label className="text-sm pt-2 text-muted-foreground">Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-border bg-muted text-lg font-bold text-muted-foreground select-none">
                  S
                </div>
                <div className="flex-1 rounded-lg border border-dashed border-border p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <Upload className="size-5 text-muted-foreground mx-auto mb-1" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">Arrastra tu logo aquí o <span className="text-primary">selecciona archivo</span></p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG o SVG · Fondo transparente · Mín. 200×200px</p>
                </div>
              </div>
            </div>

            <Field label="Nombre legal">
              <Input {...input(legalName, setLegalName)} className="h-8 text-sm" />
            </Field>
            <Field label="Nombre comercial">
              <Input {...input(tradeName, setTradeName)} className="h-8 text-sm" />
            </Field>
            <Field label="NIT">
              <Input {...input(nit, setNit)} className="h-8 text-sm font-mono" />
            </Field>
            <Field label="Régimen tributario">
              <Select value={taxRegime} onValueChange={v => { setTaxRegime(v as TaxRegime); markDirty() }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TAX_REGIMES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Eslogan" optional>
              <Input {...input(slogan, setSlogan)} className="h-8 text-sm" placeholder="El lema de tu clínica" />
            </Field>
            <Field label="Sitio web" optional>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(website, setWebsite)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
          </Card>

          {/* Card 2 — Contacto */}
          <Card title="Información de contacto">
            <Field label="Teléfono principal">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(phone, setPhone)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
            <Field label="WhatsApp">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(whatsapp, setWhatsapp)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
            <Field label="Email general">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(emailGeneral, setEmailGeneral)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
            <Field label="Email de soporte">
              <Input {...input(emailSupport, setEmailSupport)} className="h-8 text-sm" />
            </Field>
            <Field label="Email de facturación">
              <Input {...input(emailBilling, setEmailBilling)} className="h-8 text-sm" />
            </Field>
            <Field label="Instagram" optional>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(instagram, setInstagram)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
            <Field label="Facebook" optional>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(facebook, setFacebook)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
          </Card>

          {/* Card 3 — Dirección */}
          <Card title="Dirección">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"País",          value:"Colombia",    disabled:true },
                { label:"Departamento",  value:department,    setter:setDepartment },
                { label:"Ciudad",        value:city,          setter:setCity },
              ].map(({ label, value, setter, disabled }) => (
                <div key={label}>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>
                  <Input
                    value={value}
                    disabled={disabled}
                    onChange={setter ? e => { setter(e.target.value); markDirty() } : undefined}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
            <Field label="Dirección completa">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" strokeWidth={1.5} />
                <Input {...input(address, setAddress)} className="h-8 text-sm pl-8" />
              </div>
            </Field>
            <Field label="Código postal">
              <Input {...input(postal, setPostal)} className="h-8 text-sm w-32 font-mono" />
            </Field>
            {/* Map placeholder */}
            <div className="grid grid-cols-[180px_1fr] items-start gap-4">
              <span />
              <div className="h-32 rounded-lg border border-border bg-muted/40 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="size-6 text-muted-foreground mx-auto mb-1" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">Vista de mapa — integración pendiente</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 4 — Info operativa */}
          <Card title="Información operativa">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Año de fundación</Label>
                <Input {...input(foundingYear, setFoundingYear)} type="number" className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Número de empleados</Label>
                <Input {...input(employees, setEmployees)} type="number" className="h-8 text-sm" />
              </div>
            </div>
            <Field label="Tipo de clínica">
              <Select value={clinicType} onValueChange={v => { setClinicType(v as ClinicType); markDirty() }}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLINIC_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-[180px_1fr] items-start gap-4">
              <Label className="text-sm pt-2 text-muted-foreground">Especies que atiende</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIES_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSpecies(s)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors",
                      species.includes(s)
                        ? "border-primary/30 bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="border-t border-border bg-background px-6 py-3 flex items-center justify-end gap-3">
        <Button variant="ghost" size="sm" className="h-8 text-xs" disabled={!isDirty} onClick={handleDiscard}>
          Descartar cambios
        </Button>
        <Button size="sm" className="h-8 text-xs" disabled={!isDirty} onClick={handleSave}>
          Guardar cambios
        </Button>
      </div>
    </div>
  )
}
