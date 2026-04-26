# Modelo Entidad-Relación — VetSmart

```
User ──1:N──> AuditLog
User ──1:N──> ClinicalRecord (veterinarianId)
User ──1:N──> Notification
User ──1:N──> Session (Auth.js)
User ──1:N──> Account (Auth.js)

Patient ──1:1──> Owner
Patient ──1:N──> ClinicalRecord
Patient ──1:N──> Vaccination
Patient ──1:N──> Deworming
Patient ──1:N──> PatientDocument
Patient ──1:N──> PatientNote

Appointment ──N:1──> Patient
Appointment ──N:1──> User (veterinarian)
Appointment ──N:1──> Service
Appointment ──1:N──> AppointmentReminder

ClinicalRecord ──N:1──> Patient
ClinicalRecord ──N:1──> User (veterinarian)
ClinicalRecord ──1:N──> RecordDiagnosis
ClinicalRecord ──1:N──> RecordMedication
ClinicalRecord ──1:N──> RecordProcedure
ClinicalRecord ──1:1──> RecordVitals
ClinicalRecord ──1:N──> RecordAttachment

Product ──N:1──> Supplier (via ProductSupplier)
Product ──1:N──> ProductLot
Product ──1:N──> StockMovement

Service ──N:1──> ServiceCategory (via ServiceVeterinarian)
Service ──N:1──> User (via ServiceVeterinarian)

ClinicConfig ── key-value store for settings
```

## Modelos principales (16)

| Modelo | Descripción |
|--------|-------------|
| User | Usuarios del sistema con roles (ADMIN/VETERINARIO/RECEPCIONISTA) |
| Patient | Pacientes (mascotas) con datos clínicos y estado |
| Owner | Propietarios de los pacientes |
| Appointment | Citas médicas con estado y FK a paciente/vet/servicio |
| ClinicalRecord | Registro clínico con notas SOAP |
| RecordVitals | Signos vitales asociados a un registro clínico |
| RecordDiagnosis | Diagnósticos (CIE-10) por registro |
| RecordMedication | Medicación prescrita en cada atención |
| Product | Productos del inventario con control de stock |
| StockMovement | Movimientos de entrada/salida de inventario |
| Supplier | Proveedores de productos |
| Service | Servicios ofrecidos (consulta, vacunación, cirugía, etc.) |
| AuditLog | Traza de auditoría de todas las acciones |
| Notification | Notificaciones generadas por el cron |
| ClinicConfig | Configuración clave-valor de la clínica |
| Session / Account | Tablas nativas de Auth.js para sesiones |

## Convenciones

- Soft delete: `deletedAt` nullable en User, Patient, Product, Appointment, ClinicalRecord
- Timestamps auditables: `createdAt`, `updatedAt` en todos los modelos principales
- Enums tipados: Role, UserStatus, PatientStatus, AppointmentStatus, ProductCategory, etc.
- Índices compuestos en campos de búsqueda frecuente (nombre, email, fechas, status)
