# Yapay zekâ yer tutucu görselleri — istem taslakları (master-plan 8.15)

Durum: taslak, 2026-10-31 (Opus). Hiçbiri üretilmedi. Kurallar `DECISIONS.md` 2026-10-31 "Placeholder artwork, Las Vegas photo, AI image policy" ve master-plan 8.15'te:
- Yalnız lisanslı fotoğrafı olmayan varlıklar için. Görseller varlık başına değil, tür ya da dönem başına üretilir.
- Gerçek kişi, yüz, takım renk düzeni (livery), logo, sponsor, numara ya da yazı yok.
- Her çıktı siteye girmeden önce sahibe gösterilir.
- Cloud Vision `LOGO_DETECTION` + `SAFE_SEARCH` kontrolü yapılır.
- `public/stories`'e asla girmez.

## Neden dönem başına araç

Bugün lisanslı fotoğrafı olmayan her araç (çoğu 2017 öncesi) aynı modern, halolu araç görselini gösteriyor. 1988 McLaren'in yerinde 2020'lerin silüeti duruyor. Altı dönem görseli bu yanlışı kapatır; mevcut görsel 2018 ve sonrası için kalır.

## Ortak stil (sahibin 2026-10-31 görselleriyle aynı dil)

Her istemin sonuna eklenir:

```text
flat minimalist vector illustration, strict side profile, solid near-black silhouette (#111316) with very subtle dark grey panel lines, centered on a matte charcoal slate background (#2b3038) with a soft dark vignette, one thin straight crimson accent line (#9b1c2c) running horizontally just above the car, generous empty margin around the car, no livery, no colours on the car, no logos, no sponsors, no numbers, no text, no driver visible, no people, no shadows on the ground, no photorealism, 16:9
```

Çıktı: 16:9, en az 1376 px genişlik, JPG ya da PNG. Kenarda çerçeve olmasın; sahibin ilk araç görselinde çift çerçeve vardı ve kırpıldı.

Google Flow'da (sahibin ilk dört görseli gibi) istem aynen yapıştırılır. Vertex Imagen ile üretmek istenirse betik yazılır, ama anahtar sahibin `.env.local`'ında olduğu için betiği sahip koşar.

## Araç dönemleri

Dosya adları `public/placeholders/car-<dönem>-<genişlik>.webp`. Eşleme `CarPlaceholder`'da sezon yılına göre yapılır; yılı bilinmeyen araç mevcut görseli gösterir.

### 1. `car-1950` — 1950–1960, önden motorlu "puro"
```text
1950s Formula 1 racing car, front-engined, long cigar-shaped body with a long tapered bonnet, large thin wire-spoke wheels with narrow tall tyres, open cockpit set far back with a small curved windscreen, exposed front suspension, no wings, exhaust pipe along the side
```

### 2. `car-1961` — 1961–1967, arkadan motorlu ince gövde
```text
early 1960s Formula 1 racing car, rear-engined, low slim cigar-shaped body, driver sitting reclined in front of the engine, narrow tyres, exposed wishbone suspension, small wraparound windscreen, rounded nose with a small oval air intake, no wings
```

### 3. `car-1968` — 1968–1982, kanatlar ve yer etkisi
```text
late 1970s Formula 1 racing car, wedge-shaped low body with long side pods, very wide slick rear tyres, tall rectangular rear wing on struts, tall engine air box above the driver's head, flat front wing on a pointed nose, open cockpit
```

### 4. `car-1983` — 1983–1993, turbo ve düz taban
```text
mid-1980s Formula 1 racing car, very low flat body, low pointed nose close to the ground with a wide front wing, short side pods, large wide rear wing with endplates, low engine cover, wide slick tyres, open cockpit with the driver's helmet just visible above the bodywork
```

### 5. `car-1994` — 1994–2008, yüksek burun ve oluklu lastik
```text
early 2000s Formula 1 racing car, raised high nose with the front wing hanging below it, narrow car with tall cockpit sides, tall engine cover with a large roll hoop air intake, grooved slick tyres, small aerodynamic winglets on the side pods, medium rear wing
```

### 6. `car-2009` — 2009–2017, halo öncesi
```text
2010s Formula 1 racing car, high nose with a very wide low front wing, tall narrow rear wing, long engine cover with a shark fin, smooth side pods, wide slick tyres, open cockpit without any halo device
```

2018 ve sonrası: mevcut `car-*.webp` (halolu araç) kalır.

## İsteğe bağlı: pilot, klasik dönem

Bugünkü pilot görseli modern kapalı kask ve yarış tulumu silüeti. 1950–1970 pilotları için ayrı bir görsel istenirse:

```text
1950s racing driver portrait, faceless head-and-shoulders silhouette, open-face leather helmet with goggles pushed up, short-sleeved polo shirt, flat minimalist vector illustration, near-black silhouette on matte charcoal slate background (#2b3038), one thin vertical crimson accent line (#9b1c2c) on the left, no face details, no text, no logos, 3:4
```

## Sonraki adımlar

1. Sahip bu istemleri onaylar ya da düzeltir.
2. Görseller üretilir (sahip Google Flow'da ya da Vertex betiğiyle).
3. Ajan `assets/placeholders/`'a koyar, WebP'ye çevirir ve Cloud Vision kontrolünü koşar.
4. `CarPlaceholder` sezona göre görseli seçer; test ve tarayıcı kontrolü yapılır.
