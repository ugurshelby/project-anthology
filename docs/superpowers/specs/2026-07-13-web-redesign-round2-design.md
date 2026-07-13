# Web Redesign Round 2 — Spec

**Tarih:** 2026-07-13
**Kapsam:** `project-anthology` kök repo (Next.js web). Mobile'a dokunulmuyor — mobile zaten bu turun referans noktası (bkz. `logs/2026-07-13.md`, mobile round 2 redesign).
**Durum:** Onay bekliyor.

## Bağlam

Mobile uygulamada 2026-07-12/13'te yapılan kapsamlı redesign turundan sonra (merkezi hero, takım logoları/renkleri, circuit detay ekranı, zengin driver/team profilleri, Anthology içerik, Race Day Mode, Takım DNA'sı, şampiyonluk ekranı — bkz. `logs/2026-07-12d.md`, `logs/2026-07-13.md`) web tarafı görsel ve içerik zenginliği bakımından geride kaldı. Efendim canlı siteyi (`project-anthology-seven.vercel.app`) ekran görüntüleriyle inceleyip madde madde geri bildirim verdi. Bu spec o geri bildirimin tamamını, uygulama sırası korunarak, tek bir kapsamlı redesign planına döker.

**Genel ilke (tüm maddelerde geçerli):** Masaüstü tasarımı mobile app'ten ilham alır ama yatay ekrana özel olarak yeniden düşünülür (birebir kopya değil). Mobile responsive kırılım noktası ise mobile app'e mümkün olduğunca yakın olmalı — aynı bileşen/görsel dili.

---

## 1. INP Performans Sorunu (öncelik: ilk düzeltme)

**Sorun:** Chrome DevTools Interaction Timing ölçümünde, ana sayfadaki driver standings listesindeki satır linki (`a.group.relative.col-span-4...hover:-translate-y-0.5.hover:bg-surface-raised...`) 256.4ms render süresine ve 261ms toplam INP'ye sebep oluyor.

**Kapsam:** `components/standings/StandingsRow.tsx` (`DriverRow`/`TeamRow`) ve ilişkili hover-transition tanımları. Kök neden muhtemelen `hover:-translate-y-0.5` + `bg-surface-raised` geçişinin her satırda ayrı ayrı tetiklenen layout/paint maliyeti veya listenin tamamının re-render olması. Düzeltme: transition'ı `transform`/`opacity`'ye sıkı tutmak, gereksiz re-render'ları önlemek (memo, key stabilitesi), varsa liste virtualization ihtiyacını değerlendirmek.

**Kabul kriteri:** Aynı etkileşim Chrome DevTools Performance panelinde 260ms civarından makul bir değere (öncelik: <100ms) düşer.

---

## 2. Haber Detay Sayfası 404 Bug'ı (öncelik: ikinci düzeltme)

**Sorun:** `/news` sayfasında bir habere tıklanınca `/news/[id]` rotası "404 — Off Track" gösteriyor. Haber kartından detay sayfasına yönlendirme/route kırık.

**Kapsam:** `app/news/[id]/page.tsx` (varsa) route'unun var olup olmadığı, haber kartındaki `href`'in doğru id/slug üretip üretmediği, ve haber verisinin (`lib/news/aggregate.ts` kaynaklı, muhtemelen harici RSS/agregasyon kaynaklı — kalıcı bir id şeması olmayabilir) detay sayfası için nasıl adreslenebileceği araştırılacak. Harici haber kaynaklarının çoğu zaman kendi kalıcı URL'i vardır (`item.url`); iç detay sayfası yerine dışarıya yönlendirme de bir çözüm olabilir — implementasyon adımında karar verilecek, kapsamı burada sabitlemiyoruz.

**Kabul kriteri:** Herhangi bir haber kartına tıklanınca kullanıcı 404 almaz; ya iç bir detay sayfası ya da orijinal habere doğru bir yönlendirme görür.

---

## 3. Ana Sayfa (Homepage) Redesign

**Mevcut durum:** Sol yarıda devasa "Next Race" hero'su (görsel + countdown), sağ yarıda 8 satırlık driver standings listesi (lider spotlight + 7 satır), altında haber listesi.

**Değişiklikler:**
- Takım DNA çizgi/doku denemesi (Mercedes grid vb., bu turun 4. maddesinde web'e eklenmişti) **kaldırılıyor** — sadece takım rengi + gradyan kullanımına dönülüyor. (Not: `lib/assets/team-pattern.ts` ve ilgili `teamPatternStyle()` çağrıları standings'ten çıkarılacak; dosyanın kendisi ileride başka bir yerde kullanılabilirse silinmeyip sadece çağrı noktaları kaldırılabilir — implementasyon kararı.)
- Lider (P1) standings kartına gerçek pilot fotoğrafı eklenir (şu an sadece isim/takım/puan var, görsel yok).
- Standings listesi 8 değil **5 pilot** gösterir (lider + 4), açılan alan diğer yeni panellere aktarılır.
- Kalan pilot satırları/kartları büyütülür — yüzler net seçilebilir boyutta olmalı (mevcut 32px `DriverAvatar` yetersiz).
- **Yeni panel: "Latest Race"** — en son biten yarışın özeti (podyum + fastest lap), mobile'daki `RaceWeekendBanner`/Race Day Mode ile aynı veri kaynağını (`/api/season/[year]/last-result`, bu turda zaten eklendi) kullanır.
- "Next Race" hero'su şu an sayfanın sol yarısını tek başına kaplıyor ve orantısız büyük — Latest Race paneli eklenince tüm layout **asimetrik bento grid** olarak yeniden kurulur (üç ana blok: Next Race hero, Latest Race paneli, Standings — boyutları birbirine göre dengelenecek, hiçbiri diğerini ezmeyecek).
- Genel görünüm mobile ana sayfasına (`mobile/app/(tabs)/index.tsx`) benzer olmalı ama yatay ekrana özel bir asimetrik bento düzenlemesiyle.

**Kapsam dosyaları:** `app/page.tsx`, `components/home/SplitHomeLayout.tsx`, `components/home/HomeDataColumn.tsx`, `components/standings/StandingsCard.tsx`, `components/standings/StandingsRow.tsx`, `components/standings/StandingsLeaderCard.tsx`, yeni `components/home/LatestRaceCard.tsx` (veya benzeri).

---

## 4. Season Sayfası Redesign

**Mevcut durum:** Solda takvim listesi (pist haritası thumbnail'leri arka planda çok soluk), sağda Drivers/Teams toggle'lı standings paneli — bu panel Calendar kartının en altına kadar uzanıyor ve dar/sıkışık görünüyor.

**Değişiklikler:**
- Drivers/Teams kartlarına hero için görsel kullanımı eklenir (homepage ile aynı prensip — pilot/takım görseli).
- Calendar listesindeki pist haritaları şu an arka planda kaybolacak kadar soluk — daha görünür/belirgin bir işleme (kontrast, opaklık, boyut) uygulanır.
- "Rounds 22 / Completed 9 / Leader ANTONELLI" bloğundaki tamamlanan-tur bilgisi düz sayı yerine **progress bar** olarak görselleştirilir (22'nin 9'u dolu bir bar).
- Drivers/Teams paneli Calendar kartından **ayrılır** — Calendar sayfanın en üstünde kendi başına kalır, Drivers/Teams için ayrı, kendi büyüklüğünde kartlar açılır (artık sağda gereksiz boşluk kalmayacak şekilde layout yeniden kurulur).
- Sayfa geneli **asimetrik bento grid**'e geçer; Drivers ve Teams ayrı kartlarda olur (22 pilot / 11 takım farklı içerik hacmi olduğu için farklı kart boyutları doğal).
- "Most Wins · Constructor" bloğu (şu an "7 Mercedes" düz metni) bento grid'e uygun, takım logosu + takım rengi + görsel vurgu içeren bir kart olarak yeniden tasarlanır.
- "Last Race · British Grand Prix" bloğu podyum mantığını korur ama görsel kullanımı (pilot/takım görseli, pist görseli vb.) eklenerek zenginleştirilir.

**Kapsam dosyaları:** `app/season/page.tsx` (veya `app/season/[year]/page.tsx`), `components/season/*` (PodiumViz, calendar bileşenleri), `components/standings/*`.

---

## 5. Drivers/Teams → Birleşik "Grid" Sayfası + Detay Sayfaları Redesign

**Mevcut durum:** `/drivers` ve `/teams` ayrı sayfalar. Drivers sayfasında sola yatık, sıkışık ikili pilot kartları (fotoğraflar küçük/seçilemiyor) takım başlıkları altında gruplu liste halinde. Teams sayfasında güçlü, iyi tasarlanmış takım kartları (logo + araç görseli + renk vurgusu) — bu tasarım referans alınacak, değiştirilmeyecek.

**Değişiklikler:**
- Drivers ve Teams **ayrı sayfa/toggle yerine tek bir "Grid" sayfası** olur (mobile'daki `profiles.tsx`/Grid tab ile paralel, ama masaüstünde toggle değil — tam ekran, ikisi de aynı anda görünür).
- Layout önerisi: her takım bloğu için solda o takımın iki pilotunun kartı, sağında (aynı hizada) takım kartı — üçü yan yana, ekranı simetrik dolduran bir sıra oluşturur.
- Takım kartı tasarımı (mevcut `/teams` sayfasındaki) **korunur**, değiştirilmez.
- Pilot kartları **yeniden tasarlanır**: daha büyük ve net pilot görseli, daha baskın/canlı takım rengi kullanımı (mevcut kartlar soluk/küçük).
- Hem eski Drivers hem Teams sayfalarındaki **sola yatık hizalama terk edilir** — mobile'da yapıldığı gibi simetrik/ortalanmış bir düzene geçilir (şu an sağ tarafta kullanılmayan boşluk var).
- **Detay sayfaları** (`app/drivers/[driverId]/page.tsx`, `app/teams/[constructorId]/page.tsx`): genel yerleşim/tasarım dili korunur ama mobile'a bu turda eklenen tüm zenginleştirmeler web'e birebir taşınır:
  - Driver detay: takım kartı (tıklanabilir, team sayfasına götürür — zaten var), kariyer istatistik bloğu (zaten var), bio/milestone/"deep cut" lore içeriği (mobile'da var, web'de eksik/az), 2026 aracı görseli (mobile'da var).
  - Team detay: pilot numaraları hero'da, takım logosu, araç görseli, bio/milestone/lore bloğu (mobile'da var — ekran görüntüsünde web'de kısmen zaten iyi durumda, "Technical Dossier" ve "Head to Head" güzel; asıl eksik lore/bio derinliği ve driver line-up kartlarının görsel kalitesi).
- Masaüstüne özel tasarım mobile'dan ilham alır, yatay ekrana özelleştirilir; mobile kırılımında ise doğrudan mobile app'in bileşen/görsel diline en yakın hal hedeflenir.

**Kapsam dosyaları:** yeni birleşik route (örn. `app/grid/page.tsx`, `/drivers` ve `/teams` route'ları buraya yönlenir veya kaldırılır — implementasyon kararı), `app/drivers/[driverId]/page.tsx`, `app/teams/[constructorId]/page.tsx`, ilgili `components/drivers/*`, `components/teams/*`.

---

## 6. Circuits Sayfası + Detay Sayfası Redesign

**Mevcut durum:** Bento grid kullanılıyor (doğru yönde) ama kartlar tekdüze boyutta, arka planda sadece ince kırmızı çizgi pist haritası var (görsel yok), ülke bayrağı yok. Next Race kartı zaten büyük/vurgulu. Detay sayfasında sağda gereksiz "Driver Standings" paneli var, sol tarafta pist haritası + circuit data iyi ama geliştirilebilir.

**Değişiklikler:**
- Bento kartları **daha asimetrik/çeşitli boyutlarda** olacak şekilde yeniden düzenlenir (şu an hepsi aynı 1x1/2x1 tekrarı).
- Kart arka planında line-art pist haritası yerine **gerçek pist fotoğrafı/görseli**, hafif karartma (scrim) ile kullanılır — okunabilirlik korunur.
- Her kartın bir köşesinde **ülke bayrağı** gösterilir.
- Next Race kartı mevcut büyüklüğünü/vurgusunu korur; ek olarak **sayfa açıldığında otomatik olarak o karta scroll/navigate eder** (hafif bir scroll-into-view davranışı).
- **Detay sayfası:**
  - "Driver Standings" paneli **kaldırılır**, yerine **"Results"** paneli gelir: güncel sezonda tamamlanmış yarışların sonuçları, içten scroll edilebilir, 5'li grid halinde (kaydırıldıkça alttakiler görünür).
  - "Recent Winners" **son 5 yılı** gösterir (şu an sadece 2026); güncel sezonun galibi hero/vurgulu şekilde öne çıkar, geçmiş yıllar altında sıralanır.
  - Pist haritası kartına **glassmorphism** uygulanır — referans doküman: `docs/design/design-styles/Glassmorphism Design System_ Technical Specification.md`. Kart daha "parlayan"/öne çıkan bir görünüm kazanır.
  - Mobile'a eklenen pist karakteri/veri içeriği (`circuitFacts.ts` — length/corners/DRS zones/lap record/character/signature corner/note) web detay sayfasına da eklenir; ilgili yerlerde gerçek pist görseli kullanılır.

**Kapsam dosyaları:** `app/circuits/page.tsx`, `app/circuits/[id]/page.tsx`, `components/circuits/*`, `lib/data/circuits.ts` (zaten `getCircuitDetail`/`getCircuitWinners` var — winners sorgusunun 5 yıla genişletilmesi gerekebilir, şu an "last 8 seasons" olarak biliniyor, doğrulanacak).

---

## 7. Anthology + Hikaye Detay Sayfası Redesign

**Mevcut durum:** Hub sayfası (grid, tipografi, kart tasarımı) **iyi durumda, değişiklik istenmiyor**. Hikaye detay sayfası (`app/anthology/[slug]/page.tsx`) ise tam ekran görsel bloklarının ağırlıklı olduğu, geliştirilmeye açık bir okuma deneyimi sunuyor.

**Değişiklikler:**
- Hub sayfası (`app/anthology/page.tsx`, `StoryCard.tsx`) **dokunulmuyor**.
- Hikaye detay sayfası (`StoryBody.tsx`, `AnthologyHero.tsx`) yeniden tasarlanır:
  - Tam ekran (full-bleed / 100vw) görsel kullanımından vazgeçilir — daha editöryel, okuma odaklı bir kompozisyona geçilir.
  - Referans dokümanlar: `docs/design/design-styles/Editorial UI Design System_ The Architecture of Narrative Experience.md`, `docs/design/design-styles/Bento Grid Design System_ A Production-Grade Framework for Modular UI.md`, `docs/design/design-styles/Card-Based UI System_ Professional Design Specification.md`. İlgili tasarım skill'leri (`high-end-visual-design`, `redesign-existing-projects` vb.) kullanılır.
  - Mevcut blok tipleri (`heading`, `quote`, `image`, `paragraph`) korunur; sadece görsel/kompozisyon yaklaşımı değişir.

**Görsel spesifikasyon çıktısı (Efendim'e teslim edilecek, implementasyon tamamlanınca):**
Efendim kendi bulduğu görselleri hikaye ismiyle (kapak) ve sıra numarasıyla (içerik görselleri) adlandırıp kırpacak. Bu yüzden nihai tasarım netleşince şu bilgiler netleştirilip raporlanacak:
- Hub kart kapak görseli (`heroImage`) — oran ve piksel boyutu (mevcut düzende zaten kullanılan bir oran var, yeniden tasarım sonrası değişebilir).
- Hikaye detay sayfası hero/kapak görseli — oran ve piksel boyutu.
- İçerik içi `image` bloklarının üç `layout` varyantı (`full`, `landscape`, `portrait`) için her biri ayrı ayrı oran ve piksel boyutu.
Bu spesifikasyon, redesign'in görsel kompozisyonu netleşmeden kesinleştirilemez — **implementasyon adımının bir çıktısı** olarak Efendim'e ayrıca raporlanacak, şu an tahmini rakam verilmiyor.

**Kapsam dosyaları:** `components/anthology/StoryBody.tsx`, `components/anthology/AnthologyHero.tsx`, `app/anthology/[slug]/page.tsx`.

---

## 8. Navbar Redesign

**Mevcut durum:** Sol üstte APEX logosu, yanında sola yaslı sayfa linkleri (Season, Drivers, Teams, Circuits, News, Anthology). Glossary sadece footer'da bir link.

**Değişiklikler:**
- Masaüstünde **APEX logosu navbar'ın tam ortasına ortalanır** (ana sayfaya götüren link olma işlevi korunur).
- Diğer sayfalar APEX'in solunda ve sağında **simetrik** dizilir.
- Toplam 7 öğe ile navbar: **Season · Grid · Circuits · APEX · News · Anthology · Glossary**
  - Sol grup (3): Season, Grid, Circuits
  - Merkez: APEX (logo/home)
  - Sağ grup (3): News, Anthology, Glossary
- "Grid" burada madde 5'teki birleşik Drivers+Teams sayfasının navbar etiketi.
- Glossary navbar'a taşınır (şu an sadece footer'da) — footer'da kalıp kalmayacağı implementasyon kararı (muhtemelen ikisinde de olabilir, çakışma değil).
- Mobile navbar (tab bar) zaten bu sıralamayı andıran bir düzene sahip (Grid–Season–Home–News–Anthology) — web bu düzenden ilham alır ama 7 öğeli simetrik masaüstü formuna kendi çözümünü üretir. Mobil kırılımda mevcut mobil navigasyon deseni (muhtemelen hamburger/drawer) korunur, sadece öğe listesi güncellenir.

**Kapsam dosyaları:** `components/layout/nav-items.ts`, `components/layout/SiteHeader.tsx` (veya ekivalanı), `components/layout/NavIcons.tsx`, `components/layout/SiteFooter.tsx`.

---

## Uygulama Sırası

Maddeler yukarıdaki numaralandırmayla (1→8) sırayla uygulanacak — bu, Efendim'in konuşma boyunca verdiği bildirim sırasıyla birebir aynı (kolaydan/acilden karmaşığa doğru doğal bir ilerleme de teşkil ediyor: önce bug'lar, sonra sayfa sayfa redesign, en son navbar — çünkü navbar'ın "Grid" linki madde 5'in ürettiği yeni sayfaya bağımlı).

## Doğrulama Planı (her madde için)

- `tsc --noEmit` temiz.
- `npm run build` temiz (mevcut route'ların hepsi derlenir, yeni/kaldırılan route'lar için redirect veya 410 stratejisi düşünülür — `/drivers`, `/teams` kaldırılırsa eski linkler kırılmasın).
- Görsel doğrulama: yerel `npm run dev` üzerinden Chrome DevTools MCP ile her sayfa masaüstü + mobile breakpoint'te kontrol edilir.
- Regresyon kontrolü: mevcut testler (`npm test`) kırılmaz.
- Her madde kendi commit'i ile teslim edilir (önceki turdaki pratik korunur).

## Kapsam Dışı (bu spec'te ele alınmıyor)

- Mobile tarafında herhangi bir değişiklik (bu tur tamamen web'e özel).
- Android widget (ayrı, daha önce ertelenmiş bir konu).
- Anthology hub sayfasının kendisi (sadece detay sayfası kapsamda).
- Yeni bir arama özelliği (daha önce bilinçli olarak kapsam dışı bırakılmıştı, bu spec bunu değiştirmiyor).
