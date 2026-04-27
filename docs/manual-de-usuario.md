# VetSmart — Manual de Usuario

**VetSmart** es un sistema de gestión veterinaria profesional desarrollado para **SERMEC Veterinaria**. Centraliza la administración de pacientes, citas, historial clínico, inventario y reportes en una plataforma web moderna.

---

## 1. Acceso al Sistema

### 1.1 Ingresar a la aplicación

Abre tu navegador y accede a la URL proporcionada por tu administrador (ejemplo: `https://vetsmart.porix.cloud`).

![Login](images/manual/login.png)
*Pantalla de inicio de sesión*

1. Ingresa tu **correo electrónico** corporativo.
2. Ingresa tu **contraseña**.
3. Haz clic en **Iniciar sesión**.

### 1.2 Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | `admin@vetsmart.co` | `Vetsmart2026!` |
| Veterinario | `marly.jara@sermec.com` | `Vetsmart2026!` |
| Recepcionista | `sandra.gutierrez@sermec.com` | `Vetsmart2026!` |

### 1.3 Cerrar sesión

1. Haz clic en tu nombre o avatar en la esquina inferior izquierda de la barra lateral.
2. Selecciona **Cerrar sesión** en el menú desplegable.

![Cerrar sesión](images/manual/logout.png)
*Menú de usuario con opción de cierre de sesión*

---

## 2. Interfaz General

### 2.1 Barra lateral (menú principal)

La barra lateral izquierda organiza las secciones del sistema:

- **Principal**: Dashboard, Pacientes, Citas, Historial Clínico
- **Gestión**: Inventario, Reportes, Usuarios
- **Sistema**: Configuración, Ayuda

![Barra lateral](images/manual/sidebar.png)
*Barra lateral con todas las secciones*

### 2.2 Barra superior

- **Buscador global**: Permite buscar pacientes, citas y productos desde cualquier pantalla.
- **Nueva cita**: Botón de acceso rápido para crear una cita.
- **Notificaciones**: Campana con indicador de notificaciones pendientes.
- **Tema oscuro/claro**: Botón para alternar entre temas.

![Barra superior](images/manual/topbar.png)
*Barra superior con buscador y acciones rápidas*

### 2.3 Dashboard

Al iniciar sesión, el dashboard muestra un resumen ejecutivo:

- **KPIs principales**: Pacientes activos, citas hoy, productos con stock crítico, valor del inventario.
- **Agenda del día**: Próximas citas del día con hora, paciente y veterinario.
- **Alertas de inventario**: Productos con stock por debajo del mínimo.
- **Próximas vacunas**: Vacunas y desparasitaciones programadas para los próximos días.
- **Gráficos**: Distribución de servicios, ocupación por hora, razas populares, desempeño de veterinarios.
- **Actividad reciente**: Últimas acciones registradas en el sistema.

![Dashboard](images/manual/dashboard.png)
*Vista del dashboard principal*

---

## 3. Módulo Pacientes

### 3.1 Listado de pacientes

Muestra todos los pacientes registrados con opciones de búsqueda y filtros.

![Listado de pacientes](images/manual/patients-list.png)
*Listado de pacientes con filtros*

**Funcionalidades**:
- Buscar por nombre del paciente o del propietario.
- Filtrar por especie, raza, estado o veterinario asignado.
- Ordenar por nombre, fecha de registro o última visita.
- **Exportar** a CSV o Excel.

### 3.2 Crear un nuevo paciente

1. Haz clic en **Nuevo paciente**.
2. Completa los campos obligatorios:
   - Nombre del paciente
   - Especie (Perro, Gato, Ave, etc.)
   - Raza
   - Sexo
   - Fecha de nacimiento (aproximada)
   - Nombre del propietario
   - Teléfono del propietario
3. Opcionalmente agrega: color, peso, microchip, alergias, veterinario asignado.
4. Haz clic en **Guardar**.

![Nuevo paciente](images/manual/new-patient.png)
*Formulario de creación de paciente*

### 3.3 Editar un paciente

1. Desde el listado, haz clic en el paciente.
2. En la barra lateral del detalle, selecciona **Editar paciente**.
3. Modifica los campos necesarios.
4. Haz clic en **Guardar cambios**.

### 3.4 Archivar un paciente

Cuando un paciente ya no asiste a la clínica:

1. Desde el detalle del paciente, en la barra lateral, haz clic en **Archivar paciente**.
2. Confirma la acción en el cuadro de diálogo.
3. El paciente quedará oculto del listado principal pero su historial se conserva.

### 3.5 Detalle del paciente

Al hacer clic en un paciente, se abre su ficha completa con pestañas:

| Pestaña | Descripción |
|---------|-------------|
| **Resumen** | Información general, última visita, peso, alergias |
| **Historial Clínico** | Registros SOAP ordenados por fecha |
| **Vacunas** | Esquema de vacunación con fechas y próximas dosis |
| **Desparasitaciones** | Registro de desparasitaciones internas y externas |
| **Documentos** | Archivos adjuntos (exámenes, recetas, imágenes) |
| **Notas** | Notas internas del personal |
| **Línea de tiempo** | Vista cronológica de todas las interacciones |

![Detalle del paciente](images/manual/patient-detail.png)
*Ficha de paciente con pestañas*

### 3.6 Importar pacientes desde CSV

1. En el listado de pacientes, haz clic en **Importar**.
2. Selecciona un archivo CSV con el formato especificado.
3. El sistema validará los datos y mostrará un resumen con los resultados.
4. Confirma la importación.

![Importar CSV](images/manual/import-csv.png)
*Diálogo de importación de pacientes desde CSV*

---

## 4. Módulo Citas

### 4.1 Vista de calendario

El calendario ofrece tres vistas:

- **Día**: Muestra las citas hora por hora.
- **Semana**: Vista semanal con columnas por día.
- **Mes**: Vista mensual con resumen de citas por día.

![Calendario de citas](images/manual/appointments-calendar.png)
*Calendario en vista semanal*

### 4.2 Vista de lista

Muestra las citas en formato de tabla con filtros por:
- Rango de fechas
- Estado (Programada, Confirmada, En curso, Completada, Cancelada)
- Veterinario
- Paciente

### 4.3 Crear una nueva cita

Desde cualquier pantalla:

1. Haz clic en el botón **Nueva cita** en la barra superior.
2. Selecciona el **paciente** (búsqueda por nombre).
3. Selecciona el **veterinario**.
4. Selecciona el **servicio** (consulta general, vacunación, cirugía, etc.).
5. Elige **fecha y hora**. El sistema muestra los horarios disponibles del veterinario.
6. Agrega opcionalmente **notas** para la cita.
7. Haz clic en **Guardar**.

![Nueva cita](images/manual/new-appointment.png)
*Formulario de creación de cita*

### 4.4 Ver detalle de una cita

Haz clic en cualquier cita del calendario o lista para ver:
- Paciente y propietario
- Veterinario asignado
- Servicio y duración
- Estado actual
- Notas
- Historial de recordatorios

### 4.5 Cancelar una cita

1. Abre el detalle de la cita.
2. Haz clic en **Cancelar cita**.
3. Selecciona el motivo de cancelación.
4. Confirma la acción.

---

## 5. Módulo Historial Clínico

### 5.1 Búsqueda y filtros

El historial clínico general permite buscar registros por:
- Nombre del paciente
- Veterinario que atendió
- Rango de fechas
- Diagnóstico
- Tipo de registro

![Historial clínico](images/manual/clinical-records.png)
*Vista del historial clínico con filtros*

### 5.2 Nuevo registro clínico (SOAP)

1. Desde el detalle del paciente, ve a la pestaña **Historial Clínico**.
2. Haz clic en **Nuevo registro**.
3. Completa el formato **SOAP**:

| Campo | Descripción |
|-------|-------------|
| **S — Subjetivo** | Síntomas reportados por el propietario |
| **O — Objetivo** | Hallazgos del examen físico, signos vitales |
| **A — Assessment** | Diagnóstico(s) presuntivo(s) o definitivo(s) |
| **P — Plan** | Tratamiento, medicación, procedimientos, seguimiento |

4. Agrega **signos vitales**: temperatura, frecuencia cardíaca, frecuencia respiratoria, peso.
5. Selecciona **diagnósticos** del catálogo CIE-10 veterinario.
6. Agrega **medicación**: nombre, dosis, frecuencia, duración.
7. Agrega **procedimientos** realizados.
8. Opcionalmente adjunta **documentos** (exámenes de laboratorio, imágenes).
9. Selecciona el **veterinario** que atendió (por defecto eres tú).
10. Haz clic en **Guardar registro**.

![Nuevo registro clínico](images/manual/new-clinical-record.png)
*Formulario SOAP para nuevo registro clínico*

### 5.3 Ver detalle de un registro

Haz clic en cualquier registro de la lista para ver:
- Notas SOAP completas
- Signos vitales
- Diagnósticos asociados
- Medicación prescrita
- Procedimientos realizados
- Documentos adjuntos

![Detalle de registro](images/manual/record-detail.png)
*Detalle de un registro clínico*

---

## 6. Módulo Inventario

### 6.1 Listado de productos

Muestra todos los productos del inventario con:
- Búsqueda por nombre o código
- Filtros por categoría, proveedor, estado de stock
- Indicadores visuales de stock crítico (color rojo)
- Stock disponible y precio de venta

![Listado de inventario](images/manual/inventory-list.png)
*Listado de productos del inventario*

### 6.2 Crear un nuevo producto

1. Haz clic en **Nuevo producto**.
2. Completa los campos:
   - Nombre del producto
   - Categoría (Medicamento, Insumo, Accesorio, Alimento, etc.)
   - Proveedor
   - Precio de compra y precio de venta
   - Stock inicial
   - Stock mínimo (para alertas)
   - Unidad de medida
3. Haz clic en **Guardar**.

### 6.3 Registrar movimiento de stock

1. Desde el detalle del producto, haz clic en **Registrar movimiento**.
2. Selecciona el tipo:
   - **Entrada**: Compra, devolución, ajuste positivo.
   - **Salida**: Venta, uso interno, merma, ajuste negativo.
3. Ingresa la cantidad, fecha y motivo.
4. Haz clic en **Guardar**.

![Movimiento de stock](images/manual/stock-movement.png)
*Formulario de registro de movimiento de inventario*

### 6.4 Alertas de stock crítico

El sistema muestra automáticamente en el dashboard los productos cuyo stock actual está por debajo del stock mínimo configurado.

---

## 7. Módulo Reportes

### 7.1 KPIs del dashboard

Los indicadores principales se muestran en la parte superior:
- Pacientes activos registrados
- Citas programadas para hoy
- Productos con stock crítico
- Valor total del inventario

### 7.2 Gráficos analíticos

El módulo de reportes incluye:

- **Razas más atendidas**: Distribución de pacientes por raza.
- **Servicios más solicitados**: Frecuencia de cada servicio.
- **Desempeño de veterinarios**: Cantidad de atenciones por profesional.
- **Diagnósticos más frecuentes**: Principales diagnósticos registrados.
- **Ingresos por período**: Facturación estimada en un rango de fechas.

![Reportes](images/manual/reports.png)
*Vista del módulo de reportes con gráficos*

### 7.3 Exportar reportes

Los reportes se pueden exportar a:
- **CSV**: Datos tabulares para análisis en Excel.
- **PDF**: Reportes formateados para impresión o presentación.

Usa los botones de exportación en la parte superior de cada sección.

---

## 8. Módulo Usuarios

### 8.1 Listado de usuarios

Muestra todos los usuarios del sistema con su rol y estado.

![Listado de usuarios](images/manual/users-list.png)
*Listado de usuarios del sistema*

### 8.2 Roles y permisos

| Rol | Descripción |
|-----|-------------|
| **Administrador** | Acceso completo a todas las funcionalidades. Puede crear y gestionar usuarios. |
| **Veterinario** | Puede gestionar pacientes, citas, historial clínico, inventario y ver reportes. |
| **Recepcionista** | Puede registrar pacientes, gestionar citas y consultar información básica. |

### 8.3 Crear un nuevo usuario

1. Haz clic en **Nuevo usuario**.
2. Completa los campos:
   - Nombre completo
   - Correo electrónico
   - Rol (Administrador, Veterinario, Recepcionista)
   - Contraseña temporal
3. Haz clic en **Guardar**.
4. El usuario recibirá sus credenciales para iniciar sesión.

### 8.4 Editar un usuario

1. Haz clic en el usuario en el listado.
2. Modifica los campos necesarios.
3. Para cambiar la contraseña, usa la opción **Restablecer contraseña**.
4. Haz clic en **Guardar cambios**.

### 8.5 Activar / Desactivar un usuario

1. Desde el detalle del usuario, usa el interruptor de estado.
2. Un usuario desactivado no puede iniciar sesión pero su información se conserva.

---

## 9. Módulo Configuración

### 9.1 Información general de la clínica

Configura los datos básicos de SERMEC Veterinaria:
- Nombre de la clínica
- Dirección
- Teléfono
- Correo electrónico de contacto
- Logo (opcional)

![Configuración general](images/manual/config-general.png)
*Configuración de información general de la clínica*

### 9.2 Horarios de atención

Define los horarios de atención por día de la semana:
- Hora de apertura y cierre
- Días laborales
- Intervalo entre citas
- Horarios especiales

### 9.3 Servicios

Gestiona los servicios ofrecidos:
- Nombre del servicio (consulta general, vacunación, cirugía, etc.)
- Duración estimada
- Precio sugerido
- Veterinarios habilitados para realizar el servicio
- Activar / desactivar servicio

---

## 10. Solución de Problemas

### 10.1 No puedo iniciar sesión

| Problema | Posible causa | Solución |
|----------|--------------|----------|
| Credenciales inválidas | Correo o contraseña incorrectos | Verifica que el correo esté bien escrito. Usa la opción "Olvidé mi contraseña" o contacta al administrador. |
| Cuenta desactivada | El administrador desactivó tu cuenta | Contacta al administrador del sistema. |
| Demasiados intentos | Superaste el límite de intentos permitidos | Espera 1 minuto e intenta nuevamente. |
| Página no carga | Problemas de conexión o certificado SSL | Verifica tu conexión a internet. Asegúrate de usar `https://`. |

### 10.2 El sistema se ve mal o no responde

- Intenta recargar la página (`F5` o `Ctrl+R`).
- Limpia la caché del navegador.
- Usa un navegador actualizado (Chrome, Firefox, Edge).
- Verifica que tu conexión a internet sea estable.

### 10.3 No encuentro un paciente

- Usa el buscador en la barra superior (búsqueda global).
- Verifica los filtros en el listado de pacientes (estado "Activo" por defecto).
- Si el paciente fue archivado, contacta al administrador.

### 10.4 Contacto con el administrador

Para cualquier problema no resuelto en esta guía, contacta al administrador del sistema:
- Por correo electrónico
- Presencialmente en SERMEC Veterinaria

---

## Apéndice: Árbol de navegación

```
Login
 +-- Dashboard
      +-- Pacientes
      |    +-- Listado
      |    +-- Nuevo paciente
      |    +-- Detalle del paciente
      |         +-- Resumen
      |         +-- Historial Clinico
      |         +-- Vacunas
      |         +-- Desparasitaciones
      |         +-- Documentos
      |         +-- Notas
      |         +-- Linea de tiempo
      +-- Citas
      |    +-- Calendario (dia/semana/mes)
      |    +-- Vista de lista
      |    +-- Nueva cita
      |    +-- Detalle de cita
      +-- Historial Clinico (general)
      +-- Inventario
      |    +-- Listado de productos
      |    +-- Nuevo producto
      |    +-- Detalle de producto
      +-- Reportes
      +-- Usuarios
      |    +-- Listado
      |    +-- Nuevo usuario
      |    +-- Detalle de usuario
      +-- Configuracion
      |    +-- Informacion general
      |    +-- Horarios
      |    +-- Servicios
      +-- Ayuda
```

---

Documento generado el 27 de abril de 2026.

VetSmart v1.0.0 — © 2026 SERMEC Veterinaria
