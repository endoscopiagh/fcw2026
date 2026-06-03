# FCW 2026 - Quiniela Mundial

Aplicación web privada para quiniela/fantasy del Mundial FIFA 2026.

## Stack

- Next.js App Router + TypeScript
- Prisma ORM
- PostgreSQL (Neon o Supabase Postgres)
- Auth personalizada (username/password + cookies JWT httpOnly)
- Tailwind CSS

## Requisitos

- Node.js 20+
- Base de datos PostgreSQL administrada (Neon o Supabase)

## Variables de entorno

Crea un archivo `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"
JWT_SECRET="reemplaza-con-un-secreto-seguro"
INITIAL_ADMIN_USERNAME="admin"
INITIAL_ADMIN_PASSWORD="cambia-esta-password"
```

> `DATABASE_URL` se usa en runtime.
> `DIRECT_URL` se recomienda para migraciones directas.

## Instalación local

```bash
npm install
npx prisma generate
```

## Migraciones y seed

Cuando tengas `DATABASE_URL` configurada:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Para entornos no-locales (staging/prod):

```bash
npx prisma migrate deploy
```

## Ejecutar en desarrollo

```bash
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

## Build de producción

```bash
npm run build
npm run start
```

## Deploy en Vercel + PostgreSQL externo

1. Crea tu base en Neon o Supabase y copia `DATABASE_URL` y `DIRECT_URL`.
2. Sube este repo a GitHub.
3. Importa el proyecto en Vercel.
4. En Vercel -> Settings -> Environment Variables, agrega:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`
   - `INITIAL_ADMIN_USERNAME`
   - `INITIAL_ADMIN_PASSWORD`
5. Ejecuta migraciones contra producción (CI o local apuntando a prod):
   - `npx prisma migrate deploy`
6. (Opcional) corre seed inicial:
   - `npx prisma db seed`

Con esto la app queda desplegable en Vercel usando PostgreSQL administrado.
