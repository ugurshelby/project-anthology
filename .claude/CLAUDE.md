# Çalışma Anayasası

> **Frontend durumu (2026-06-21):** Frontend tamamen sıfırlandı ve yeniden inşa edilecek.
> `components/` silindi; `app/**/page.tsx` sayfaları veri çağrılarını + metadata'yı koruyan
> iskelet placeholder'lara indirildi; `app/globals.css` yalnızca token + reset içeriyor.
> Backend, veri katmanı, mimari, metin içerikleri (`data/`) ve `public/` assetleri korundu.
> Yeni frontend tasarım dili kullanıcı tarafından verilecek — hazır bir tasarım anayasası YOK.

## 1. Başlamadan Önce
- `docs/reference/proje-dizini.md` oku.
- `docs/reference/PROJECT_LESSONS_AND_ROADMAP.md` — geçmiş hatalar + mimari kararlar.
- Sezon/yıl/takım/pilot belirsizse: `lib/f1Calendar` → `getF1Context()`.
- Frontend işlerinde TEK tasarım otoritesi: `design/design.md`.
- Mobil işlerinde ek otorite: `docs/superpowers/specs/2026-06-25-mobile-app-design.md`.
- ⚠️ `design/stitch-design-pack/DESIGN.md` BİZİM DEĞİL — Stitch'in otomatik ürettiği, eski
  kırmızı-tonlu Material paletli bir taslaktır. ASLA referans alma, palet/karar çekme.
  Yalnız `design/design.md` geçerlidir.

## 2. Sırayla Çalış
- Backend ve mimari önce, frontend sonra.
- Değiştirmeden önce ilgili dosyayı oku.
- Silmeden önce yedekle veya uyar.

## 3. Sabit Kurallar (Backend & Mimari)
- Sezon/takım/pilot hardcode yok — tek kaynak `lib/f1Calendar`.
- Dış API çağrıları server-side; client'a API key sızmaz.
- Supabase: server-side service role, client-side anon.
- Env var: hem `.env.local` hem Vercel dashboard'da.
- Kritik fonksiyonlar Sentry / `lib/logger` ile sarılı.
- F1 snapshot okuma `lib/data/f1.ts` (3-tier), yazma `lib/f1Ingest.ts`.
- Asset path çözümleme `lib/assets/f1-icons.ts` (sezon parametresi zorunlu).
- Yorum değil kod; gereksiz açıklama yazma.

## 4. Her Değişiklik Sonrası (sırayla)
1. `npm run build` → sıfır hata. (Mobil: `cd mobile && npx tsc --noEmit`)
2. `npx tsc --noEmit` → sıfır hata. Backend/data değişikliğinde `npm test` (vitest) → yeşil.
3. `logs/AGENT_{KONU}_{TARIH}.md` yaz (ne yapıldı, ne çalıştırıldı, ne kaldı).
4. Commit (açıklayıcı mesaj; büyük adım = ayrı commit).

## 5. Engelle, Sorma
Manuel aksiyon gerekiyorsa (Supabase dashboard, Vercel env, API key vb.):
```
⚠️ MANUEL AKSİYON GEREKLİ: [ne yapılmalı]
```
yaz, sonra devam et.

## 6. Görev Sonu Raporu (Türkçe)
```
✅ Tamamlananlar
⚠️ Manuel aksiyon gerekenler
❌ Tamamlanamayan + neden
📁 Değişen dosyalar
```

## 7. Çalışma Döngüsü & Doğrulama Disiplini

Her sorun, hata veya görev için şu döngü işletilir:

```
KEŞFET → PLANLA → UYGULA → DOĞRULA → YİNELE (gerekirse)
```

- **Keşfet:** İlgili dosyaları, geçmişi ve bağlamı oku. Memory'deki geçmiş hata ve kararları göz önüne al.
- **Planla:** Adımları ve **dokunulmayacak yerleri** belirle. Büyük işlerde planı göster.
- **Uygula:** Planı uygula, her adımı kısaca logla.
- **Doğrula:** Build/lint/type geçiyor mu? Belirtilen kısıtlara uyuldu mu?
- **Yinele:** Kriter karşılanmadıysa neyin eksik olduğunu açıkla ve döngüyü tekrarla.

### Bağımsız Hakem Kontrolü

Her döngünün sonunda *"yapan gözle değil, denetleyen gözle"* kontrol et:
1. Değişiklikler hedefle tutarlı mı?
2. Beklenmedik yan etki var mı?
3. Hangi varsayım test edilmedi?
4. Kriterlerin **tamamı** mı karşılandı?

### Dur ve Sor

Şu durumlarda döngüyü durdur, kullanıcıya sor:
- Production'ı etkileyen değişiklik (Vercel/Supabase canlı).
- `package.json`, `tsconfig.json`, `.env` gibi kritik config değişikliği.
- **Silme** işlemi (dosya, tablo, kayıt).
- Birden fazla çözüm yolu var ve tercih belirsiz.

## 8. Tasarım Skill Kuralları (Otomatik — kullanıcı söylemeden uygulanır)

### Web Frontend (Next.js)
- **Yeni bileşen / sıfırdan tasarım:** `high-end-visual-design` skill'i çağrılır.
- **Review / denetim / genel iyileştirme:** `ui-ux-pro-max` skill'i çağrılır.

### Mobil Frontend (Expo / React Native)
- **Yeni ekran / bileşen:** `react-native-skills` + `imagegen-frontend-mobile` skill'leri referans alınır.
- **Liste performansı:** FlashList zorunlu, FlatList yasak.
- **Animasyon:** `react-native-reanimated` 3, yalnızca `transform`/`opacity`.
- **Görseller:** `expo-image` zorunlu, RN Image yasak.

### Skill / `design.md` İlişkisi
`high-end-visual-design` ve `ui-ux-pro-max` aktifken `design/design.md` **katı kural değil, ilham kaynağı**dır.
Skill'in önerisi farklılaşıyorsa uygulanır. Yine de geçerli üç ilke:
1. Sayfanın genel tonuyla açık çelişki yaratma.
2. Mevcut bileşenlerle yan yana durduğunda kopukluk hissettirme.
3. `prefers-reduced-motion` ve WCAG kontrast minimumları her zaman geçerli.

## 9. Yüklü Skill Kataloğu (Özet)

| Kategori | Skill | Ne Zaman |
|---|---|---|
| UI Tasarım | `high-end-visual-design` | Yeni web bileşeni / sıfırdan tasarım |
| UI Denetim | `ui-ux-pro-max` | Review / audit / genel iyileştirme |
| Mobil | `react-native-skills` | RN/Expo bileşen ve liste performansı |
| Mobil Görsel | `imagegen-frontend-mobile` | Mobil ekran mockup üretimi |
| Animasyon | `react-view-transitions` | React View Transition / route animasyonu |
| React | `react-best-practices` | Bileşen yazımı, veri çekme, performans |
| Supabase | `supabase` | DB, Auth, Edge Functions, migrations, RLS |
| Erişilebilirlik | `accesslint-audit` | WCAG 2.2 denetimi ve düzeltme |
| Brainstorm | `superpowers:brainstorming` | Yeni özellik / büyük değişiklik öncesi |
| Plan | `superpowers:writing-plans` | Implementation planı yazımı |
