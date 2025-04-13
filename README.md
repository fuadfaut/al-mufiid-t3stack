# e-Rapor TPQ Al-Mufid

Aplikasi e-Rapor digital untuk Taman Pendidikan Al-Qur'an (TPQ) berbasis web yang dibangun menggunakan T3 Stack.

## Fitur Utama

- 🔐 Autentikasi multi-role (Admin, Ustadz/ah, Santri)
- 📊 Dashboard khusus untuk setiap role
- 📝 Penilaian komprehensif meliputi:
  - Fashahah (Makharijul Huruf, Sifatul Huruf, dll)
  - Tajwid (Hukum Nun Mati, Mad, dll)
  - Tartil (Tempo, Kelancaran)
  - Suara & Nada
  - Adab & Sikap
- 📄 Generasi laporan PDF otomatis
- 📱 Responsif untuk desktop dan mobile

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org)
- **Autentikasi:** [NextAuth.js](https://next-auth.js.org)
- **Database:** [Prisma](https://prisma.io)
- **ORM:** [Drizzle](https://orm.drizzle.team)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **API:** [tRPC](https://trpc.io)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com)

## Prasyarat

- Node.js 18+ 
- PostgreSQL
- pnpm (direkomendasikan)

## Instalasi

1. Clone repositori:
```bash
git clone https://github.com/username/al-mufid.git
cd al-mufid
```

2. Install dependensi:
```bash
pnpm install
```

3. Salin file environment:
```bash
cp .env.example .env
```

4. Sesuaikan konfigurasi database di file `.env`

5. Setup database:
```bash
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema ke database
pnpm db:seed      # Seed data awal
```

6. Jalankan development server:
```bash
pnpm dev
```

## Struktur Proyek

```
src/
├── app/                 # App router & API routes
├── components/          # React components
├── lib/                 # Utility functions
├── server/             # Server-side code
│   ├── api/            # API handlers
│   ├── auth/           # Authentication
│   └── db/             # Database config
├── styles/             # Global styles
└── types/              # TypeScript types
```

## Scripts

- `pnpm dev` - Jalankan development server
- `pnpm build` - Build untuk production
- `pnpm start` - Jalankan production server
- `pnpm lint` - Jalankan linter
- `pnpm format:write` - Format code dengan Prettier
- `pnpm db:studio` - Buka Prisma Studio

## Deployment

Aplikasi dapat di-deploy menggunakan:
- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

## Lisensi

[MIT](LICENSE)

