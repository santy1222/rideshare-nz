# Ride Share NZ – Guía de configuración

## 1. Instalar dependencias

```bash
npm install
```

Si hay problemas de SSL en la red corporativa:
```bash
npm install --legacy-peer-deps
# o temporalmente:
npm config set strict-ssl false
npm install
npm config set strict-ssl true
```

## 2. Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com)
2. Andá al **SQL Editor** y ejecutá el contenido de `supabase/schema.sql`
3. Copiá `.env.local.example` a `.env.local` y completá las variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

Las keys las encontrás en **Project Settings → API** en Supabase.

## 3. Correr el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## 4. Crear usuario admin

1. Registrate normalmente en la app
2. En Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE id = 'tu-uuid';
```
El UUID está en **Authentication → Users** en el dashboard de Supabase.

## Estructura del proyecto

```
rideshare-nz/
├── app/
│   ├── page.tsx              # Home con listado y buscador
│   ├── login/page.tsx        # Login
│   ├── register/page.tsx     # Registro
│   ├── trips/
│   │   ├── new/page.tsx      # Publicar viaje
│   │   └── [id]/page.tsx     # Detalle del viaje
│   ├── profile/page.tsx      # Perfil de usuario
│   ├── admin/page.tsx        # Panel de admin
│   └── api/trips/[id]/cancel # API route para cancelar
├── components/
│   ├── Navbar.tsx
│   ├── TripCard.tsx
│   └── SearchForm.tsx
├── lib/supabase/             # Clientes de Supabase
├── types/index.ts            # Tipos TypeScript
└── supabase/schema.sql       # Schema de base de datos
```

## Funcionalidades

- **Home**: Listado de viajes con búsqueda por origen, destino y fecha
- **Auth**: Registro y login con Supabase Auth
- **Publicar viaje**: Formulario completo con precio opcional ("a coordinar")
- **Detalle de viaje**: Teléfono del conductor visible solo para usuarios registrados
- **Perfil**: Editar datos, ver viajes propios y reseñas recibidas
- **Admin**: Ver todos los usuarios/viajes, suspender o eliminar usuarios
- **Reseñas**: Sistema de calificación 1-5 estrellas con promedio automático
