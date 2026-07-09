# Exclusive E-Commerce — Backend (Express + TypeScript + PostgreSQL)

Bu loyiha sizning Figma "Exclusive" dizayningizga mos backend bo'lib, oldingi
"5-oy Exam" (Mongoose/JS) loyihangizdagi arxitektura uslubi (schema/controller/router/middleware/validator/error/utils)
asosida, lekin **TypeScript + PostgreSQL (Prisma ORM)** bilan qayta yozilgan.

## O'rnatish

```bash
npm install
```

## Sozlash

`.env` faylini oching va quyidagilarni to'ldiring:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/exclusive_db?schema=public"
SECRET_KEY=...
REFRESH_SECRET_KEY=...
GOOGLE_EMAIL=...
GOOGLE_PASS=...   # Gmail App Password
```

## Prisma (PostgreSQL) sozlash

```bash
npx prisma generate      # Prisma Client yaratadi (internet kerak)
npx prisma migrate dev --name init   # DB jadvallarini yaratadi
```

> Eslatma: Prisma Client generatsiyasi uchun `binaries.prisma.sh` domenidan
> query-engine binar fayli yuklanadi. Agar tarmog'ingiz cheklangan bo'lsa,
> oddiy uy/ish kompyuteringizda muammosiz ishlaydi.

## Ishga tushirish (dev rejim)

```bash
npm run dev
```

Server: `http://localhost:4001`

## Build (production)

```bash
npm run build
npm start
```

## Papka strukturasi

```
src/
├── config/        # Prisma client, multer (fayl yuklash)
├── error/         # CustomErrorHandler klassi
├── middleware/     # authorization, admin.checker, refresh-token, error, validate
├── validator/      # Joi validatorlar + JWT token generator
├── utils/          # logger (winston), email-sender (nodemailer)
├── controller/     # auth, category, product, cart, wishlist, address, order
├── router/         # har bir modul uchun Express router
├── types/          # Express Request kengaytmasi (req.user)
└── index.ts        # asosiy server fayli

prisma/
└── schema.prisma   # PostgreSQL DB sxemasi (User, Category, Product, Order va h.k.)
```

## Asosiy API endpointlar

Auth: `/api/register`, `/api/verify` (OTP), `/api/login`, `/api/refresh`, `/api/logout`, `/api/profile`

Kategoriyalar: `/api/get_all_categories`, `/api/add_category` (admin)

Mahsulotlar (Home page bo'limlari): `/api/products/explore`, `/api/products/flash-sale`,
`/api/products/best-selling`, `/api/products/new-arrival`, `/api/products/:slug`,
`/api/products/:slug/related`, `/api/products/:id/reviews`

Savatcha: `/api/cart` (GET/POST), `/api/cart/:id` (PATCH/DELETE)

Sevimlilar: `/api/wishlist`, `/api/wishlist/:product_id`, `/api/wishlist/move-all-to-cart`

Buyurtma (Checkout): `/api/orders` (POST/GET), `/api/orders/:id`, `/api/orders/:id/cancel`,
`/api/orders/:id/return`, `/api/coupons/apply`

Manzillar (Address Book): `/api/addresses`

Kontakt: `/api/contact`

## Autentifikatsiya oqimi (original loyihadagidek)

1. `/register` — parol hash qilinadi, 6 xonali OTP kod emailga yuboriladi
2. `/verify` — OTP tekshiriladi, `accessToken` (15 min) va `refreshToken` (7 kun) cookie qilib beriladi
3. `/login` — parol tekshiriladi, yangi OTP emailga yuboriladi (2-faktorli login)
4. `/refresh` — refreshToken orqali yangi accessToken olinadi
5. Himoyalangan route'lar `authorization` middleware orqali, admin route'lar
   qo'shimcha `admin.checker` middleware orqali tekshiriladi
