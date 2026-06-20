# APEX: DESIGN SYSTEM & AGENT CONSTITUTION (DESIGN_SYSTEM.md)

> **AGENT DIRECTIVE FOR CLAUDE CODE & CURSOR:** 
> Bu doküman "APEX" (eski adıyla Project Anthology) projesinin değiştirilemez tasarım anayasasıdır. Proje, Formula 1 için karanlık, sinematik ve brütalist bir arşiv/blog platformudur. 
> **Rol Dağılımı:** `Claude Code` (Backend, Supabase, TypeScript Logic, Veri Akışı) ve `Cursor` (Frontend, Tailwind, Animasyon, UI Layout) olarak çalışacaktır. Tasarımda "glassmorphism", yuvarlak köşeler veya gölgeler KESİNLİKLE YASAKTIR.

## 1. KONSEPT: SİNEMATİK BRÜTALİZM ("Asphalt & Carbon")
APEX'in görsel dili bir web sitesinden ziyade, bir F1 aracının telemetri ekranı veya üst düzey bir motorsport belgeselinin arayüzü gibi hissettirmelidir.
*   **Flat & Matte (Düz ve Mat):** Derinlik hissi gölgelerle (shadows) veya cam efektleriyle (glassmorphism) DEĞİL; kontrast, renk ve tipografi boyutlarıyla sağlanacaktır [3].
*   **The Atmosphere Layer (Atmosfer Katmanı):** Hero bölümleri ve tam sayfa arka planlar her zaman `Carbon Grid` (İnce, %5 opacity grid çizgileri), `Film Grain` (CSS veya SVG noise overlay) ve `Spotlight` (CSS radial-gradient) katmanlarından oluşur. Bu üçlü kombinasyon asla bozulamaz.
*   **Sıfır Tolerans:** `border-radius` (rounded) ve `box-shadow` (shadow) sınıflarının kullanımı tüm Tailwind kodlarında kesinlikle yasaktır. Her şey keskin, köşeli ve "jilet gibi" olmalıdır.

## 2. RENK SİSTEMİ (60-30-10 Kuralı)
Arayüz karanlık, tehditkar ama okunabilir olmalıdır [4].
*   **Zemin (%60):** `#0a0a0a` (Neredeyse siyah). Asfaltı ve karbon fiberi temsil eder. Saf siyah (`#000000`) kullanılmaz.
*   **Metin/İkincil Zeminler (%30):** Keskin beyazlar, endüstriyel griler (Örn: `#1a1a1a`, `#2a2a2a` sınır çizgileri için).
*   **Apex Red Vurgu (%10):** `#ff1801`. Bu renk sayfada en fazla 4 noktada bulunabilir (örn: Aktif sekme çizgisi, kritik bir CTA, pilot numarasının bir parçası veya "kırmızı patlama" animasyonu).
*   **Dinamik Takım Paletleri:** `/drivers/[id]` ve `/teams/[id]` sayfalarında takım renkleri, CSS değişkenleri (`--team-primary`, `--team-secondary`) üzerinden yönetilir. Sayfa geçişlerinde bu renkler **800ms linear-easing** ile değişmelidir.

## 3. TİPOGRAFİ (Telemetri Hiyerarşisi)
Fontlar asla birbirine karıştırılamaz. Hiyerarşi mutlaktır [5, 6].
*   **Başlıklar & Hero Elementleri:** `Bebas Neue`. Sadece H1, devasa pilot numaraları ve hero title'ları için. Büyük, dar ve agresif.
*   **Etiketler, UI Navigasyonu & Küçük Başlıklar:** `Barlow Condensed`. Sekmeler, buton içleri, meta-datalar (tarih, yazar, lokasyon).
*   **Gövde Metni (Body):** `Inter`. Blog içerikleri ve uzun okunacak metinler. Maksimum 75 karakter satır uzunluğu kuralı geçerlidir [7].
*   **Veri, Telemetri & İstatistikler:** `IBM Plex Mono`. Saniye farkları, puan durumları, kronometreler, grid pozisyonları. Rakamların hizalanması için monospace zorunludur.

## 4. SAYFA VE BİLEŞEN MİMARİSİ
### 4.1. Discovery Grid (/drivers, /teams)
*   Sayfalar, 24 yarışlık SVG takvimine benzer şekilde keskin border'lara (1px solid `#2a2a2a`) sahip asimetrik "Bento Grid" bloklarından oluşacaktır.
*   Kartların hover (üzerine gelme) durumlarında gölge veya büyüme olmaz; sadece border rengi (Apex Red veya Takım Rengi) değişir veya arkaplan mat bir vurgu alır.

### 4.2. Profil Sayfaları (/drivers/[id], /teams/[id])
*   **Hero Section:** Devasa bir `Bebas Neue` pilot/takım numarası (ekranın dışına taşan tipografi, clipping ile). Arkada kask ve tulum renk şemasını yansıtan dinamik gradient spotlight.
*   **İçerik:** EntityDrawer mantığı bırakılmış olup, tam sayfa dikey akışa (scroll) geçilmiştir. İstatistikler (IBM Plex Mono) keskin kutular içinde, haber kartları ise altında listelenir.

## 5. HAREKET DİLİ (Motion Narrative) & İNTRO SEKANSI
Tüm animasyonlar "sinematik" bir anlatıya sahip olmalı, anlamsız zıplamalar olmamalıdır.
*   **Sinematik İntro Sekansı:** Sadece yeni oturumlarda (`sessionStorage` kontrolü ile) 1 kez çalışır. 
    *   *Akış:* Drone Shot (Video/3D Render) -> Lastik Zoom In (Kamera içeri girer) -> Kırmızı Patlama (`#ff1801` flash) -> Ekran süpürme (Sweep transition) ile Ana Sayfaya düşüş.
*   **Erişilebilirlik (prefers-reduced-motion):** Cursor bu animasyonları (Framer Motion veya CSS) yazarken, işletim sisteminde hareketi azaltma seçeneği açık olan kullanıcılar için intro sekansını KESİNLİKLE atlayacak (bypass) veya basit bir fade-in ile değiştirecek bir kontrol (`useReducedMotion`) yazmalıdır [8]. Bu yasal ve deneyimsel bir zorunluluktur.

## 6. PERFORMANS VE YAPI OPTİMİZASYONU (Darboğaz Çözümü)
Şu anki ~1-1.3 saniyelik JS chunk evaluation darboğazını çözmek için:
*   **Lazy Loading:** 24 SVG pist haritası ve Sinematik İntro varlıkları (video/ağır componentler) next/dynamic ile lazy load edilmelidir.
*   **Server Components:** Mümkün olan tüm Discovery Grid, Haber ve Standings bileşenleri React Server Components (RSC) olarak yazılmalı, client-side JS en aza indirilmelidir.
*   **CSS Variables:** 800ms'lik takım rengi değişimleri React state'leri ile değil, performansı korumak adına doğrudan CSS Variables (Custom Properties) enjekte edilerek yapılmalıdır.

## 7. AGENT KOORDİNASYON KURALLARI (Claude Code & Cursor)
*   **Claude Code (Backend/Data):** Supabase şemalarını, `/drivers/[id]` için dinamik veri getirme (data fetching) mantığını, Next.js route'larını ve API endpointlerini yönetir. Typescript "Strict" mod kurallarına uymak zorundadır.
*   **Cursor (Frontend/UI):** Claude'un sağladığı verileri alır; bu `DESIGN_SYSTEM.md` dosyasındaki Flat/Matte, Bebas/Inter, Zero-Radius kurallarına göre TailwindCSS sınıflarına dönüştürür. Framer Motion entegrasyonlarında CSS tabanlı performans optimizasyonunu gözetir.