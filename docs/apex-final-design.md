# APEX — FINAL DESIGN CONSTITUTION (apex-final-design.md)

> **CLAUDE CODE & CURSOR İÇİN DİREKTİF:**
> Bu doküman APEX'in tek geçerli tasarım anayasasıdır. Daha önceki tüm tasarım dosyalarını geçersiz kılar.
> APEX, Formula 1 için karanlık, sinematik, brütalist bir arşiv/editöryel platformdur — bir web sitesinden çok bir telemetri ekranı ya da motorsport belgeseli arayüzü gibi hissettirir.
>
> Doküman iki katmandan oluşur:
> **(A) SABİT KURALLAR** — asla ihlal edilmez, müzakere edilmez, ölçülebilirdir.
> **(B) ÖZGÜR ALANLAR** — agent'ın yaratıcı karar verdiği, prensiple yönlendirilen ama dikte edilmeyen bölgeler.
>
> Bir işe başlamadan önce: yapacağın şey (A)'da bir kuralı çiğniyor mu diye kontrol et. Çiğnemiyorsa (B)'de özgürsün. Emin değilsen sor, varsayım yapma.

---

## 0. TEMEL FELSEFE (Tek cümlelik pusula)

> **Derinlik gölgeyle değil tonla, hiyerarşi süslemeyle değil boyutla, vurgu bollukla değil ketumlukla kurulur.**

Her tasarım kararını bu cümleye karşı test et. Gölge eklemek istiyorsan dur. Bir şeyi büyütmek yerine renklendirmek istiyorsan dur. Kırmızıyı bir yere daha koymak istiyorsan dur.

---

# KATMAN A — SABİT KURALLAR (İhlal edilemez)

## A1. RENK SİSTEMİ

### Zemin ve yüzeyler (Tonal elevation)
Derinlik **gölgeyle değil, yüzeyler arası ton farkıyla** kurulur. Üç yüzey seviyesi vardır, hepsi siyahın komşusudur:

| Seviye | Değer | Kullanım |
| :--- | :--- | :--- |
| Level 0 — Zemin | `#0a0a0a` | Sayfa arka planı. Saf siyah (`#000000`) **yasak** (halation/göz yorgunluğu). |
| Level 1 — Panel | `#141414` | Kartlar, paneller. Zeminden ayrımı `1px solid #262626` border ile yapılır, gölgeyle değil. |
| Level 2 — Vurgulu | `#1f1f1f` | Hover ya da aktif kart yüzeyi. |

### Metin renkleri
Hiyerarşi griyle değil **kontrastla** kurulur. İkincil metni "soluk gri" yapmak yasak — bunun yerine zeminle aynı ton, düşük doygunluk:

| Rol | Değer | Not |
| :--- | :--- | :--- |
| Birincil metin | `#f5f5f5` (off-white) | Saf beyaz (`#ffffff`) **yasak** (dark mode'da halation). |
| İkincil metin | `#a3a3a3` | Yalnızca **uzun gövde metni ve düşük öncelikli etiketler** için. |
| **Kritik veri / sayı** | `#f5f5f5` | Puan, süre, grid pozisyonu gibi okunması ZORUNLU veriler asla `#a3a3a3` olamaz — küçük metin yüksek kontrast ister (bkz. A4). |

> **Çatlak kapatıldı:** Küçük telemetri verisi `#a3a3a3` ile gösterilemez. Önemli olduğu için küçük yazılır, küçük olduğu için yüksek kontrast ister → off-white olmak zorundadır. Gri yalnızca okunması zorunlu olmayan ikincil metnindir.

### Apex Red — `#ff1801` (Statik kullanım yasası)
Kırmızı ciddiyetini korumak için **bir sayfada en fazla 4 STATİK noktada** bulunur:

1. Aktif navigasyon sekmesinin altındaki **2px düz indikatör çizgisi**.
2. Sayfadaki **tek bir birincil CTA** butonunun arka planı.
3. Bölüm başlıklarının altındaki kısa **aksан çizgisi** (editöryel imza — bkz. B2).
4. **Yalnızca** şampiyona liderinin / o yarışın P1 pilotunun konum işareti.

**KESİN YASAKLAR — kırmızı asla şunlarda kullanılmaz:**
- Veri/puan/istatistik rakamları
- Standart liste başlıkları
- Link hover durumları
- Arka plan dolguları
- İkincil butonlar
- Menü öğeleri ve kaydırma çubukları

> **Gerekçe:** İnsan zihni ekranda aynı anda 4–7 renk atamasını takip edebilir; kırmızı "tehlike/uyarı" sinyali taşıdığı için göze zorla çeker. Her yerde olursa vurgu değeri sıfırlanır. Büyük `#0a0a0a` nötr dinlenme alanları bırakmak **zorunludur**.

### Apex Red — Transient (geçici) kullanım
Tam ekran "kırmızı patlama" intro flash'ı **statik 4 nokta kuralından muaftır** — çünkü kalıcı değil, anlıktır. Geçici kırmızı (flash, bir kerelik vurgu animasyonu) ayrı kategoridir ve 4 nokta bütçesini harcamaz. Ama transient kırmızı da yalnızca **sinematik intro** ve **kritik bir kullanıcı eylemi onayı** (örn. başarılı işlem flash'ı) için kullanılır, dekoratif değil.

> **Çatlak kapatıldı:** Statik (kalıcı, 4 nokta) ve transient (anlık, muaf) kırmızı artık ayrı kategoridir.

### 60-30-10 dengesi
%60 nötr (siyah/gri/off-white) · %30 yapısal beyaz+gri tonları · %10 vurgu (Apex Red + takım renkleri). Bu oran sayfa genelinde korunur.

---

## A2. TİPOGRAFİ (Görev atamaları sabit)

Dört font, dört kesin görev. **Asla birbirinin yerine kullanılmaz:**

| Font | Görev |
| :--- | :--- |
| **Bebas Neue** | Sadece hero title'ları, devasa pilot numaraları, H1–H2. Büyük, dar, agresif. |
| **Barlow Condensed** | UI navigasyonu, sekmeler, buton içleri, meta-data (tarih/lokasyon/yazar), kart başlıkları (H3). Uppercase + geniş harf arası. |
| **Inter** | Gövde metni, blog içeriği, uzun okuma. Normal case. |
| **IBM Plex Mono** | Veri, telemetri, istatistik, süre, grid pozisyonu, puan. |

> **Monospace kararı (kaynaktan sapma — bilinçli):** Genel UI ergonomi kaynakları veri tabloları için OS-native sans-serif önerir. APEX bunu reddeder: monospace'in sabit karakter genişliği sayıların dikey hizalanmasını sağlar ve "telemetri ekranı" kimliğinin merkezindedir. Bu ergonomik değil **kimliksel** bir karardır ve kasıtlıdır. (Performans için font dosyaları `font-display: swap` ile yüklenir, mizanpaj kaymasını önlemek için boyutlar önceden ayrılır.)

### Tipografik ölçek (Sabit basamaklar)
Hiyerarşi **dramatik boyut uçurumlarıyla** kurulur — her başlık aynı ağırlıkta olursa hiyerarşi ölür. Satır yüksekliği boyutla **ters orantılıdır** (büyük başlık dar, küçük metin geniş):

| Element | Font | Boyut | Line-height | Stil |
| :--- | :--- | :--- | :--- | :--- |
| Hero / Pilot No | Bebas Neue | 128px+ (8rem+) | 0.9–1.0 | Uppercase, tracking-tight, ekran dışına taşabilir |
| H1 — Sayfa başlığı | Bebas Neue | 64px (4rem) | 1.05 | Uppercase, sola dayalı |
| H2 — Bölüm başlığı | Bebas Neue | 40px (2.5rem) | 1.1 | Uppercase |
| H3 — Kart başlığı | Barlow Condensed | 24px (1.5rem) | 1.2 | Uppercase (hero ile arasında kasıtlı uçurum) |
| Body | Inter | 16px (1rem) | 1.6 | Normal case, **max 75 karakter satır genişliği** |
| Meta / UI Nav | Barlow Condensed | 14px (0.875rem) | 1.4 | Uppercase, tracking-wide |
| Veri / Telemetri | IBM Plex Mono | 20px (1.25rem) | 1.5 | Rakamlar **sağa hizalı** |

> Yeni boyutlar gerekirse 16px tabanından modüler oranla (1.125 veya 1.333) üret, sonra en yakın 4px/8px'e yuvarla.

---

## A3. SPACING — 8pt GRID

- Her `margin`, `padding`, `width`, `height` **8'in katı** olmalı (8, 16, 24, 32, 40, 48…).
- **4pt yarı-adım** yalnızca: ikon içi hizalama, sıkı padding, küçük meta-veri blokları çevresinde kullanılır.
- **Gerekçe:** 8, retina ölçeklemede (1.5x/2x/3x) temiz bölünür, yarım-piksel bulanıklığını önler.

### Spacing esnekliği (Bento gerilimi çözümü)
Asimetrik/Bento layout'larda **mutlak gap dayatması yasak.** Kural şudur:
- Gap, **8pt ailesinden** seçilir; **varsayılan 24px**, gerekçeli sapma 16px veya 32px olabilir.
- Sütun sayısı masaüstünde **en fazla 4–5**.
- Mobilde öğeler tek sütuna iner (restack), gap 16px'e düşebilir.

> **Çatlak kapatıldı:** "Gap kesinlikle 24px" gibi responsive'de matematiksel olarak tutmayan mutlak ifade kaldırıldı. Varsayılan 24px, ama 8pt ailesi içinde esneme serbest.

---

## A4. ERİŞİLEBİLİRLİK (Yasal + ergonomik, müzakere edilmez)

### Kontrast — APCA
Metin küçüldükçe **daha yüksek** kontrast ister (ince font az "mürekkep" kaplar, algılanması zorlaşır):

| Metin | APCA hedefi | WCAG asgari |
| :--- | :--- | :--- |
| Küçük/kritik veri, ince font | Lc ~90 | — |
| Standart gövde metni | Lc ~75 | 4.5:1 |
| Büyük/kalın başlık | Lc ~60 | 3:1 |

> Bu, A1'deki "kritik veri off-white olmalı" kuralının matematiksel sebebidir: küçük veri Lc ~90 ister, `#a3a3a3` bunu `#0a0a0a` üzerinde sağlayamaz.

### Dokunmatik hedefler
İnteraktif her öğe **min 44×44px** (iOS) / 48×48dp (Android). Estetik uğruna küçültülmez. Aralarında min 8pt boşluk.

### Sadece renge güvenme
Bir durumu (DNF, ceza, en hızlı tur, hata, başarı) **yalnızca renkle** gösterme yasak. Renk + **ikon/piktogram + metin** birlikte kullanılır.
- Gerekçe: renk körlüğü erkeklerin ~%8'ini etkiler.
- Durum sinyali için renge ek olarak **şekil, konum, desen veya metin** eşlik etmelidir.

---

# KATMAN B — ÖZGÜR ALANLAR (Prensiple yönlendir, dikte etme)

> Buradaki her şey (A) kurallarını çiğnemediği sürece **agent'ın yaratıcı kararıdır.** Prensibe uy, uygulamada özgür ol.

## B1. LAYOUT KOMPOZİSYONU (Özgür)
Bento grid'in **asimetri kararları sana ait.** Hangi kutu büyük, hangi küçük, hangi modül nereye — bunu içeriğin önemine göre sen kurarsın. Tek kısıt: 8pt grid (A3) ve max 4–5 sütun. İçinde istediğin kadar yaratıcı ol; kutuların hepsi aynı boyutta olmasın — bu zaten brütalist asimetrinin amacı.

## B2. İMZA ELEMENTLERİ (Prensip ver, ölçü dayatma)
APEX'i tanınır kılan görsel imza katmanı. **Ne olduğunu** tanımlıyorum, **her kullanımının ölçüsünü** sana bırakıyorum — bağlama göre uygula:

- **Carbon Grid:** İnce, ~%5 opacity grid çizgileri. Hero ve tam sayfa zeminlerde atmosfer katmanı. Yoğunluğu bağlama göre ayarla.
- **Film Grain:** Hafif noise overlay (CSS/SVG). Sinematik doku. Asla okunabilirliği bozacak yoğunlukta olmaz.
- **Keskin köşe işaretleri (corner ticks):** Brütalist çerçeve aksanları — telemetri ekranı hissi. Nerede ve ne kadar, sana ait.
- **Editöryel aksan çizgisi:** Bölüm başlıklarının altındaki kısa kırmızı/beyaz çizgi (A1'deki 4 noktadan biri kırmızıysa).
- **Monospace veri vurgusu:** Sayıları öne çıkarmak telemetri kimliğinin kalbidir; nasıl çerçeveleyeceğin sana ait.

> Prensip: imzalar **dokuyu** kurar, **içeriği gasp etmez.** Bir imza okunabilirliği veya hiyerarşiyi bozuyorsa, imza geri çekilir.

## B3. İÇERİK HİYERARŞİSİ — KİMLİK (Prensip)
APEX'i jenerik "koyu temalı F1 datası"ndan ayıran şey **editöryel/arşiv içeriğidir**, standings tablosu değil.

**Prensip:** Ayrıştırıcı içerik (Anthology, On This Day, Tech Glossary gibi editöryel/arşiv modülleri) sayfa düzeninde **görsel öncelik** alır. Jenerik veri (standings, takvim) herkesin sahip olduğu şeydir — onu ikinci sıraya koy. Bir ziyaretçi ana sayfaya baktığında "bu neden var, bunu başka yerde bulamam" hissetmeli.

> Hangi modülün ne kadar yer kaplayacağı (B1 ile) sana ait — ama **özgün içerik her zaman jenerik veriden büyük/önde** kuralı sabittir.

## B4. HOVER & DURUM GERİ BİLDİRİMİ (Prensip + çatlak çözümü)
Brütalizm hover'da büyüme/gölge yasaklar. Ama "sadece renge güvenme" (A4) yüzünden **hover tek başına renkle bildirilemez.** Çözüm — hover'da renk değişimine **renkten bağımsız en az bir sinyal** eşlik etmeli:

- Border **kalınlığı** değişebilir (1px → 2px)
- Bir **köşe işareti** belirebilir (B2 corner tick)
- Border **rengi** takıma/Apex Red'e döner (renk sinyali)
- Yüzey Level 1 → Level 2'ye geçer (ton sinyali)

> Renk değişimi + (kalınlık VEYA köşe işareti VEYA ton) birlikte → renk körü kullanıcı da hover'ı algılar. Hangi kombinasyonu seçeceğin sana ait. Büyüme ve gölge yine yasak.

## B5. HAREKET (Prensip)
- Animasyon **amaçlıdır**: geri bildirim verir, yönlendirir. Dekorasyon için animasyon yasak.
- **Peak-End:** Tatmin edici küçük mikro-etkileşimler (pürüzsüz geçiş, net tıklama) deneyimin zirvelerini kurar — bunları kullan.
- Aşırı 3D ve parallax **yasak** (yavaşlatır, mesajın önüne geçer).
- **Sinematik intro:** Yalnızca yeni session'da 1 kez (sessionStorage). Akış sana ait ama omurga: drone shot → zoom → kırmızı flash → keskin geçişle ana sayfa.
- **Takım renk geçişleri:** React state değil, **CSS Variables** ile, 800ms linear (performans).
- **prefers-reduced-motion:** AÇIK olan kullanıcıda tüm sinematik animasyonlar bypass edilir, basit fade-in'e döner. Bu **zorunludur** (kod: `useReducedMotion` vb.).

---

# C. BİLEŞEN KURALLARI (Karma — sabit + özgür)

- **Köşeler:** Her yerde `border-radius: 0`. Sabit, istisnasız.
- **Gölge:** `box-shadow` yasak. Derinlik tonla (A1). Sabit.
- **Glassmorphism / backdrop-blur:** Yasak. Sabit.
- **Butonlar:** "Ghost button" (içi boş, sadece çerçeve) yasak — tıklanabilirliği öldürür. Butonlar mat dolgulu (`#1a1a1a` veya tek CTA için Apex Red). Etiket `Barlow Condensed`, optik merkeze hizalı.
- **Formlar:** Label her zaman input'un üstünde (top-aligned). Hatalar ilgili alanın **altında** (inline), ekran üstünde değil. Hata metni nötr/suçlamayan dil ("Bu numara hatalı", "Yanlış girdiniz" değil). 5'ten az seçenekte dropdown yerine radyo/segment kontrol.
- **Tablolar:** Sayılar sağa hizalı (IBM Plex Mono). Durum hücreleri renk + ikon + metin.

---

# D. AGENT İÇİN KARAR PROTOKOLÜ

Her tasarım görevinde sırasıyla:

1. **Bu (A)'da bir kuralı çiğniyor mu?** → Evet ise dur, çiğneme.
2. **Felsefe cümlesine (Bölüm 0) uyuyor mu?** → Gölge/bolluk/süsleme ekliyorsan dur.
3. **Kırmızı bütçesi (A1) doldu mu?** → 4 statik nokta aşıldıysa kırmızıyı çıkar.
4. **Özgün içerik jenerik veriden önde mi (B3)?** → Değilse hiyerarşiyi düzelt.
5. **Geri kalan her şey (B) → özgürsün.** Yaratıcı ol, prensibe sadık kal.

Emin olamadığın yerde varsayım yapma — sor.

---

*APEX · Sinematik Brütalizm · "Asfalt ve Karbon"*
*Bu doküman her tasarım işinde omurga olarak kullanılır.*
