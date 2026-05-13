@AGENTS.md

# Tipovačka Mundial 2026

Tipovací aplikace pro Mistrovství světa ve fotbale 2026 pro uzavřenou skupinu přátel.

## Stack

- **Next.js 16.2.6** – App Router, `proxy.ts` místo `middleware.ts` (breaking change v16)
- **React 19**, TypeScript, **Tailwind CSS 4**
- **NextAuth.js v5 beta.31** – Credentials provider, JWT
- **Prisma 7.8.0** – `@prisma/adapter-pg` povinný, custom output `lib/generated/prisma`
- **PostgreSQL** na Neon.tech
- **flag-icons** – CSS knihovna pro vlajky zemí (`fi fi-{kód}`)
- **Plus Jakarta Sans** – font (přes Next.js `next/font/google`)

## Důležité příkazy

```bash
npx prisma generate          # po každé změně schema.prisma
npx prisma db push           # sync schématu s DB (bez migration history)
```

> Po `prisma generate` **vždy restartuj dev server** – Turbopack drží starý klient v paměti.

## Struktura

```
app/
  (main)/          # chráněné stránky (auth guard v proxy.ts)
    page.tsx        # žebříček / dashboard
    vysledky/       # výsledky zápasů
    hraci/[id]/     # tipy konkrétního hráče
    admin/          # admin panel (role: ADMIN)
  login/            # přihlašovací stránka
  globals.css       # Tailwind 4 + CSS proměnné (bílé téma)
  layout.tsx        # root layout, Plus Jakarta Sans font
proxy.ts            # Next.js 16 auth middleware (exportuje `proxy`, ne `middleware`)
lib/
  auth.ts           # NextAuth config
  prisma.ts         # Prisma singleton (globalForPrisma pattern)
  actions/
    predictions.ts  # server actions pro hráče
    admin.ts        # server actions pro admina
components/
  sidebar.tsx       # navigace (desktop), přijímá userName + userEmail
  mobile-header.tsx # navigace (mobil)
  admin/            # admin komponenty (tabs, match results, group results, ...)
  player/           # hráčské komponenty (match predictions, group, tournament)
prisma/schema.prisma
```

## Autentizace a role

- Role: `ADMIN`, `PLAYER`
- Admin vidí vše + admin panel na `/admin`
- Každý hráč vidí tipy ostatních, ale upravovat může jen svoje (nebo admin cizí)
- `canEdit` prop řídí, zda jsou inputy aktivní

## Bodování zápasů

| Výsledek | Body |
|---|---|
| Přesný tip (skóre) | 5 |
| Správný rozdíl gólů | 3 |
| Správný vítěz | 2 |
| Špatný tip | 0 |

Skupiny a turnaj: 5 bodů za správné umístění (skupiny), 10 bodů za správné umístění (turnaj).

## Kritické detaily

- **TypeScript generiky v `.tsx`** – Turbopack parsuje `<T>` jako JSX. Používej `function` deklarace místo arrow funkcí s generiky.
- **Datum formatting** – vždy přidej `timeZone: "Europe/Prague"` do `toLocaleDateString`/`toLocaleTimeString` v klientských komponentách, jinak vzniká hydration mismatch.
- **Prisma composite unique** – `MatchPrediction` má `@@unique([userId, matchId])` → v upsert: `where: { userId_matchId: { userId, matchId } }`.
- **Sidebar šířka** – `w-72` (288px) v `app/(main)/layout.tsx`, main content má `md:ml-72`.
- **Prisma singleton** – `lib/prisma.ts` používá `globalForPrisma` pattern. Po `prisma generate` je nutný restart dev serveru.
