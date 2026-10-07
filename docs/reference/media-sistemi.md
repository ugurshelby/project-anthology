# Medya (görsel) sistemi: pilot, takım, araç, pist

Last verified: 2026-10-06

Bu doküman **backend tarafında kurulan görsel temin sistemini** ve **frontend'in (Antigravity) bu sisteme nasıl güvenli bağlanacağını** anlatır. Kod ve migration hazırdır; migration canlı veritabanına uygulandı ve kod/workflow 2026-10-06'da canlıya çıktı; ilk `sync-media` koşusuyla dolum başlar (bkz. Bölüm 13).

> Tek cümlede: Site **hiçbir zaman** Wikimedia'ya (veya başka bir görsel kaynağına) kendi isteğiyle gitmez. Zamanlanmış bir iş (cron) her varlık için lisansı doğrulanmış tek bir görsel bulur, kendi WebP kopyasını Supabase Storage'a yükler, bilgisini `media_assets` tablosuna yazar. Sayfalar yalnızca bu tabloyu okur. Kayıt yoksa **placeholder** çizilir.

---

## 1. Kararlar ve kapsam

| Konu | Karar |
|---|---|
| Pilot / araç | Varlık başına **1 görsel** yeter |
| Takım | **1 logo** yeter (şeffaf ya da arka planlı) |
| Pist | Son ~20–30 yılın pistleri + ikonik tarihî pistler (Nürburgring vb.) |
| Lastik | **Kapsam dışı** (SVG seti sahibin elinde) |
| Dönem | Otomatik keşif **2018 → bugün**. Eski sezonlar (1950–2017) sonraki faz |
| Araç | **Sezona özel**: `mclaren:2025` yalnızca 2025 aracıdır. Önceki/sonraki sezonun aracı **asla** gösterilmez; yoksa placeholder |
| İkonik araçlar | Sezondan bağımsız, elle derlenmiş liste (`data/media/curated.ts`): F2004, MP4/4, RB19, W05/W11/W14, W196, 312T… |
| Kaynak | Wikimedia Commons (+ Wikidata). Lisansı kodla doğrulanır |
| Depolama | Kendi Supabase Storage bucket'ımız (`media`), yeniden kodlanmış küçük WebP'ler |
| Fallback | Görsel yoksa **tür'e özel SVG placeholder** (frontend çizer) |
| Telifli kaynaklar | **Kullanılmaz**: FOM/F1 (`media.formula1.com`, OpenF1 `headshot_url` dahil), takım basın portalları |

---

## 2. Mimari

```
                         (saatlik cron: /api/cron/sync-media)
 Jolpica ──► keşif ──► media_assets (pending) ─┐
 (sezon başına pilot/takım/pist listesi)       │
                                               ▼
   Wikipedia başlığı ─► Wikidata QID ─► P18 / P154 / P373 ─► Commons dosyaları
        (Jolpica'nın verdiği URL)                          (arama + kategori)
                                               │
                  lisans kapısı + boyut/format kapısı + puanlama + eşik
                                               │
                         ┌─────────────────────┴─────────────────────┐
                    geçen aday var                              hiçbiri geçmedi
                         │                                            │
        indir → sharp → WebP varyantları + blur + renk         status = missing
        Storage'a yükle (içerik adresli yol)                   (placeholder)
        media_assets.status = resolved
                         │
                         ▼
   Sayfa / API ──► media_assets (RLS: yalnız resolved) ──► { image | placeholder }
```

Önemli özellikler:
- **İstek anında dış çağrı yok.** Rate limit (Wikimedia 429) kullanıcıyı etkilemez.
- **Artımlı:** her çalışmada yalnızca vadesi gelenler işlenir; yeni sezon/pilot/takım/pist **otomatik** bulunur.
- **Dayanıklı:** 429/ağ hatası görseli "yok" saymaz (backoff ile tekrar denenir); art arda 3 geçici hata devre kesici açar.
- **Yanlış görsel yerine görsel yok:** sert kapılar + puan eşiği. Eşiği geçemeyen varlık `missing` olur.

---

## 3. Veri modeli

Migration: `supabase/migrations/20261006000001_media_assets.sql`

### `media_assets` (varlık başına 1 satır, `unique(entity_type, entity_key)`)

| Kolon | Anlamı |
|---|---|
| `entity_type` | `driver` \| `team` \| `car` \| `circuit` |
| `entity_key` | Aşağıdaki anahtar kuralları |
| `aliases` | Aynı varlığın diğer kimlikleri (F1DB: `lewis-hamilton`, `red-bull`…) |
| `status` | `pending` (hiç çözülmedi) · `resolved` (görsel var) · `missing` (uygun görsel bulunamadı → placeholder) |
| `review` | `auto` (sistem seçti) · `approved` (sahip onayladı, yeniden aranmaz) · `rejected` (sahip gizledi; dosya bir daha seçilmez) |
| `variants` | `[{w,h,path,bytes}]` WebP varyantları (Storage yolları) |
| `width`/`height`, `blur_data_url`, `dominant_color` | Layout kayması ve blur-up için |
| `author`, `license`, `license_url`, `attribution`, `source_page_url`, `source_file` | Atıf ve takedown izi |
| `is_trademark` | Takım logoları için `true` |
| `confidence` | 0–1 arası puan |
| `attempts`, `last_error`, `next_check_at`… | Zamanlama/teşhis (anon'a **kapalı**) |

`media_sync_state`: keşfedilen sezonları tutan küçük key/value tablosu (yalnız service role).

### Anahtar (key) kuralları

Anahtarlar **Jolpica/Ergast kimlikleridir** (sitenin profil URL slug'larıyla aynı):

| Tür | Anahtar | Örnek |
|---|---|---|
| driver | `driverId` | `max_verstappen`, `hamilton`, `norris` |
| team | `constructorId` | `red_bull`, `mclaren`, `aston_martin` |
| circuit | `circuitId` | `suzuka`, `albert_park`, `nurburgring` |
| car (sezonluk) | `<constructorId>:<sezon>` | `mclaren:2025`, `red_bull:2023` |
| car (ikonik) | `iconic:<slug>` | `iconic:ferrari-f2004` |

Anahtar deseni: `^[a-z0-9_.:-]{1,80}$` (DB CHECK + API doğrulaması aynı).

**Alias (önemli entegrasyon notu):** Güncel sezon sayfaları Jolpica kimliği (`hamilton`, `red_bull`), arşiv/geçmiş sezon sayfaları F1DB kimliği (`lewis-hamilton`, `red-bull`) kullanır. Okuma katmanı bir anahtarı `entity_key` **veya** `aliases` ile eşler (tire/alt çizgi varyantlarını da dener) ve **cevapta istenen anahtarı aynen geri verir**. Frontend, sayfasının bildiği kimliği olduğu gibi gönderebilir. Alias bulunamayan bir kimlik görürseniz placeholder gelir; backend'e bildirin (`data/media/curated.ts` → `CIRCUIT_ALIASES`).

### Storage

Bucket: `media` (public read, 3 MB üst sınır, yalnız `image/webp`). Yazma yalnız service role. Yol: `<tür>/<anahtar>/<sha10>/<genişlik>.webp`; `:` yerine `__` kullanılır. **İçerik adresli**: görsel değişirse URL değişir, bu yüzden dosyalar `Cache-Control: max-age=31536000, immutable` gibi sonsuz cache'lenebilir.

---

## 4. Kaynak zinciri (sırayla)

Her aşama toplu (batch) çalışır; ilk **yeterli** aday bulunan aşamada durulur (en ucuz/güvenilir kaynak önce).

| Tür | Sıra |
|---|---|
| **driver** | ① curated dosya (varsa) → ② Wikidata **P18** (aktif pilotsa ve fotoğraf son 2 yıldan eskiyse sıradaki aşamaları da dener) → ③ aktif pilotlar için Commons `"<isim> <sezon>"` araması → ④ Wikidata Commons kategorisi (P373) → ⑤ Commons `"<isim> Formula 1"` araması → **placeholder** |
| **team** (logo) | ① curated → ② Wikidata **P154** (logo) → ③ Commons `"<takım> logo"` aramaları (SVG tercih, en yeni yıl, renkli) → **placeholder** |
| **car** (sezonluk) | Commons `"<takım> <sezon> Formula One"` aramaları (takımın Wikipedia başlığı da kullanılır) + varsa `data/media/curated.ts` `CAR_MODELS` şasi adı (`"Red Bull RB16B"`). **Sezon kapısı:** dosya adındaki/metadata'daki yıl sezonla birebir eşleşmeli → **placeholder** |
| **car** (ikonik) | Yalnızca elle derlenmiş `files` listesi (sırayla) → opsiyonel `query` → placeholder |
| **circuit** | ① curated → ② Wikidata P18 → ③ P373 kategorisi (kaynak `commons-category`: pistin kendi Commons kategorisine konmuş dosyalar; adında yarış sözcüğü olmayan pistler — Red Bull Ring, Kyalami, AVUS — yalnızca böyle tanınır) → ④ Commons `"<pist> aerial/circuit"` → ⑤ `"<pist> grandstand / paddock pit lane / Formula One"` ve `"<yer> Grand Prix"` → **placeholder** |

### Kapılar (hepsi geçmeli)

1. **Lisans** (Bölüm 6): allow-list dışı her şey elenir.
2. **Format:** JPEG/PNG/WebP. SVG yalnızca takım logosu için (Commons PNG'ye çevirir, biz yine raster'e çeviririz; **SVG hiçbir zaman saklanmaz**). Pist ve araç fotoğrafları için PNG reddedilir (çoğu pist şeması/ekran görüntüsü).
3. **Boyut:** pilot ≥ 400 px, araç/pist ≥ 1400 px geniş (logo SVG için yok).
4. **Konu kapıları:** isim/yer adı başlıkta veya kategoride geçmeli; yasaklı kelimeler (harita, oyuncak, poster, diğer seriler F2/F3/E…); araçta **sezon**; pistte **yarış bağlamı** (circuit/speedway/pit/grandstand…); logoda "logo/wordmark/emblem" ve araç modeli rozeti (F430, 16M) olmaması.
5. **Pist için ek kapılar (2026-10-07):** at yarışı (Aintree Racecourse), pul/ilk gün zarfı/kartpostal kategorileri, bisiklet/maraton gibi aynı yolda yapılan etkinlikler ve fuar/sergi/banner fotoğrafları (AVUS'ta Grüne Woche salonu çıkmıştı) reddedilir. Başlığı yalnızca `<pist> Grand Prix (123456)` olan etkinlik anlık görüntüsü, parçayı (aerial/grandstand/start-finish…) adlandırmıyorsa −10 alır. Pistin adındaki takım sözcüğü (Red Bull Ring) "aksiyon fotoğrafı" cezası sayılmaz.
6. **Araç için şasi kapısı:** takım adı başlıkta değilse kategoride `<şasi> of <sürücü>` benzeri model kategorisi aranır (`Ferrari SF1000 of Charles Leclerc`; desen SF1000, C39, AT01, RP20, R.S.20, VF-19, MCL36 gibi 1–4 haneli şasi kodlarını tanır). Yalnızca yıl metadata'dan geliyorsa kategorilerde olay da (test/Grand Prix/qualifying…) geçmeli — sergi arabası (Honda ofisindeki AT02) yarış hafta sonu karesi sayılmaz. `<şasi> of <sürücü>` kategorisi puan kazanır; yalnızca model kategorisi taşıyan geniş tribün kareleri sıralamada geride kalır. Yol aracı kelimeleri (Stradale, Spider…) elenir.
7. **Puan ≥ eşik** (driver 55, team 60, car 60, circuit 50). Puan; kaynak güveni, isim eşleşmesi, çözünürlük, kadraj, yenilik, "pistte çekilmiş araç" gibi sinyallerden gelir.

Gerçek veride yakalanan tuzaklar (testlerle sabitlendi): Ferrari logosu aramasında yol aracı rozeti; "Ferrari World" tema parkı logosu; Red Bull içecek logosu; Silverstone'un Wikidata görseli olarak bir McLaren shakedown fotoğrafı; Watkins Glen'in Wikidata görseli olarak bir NASCAR sürücüsü portresi; "panoramio" kelimesinin "panorama" sayılması (otel/şehir fotoğrafları); CC0 dosyalarının "telifli" işaretli gelmesi.

---

## 5. Senkronizasyon (cron)

Route: `app/api/cron/sync-media` · Zamanlama: saatlik, **QStash** (`apex-sync-media`, `41 * * * *`; kurulum `npm run qstash:sync`, bkz. `apex-reference.md` "Zamanlayıcı"); yedek olarak GitHub Actions (`.github/workflows/sync-media.yml`, `17 * * * *`, GitHub bunu ~5 kez/gün çalıştırır). `vercel.json`'da değil çünkü Vercel Hobby cron'ları günde bir kez çalışır ve saatlik ifade deploy'u reddeder · `maxDuration=300`, iş bütçesi 240 sn. Migration uygulanana kadar route `200 {skipped:true}` döner (workflow kırmızı olmaz).

- **Auth:** `Authorization: Bearer <CRON_SECRET>` (`isCronAuthorized`, fail-closed) + `isCronTriggerAllowed` (60 sn alt sınır).
- **Keşif:** Jolpica'dan sezon başına pilot/takım/pist listesi. En yeni sezon her çalışmada, eski sezonlar çalışma başına en fazla 2 tane geriye doğru (2018'e kadar). Ek olarak ikonik araçlar ve tarihî pistler (`data/media/curated.ts`). **Yeni sezon (2027, 2028…) için kod değişikliği gerekmez.**
- **İşleme:** vadesi gelenler (önce `pending`), toplu kimlik çözümü (Wikipedia→Wikidata→görsel talepleri) sonra varlık başına aday arama/puanlama/indirme.
- **Çözümleyici sürümü (`RESOLVER_VERSION`, `lib/media/sync.ts`):** kapılar/puanlama/arama aşamaları/curated veri iyileştiğinde sürüm artırılır; bir sonraki çalışma **bir kez** tüm `missing` satırları vadesi gelmiş yapar (`next_check_at = now`) ve sürümü `media_sync_state.resolver_version` içine yazar. Böylece iyileştirme, 7–21 gün beklemeden vazgeçilmiş varlıklara ulaşır; kayıt başarısız olsa bile çalışma düşmez. Yanıtta `requeued` sayısı döner.
- **Vade takvimi:** `resolved` 90 gün · `approved` 180 gün · `missing`: son iki sezonun aracı 7 gün (yeni sezon fotoğrafları haftalar sonra çıkar), diğerleri 21 gün · hata: 10 dk × 2ⁿ (en çok 6 saat).
- **Rate limit koruması:** host başına istek aralığı (Wikimedia ≥ 1.1 sn), `Retry-After`'a uyulur, açıklayıcı `User-Agent` (`MEDIA_CONTACT` env veya site URL'si). Art arda 3 geçici hata → çalışma durur.
- **İdempotent:** aynı dosya seçilirse indirme yapılmaz; vadesi gelmemiş satıra (çözülmüş: 90 gün, onaylı: 180 gün) dokunulmaz — elle veya zamanlı her tetikleme yalnızca vadesi gelen (yeni, hatalı, vadesi dolmuş `missing`) varlıkları arar. Eski sürümün Storage dosyaları temizlenir.
- **Storage yükleme:** geçici ağ geçidi hataları (HTTP 5xx, boş mesaj; 2026-10-07'de `hockenheimring` için 520) 3 denemeye kadar tekrarlanır; 4xx hatalar hemen düşer (`uploadWithRetry`).
- **Teşhis:** `missing` satırın `last_error` alanı elenme nedenlerini ve gerekli eşiğin altında kalan en iyi iki adayı yazar (`best below bar: …`).
- **İlk dolum:** ~300 varlık için birkaç saatlik çalışma yeter (Wikimedia'nın hız sınırı yüzünden). İş boşken tek ucuz sorgudur.
- `?only=driver:norris,team:ferrari` yalnızca vadesi gelen bu varlıkları işler.

Yerel/kuru deneme (DB'ye yazmaz, env dosyası okumaz): `npx tsx scripts/media-sync.ts --seasons 2025-2025 --only driver:norris --out /tmp/media-out --report /tmp/rapor.json`

---

## 6. Lisans ve hukuk politikası

**Allow-list (yalnızca bunlar):** Public domain (`pd*`), CC0, CC BY (`cc-by-*`), CC BY-SA (`cc-by-sa-*`). Commons'un kendi makine-okunur `License` kodundan okunur. **Reddedilenler:** NC, ND, GFDL-tek, fair use, "non-free" işaretli, bilinmeyen/eksik lisans, çelişkili metadata. Şüphede **ret**.

- **Atıf:** CC BY/BY-SA için zorunlu. Her kayıtta hazır cümle var: `Yazar / Wikimedia Commons, CC BY-SA 4.0`. Frontend bunu görselin yanında veya "görsel kaynakları" bölümünde göstermelidir (Bölüm 9).
- **BY-SA:** Bizim yeniden kodladığımız kopya türev sayılabilir; atıf + lisans bağlantısı bu yüzden önemlidir. Görseller yalnızca kendi alanımızda sunulur; yeniden lisanslamıyoruz.
- **Takım logoları:** Telif hakkı (basit logo → PD) ile **marka hakkı** ayrı şeydir. Logolar `is_trademark = true` işaretlidir. Sitede "bağımsız, resmî olmayan fan projesi; marka ve logolar sahiplerine aittir" notu bulunmalıdır; logo, takımla bağlantı izlenimi vermeyecek şekilde (yalnızca takımı tanımlamak için) kullanılmalıdır.
- **"Public domain, bilinmeyen yazar" etiketi** (özellikle 1950'ler): Commons etiketine güveniyoruz, hukuki garanti değildir. İkonik eski araçlarda sınırlıdır; şüpheli olanı `review = 'rejected'` ile gizleyin (Bölüm 13).
- **Takedown:** Hak sahibi talebi → ilgili satırı `rejected` yapıp görseli anında gizleyin; dosya bir daha seçilmez. Politika sayfasında bir iletişim yolu bulunmalı (iletişim adresi sahibin kararıdır).
- **Kullanılmayanlar:** `media.formula1.com` ve OpenF1 `headshot_url` (FOM'a ait), takım basın portalları (kullanım şartları yeniden dağıtıma izin vermiyor).

Bu bir hukuki görüş değildir; sistem, riski azaltan teknik kapılar ve bir izleme/gizleme kanalı sağlar.

---

## 7. Okuma katmanı ve API sözleşmesi

### Sunucu (RSC) kullanımı

```ts
import { getMediaBatch, getMedia } from '@/lib/media/read';

const map = await getMediaBatch('driver', driverIds);   // listeler için TEK sorgu
const one = await getMedia('circuit', 'suzuka');          // tekil (request içinde cache'li)
```
`getMediaBatch` **hiçbir zaman fırlatmaz** ve her istenen anahtar için cevap döner (`image` veya `placeholder`). Veritabanı hatasında tüm anahtarlar placeholder olur.

### HTTP API

`GET /api/media?type=driver|team|car|circuit&keys=a,b,c` (en çok 40 anahtar)

Başarılı cevap (`200`, `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`):

```json
{
  "type": "driver",
  "items": {
    "norris": {
      "status": "image",
      "type": "driver",
      "key": "norris",
      "image": {
        "src": "https://<proje>.supabase.co/storage/v1/object/public/media/driver/norris/ab12cd34ef/640.webp",
        "srcSet": ".../160.webp 160w, .../320.webp 320w, .../640.webp 640w",
        "width": 640,
        "height": 800,
        "variants": [{ "w": 160, "h": 200, "src": "..." }],
        "blurDataURL": "data:image/webp;base64,...",
        "dominantColor": "#8a5a44"
      },
      "attribution": {
        "text": "Stepro / Wikimedia Commons, CC BY-SA 4.0",
        "author": "Stepro",
        "license": "CC BY-SA 4.0",
        "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:...",
        "trademark": false
      }
    },
    "unknown_guy": {
      "status": "placeholder",
      "type": "driver",
      "key": "unknown_guy",
      "placeholder": { "kind": "driver", "seed": "unknown_guy" }
    }
  }
}
```

Hatalar: `400` geçersiz `type`/`keys` (tek bir kötü anahtar tüm isteği reddeder) · `429` rate limit (`Retry-After`) · `500` genel mesaj (iç ayrıntı sızdırılmaz).

**Her istenen anahtar cevapta vardır.** Frontend "anahtar yok" durumunu ayrıca ele almak zorunda değildir.

---

## 8. Frontend (Antigravity) entegrasyon kuralları

Tek kural: **`status === 'image'` ise görseli göster, değilse placeholder çiz.** Başka fallback yoktur (özellikle: araçta komşu sezonun görseli, pilotta başka kaynak, harici URL).

1. **Listelerde tek istek.** Kartlar tek tek istek atmasın. Sunucuda `getMediaBatch`, istemcide `/api/media` ile 40'a kadar anahtarı tek seferde isteyin.
2. **Anahtar üretimi:** sayfanın bildiği kimliği olduğu gibi kullanın (Jolpica ya da F1DB kimliği; Bölüm 3). Araç: `` `${constructorId}:${season}` `` (aynı kimlik ailesiyle). İkonik araç: `iconic:<slug>` (liste için `ICONIC_CARS` → `data/media/curated.ts`).
3. **Layout kayması yok:** `width`/`height` ile `aspect-ratio` verin; `dominantColor` arka plan, `blurDataURL` bulanık ön görsel olarak kullanılsın.
4. **`srcSet` + `sizes` kullanın.** Görseller zaten doğru boyutlu WebP'dir; Vercel Image Optimization'a **gerek yok**: `next/image` kullanılacaksa `unoptimized` ve `srcSet` verin (veya düz `<img>`). `next.config.ts` yalnızca `…/storage/v1/object/public/media/**` yoluna remote izin verir.
5. **LCP:** sayfa başı kahraman görselinde `fetchPriority="high"` ve `loading="eager"`; diğerlerinde `loading="lazy"`, `decoding="async"`.
6. **Alt metin sizin sorumluluğunuzdadır** (isim zaten sizde): örn. `"Lando Norris, portre"`. Atıf metnini alt metne koymayın.
7. **Atıf görünür olmalı** (CC BY/BY-SA yükümlülüğü): görselin yanında küçük bir "Foto: …" satırı ya da bir bilgi (ⓘ) açılır penceresi ve ayrıca bir "Görsel kaynakları" sayfası. `attribution.text` **düz metin** olarak render edilir (`textContent`; asla `dangerouslySetInnerHTML`). `sourceUrl` bağlantısına `rel="noopener noreferrer" target="_blank"`.
8. **Takım logosunda** (`attribution.trademark === true`) sayfa/altbilgide "resmî olmayan fan projesi" notu gösterilsin.
9. **`onError`:** görsel yüklenemezse placeholder'a düşün ve yeniden denemeyin.
10. **Sayfa seviyesi cache:** sayfalar ISR/`revalidate` ile üretilebilir. Görsel URL'leri değişmez (içerik adresli), API cevabı CDN'de 1 saat cache'lenir.
11. **Yapmayın:** `media.formula1.com`, OpenF1 `headshot_url`, Wikimedia'ya doğrudan istek, URL parametresi alan proxy, kullanıcıdan gelen bir değeri filtre/URL'ye eklemek.

---

## 9. Placeholder tasarım brief'i (Antigravity ile üretilecek)

Backend yalnızca `{ status: "placeholder", placeholder: { kind, seed } }` döner. **Nasıl çizileceği frontend'in işidir**; tasarımlar Antigravity ile üretilecek. Hepsi **özel SVG** (raster/harici dosya yok), mevcut Apex tasarım diline uygun, hafif (ideal < 3 KB), erişilebilir ve `prefers-reduced-motion`'a saygılı olmalı.

| `kind` | Brief |
|---|---|
| `circuit` | **Standart pist şeması:** soyut, tek çizgili, iyi tanımlı bir pist kontur illüstrasyonu (kıvrımlı kapalı döngü, start/finish işareti, ince grid dokusu). Tüm pistlerde aynı dil. Elimizdeki gerçek pist konturu (`circuitIconSrc`, MIT) varsa **onu kullanmak** önceliklidir; yoksa bu genel şema. |
| `team` | **Takım adı tipografisi:** takım adının logo gibi durduğu renkli tipografik bir SVG (takım renginden türetilmiş, `--team-secondary`). Resmî logoyu taklit **etmeyin**; özgün bir kelime-işareti dili. Uzun isimler için iki satır/kısaltma kuralı. |
| `car` | **Araç silüeti:** takım rengiyle yan görünüm F1 aracı siluet çizimi. `seed` (anahtar) ile hafif varyasyon (kanat/renk şeridi) ki farklı takımlar farklı görünsün. İkonik araçlarda başlık olarak araç adı/yıl gösterilebilir. |
| `driver` | **Pilot rozeti:** baş harfler/kod + numara, takım rengiyle; farklı pilotlar `seed` ile farklı desen/şeritle ayrışsın. Mevcut `ApexFallback` rozetinin geliştirilmiş hâli olabilir. |

Ortak: koyu/açık tema, WCAG AA kontrast, sabit en-boy oranı (görsel yerine geçtiği kutu ile aynı → layout kayması yok), tamamen dekoratif ise `aria-hidden`, anlamlıysa `role="img"` + isimle `aria-label`. "Eksik görsel hatası" gibi değil, **bilinçli teknik tasarım** gibi görünmeli.

---

## 10. Güvenlik notları

- **İstek anında dış çağrı yok** → SSRF yüzeyi yok. İndirme yalnızca `https://upload.wikimedia.org` ve `https://thumb.wikimedia.org` hostlarına izinlidir (kod allow-list'i; kullanıcı girdisi buraya ulaşmaz).
- **Public API yalnızca tür + doğrulanmış anahtar alır, URL almaz.** Anahtar deseni sıkıdır; tek geçersiz anahtar isteği reddeder. Okuma katmanı ayrıca filtre ifadesine girmeden önce anahtarları yeniden doğrular (PostgREST filtre enjeksiyonuna karşı).
- **RLS + kolon bazlı yetki:** `anon`/`authenticated` yalnızca `status = 'resolved' AND review <> 'rejected'` satırları ve yalnızca arayüz kolonlarını okuyabilir. `last_error`, `attempts`, `content_sha256`, `rejected_files`, vade kolonları **özeldir**. Yazma yalnızca `service_role`.
- **Service role anahtarı yalnızca sunucuda** (`getSupabaseAdmin()`). Cron route'u `isCronAuthorized` (fail-closed, sabit zamanlı karşılaştırma) ve tetik sınırı ile korunur.
- **Girdi doğrulama:** indirilen byte'lar magic-byte ile JPEG/PNG/WebP doğrulanır, 12 MB üst sınır, piksel sınırı; her görsel `sharp` ile **yeniden kodlanır** (EXIF/metadata silinir, kötü amaçlı yük etkisizleşir). **SVG saklanmaz/sunulmaz.**
- **XSS:** `attribution.text`/`author` Commons'tan gelen **güvenilmeyen metindir** (HTML etiketleri temizlenir, uzunluk sınırlıdır) ama frontend yine de düz metin olarak render etmelidir.
- **Cache zehirlenmesi yok:** URL'ler içerik adreslidir; aynı URL altında içerik değişmez.
- **Secret yok:** yeni zorunlu env yok. İsteğe bağlı `MEDIA_CONTACT` yalnızca User-Agent içindir (değer commit edilmez).
- **CSP:** `img-src` zaten `https:` içerir. İsterseniz sıkılaştırma: `img-src 'self' data: blob: https://<proje>.supabase.co`.

---

## 11. Performans notları

- Her görsel 3 genişlikte WebP (pilot 160/320/640, logo 96/192/384, araç/pist 480/960/1600) + 16 px blur data-URL + baskın renk. Kaynaktan büyütme yapılmaz.
- Storage dosyaları `immutable`, 1 yıl cache; API cevabı CDN'de 1 saat (+ stale-while-revalidate 1 gün).
- Listeler için **tek sorgu** (`getMediaBatch`, `in` + `ov` filtresi, GIN indeksli `aliases`).
- Sayfalarda hiçbir yerde görsel için canlı Wikimedia/Jolpica çağrısı yoktur.
- Cron boşken tek ucuz sorgudur; saatlik tetik maliyetsizdir.
- Görsel optimizasyon faturası için: önceden boyutlandırılmış görsellerde `unoptimized` kullanın.

---

## 12. Ölçülen sonuçlar (kuru çalıştırma, gerçek Wikimedia/Jolpica'ya karşı)

Komut: `npx tsx scripts/media-sync.ts --seasons 2018-2026 --passes 4` (4 geçiş = 4 ardışık saatlik cron çalışması; **DB'ye yazmaz**, gerçek Jolpica/Wikimedia'ya gider). Tarih: 2026-10-06.

**Genel:** 245 varlık → **219 görsel bulundu (%89)**, 26 placeholder, **0 hata**. Süre 994 sn (Wikimedia hız sınırına uyularak), Storage'a gidecek toplam **649 WebP dosyası / 42 MB**.

| Tür | Bulundu | Eksik | Not |
|---|---:|---:|---|
| Pilot | **60** / 60 | 0 | 2018–2026 grid (test/yedek pilotlar dahil) |
| Takım logosu | 12 / 18 | 6 | Eksik: `ferrari`, `rb` (Racing Bulls), `cadillac`, `toro_rosso`, `alphatauri`, `force_india` |
| Araç (sezonluk) | 81 / 91 | 10 | Sezon sezon aşağıda |
| İkonik araç | **24** / 24 | 0 | F2004, MP4/4, RB19, W05/W11/W14/W196, 312T, 640, F1-75, Lotus 49/79, BT46B, Tyrrell P34, FW14B/FW16, B194, R25, Brawn, Vanwall, Alfa 158, M23, MP4/13, 156 |
| Pist | 42 / 52 | 10 | Eksik: `aintree`, `avus`, `jeddah`, `kyalami`, `losail`, `madring`, `miami`, `red_bull_ring`, `vegas`, `yeongam` |

Sezonluk araç kapsamı: 2018 **10/10** · 2019 **10/10** · 2020 5/10 · 2021 8/10 · 2022 9/10 · 2023 9/10 · 2024 **10/10** · 2025 **10/10** · 2026 10/11 (eksik: `haas:2026`). Eksik araçlar: `alfa:2020`, `alphatauri:2020…2023`, `ferrari:2020`, `racing_point:2020`, `red_bull:2021`, `renault:2020`, `haas:2026` → placeholder (komşu sezonun aracı **gösterilmez**).

Boyutlar (en büyük varyant): pilot ort. 44 KB (maks 130), logo ort. 15 KB (maks 34), araç ort. 152 KB (maks 453), pist ort. 195 KB (maks 381).

**Süre/kota:** ~245 varlık yaklaşık 17 dk iş demektir; saatlik cron (çalışma başına 240 sn bütçe) ilk günde backlog'u bitirir. Boşta çalışma tek DB sorgusudur.

**İnsan gözüyle doğrulananlar** (üretilen WebP'lerden kontak sayfası çıkarıldı): 12/12 logo doğru marka (Alpine, Haas TGR 2026, McLaren, Mercedes-AMG Petronas 2026, Atlassian Williams, Sauber, Aston Martin Aramco, Red Bull Racing…); 24/24 ikonik araç doğru araç; 2025 aracı örnekleri ve 12 pist örneği doğru mekân. Bu doğrulama **örnek tabanlıdır**; 245 görselin hepsine tek tek bakılmadı.

**Bilinen zayıf seçimler (kapıları geçti ama kalitesi düşük):** bazı pistlerde yarış/etkinlik karesi (`anderstorp`, `estoril`, `watkins_glen`: 54 puan), Nürburgring için tek bir viraj fotoğrafı, `baku` için pistin uydu görüntüsü; 2021 `mclaren`/`alfa`/`williams` araçları için garaj/belirsiz kareler; 2019 `racing_point`/`renault`/`toro_rosso` pilot adlı kareler. Hepsi düşük `confidence` taşır; Bölüm 13'teki sorguyla listelenip `rejected` yapılabilir.

**Ölçümün yakaladığı hatalar** (düzeltildi, testle sabitlendi): CC0 dosyaların reddedilmesi, Ferrari için yol aracı rozeti/tema parkı logosu, Red Bull için içecek ve 2005 logosu, Formula Renault 2.0 logosu, Marlboro reklam fotoğrafı, Silverstone/Watkins Glen için yanlış Wikidata görselleri, otel/şehir/kasaba/trafik sıkışıklığı fotoğrafları, PNG pist şemaları, yıl aralıklı şema, motor tedarikçisi/sponsor eşleşmeleri (2018 Renault = McLaren pilotu), siyasetçi töreni fotoğrafı, klasik McLaren MP4-x'in modern sezonlara girmesi, direksiyon simidi/fuar standı/yol aracı.


---

## 13. İşletme (sahip için)

**Canlıya alma sırası (her adım sahibin onayıyla):**
1. ~~Migration'ı uygulayın~~ **Yapıldı (2026-10-06, sahip onayıyla, Supabase MCP):** `20261006000001_media_assets.sql` + `20261006000002_push_service_role_grants.sql` uygulandı ve `schema_migrations` geçmişine repo sürümleriyle kaydedildi. Doğrulama: RLS, anon'a yalnızca 20 arayüz kolonu açık (gerçek anon REST: genel kolon 200, `last_error` ve `select=*` 401), `media` bucket (public, 3 MB, webp), `service_role` tam yetkili.
2. `MEDIA_CONTACT` Vercel Production'a eklendi (sahip, 2026-10-06; değer repoda tutulmaz). Anlamı: Değer gizli değildir; Wikimedia'nın User-Agent politikası, isteği yapanın ulaşılabilir olmasını ister. İzlediğiniz bir e-posta adresi (ör. ileride `contact@…`) ya da proje adresi (repo URL'si) olur; boşsa site URL'si kullanılır. Commit edilmez.
3. Deploy'dan sonra `sync-media` GitHub workflow'u saatlik backlog'u eritir (ilk gün birkaç saat); hemen başlatmak için workflow'u `workflow_dispatch` ile elle tetikleyin (repo secret `CRON_SECRET_KEY` ve var `SITE_URL` diğer workflow'larla ortaktır).
4. İlerleme: aşağıdaki SQL'ler.

**İzleme:**
```sql
select entity_type, status, count(*) from media_assets group by 1, 2 order by 1, 2;
select entity_type, entity_key, last_error, attempts from media_assets where attempts > 0 order by attempts desc limit 20;
select entity_key, license, source_file from media_assets where entity_type = 'team' and status = 'resolved';
select entity_type, entity_key, last_error from media_assets where status = 'missing' order by 1, 2;  -- placeholder'a düşenler
select entity_type, entity_key, source_file, confidence from media_assets where status = 'resolved' and review = 'auto' and confidence < 0.7 order by confidence;  -- gözle kontrol edilecek zayıf seçimler
```

**Yanlış/şüpheli görseli gizleme (takedown dahil):**
```sql
update media_assets set review = 'rejected', next_check_at = now()
where entity_type = 'car' and entity_key = 'mclaren:2025';
```
Görsel **anında** herkese kapanır. Bir sonraki cron çalışması dosyayı kara listeye alır ve sıradaki en iyi adayı seçer (bulamazsa placeholder).

**Beğenilen görseli kilitleme:** `update media_assets set review = 'approved' where ...;` (otomatik yeniden aranmaz).

**Belirli varlığı yeniden aratma:** `update media_assets set next_check_at = now() where ...;`

**El ile görsel ekleme/değiştirme:** `data/media/curated.ts` içinde ilgili `files` listesine Commons dosya adını ekleyin (lisans kapısı yine uygulanır).

**2026-10-07 ek arama sonucu (gerçek Wikimedia'ya karşı kuru çalıştırma, DB'ye yazmadan):** 26 `missing` + 5 `pending` varlıktan 14 araç (hepsi) ve 4 pist (Kyalami, Red Bull Ring, Miami, Hockenheimring) çözüldü; Aintree, AVUS, Yeongam, Jeddah, Losail, Madring, Las Vegas ve 6 takım logosu (Ferrari, Racing Bulls, Cadillac, Toro Rosso, AlphaTauri, Force India) bilinçli olarak placeholder'da kaldı (serbest/uygun fotoğraf yok ya da uygun olmayanlar elendi). Canlıya geçince `RESOLVER_VERSION = 2` bu satırları kendiliğinden yeniden dener.

**Eski sezonlar (1950–2017):** Şimdilik kapsam dışı. `MEDIA_MIN_SEASON` (`lib/media/sync.ts`) düşürülünce aynı sistem geriye doğru genişler. **Sistem oturunca bu genişletmeyi hatırlatın.**

---

## 14. Bilinen sınırlar

- **Serbest fotoğrafı olmayan pistler:** Losail (yalnızca MotoGP kareleri), Madring/Jeddah (yalnızca SVG şema), Las Vegas (yalnızca etkinlik anlık görüntüleri), Yeongam (yalnızca yarış karesi), Aintree (yalnızca at yarışı pisti), AVUS (yalnızca pul/fuar). Commons'a uygun bir fotoğraf eklendiğinde ya da `EXTRA_CIRCUITS[].files` / `curatedFiles` ile elle bir dosya verildiğinde çözülür.
- **Ferrari (Scuderia) logosu Commons'ta yok** (serbest sürüm yüklenmemiş/silinmiş); Ferrari ve Racing Bulls için tipografik placeholder görünür. Red Bull için yalnızca eski/ara sürüm PD logo bulunur. Bu bir kod değil kaynak sınırıdır.
- **Görsel kalite çeşitliliği:** pilot fotoğrafları çoğunlukla pist kenarı/hayran bölgesi çekimleri (stüdyo portresi değil). Puanlama yalnızca metadata'ya bakar, pikselleri görmez; aday sırası iyi ama kusursuz değildir. Kötü olanı `rejected` yapın.
- **Araç fotoğrafları:** yeni sezonun görselleri genellikle testlerden/ilk yarışlardan sonra Commons'a girer; o zamana kadar placeholder. Garaj içi/müze çekimleri ikinci sırada tutulur ama yalnızca onlar varsa seçilir.
- **Pist:** bazı pistlerde uygun serbest fotoğraf yoktur ya da yalnızca şehir/hava görüntüsü vardır; eşik altı kalanlar placeholder olur.
- **F1DB kimlik eşleşmesi:** pilot/takım alias'ları sitenin F1DB indeksinden isim eşleşmesiyle üretilir; pist F1DB kimlikleri için tire/alt çizgi varyantları + `CIRCUIT_ALIASES` kullanılır (doğrulanmamış girişler zararsızdır).
- **Wikimedia bağımlılığı:** kaynak tarafındaki silinme/lisans değişikliği bir sonraki yeniden kontrolde (90 gün) görülür.

---

## 15. Dosya haritası

| Dosya | Görev |
|---|---|
| `supabase/migrations/20261006000001_media_assets.sql` | Tablolar, RLS, kolon yetkileri, bucket |
| `types/database.ts` | `MediaAssetRow` vb. tipler |
| `lib/media/keys.ts` | Anahtar kuralları ve doğrulama |
| `lib/media/license.ts` | Lisans kapısı, atıf cümlesi |
| `lib/media/wikimedia.ts` | Wikipedia/Wikidata/Commons istemcileri (toplu) |
| `lib/media/http.ts` | Hız sınırlı, backoff'lu HTTP |
| `lib/media/score.ts` | Kapılar ve puanlama (tür bazlı) |
| `lib/media/resolve.ts` | Varlık başına kaynak zinciri |
| `lib/media/process.ts` | İndirme (host allow-list), `sharp` ile WebP |
| `lib/media/repo.ts` | Supabase ve bellek içi depo |
| `lib/media/universe.ts`, `aliases.ts` | Jolpica'dan keşif, alias üretimi |
| `lib/media/sync.ts` | Orkestratör (bütçe, devre kesici, vade takvimi) |
| `lib/media/read.ts` | Okuma katmanı (sayfalar + API) |
| `app/api/media/route.ts` | Public API |
| `app/api/cron/sync-media/route.ts` | Cron (migration yokken `skipped`, `lib/media/errors.ts`) |
| `.github/workflows/sync-media.yml` | Saatlik tetik (GitHub Actions) |
| `data/media/curated.ts` | Elle derlenen ikonik araçlar, logo/pist ayarları, alias'lar |
| `scripts/media-sync.ts` | Kuru çalıştırma (DB'ye yazmaz) |
| `tests/media-*.test.ts`, `tests/api-media.test.ts` | Testler |
