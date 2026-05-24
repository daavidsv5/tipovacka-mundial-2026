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
    vysledky/       # výsledky – záložky Zápasy / Skupiny / Turnaj
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
  vysledky-tabs.tsx # klientský komponent se záložkami pro stránku Výsledky
  admin/            # admin komponenty (tabs, match results, group results, players, tournament)
  player/           # hráčské komponenty (match predictions, group, tournament)
prisma/schema.prisma
```

## Autentizace a role

- Role: `ADMIN`, `PLAYER`
- Admin vidí vše + admin panel na `/admin`
- Každý hráč vidí tipy ostatních, ale upravovat může jen svoje (nebo admin cizí)
- `canEdit` prop řídí, zda jsou inputy aktivní

## Zamykání tipů

- **Zápasy** – každý zápas se uzamkne samostatně v momentě jeho začátku (`now >= match.date`)
- **Skupiny + Turnaj** – uzamknou se pro hráče v momentě prvního skupinového zápasu (= zahájení turnaje)
- Admin může vždy editovat bez ohledu na zamčení
- Logika v `app/(main)/hraci/[id]/page.tsx`: `canEditGroups`, `canEditTournament` předávány odděleně od `canEdit` (pro zápasy)

## Bodování zápasů

| Výsledek | Body |
|---|---|
| Přesný tip (skóre) | 5 |
| Správný rozdíl gólů | 3 |
| Správný vítěz | 2 |
| Špatný tip | 0 |

Skupiny a turnaj: 5 bodů za správné umístění (skupiny), 10 bodů za správné umístění (turnaj).

## Platby hráčů (prize pool)

- Vklad: **400 Kč / hráč**, sledováno přes pole `hasPaid` (Boolean, default false) na modelu `User`
- Prize pool na dashboardu počítá **pouze zaplacené hráče**: `players.filter(p => p.hasPaid).length * 400`
- `ENTRY_FEE = 400` v `app/(main)/page.tsx`
- Admin přepíná platbu tlačítkem u každého hráče v záložce Hráči
- Prize pool banner nahoře v záložce Hráči zobrazuje: celkovou částku, počet zaplacených, progress bar
- Server action: `togglePlayerPayment(userId, hasPaid)` v `lib/actions/admin.ts`

## Revalidace po admin akcích

- `assignPlayoffTeam` a `saveMatchResult` volají `revalidatePath("/", "layout")` – revaliduje celý strom (hráči, výsledky, admin)
- Přiřazení týmů playoff zápasů funguje i bez vyplněného skóre (guard `isNaN` odstraněn z `handleSave` v `match-results-admin.tsx`)

## Kódování souborů

- Všechny `.tsx` soubory musí být uloženy v **UTF-8** – české znaky a emoji se jinak zobrazují jako `Ĺ™`, `â€"` apod.
- Problém se projevoval v `tournament-predictions.tsx` a `players-admin.tsx` – opraveno přepsáním souborů

## Vizuální styl

- **Orámování karet** – všude `border-blue-900` (plná tmavě modrá, bez opacity). Nepoužívat `border-blue-900/30` ani jiné varianty s opacitou.
- **Rank indikátory ve skupinách** – kolečka s číslem v tmavě zelené (`border-green-800 text-green-800`) pro všechna tři místa. Texty „1. místo / 2. místo / 3. místo" jsou odstraněny.
- **Admin karty zápasů** – stejná struktura jako hráčské karty: horní lišta (skupina/fáze + datum), střed (domácí tým vpravo | skóre inputy | hosté vlevo), spodní lišta (stav + akce). Inputy `w-12 h-10 border-2 border-gray-200 rounded-xl`.
- **Logo v sidebaru** – logo v bílém zaoblenném rámečku (`bg-white rounded-xl p-1.5`), vedle něj dva řádky textu: „Tipovačka" a „Mundial 2026", `font-bold text-lg text-white`. Bez `filter: invert(1)`.

## Mobilní responsivita

- `html` i `body` mají `overflow-x: hidden` + `body` má `max-width: 100vw` – fix pro iOS Safari i Android Chrome.
- `Sidebar` přijímá `onClose?: () => void` – volá se při kliknutí na jakýkoliv navigační odkaz (hlavní sekce i hráči). `MobileHeader` předává `onClose={() => setOpen(false)}`.
- Admin tipy hráčů (`PlayerPredictionRow`) mají dvouřádkový layout: jméno + body badge nahoře, inputy + uložit dole (odsazení `ml-8`). Nedochází k přetečení na žádné šířce.
- Všechny `<select>` elementy mají `w-full` uvnitř wrapperu s `max-w-[140px]` (nebo podobnou hodnotou) – zabraňuje přetékání přes `flex-1 min-w-0` rodiče.
- Admin tabs: `grid-cols-2` na mobilu, `flex` na desktopu – tab bar nikdy nepřetéká viewport.
- **Match karty – datový formát**: datum bez roku (`day: "numeric", month: "numeric"`), skupina zkrácena na „Sk. X".
- **Match karty – responsivní velikosti**: `px-3 sm:px-5`, `gap-2 sm:gap-3`, team název `text-xs sm:text-sm`, skóre boxy `w-8 h-8 sm:w-9 sm:h-9`.
- **ScoreInputCard (hráčský pohled)**: týmy jsou v samostatném středovém řádku přes celou šířku (jako ve Výsledcích – badge `vs` pro nadcházející zápasy). Inputy pro tipování jsou ve **spodním pásu karty** oddělené od řádku s týmy – eliminuje přetékání na mobilu.
- **Player header** (`hraci/[id]/page.tsx`): kompaktní layout `p-4 sm:p-6`, avatar `w-12 sm:w-14`, body a přesných tipů zobrazeny jako malé barevné badge tagy pod jménem (ne jako velká čísla v separátní sekci).

## Deployment (Vercel)

- Repo: `https://github.com/daavidsv5/tipovacka-mundial-2026`
- Build příkaz: `prisma generate && next build` — nutné aby Vercel vygeneroval Prisma klienta (složka `lib/generated/prisma` je v `.gitignore`)
- Environment variables na Vercelu: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
- `NEXTAUTH_URL` = produkční URL projektu (např. `https://tipovacka-mundial-2026.vercel.app`)
- Po změně env variables je nutný Redeploy

## Změna hesla (hráč)

- Stránka `/nastaveni` – hráč může změnit vlastní heslo (současné + nové + potvrzení).
- Server action: `changePassword(currentPassword, newPassword)` v `lib/actions/user.ts`.
- Minimální délka hesla: 6 znaků. Admin tuto funkci nemá potřebu (reset hesla dělá přes admin panel).
- Odkaz „Změnit heslo" s ikonou `KeyRound` je v dolní části sidebaru nad „Odhlásit se". Funguje i na mobilu (sidebar sdílen s `MobileHeader`).

## Skupinové tipy – limit 3. míst

- Hráč může mít **maximálně 8 skupin** s tipem na 3. místo (MS 2026 postupuje 8 třetích míst).
- Stav 3. míst je zdvižen do rodiče `GroupPredictions` – sleduje všechny skupiny najednou.
- Počítadlo „3. místo: X/8" zobrazeno nad kartami (oranžové při dosažení limitu).
- Při dosažení limitu se select pro 3. místo nahradí badge „Limit 8 dosažen".
- Server-side validace v `saveGroupPrediction` (`lib/actions/predictions.ts`) – admin limit nemá.

## Počet gólů v turnaji

- Hráči tipují celkový počet gólů vstřelených na celém turnaji.
- Bodování: **10 bodů** pokud je tip v toleranci **±10 gólů** od skutečnosti, jinak 0.
- DB pole: `TournamentPrediction.totalGoals Int?` + `totalGoalsPointsAwarded Int @default(0)`.
- DB pole: `TournamentResult.totalGoals Int?`.
- Admin zadává skutečný počet gólů v záložce Turnaj v admin panelu.
- Karta „🎯 Počet gólů v turnaji" zobrazena: v tipech hráče (pod Nejlepší střelec), ve Výsledcích → záložka Turnaj, v Pravidlech → sekce Skupiny & Turnaj.
- `recalculateTournamentPoints` a `recalculateUserTotals` zahrnují `totalGoalsPointsAwarded`.
- Při ukládání `saveTournamentPrediction`: prázdné stringy pro enum `czechPlacement` se konvertují na `null` (jinak Prisma hází `PrismaClientValidationError`).

## Skupinové karty — UX detaily

- **Zvýrazněný select při nevybrání** – `<select>` má dynamický border: prázdná hodnota → `border-2 border-blue-400`, vybraná hodnota → `border-2 border-gray-200`. Platí v `group-predictions.tsx` (hráč) i `group-results-admin.tsx` (admin).
- **Badge bodů u každého řádku** – vedle každého selectu je zelený badge `+5b` (`text-emerald-600 font-semibold`) — hráč vidí, kolik bodů za správné tipnutí daného umístění dostane.

## Kritické detaily

- **TypeScript generiky v `.tsx`** – Turbopack parsuje `<T>` jako JSX. Používej `function` deklarace místo arrow funkcí s generiky.
- **Datum formatting** – vždy přidej `timeZone: "Europe/Prague"` do `toLocaleDateString`/`toLocaleTimeString` v klientských komponentách, jinak vzniká hydration mismatch.
- **Prisma composite unique** – `MatchPrediction` má `@@unique([userId, matchId])` → v upsert: `where: { userId_matchId: { userId, matchId } }`.
- **Sidebar šířka** – `w-72` (288px) v `app/(main)/layout.tsx`, main content má `md:ml-72`.
- **Prisma singleton** – `lib/prisma.ts` používá `globalForPrisma` pattern. Po `prisma generate` je nutný restart dev serveru.
- **`prisma.groupResult` undefined** – nastane po změně schématu bez `prisma generate` + restartu serveru. Vždy obojí spustit po změně `schema.prisma`.
- **Skupina vs. playoff admin save** – `handleSave` v `MatchRow` nesmí mít early return `if (isNaN(h) || isNaN(a))` před voláním `assignPlayoffTeam`, jinak se týmy nezapíší bez skóre.
