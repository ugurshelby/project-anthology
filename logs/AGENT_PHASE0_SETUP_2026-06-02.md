# AGENT LOG — Phase 0: Kurulum ve Entegrasyonlar

**Tarih:** 2026-06-02
**Ajan:** Claude Code (Opus 4.8)
**Karar:** Sıfırdan temiz başlangıç (working tree bilinçli temizlenmişti; eski HEAD kodu geri getirilmedi).

## Ne yapıldı (maddeler)
- Proje durumu tespit edildi: working tree temizlenmiş, HEAD'de eski Next.js projesi duruyor, canlı Supabase DB boş (hiç tablo yok).
- Dış entegrasyonlar doğrulandı: GitHub `origin` ✅, Vercel `.vercel/project.json` ✅, Supabase env (`.env.local`) ✅, Vercel OIDC token taze ✅.
- Toolchain doğrulandı: Node v22.18, npm 10.9.3, Vercel CLI v54.5.1; Supabase CLI ve Scoop global kurulu DEĞİL → `npx supabase` fallback kullanıldı.
- **Next.js 16.2.7** iskeleti kuruldu (`create-next-app --yes` geçici `scaffold-tmp/` dizinine, sonra kök dizine taşındı). TypeScript + ESLint + Tailwind v4 + App Router + Turbopack + `@/*` alias.
- `package.json` `name` → `project-anthology` düzeltildi.
- Bağımlılıklar eklendi: `@supabase/supabase-js@^2.107`, dev: `tsx@^4.22`, `dotenv@^17.4`.
- create-next-app'in ürettiği 11 byte'lık kök `CLAUDE.md` (`@AGENTS.md` referansı) silindi → mevcut `.claude/CLAUDE.md` (proje anayasası, 2187 byte) KORUNDU. `AGENTS.md` (Next.js 16 agent uyarıları) tutuldu.
- `tsconfig.json` exclude'a `old-versions-valuable-files` + `pre-plans` eklendi (referans dosyaları type-check'i kırıyordu).
- `.gitignore`: create-next-app default'una `!.env.example` istisnası + `supabase/.temp/`, `supabase/.branches/` eklendi.
- `.env.example` oluşturuldu (anahtar adları, değerler boş; client/server ayrımı not edildi).
- `npx supabase init` → `supabase/config.toml` + `supabase/.gitignore`.
- `npx supabase link --project-ref ezocovgpybrluvgaqnft` → yerel `supabase/.temp/project-ref` yazıldı.

## Değişen / oluşan dosyalar
- Oluşan: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `app/{layout,page}.tsx`, `app/globals.css`, `app/favicon.ico`, `public/*`, `AGENTS.md`, `README.md`, `.gitignore`, `.env.example`, `supabase/config.toml`, `supabase/.gitignore`
- Korunan (dokunulmadı): `.claude/CLAUDE.md`, `.cursor/`, `.env.local`, `.vercel/`, `old-versions-valuable-files/`, `pre-plans/`

## Çalıştırılan komutlar
- `npx create-next-app@latest scaffold-tmp --yes`
- `npm install @supabase/supabase-js` ; `npm install -D tsx dotenv`
- `npm run build` → ✅ exit 0, sıfır TS hatası, `/` ve `/_not-found` static prerender
- `npx supabase init` ; `npx supabase link --project-ref ezocovgpybrluvgaqnft`

## Karşılaşılan hatalar ve çözümleri
1. **create-next-app non-empty dir reddi** (`.env.local`, `.vercel/`, `old-versions-valuable-files/`, `pre-plans/` çakışması) → geçici `scaffold-tmp/` dizinine kurulup içerik köke taşındı.
2. **`_scaffold_tmp` npm naming hatası** (alt çizgi ile başlayamaz) → `scaffold-tmp` kullanıldı.
3. **Build TS hatası**: `old-versions-valuable-files/news.ts` `@/lib/supabase` import edemiyordu → bu referans dizinleri `tsconfig.json` exclude'a eklendi.
4. **`scaffold-tmp` silinemedi** (geçici dosya kilidi, node_modules taşıması sonrası) → birkaç deneme sonrası temizlendi.
5. **`supabase projects list` → "Access token not provided"**: `link` ref'i yerel yazdı ama API auth'u yok → login gerekli (manuel aksiyon).

## ⚠️ MANUEL AKSİYON GEREKLİ
- **`supabase login`**: Tarayıcıda Supabase hesabıyla yetkilendirme. Agent çalıştıramaz.
  Çalıştır: `npx supabase login`
  Sonra: `npx supabase link --project-ref ezocovgpybrluvgaqnft` (auth ile tam doğrulanır),
  ardından `npx supabase projects list` ile teyit.

## Sonraki adım
- Phase 1: DB şeması (`pre-plans/database-schema-plan.md` → `001_initial_schema.sql` yeniden tasarımı) ve data layer.
- Login sonrası `supabase db push` ile migration uygulanabilir hale gelir.
