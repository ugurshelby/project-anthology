# Apex Mobile App — Design Spec
**Tarih:** 2026-06-25  
**Stack:** Expo SDK 52 · React Native · Expo Router · NativeWind · React Query · Expo Notifications  
**Referans:** BoxBox Club (görsel dil + navigasyon his) · `design/design.md` (Apex tasarım sistemi)

---

## 1. Kapsam

Web sitesiyle neredeyse tam parité:
- Home
- Season (takvim + standings)
- Profiles (Pilot & Takım toggle — tek ekran)
- Anthology (hikayeler)
- News + Tech Glossary (News içinde secondary tab)

Canlı yarış takibi yok. Auth yok — tamamen read-only, giriş gerektirmez.  
Bildirim tercih yönetimi var (ilk açılışta izin + seçim).

---

## 2. Repo Yapısı

Mevcut `anthology` monorepo'su içinde `/mobile` klasörü — ayrı Expo projesi, tam monorepo değil.

```
anthology/
├── app/                          # mevcut Next.js (dokunulmaz)
├── mobile/                       # YENİ — Expo uygulaması
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx       # Bottom tab navigator
│   │   │   ├── index.tsx         # Home
│   │   │   ├── season.tsx        # Sezon / takvim / standings
│   │   │   ├── profiles.tsx      # Pilot & Takım (toggle)
│   │   │   ├── anthology.tsx     # Hikayeler listesi
│   │   │   └── news.tsx          # Haberler + Glossary tab
│   │   ├── anthology/[slug].tsx  # Hikaye detay
│   │   ├── driver/[id].tsx       # Pilot detay (profiles'dan push)
│   │   ├── team/[id].tsx         # Takım detay (profiles'dan push)
│   │   ├── notifications.tsx     # Bildirim tercihleri
│   │   └── _layout.tsx           # Root layout (safe area, fonts, query client)
│   ├── components/
│   │   ├── ui/                   # Temel atomlar (Card, Chip, Divider...)
│   │   ├── standings/            # StandingsRow, StandingsToggle
│   │   ├── race/                 # RaceCountdown, RaceCard, CalendarRow
│   │   ├── news/                 # NewsRow, NewsFilter
│   │   ├── profile/              # DriverHero, TeamHero, StatGrid
│   │   └── anthology/            # StoryCard, StoryHero
│   ├── lib/
│   │   ├── api.ts                # Tüm fetch fonksiyonları (Vercel endpoint'leri + Supabase anon)
│   │   ├── queryKeys.ts          # React Query key factory
│   │   └── notifications.ts     # Expo Push token kayıt + tercih yönetimi
│   ├── hooks/
│   │   ├── useCountdown.ts       # Geri sayım hook'u
│   │   └── useTeamColor.ts       # Takım rengi çözümleme
│   ├── constants/
│   │   ├── colors.ts             # Apex token sistemi (design.md §1'den)
│   │   └── typography.ts         # Font token'ları
│   ├── assets/
│   │   └── fonts/                # Barlow Condensed, Inter, JetBrains Mono
│   ├── app.json                  # Expo config
│   ├── babel.config.js
│   ├── tailwind.config.js        # NativeWind
│   └── package.json
└── ...                           # mevcut Next.js dosyaları
```

---

## 3. Backend Entegrasyonu

Mobil uygulama mevcut Vercel backend'ini tüketir — sıfır yeni backend kodu (bildirim cron hariç).

| Veri | Kaynak |
|---|---|
| Sezon takvimi + standings | `/api/season/[year]` |
| Haberler | `/api/news` |
| Pilot / takım detay | Supabase anon (doğrudan tablo okuma, RLS korunur) |
| Hikayeler | Supabase anon `stories` tablosu |
| Tech Glossary | `/data/glossary/` statik JSON (build-time bundle) |
| Bildirim push | YENİ: `/api/cron/notify` (F1 takviminden oturumları okuyup Expo Push API'ye gönderir) |

**React Query:** `@tanstack/react-query` ile cache + stale-while-revalidate. Ağ kesilmesinde son başarılı veri gösterilir (`placeholderData: keepPreviousData`).

---

## 4. Navigasyon

**Bottom Tab Bar** — 5 sekme, platform-native (`@react-navigation/bottom-tabs` native variant):

```
[ Home ]  [ Season ]  [ Profiles ]  [ Anthology ]  [ News ]
```

- Aktif sekme: Apex Red `#ff1801` (takım bağlamı yoksa global renk)
- İkon stili: minimal, tutarlı stroke ağırlığı, generic library-default değil
- Glossary: News ekranının içinde `SegmentedControl` (ikinci tab değil)
- Hamburger/drawer yok — Apex `design.md §3.1` ile örtüşür

**Stack navigasyon:** Profiles → Driver detay / Team detay; Anthology listesi → Hikaye detay

---

## 5. Ekran Tasarımları

### 5.1 Home

Tek viewport'ta ana özet — scroll minimal, içerik sıkıştırılmış değil.

```
┌─────────────────────────────────┐
│ [status bar — safe area]        │
│                                 │
│  NEXT RACE          [label-caps]│
│  SINGAPORE GP       [headline]  │
│  ──────────────── hairline ──── │
│                                 │
│     14           [hero: 64px    │
│  DAYS LEFT        Barlow Cond.] │
│  07:23:41         [data mono]   │
│                                 │
│ ─── STANDINGS ─────────────── ▶ │
│  [Drivers | Teams]  segmented   │
│  1 VER  RED BULL    ███ 312 pts │
│  2 NOR  McLAREN     ██  287 pts │
│  3 LEC  FERRARI     ██  251 pts │
│                                 │
│ ─── LATEST INTEL ─────────────  │
│  [haber kartı 1]                │
│  [haber kartı 2]                │
│                                 │
│ [bottom tab bar — safe area]    │
└─────────────────────────────────┘
```

- Standings satırları: takım rengi sol bar (`resolveTeamUiColor`), JetBrains Mono puan
- Geri sayım rakamı `withSequence(scale 1.08 → 1.0)` her saniye güncellenir

### 5.2 Season

```
┌─────────────────────────────────┐
│  SEASON 2026        [headline]  │
│  [Drivers | Constructors] toggle│
│ ─────────────────────────────── │
│  1  MAX VERSTAPPEN    312  ████ │
│  2  LANDO NORRIS      287  ███  │
│  ...                            │
│ ─── CALENDAR ─────────────────  │
│  RD 01  BAHRAIN    15 MAR  ✓   │
│  RD 02  SAUDI      22 MAR  ✓   │
│  RD 14  SINGAPORE  [NEXT] 🔴   │
│  RD 15  JAPAN      ...         │
│                                 │
└─────────────────────────────────┘
```

- FlashList (Shopify) — büyük takvim listesi için virtualize
- Geçmiş round'lar: gri tone `--text-low`, gelecekler beyaz, "NEXT" kırmızı nokta
- Standings ve takvim aynı ekranda, aralarda section header

### 5.3 Profiles

```
┌─────────────────────────────────┐
│  [PILOTS | TEAMS]  segmented    │
│                                 │
│  ── Pilot seçili ──             │
│  ┌─────────────────────────┐   │
│  │  [pilot fotoğrafı hero] │   │
│  │  fade-to-bottom scrimi  │   │
│  │  MAX VERSTAPPEN [64px]  │   │
│  │  RED BULL · #1          │   │
│  └─────────────────────────┘   │
│  [takım rengi taban tonu]       │
│                                 │
│  CHAMPİYONLUKLAR  4            │
│  YARIŞLAR        100  KAZANMA  │
│  POLE POZİSYONLAR 40           │
│                                 │
│  ── Takım seçili ──             │
│  [araç görseli banner]          │
│  RED BULL RACING  [headline]    │
│  [VER chip] [PER chip]          │
│  Sezon: 1. 312 pts              │
└─────────────────────────────────┘
```

- `expo-image` + `blurhash` placeholder hero görseli için
- Pilot listesi: alfabetik FlashList, arama yok (kapsam dışı)
- Takım rengi taban: `getSeasonPalette().primary` — server-side çözümleme, inline style

### 5.4 Anthology

Editorial scroll — bento kart yok, tek okuma kolonu.

```
┌─────────────────────────────────┐
│  ANTHOLOGY          [headline]  │
│                                 │
│  ┌─────────────────────────┐   │
│  │  [kapak görseli]        │   │
│  │  parallax header        │   │
│  └─────────────────────────┘   │
│                                 │
│  EDITORIAL          [label-caps]│
│  Başlık buraya      [headline]  │
│  Kısa özet metni…   [body]      │
│                                 │
│  ┌─────────────────────────┐   │
│  │  [kapak görseli 2]      │   │
│  └─────────────────────────┘   │
│  Başlık 2           [headline]  │
│  ...                            │
└─────────────────────────────────┘
```

- Detay ekranı: tam genişlik hero → Barlow Condensed başlık → Inter 15px gövde
- Parallax: `useScrollViewOffset` → header `translateY` × 0.4

### 5.5 News + Glossary

```
┌─────────────────────────────────┐
│  [HABERLER | GLOSSARY]  segment │
│  [Tümü | Teknik | Yarış] filter │
│ ─────────────────────────────── │
│  14:32  Başlık uzun metin       │
│  ─────────────────────────────  │
│  11:05  Başlık iki              │
│  ─────────────────────────────  │
│  ...                            │
│                                 │
│  ── Glossary seçili ──          │
│  [Ara]  search input            │
│  DRS  açıklama metni…           │
│  ERS  açıklama metni…           │
└─────────────────────────────────┘
```

- Pull-to-refresh
- Haber açılışı: in-app WebView veya external link (tercihe göre)
- Glossary: statik JSON, `useMemo` ile filtreleme, FlashList

---

## 6. Tasarım Token Sistemi

### 6.1 Renkler — `constants/colors.ts`

```ts
export const Colors = {
  bg: '#0a0a0a',
  surface: '#141414',
  surfaceRaised: '#1c1c1c',
  hairline: '#262626',
  textHi: '#ffffff',
  text: '#e6e6e6',
  textMid: '#9a9a9a',
  textLow: '#666666',
  apexRed: '#ff1801',
}
```

Takım renkleri: `config/team-colors.ts`'ten import — mobil'de de tek kaynak.  
Hardcode renk yok. `resolveTeamUiColor()` standings bar/chip için.

### 6.2 Tipografi — `constants/typography.ts`

| Token | Font | Boyut | Ağırlık |
|---|---|---|---|
| `hero` | Barlow Condensed | 64px / lh 1.0 | 700 |
| `headline` | Barlow Condensed | 32px | 600 |
| `cardTitle` | Barlow Condensed | 22px | 600 |
| `bodyLg` | Inter | 16px / lh 1.6 | 400 |
| `bodyMd` | Inter | 15px / lh 1.6 | 400 |
| `dataMono` | JetBrains Mono | 13px | 500 |
| `labelCaps` | JetBrains Mono | 11px / 0.1em | 700 |

Font yükleme: Expo config plugin (`fonts-config-plugin` rule) — build-time, runtime CDN yok.

### 6.3 Spacing

4px baseline grid. `p-4` (16px) kart padding, `gap-6` (24px) section gap, `mx-5` (20px) sayfa kenarı.

---

## 7. Animasyon Sistemi

**react-native-reanimated 3** — tüm animasyonlar UI thread'de, layout tetiklemez.

| Animasyon | Yöntem | Parametre |
|---|---|---|
| Kart press | `useAnimatedStyle` + `withSpring` | scale 0.97, opacity 0.85, 120ms |
| Standings satır girişi | `FadeInDown` staggered | her satır 30ms offset |
| Hero geri sayım rakamı | `withSequence(scale 1.08 → 1.0)` | saniye güncellemi |
| Anthology parallax | `useScrollViewOffset` → translateY × 0.4 | — |
| Tab geçişi | Expo Router native stack | platform-native |

**Kural:** yalnızca `transform` ve `opacity` — GPU-only properties.  
`animation-gesture-detector-press` rule: Gesture.Tap > Pressable yoğun gesture senaryolarda.

---

## 8. Bildirim Sistemi

### 8.1 Kullanıcı akışı

1. İlk uygulama açılışında `notifications.tsx` ekranı gösterilir (skip seçeneği var)
2. Toggle'lar: **FP1 / FP2 / FP3 / Qualifying / Sprint / Race**
3. Kullanıcı seçimi `AsyncStorage`'a yazılır
4. Expo Push Token alınır, Vercel backend'e kaydedilir (`/api/push/register`)
5. Sonraki açılışlarda tercihler settings ekranından değiştirilebilir

### 8.2 Backend — YENİ endpoint'ler

```
POST /api/push/register     → token + tercihler Supabase'e kaydedilir
GET  /api/cron/notify       → F1 takvimine göre oturum başlamadan 30dk önce push gönderir
```

`/api/cron/notify` Vercel cron ile günde 1 çalışır; `f1Calendar.ts`'ten oturumları okur, 30dk içinde başlayacak oturumlar için `expo-server-sdk` ile Expo Push API'ye istek atar.

### 8.3 Supabase — yeni tablo

```sql
CREATE TABLE push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token       text NOT NULL UNIQUE,
  preferences jsonb NOT NULL DEFAULT '{}',  -- { fp1: true, race: true, ... }
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);
```

RLS: insert/update kendi token'ına, anon key ile.

---

## 9. Paket Listesi

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-image": "~2.0.0",
  "expo-notifications": "~0.29.0",
  "expo-font": "~13.0.0",
  "react-native-reanimated": "~3.16.0",
  "react-native-gesture-handler": "~2.20.0",
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0",
  "@react-navigation/native-stack": "^7.0.0",
  "@shopify/flash-list": "^1.7.0",
  "@tanstack/react-query": "^5.0.0",
  "nativewind": "^4.0.0",
  "tailwindcss": "^3.4.0",
  "@react-native-async-storage/async-storage": "^2.0.0",
  "expo-server-sdk": "^3.0.0"  // backend'de (Next.js), mobile'da değil
}
```

---

## 10. Geliştirme & Build Akışı

```bash
# Geliştirme
cd mobile
npx expo start          # Expo Go ile test (iOS + Android fiziksel cihaz)

# Production build
eas build --platform android   # APK / AAB
eas build --platform ios       # IPA (Apple Developer hesabı gerekli)
eas submit                      # Store'a gönderim
```

**EAS (Expo Application Services):** `eas.json` ile profile'lar — `development` (Expo Go), `preview` (internal APK), `production` (store).

---

## 11. Kapsam Dışı (Bu Spec)

- Canlı yarış timing / telemetri
- Kullanıcı hesabı / auth
- Sosyal özellikler (yorum, paylaşım)
- Offline-first tam cache (temel offline graceful degradation yeterli)
- iPad / tablet layout optimizasyonu
- Dark/light mode toggle (sadece dark)

---

## 12. Başarı Kriterleri

- Expo Go'da iOS + Android fiziksel cihazda sorunsuz çalışır
- `eas build` ile APK ve IPA üretilebilir
- Tüm ekranlar mevcut Vercel backend'i tüketir, backend'e dokunulmaz (bildirim endpoint'leri hariç)
- Bildirim tercihleri persist edilir, doğru oturumlara push gönderilir
- Animasyonlar 60fps, UI thread'de
- Tasarım dili Apex `design.md` ile tutarlı, BoxBox Club'ın native hissini taşır
