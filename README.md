# 🎟️ EventMaster - Sistema de Gestión de Eventos, Registro & Check-in

Plataforma full-stack tipo Eventbrite desarrollada en **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** y **Prisma ORM**. Diseñada para soportar alta concurrencia, disponibilidad 24/7 y despliegue 100% gratuito en **Vercel** y **Supabase**.

---

## ✨ Funcionalidades Principales

1. **Gestión de Eventos & Control de Aforo:**
   - Creación y edición de eventos con topes de aforo estrictos.
   - Bloqueo automático e inmediato de inscripciones cuando los cupos se agotan.
2. **Formulario de Registro Dinámico:**
   - Campos institucionales predeterminados: *Cédula, Nombre Completo, Correo Institucional, ID de Epik, Celular, EPS, Grupo Sanguíneo y RH, Pertenencia a Grupo/Colectivo*.
   - **Constructor de Preguntas Personalizadas:** Añade, edita o elimina preguntas por evento (texto, número, desplegable con opciones, casillas Sí/No).
3. **Automatización de Notificaciones por Correo:**
   - Envío automático de confirmación con los datos y el **Boleto Digital con Código QR** integrado al momento de registrarse (vía Resend o SMTP).
4. **Control de Acceso / Check-in en Puerta:**
   - **Escáner QR integrado:** Usa la cámara del celular, tablet o PC para validar boletos en 1 segundo.
   - **Búsqueda rápida manual:** Busca por cédula, ID Epik, correo o código de boleto.
   - **Alerta de duplicados:** Advierte si una persona ya había ingresado previamente.
   - **Registro Manual en Puerta:** Modal para inscribir e ingresar personas que no se registraron anticipadamente.
5. **Métricas en Tiempo Real & Exportación a CSV:**
   - Gráficos y barras de aforo y porcentaje de asistencia.
   - **Descarga de `.csv` completo** compatible con Excel (codificación UTF-8 con BOM), clasificando con precisión a los **Asistentes** e **Inasistentes** junto con todas las respuestas a preguntas dinámicas.
6. **Soporte Multi-Administrador:**
   - Panel protegido por JWT en cookies seguras.
   - Creación y gestión de múltiples administradores.

---

## 🚀 Inicio Rápido en Desarrollo Local

### 1. Clonar o abrir el proyecto
```bash
cd /Users/estebanromerorios/.gemini/antigravity/scratch/eventos-app
```

### 2. Variables de entorno
El archivo `.env` ya está listo con SQLite local:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="eventos-super-secret-key-change-in-production-2026"
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 🔑 Credenciales de Administrador por Defecto
- **URL de acceso admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Correo:** `admin@eventos.com`
- **Contraseña:** `admin123`

---

## 🌐 Guía de Despliegue 100% Gratuito en VERCEL + SUPABASE

### Paso 1: Base de Datos Gratuita en Supabase
1. Ingresa a [supabase.com](https://supabase.com) y crea un proyecto nuevo gratuito.
2. En la configuración del proyecto (**Project Settings -> Database**), copia la cadena **Connection String (URI)** en modo `Transaction` o `Session`.
   Ejemplo: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`

### Paso 2: Configurar Prisma para PostgreSQL (Producción)
En `prisma/schema.prisma`, cambia la fuente de datos a PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Paso 3: Subir a GitHub y Conectar con Vercel
1. Sube tu código a un repositorio privado o público en GitHub.
2. Entra a [vercel.com](https://vercel.com) y haz clic en **Add New -> Project**, seleccionando tu repositorio.
3. En la sección **Environment Variables**, añade:
   - `DATABASE_URL`: Tu conexión de Supabase PostgreSQL.
   - `JWT_SECRET`: Una clave secreta segura aleatoria.
   - `NEXT_PUBLIC_APP_URL`: La URL que Vercel te asigne (ej. `https://tu-proyecto.vercel.app`).
   - `RESEND_API_KEY`: Tu API key gratuita de [resend.com](https://resend.com) (opcional pero recomendado para correos).
4. Haz clic en **Deploy**. ¡Vercel compilará y desplegará tu app con disponibilidad 24/7 y SSL automático gratis!

### Paso 4: Inicializar la Base de Datos en Producción
Desde tu terminal local o consola:
```bash
npx prisma db push
node prisma/seed.js
```
*(Asegúrate de apuntar temporalmente tu `DATABASE_URL` a Supabase para poblar los datos iniciales)*.
