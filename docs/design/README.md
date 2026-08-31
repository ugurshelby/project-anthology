# README — `docs/design/` Kullanım Kılavuzu (Agent İçin)

> **Bu dosya, herhangi bir frontend/tasarım kararı öncesi okunacak ilk dosyadır.** Amacı: bu klasörde kaybolmamak — göreve göre hangi dosyaya bakman gerektiğini en hızlı şekilde bulmak. Bu klasör kod değil, proje-agnostik bir **tasarım referans kütüphanesi**dir; Efendim'in birden fazla projesinde (Apex, Rosso, FinPilot, EVEREST, Obsession, The Origin ve gelecekteki projeler) ortak kullanılır.

---

## 0. Nasıl Kullanılır (Agent Protokolü)

1. **Her zaman burayı önce oku.** Bir UI/frontend kararı almadan önce bu README'yi tara, aşağıdaki "Karar Tablosu"ndan görevine uyan satırı bul.
2. **Universal Design Principles her zaman tabandır.** Hangi göreve baksan da, `universal-design-principles.md` içindeki yedi ilke (hiyerarşi, bilişsel yük, sistemleştirme, tutarlılık, erişilebilirlik, geri bildirim, kısıtlama disiplini) geçerlidir — bu ilkelerle çelişen hiçbir stil/teknik kararı uygulanmaz.
3. **Proje-özel `design.md`/`CLAUDE.md` her zaman önceliklidir.** Eğer üzerinde çalıştığın projenin kendi tasarım anayasası varsa (örn. Apex'in `apex-final-design.md`'si), bu klasördeki dökümanlar onunla **çelişmez, sadece destekler/somutlaştırır**. Proje-özel kural varsa o kazanır.
4. **Birden fazla dosya gerekebilir.** Örn. "Apex için yeni bir dashboard kartı tasarla" görevi hem `design-styles/Brutalist...md`, hem `colours/60-30-10-renk-kurali.md`, hem de `design-techniques/loading-states-process-feedback.md`'yi aynı anda gerektirebilir — tabloyu tek satırla sınırlama, göreve uyan tüm satırları topla.
5. **Bu dosyayı güncel tut.** Klasöre yeni bir döküman eklendiğinde (Efendim tarafından veya senin tarafından), bu README'nin ilgili tablosuna **mutlaka** yeni bir satır eklenir. Güncel olmayan bir README, klasörü tekrar "kaybolunacak bir yığın" haline getirir — bu adım atlanamaz.

---

## 1. Klasör Ağacı

```
design/
├── README.md                           ← bu dosya (giriş noktası)
├── universal-design-principles.md      ← taban ilkeler (her şeyin üstünde)
├── ux-laws-reference.md
├── premium-design-philosophy.md
├── tasarim-skilleri-rehberi.md
├── colours/
│   └── 60-30-10-renk-kurali.md
├── typography/
│   ├── cinematic-fonts-reference.md
│   └── best-font-pairings.md
├── trends/
│   └── 2026-design-trends-ui-uyarlama.md
├── design-techniques/
│   ├── loading-states-process-feedback.md
│   └── progressive-blur-card-design.md
├── design.md/
│   ├── design-system-kurulum-rehberi.md
│   ├── mobile-design.md
│   ├── web-design.md
│   ├── Universal Mobile UI_UX Design System Principles_ Foundation for `design.md`.md
│   └── Master Design System Architecture (design.md)_ A Unified Synthesis for Scalable Web Interfaces.md
└── design-styles/
    ├── Brutalist UI Design System_ A Technical and Strategic Framework.md
    ├── Neo-Brutalism Design System_ A Technical Specification.md
    ├── Minimalism Design System_ A Production-Grade Specification.md
    ├── Glassmorphism Design System_ Technical Specification.md
    ├── Neumorphism_ A Comprehensive Design System Specification.md
    ├── Swiss Design System (International Typographic Style).md
    ├── Dark Mode First Design_ A Production-Grade System Specification.md
    ├── Bento Grid Design System_ A Production-Grade Framework for Modular UI.md
    ├── Card-Based UI System_ Professional Design Specification.md
    └── Editorial UI Design System_ The Architecture of Narrative Experience.md
```

---

## 2. Hiyerarşi (okuma sırası — genelden özele)

| Katman | Konum | Rol |
|---|---|---|
| 1 — Temel ilkeler | kök `.md` dosyaları | Stilden bağımsız "nasıl davranmalı" |
| 2 — Tooling / skill seçimi | `tasarim-skilleri-rehberi.md` | Claude Code skill'lerinin ne zaman/nasıl kullanılacağı |
| 3 — Token & kurallar | `colours/`, `typography/` | Renk oranı, font karakteri |
| 4 — Platform sistemleri | `design.md/` | Web / mobil / kurulum / ownership modeli |
| 5 — Teknikler | `design-techniques/` | Tekrar kullanılabilir UI teknikleri |
| 6 — Stil kitabı | `design-styles/` | Estetik dil spesifikasyonları |
| 7 — Trend taraması | `trends/` | Güncel/dönemsel ilham; bir stile "commit" etmeden önce keşif katmanı, `design-styles/`'ın yerini tutmaz |

**Çelişki kuralı:** Alt katman üst katmanla çelişemez, sadece onu somutlaştırır. Örn. `design-styles/Brutalist...md`'nin "zero shadow" kuralı, `universal-design-principles.md`'deki "Dark Mode = Surface Lightness" ilkesinin brutalist bir yorumudur.

---

## 3. Karar Tablosu (Göreve Göre Ne Okunur)

| Görev / Durum | Bakılacak dosya(lar) |
|---|---|
| Herhangi bir UI kararına başlarken (varsayılan) | `universal-design-principles.md` |
| Bir davranışsal/bilişsel UX kararının gerekçesini kontrol ediyorum (neden bu buton büyük, neden bu vurgu tek, güven/motivasyon tekniği kullanıyorum) | `ux-laws-reference.md` |
| "Premium/lüks hissettirsin" isteniyor | `premium-design-philosophy.md` |
| Hangi Claude Code tasarım skill'ini kullanmalıyım? | `tasarim-skilleri-rehberi.md` |
| Renk paleti / vurgu rengi dengesi kurmam gerekiyor | `colours/60-30-10-renk-kurali.md` |
| Başlık/display fontu seçimi (editorial, cinematic) | `typography/cinematic-fonts-reference.md` |
| İki fontu (başlık + gövde/imza) nasıl eşleştireceğime karar veriyorum | `typography/best-font-pairings.md` |
| Güncel/dönemsel görsel trendleri UI'a nasıl uyarlarım (poster/grafik trendi → bileşen) | `trends/2026-design-trends-ui-uyarlama.md` |
| Sayfa/bileşen yüklenirken ne gösterilmeli (skeleton, spinner, upload progress) | `design-techniques/loading-states-process-feedback.md` |
| Görsel üzerine metin/kart yerleştiriyorum, kontrast sorunu var | `design-techniques/progressive-blur-card-design.md` |
| Yeni bir projede design token/sistem kurmam gerekiyor | `design.md/design-system-kurulum-rehberi.md` |
| Mobil UX kararı (thumb zone, touch target, mobil grid) | `design.md/mobile-design.md` |
| Web UX kararı (grid, container width, hover/focus) | `design.md/web-design.md` |
| Design token mimarisi (naming convention, semantic tokens, "on-" modifier) | `design.md/Master Design System Architecture...md` |
| React/component ownership modeli (Radix+Tailwind, wrapper/composition) | `design.md/Universal Mobile UI_UX...md` veya `Master Design System Architecture...md` |
| Brutalist / Apex tarzı bir arayüz | `design-styles/Brutalist UI Design System...md`, `design-styles/Neo-Brutalism...md` |
| Minimalist / sade bir arayüz | `design-styles/Minimalism Design System...md` |
| Glassmorphism / frosted glass efekt | `design-styles/Glassmorphism Design System...md` |
| Neumorphism / soft-UI | `design-styles/Neumorphism...md` |
| Swiss / uluslararası tipografik stil | `design-styles/Swiss Design System...md` |
| Dark-mode-first bir proje kuruyorum | `design-styles/Dark Mode First Design...md` |
| Bento grid / modüler kart düzeni | `design-styles/Bento Grid Design System...md` |
| Kart bileşeni anatomisi (chunking, micro-interaction, a11y) | `design-styles/Card-Based UI System...md` |
| Anlatı-odaklı / editorial bir site | `design-styles/Editorial UI Design System...md` |

---

## 4. Dosya Özetleri

### Kök

| Dosya | Temelde ne |
|---|---|
| `universal-design-principles.md` | Tüm diğer dökümanların üstünde duran master ilkeler: hiyerarşi, bilişsel yük, sistemleştirme, erişilebilirlik, geri bildirim, kısıtlama disiplini. Estetik dikte etmez; seçilen stilin nasıl davranması gerektiğini tanımlar. |
| `ux-laws-reference.md` | 25 davranışsal UX psikolojisi prensibi, beş kategoride (Karar Verme, Dikkat, Hafıza, Motivasyon, Güven) — her biri tek cümlelik prensip + gerçek ürün örneği (Netflix, Apple, Spotify, Duolingo, Amazon, Airbnb). Güven kategorisinde etik kullanım uyarısı var. |
| `premium-design-philosophy.md` | Premium/lüks marka dili: az gürültü, hassasiyet, altın oran, sınırlı palet, boşluk disiplini. |
| `tasarim-skilleri-rehberi.md` | Claude Code'daki tasarım skill'leri için karar rehberi: ne işe yarar, hangi projede, nasıl tetiklenir. Estetik skiller aynı anda tek; `redesign-existing-projects` / `ui-ux-pro-max` her biriyle kombine edilebilir. |

### `colours/`

| Dosya | Temelde ne |
|---|---|
| `60-30-10-renk-kurali.md` | %60 zemin / %30 destek / %10 vurgu kuralı. Proje-agnostik yöntem + örnek token eşlemesi. |

### `typography/`

| Dosya | Temelde ne |
|---|---|
| `cinematic-fonts-reference.md` | Editorial/premium display font koleksiyonu: görsel karakter + kullanım context'i. |
| `best-font-pairings.md` | Altı font ikilisinin (Recoletta+Berthold, Citadel Script+Helvetica Now vb.) karakteristiği ve context'i — display fontunu hangi destek/gövde fontuyla eşleştireceğine karar verirken referans. |

### `trends/`

| Dosya | Temelde ne |
|---|---|
| `2026-design-trends-ui-uyarlama.md` | Poster/grafik tasarım kaynaklı 5 trend (abartılı tipografi, kolaj, blueprint, imperfect, monokrom) — her biri için "poster ≠ UI" uyarısıyla birlikte UI'a nasıl çevrileceği, en uygun ve en riskli kullanım bağlamları. |

### `design-techniques/`

| Dosya | Temelde ne |
|---|---|
| `loading-states-process-feedback.md` | Skeleton screen + işlem sırasında 5 geri bildirim sinyali (drag, progress, retry vb.). Belirsizlik → güvensizlik mantığı. |
| `progressive-blur-card-design.md` | Görsel üzerine metin için progressive blur + gradient fill. Kontrast garantisi; kart/profil/listing senaryoları. |

### `design.md/`

Platform ve sistem mimarisi katmanı. Proje-özel `design.md` üretmek için kaynak.

| Dosya | Temelde ne |
|---|---|
| `design-system-kurulum-rehberi.md` | Sıfırdan kurulum (5 adım) ve mevcut projeye retrofit: temeller → token → bileşen → varyant → dokümantasyon. |
| `mobile-design.md` | Mobil UX: thumb zone, 4 kolon grid, 8pt spacing, tipografi, touch hedefleri. DO/DON'T formatı. |
| `web-design.md` | Web UX: bilgi yoğunluğu, 12 kolon, max-width, mouse/klavye, sidebar/mega menu. DO/DON'T formatı. |
| `Universal Mobile UI_UX Design System Principles...md` | Mobil sistem mimarisi: Ownership Model (Radix + Tailwind + tokens), iki katmanlı token, HSL, erişilebilirlik. |
| `Master Design System Architecture (design.md)...md` | Web sistem mimarisi sentezi: ownership pipeline, token naming (`type-role-intention-variant-state`), WCAG "On" modifier, ölçeklenebilirlik. |

### `design-styles/`

Her dosya bir görsel dilin production-grade spesifikasyonu: tanım, ilkeler, token/kural, kullanım, anti-pattern.

| Dosya | Temelde ne |
|---|---|
| `Brutalist UI Design System...md` | Ham, yüksek kontrast, "materials as found"; anti-AI/hizip estetiği. |
| `Neo-Brutalism Design System...md` | Kalın outline, hard shadow, yüksek kontrast; usable anti-design. |
| `Minimalism Design System...md` | Less is more, negatif alan, altın oran, F/Z pattern, sade derinlik katmanları. |
| `Glassmorphism Design System...md` | Frosted glass: blur, alpha, rim highlight; Liquid Glass/spatial UI evrimi. |
| `Neumorphism...md` | Soft UI: aynı renk zemin + çift gölge extrusion/depression; erişilebilirlik uyarısı. |
| `Swiss Design System...md` | Uluslararası tipografik stil: grid, objektif tipografi, hizalama, invisible UI. |
| `Dark Mode First Design...md` | Koyu tema ana mimari; LCH, luminance elevation, semantik renk tutarlılığı. |
| `Bento Grid Design System...md` | Modüler bento grid: 12 kolon, tile sizing, spatial weight = önem. |
| `Card-Based UI System...md` | Kart anatomisi, chunking, micro-interaction, a11y, DO/DON'T. |
| `Editorial UI Design System...md` | Anlatı odaklı editorial UI: tipografi hakimiyeti, asimetrik grid, görsel ritim. |

---

## 5. Yeni Bir Projeye Başlarken (Greenfield Kontrol Listesi)

Bir proje sıfırdan kuruluyorsa, `docs/design/` bu sırayla devreye girer:

1. `universal-design-principles.md`'yi taban al.
2. `design.md/design-system-kurulum-rehberi.md`'deki 5 adımı (Foundations → Tokens → Components → Variants & States → Document) uygula — projenin **ilk gününde**, sonradan retrofit etmek her zaman daha maliyetlidir.
3. `tasarim-skilleri-rehberi.md`'den projeye uygun estetik-yön skilini seç (tek bir tane).
4. `colours/60-30-10-renk-kurali.md` ile renk oranını, `typography/` ile font karakterini netleştir.
5. Sonucu projenin kendi `design.md`/`CLAUDE.md` dosyasına yaz — bu döküman artık proje-özel otorite olur.

## 6. Mevcut/Yarım Kalmış Projeleri Gözden Geçirirken (Brownfield Kontrol Listesi)

`docs/design/` klasörü, bazı projeler zaten kurulduktan **sonra** zenginleşmiş olabilir. Böyle bir durumda:

1. `tasarim-skilleri-rehberi.md`'deki `redesign-existing-projects` skilini kullanarak teknik bir audit yap.
2. Audit bulgularını `design.md/design-system-kurulum-rehberi.md`'nin Retrofitting bölümündeki disiplinle (küçükten başla, big bang'den kaçın) uygula.
3. Mevcut tasarımın `universal-design-principles.md` ve seçili `design-styles/` dosyasıyla **açık çelişkilerini** listele, Efendim'e sun.
4. Bu gözden geçirme bir kerelik değildir — `docs/design/` her büyüdüğünde (yeni bir teknik/stil dökümanı eklendiğinde), mevcut projenin o yeni bilgiyle çelişip çelişmediği bir sonraki UI görevinde kontrol edilir.

---

## 7. Bu README'yi Güncel Tutma (Zorunlu Kural)

`docs/design/` klasörüne yeni bir dosya eklendiğinde (Efendim'in kendisi ekler ya da bir konuşmada üretilip klasöre taşınır):

- İlgili alt klasöre (`colours/`, `typography/`, `design-techniques/`, `design.md/`, `design-styles/` veya yeni bir kategori) **Bölüm 1 (Klasör Ağacı)**'na eklenir.
- **Bölüm 3 (Karar Tablosu)**'na, o dosyanın hangi görevde devreye gireceğini anlatan en az bir satır eklenir.
- **Bölüm 4 (Dosya Özetleri)**'ne, dosyanın "temelde ne işe yaradığını" özetleyen tek satırlık bir açıklama eklenir.
- Eğer yeni dosya mevcut bir dosyayla çelişiyorsa (örn. iki farklı 8pt grid tanımı), çelişki İş bu README'de değil, ilgili iki dosyanın kendisinde çözülür; ama bu README'ye "hangisi öncelikli" notu düşülür.

Bu güncelleme adımı atlanmaz — güncel olmayan bir README, klasörü yeniden kaybolunacak bir yığın haline getirir.
