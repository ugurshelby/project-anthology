# F1 Tech Glossary — AI İkon Üretim Promptları (CAD / Blueprint Icon Library)

Bu doküman, Apex Tech Glossary (`/tech-glossary`) sayfasındaki teknik terimler, kategoriler ve lastik telemetri kartları için Generative AI araçlarında (Midjourney, Flux, DALL-E 3, Recraft vb.) kullanılmak üzere hazırlanmış mini prompt koleksiyonudur.

Ekran görüntüsündeki görsel dil: **Koyu obsidian zemin (#0A0A0A) üzerinde, minimal, ultra-temiz CAD mühendislik şematiği, ince lazer kırmızısı (#EF4444 / #FF3B30) vektörel çizgi sanatı (orthographic line-art)**.

---

## 🎨 Evrensel Stil Formülü (Master Style Suffix)

Herhangi bir araca prompt verirken en tutarlı sonucu almak için aşağıdaki stil anahtarlarını prompt'un sonuna ekleyin:

```text
minimalist CAD blueprint icon, precision engineering line-art schematic, glowing razor-thin laser red vector strokes (#EF4444) on solid matte pitch black background (#0A0A0A), orthographic 2D technical diagram, Apple HIG dark mode telemetry aesthetic, centered composition, isolated, zero gradients, zero shadows, no photorealism, no text, no typography, no labels, 8k resolution
```

> **Öneri Parametreleri:**
> - **Midjourney v6:** `--ar 1:1 --v 6.1 --style raw --no text, labels, watermark, gradient, 3d render`
> - **Flux / Recraft:** Mode: `Vector` veya `Clean Line-Art / Tech Illustration`

---

## 🏎️ 1. Temel Teknik Şema İkonları (`TermDiagram`)

Sayfadaki 11 ana teknik terim için optimize edilmiş mini promptlar:

### 1. Diffuser (Difüzör / Venturi Çıkışı)
- **ID:** `diffuser`
- **Temsil:** Aracın altından gelen hava akımının arkaya doğru yukarı genişleyen venturi tünel geometrisi ve kavisli hava kanalları.
- **Mini Prompt:**
```text
Minimalist technical CAD blueprint icon of a Formula 1 rear diffuser expansion tunnel, showing an angled trapezoidal upswept aero channel with concentric curved airflow lines expanding outward, razor-thin glowing red vector lines on pure black background, orthographic 2D schematic, no text, clean geometric line art --ar 1:1
```

---

### 2. ERS (Energy Recovery System / Batarya & Hibrit Güç)
- **ID:** `ers`
- **Temsil:** Hibrit enerji depolama hücresi (Energy Store / Battery Pack), terminal kutbu ve merkezinde parlayan şimşek/yüksek voltaj sembolü.
- **Mini Prompt:**
```text
Minimalist technical CAD blueprint icon of a Formula 1 hybrid ERS battery pack, showing a rounded rectangular energy store module with a top terminal connector and a sharp geometric lightning bolt symbol in the center, razor-thin glowing red vector line art on pure pitch black background, clean orthographic 2D schematic, no text --ar 1:1
```

---

### 3. Ground Effect (Zemin Etkisi & Venturi Tüneli)
- **ID:** `ground-effect`
- **Temsil:** Pist zemini üzerinde daralıp genişleyen aerodinamik Venturi taban profili, aracı yere çeken alt basınç emiş vektörleri.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of Formula 1 ground effect aero, showing a flat reference ground line with a contoured venturi floor ceiling creating a converging-diverging venturi tunnel with small vertical suction load lines underneath, ultra-thin glowing red vector lines on pure black background, 2D technical schematic, no text --ar 1:1
```

---

### 4. Downforce (Yere Basma Kuvveti)
- **ID:** `downforce`
- **Temsil:** Araç temas yüzeyine (oval/eliptik lastik izi) dik olarak basan güçlü dikey aerodinamik yük oku.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of aerodynamic downforce load, showing a bold vertical engineering arrow pressing directly downward onto an aerodynamic oval contact plane footprint, clean razor-thin glowing red vector line art on deep black background, technical telemetry symbol, orthographic 2D, no text --ar 1:1
```

---

### 5. DRS (Drag Reduction System / Açılır Arka Kanat)
- **ID:** `drs`
- **Temsil:** Formula 1 arka kanat profili ve hidrolik pistonla yukarı kalkmış aktif üst kanatçık (flap gap) açıklığı.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of a Formula 1 DRS rear wing mechanism, showing rear wing endplates with an open upper airfoil flap tilted upward creating an aerodynamic slot gap, crisp glowing red vector lines on dark obsidian background, precision engineering diagram, 2D orthographic, no text --ar 1:1
```

---

### 6. Slipstream / Tow (Hava Koridoru & Arka Türbülans Cebi)
- **ID:** `slipstream`
- **Temsil:** Öndeki yarış aracının arkasında oluşan düşük basınçlı hava koridoru cebi ve arkadan yaklaşan takip aracı izi.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of Formula 1 slipstream aerodynamic tow, showing a leading vehicle silhouette with streamlined aerodynamic wake envelope curves expanding behind it, razor-thin glowing red vector line art on solid pitch black background, clean fluid dynamics schematic, 2D vector, no text --ar 1:1
```

---

### 7. Turbo (Turboşarj & Kompresör Salyangozu)
- **ID:** `turbo`
- **Temsil:** Turboşarj salyangoz gövdesi (housing), merkez türbin mili ve emiş pallerinin dairesel şeması.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of a Formula 1 turbocharger turbine housing, showing a concentric spiral compressor scroll casing with an internal multi-blade impeller wheel and intake pipe outlet, crisp glowing red vector lines on pitch black background, precision engineering line art, 2D orthographic, no text --ar 1:1
```

---

### 8. Active Suspension (Aktif Süspansiyon & Yükseklik Kontrolü)
- **ID:** `active-suspension`
- **Temsil:** Hidrolik süspansiyon silindiri, piston mili, şasi referans çizgisi ve salıncak bağlantı mafsalı.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of active suspension system, showing an adjustable hydraulic damper strut with central piston rod and horizontal chassis control arm reference linkages, razor-thin glowing red vector lines on pure black background, technical automotive schematic, 2D line art, no text --ar 1:1
```

---

### 9. Graining (Lastik Yüzeyi Taneleşmesi / Debris)
- **ID:** `graining`
- **Temsil:** Lastik sırt profili üzerinde kayma kaynaklı dalgalı soyulma çizgileri ve kopup yuvarlanan mikro kauçuk topları.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of tyre surface graining, showing a cross-section arc of a racing tyre tread with corrugated shearing wave lines and detached micro rubber granule circles rolling on the surface, glowing red vector line art on dark black background, technical tyre telemetry schematic, no text --ar 1:1
```

---

### 10. Parc Fermé (Kapalı Park & Kilitli Paddock Rejimi)
- **ID:** `parc-ferme`
- **Temsil:** Teknik inceleme garajı silüeti, kilitli bariyer kapısı veya denetim mührü (FIA scruitineering bay / lock).
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of Parc Fermé inspection bay, showing a technical garage roof truss structure with a secured security gate barrier and a central inspection padlock silhouette, razor-thin glowing red vector lines on pitch black background, architectural engineering schematic, 2D, no text --ar 1:1
```

---

### 11. Undercut (Pit Stratejisi / Erken Pit & Sıralama Atlama)
- **ID:** `undercut`
- **Temsil:** Yarış çizgisi üzerinde erken pit yoluna sapan ve rakibin önüne çıkan çift yarış çizgisi yörüngesi.
- **Mini Prompt:**
```text
Minimalist CAD blueprint icon of Formula 1 undercut pit stop strategy, showing two parallel track trajectory lines where a diverter path drops down into pit lane and accelerates forward to undercut the upper competitor line, crisp glowing red vector lines on pitch black background, telemetry tactical diagram, no text --ar 1:1
```

---

## 🏷️ 2. Kategori Rozet İkonları (Glossary Categories)

Tech Glossary filtre çubuğundaki ana disiplinler için alternatif mini promptlar:

### 1. Aerodynamics (Aerodinamik)
```text
Minimalist CAD blueprint icon of Formula 1 aerodynamics, showing streamlined wind tunnel laminar airflow lines bending smoothly over an aerodynamic front wing profile, thin glowing red vector lines on dark black background, 2D technical diagram, no text --ar 1:1
```

### 2. Power Unit (Güç Ünitesi / Motor)
```text
Minimalist CAD blueprint icon of a V6 turbo hybrid internal combustion engine cylinder and piston assembly, showing an engine block silhouette with a connecting rod and crankshaft stroke circle, razor-thin glowing red vector lines on pitch black background, 2D line art, no text --ar 1:1
```

### 3. Tyres (Lastikler)
```text
Minimalist CAD blueprint icon of an F1 18-inch racing wheel assembly, showing the clean circular profile of a low-profile tyre on an aero-wheel rim cover, glowing red vector lines on pitch black background, precision engineering line art, 2D, no text --ar 1:1
```

### 4. Chassis (Şasi & Monokok)
```text
Minimalist CAD blueprint icon of an F1 carbon-fibre monocoque safety cell and survival survival tub chassis profile with driver roll hoop, razor-thin glowing red vector lines on pitch black background, 2D structural schematic, no text --ar 1:1
```

### 5. Strategy (Yarış Stratejisi & Pit Duvarı)
```text
Minimalist CAD blueprint icon of Formula 1 pit wall race strategy, showing a tactical stopwatch bezel intersected by a split-lap pit stop delta graph line, glowing red vector lines on dark black background, clean telemetry diagram, no text --ar 1:1
```

### 6. Regulations (Teknik & Sportif Kurallar)
```text
Minimalist CAD blueprint icon of FIA Formula 1 technical regulations, showing a technical blueprint clipboard with an engineering ruler caliper measuring an aero bounding box line, thin glowing red vector lines on pure black background, 2D schematic, no text --ar 1:1
```

---

## 🏁 3. Pirelli Lastik Sırtı İkonları (Tyre Compounds)

Lastik hamur kartlarının köşe detayları için:

### 1. Slick Tyre (Kuru Zemin Düz Sırt)
```text
Minimalist CAD blueprint icon of a smooth racing slick tyre tread cross-section, showing flawless flat rubber contour with sidewall rim line, glowing red vector lines on dark background, 2D technical diagram, no text --ar 1:1
```

### 2. Intermediate Tyre (Geçiş Lastiği / Su Tahliye Olukları)
```text
Minimalist CAD blueprint icon of an F1 intermediate tyre tread pattern, showing directional arrow-shaped sipes and grooved water drainage micro-channels, razor-thin glowing red vector lines on pitch black background, 2D schematic, no text --ar 1:1
```

### 3. Full Wet Tyre (Islak Zemin / Derin Su Kanalları)
```text
Minimalist CAD blueprint icon of an F1 full wet tyre tread pattern, showing deep aggressive hydro-tread water evacuation sipes and lateral evacuation grooves, glowing red vector lines on pitch black background, 2D line art, no text --ar 1:1
```

---

## 💡 İpuçları ve Entegrasyon

1. **SVG veya PNG Çıktısı:** Generative AI'dan aldığınız görseli (örneğin Recraft veya Vectorizer.ai kullanarak) temiz SVG'ye vektörize edebilir veya şeffaf PNG olarak dışa aktarabilirsiniz.
2. **Renk Değiştirme:** Vektörel çizgilerin rengini CSS içinde `stroke="currentColor"` veya `#EF4444` (Racing Red) / `#00D2BE` (Mercedes Cyan) / `#FF8700` (McLaren Papaya) gibi takım ve hamur renklerine dinamik olarak uyarlayabilirsiniz.
3. **Bileşene Entegrasyon:** Yeni SVG path'lerini [`components/glossary/TermDiagram.tsx`](../../components/glossary/TermDiagram.tsx) içerisindeki ilgili ikon fonksiyonlarına doğrudan yapıştırabilirsiniz.
