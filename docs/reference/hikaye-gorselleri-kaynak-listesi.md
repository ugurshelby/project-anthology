# Hikâye görselleri — kaynağı doğrulanacak liste

Üretildi: `npm run stories:credits -- --write` (2026-10-07). Kaynak kaydı: `data/stories/image-credits.ts`.

Durum: **56 görsel, 0 kaynaklı, 56 kaynağı doğrulanmamış.**

## Kurallar (sahip kararı, 2026-10-07)

- Hikâye görselleri **gerçek fotoğraf** olmalı: yapay zekâ ile üretilmiş veya SVG/çizim olamaz.
- Sayfada ticari olmayan, editoryal kullanım belirtilir; kaynağı bilinen görselde kaynak adı yazılır ve görsel özgün sayfaya bağlanır.
- Kaynağı bulunamayan görsel lisansı doğrulanamayan, yani **riskli** görseldir; aşağıdaki listede durur.

## Elimizdeki bilgi

- 33 görsel Canva dışa aktarımı (Ocak 2026; tasarım adı ve tarih gömülü). Dosyada yazar, kaynak veya lisans yok; asıl fotoğrafın nereden geldiği kayıtlı değil.
- 23 görsel 2026-09-17'de ham web dosyası olarak eklendi; yalnızca özgün dosya adı kayıtlı (arama ipucu). Gömülü üstveri yok.
- Üstveri taraması (56 dosya, EXIF/IPTC/XMP): telif, kaynak veya lisans alanı yok; tek yazar alanı Canva hesabının adıdır (fotoğrafçı değil).
- Aynı içeriğin iki yolda durduğu 6 çift var (`full/01.png` = `landscape/01.png`); biri doğrulanınca ikisine de yazılır.

## Nasıl doldurulur

`data/stories/image-credits.ts` içinde ilgili satırı şu biçime çevirin (ipucu satırı kalabilir), sonra `npm run stories:credits -- --write` ile bu listeyi yenileyin:

```ts
'/stories/brawn-2009/landscape/01.png': {
  status: 'sourced', sourceUrl: 'https://…', sourceName: 'Wikimedia Commons', author: 'Ad Soyad', license: 'CC BY-SA 4.0',
},
```

Kaynağı bulunamayan görseli ya yeni bir görselle değiştirin ya da hikâyeden çıkarın; `unverified` olarak kalırsa sayfada kaynak satırı çıkmaz, yalnızca genel editoryal kullanım notu görünür.

## The Divine Lap (`senna-monaco`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `senna-monaco/landscape/01.png` | — | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-monacogp-pole.jfif (Monaco 1988 pole/cover) | **doğrulanacak** |
| Gövde | `senna-monaco/full/01.png` | McLaren-Honda MP4/4, Senna on the streets of Monte Carlo, 1988. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-monacogp.webp (MP4/4 Monaco action) | **doğrulanacak** |

## Fire & Ice (`hunt-lauda`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `hunt-lauda/landscape/01.png` | — | Canva export (design Full PC - 2, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `hunt-lauda/landscape/02.png` | Hunt in the rain, Zandvoort. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/james-hunt-mclaren.webp (Hunt wet Zandvoort) | **doğrulanacak** |
| Gövde | `hunt-lauda/portrait/01.png` | Lauda alongside the Ferrari 312T2. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/nikki-lauda-ferrari312t2.jpg (Lauda 312T2 portrait) | **doğrulanacak** |

## The 39-Second Champion (`massa-2008`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `massa-2008/landscape/01.png` | — | Canva export (design Full PC - 6, 2026-01-25); metadata names no author or source; identical copy of /stories/massa-2008/full/01.png | **doğrulanacak** |
| Gövde | `massa-2008/landscape/02.png` | Interlagos grid beneath the gathering storm. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/2008-braziliangp.jpg (Interlagos wet grid) | **doğrulanacak** |
| Gövde | `massa-2008/portrait/01.png` | Ferrari F2008 cutting through the spray. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/felipe-massa-2008-braziliangp.webp (F2008 spray) | **doğrulanacak** |
| Gövde | `massa-2008/full/01.png` | Massa on the podium, rain, tears, and unbroken pride. | Canva export (design Full PC - 6, 2026-01-25); metadata names no author or source; identical copy of /stories/massa-2008/landscape/01.png | **doğrulanacak** |

## The Red Dawn (`schumacher-ferrari`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `schumacher-ferrari/landscape/01.png` | — | Canva export (design Full PC - 9, 2026-01-26); metadata names no author or source | **doğrulanacak** |
| Gövde | `schumacher-ferrari/landscape/02.png` | Ferrari assembly line and telemetry. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/ferrari-f2004.webp (F2004 side profile) | **doğrulanacak** |
| Gövde | `schumacher-ferrari/portrait/01.png` | Schumacher era, relentless scarlet dominance. | Canva export (design Portrait Mobile - 9, 2026-01-26); metadata names no author or source | **doğrulanacak** |
| Gövde | `schumacher-ferrari/full/01.png` | The Tifosi flood the main straight at Monza. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/monza-ferrari-podium.webp (Monza tifosi/banner) | **doğrulanacak** |

## The Zonta Overtake (`hakkinen-schumacher`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `hakkinen-schumacher/landscape/01.png` | — | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/zonta-overtake.jpg (Spa 2000 three-wide cover) | **doğrulanacak** |
| Gövde | `hakkinen-schumacher/landscape/02.png` | Häkkinen entering Eau Rouge flat out. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/mika-haikkinen-mclaren.jfif (Hakkinen Eau Rouge) | **doğrulanacak** |
| Gövde | `hakkinen-schumacher/portrait/01.png` | Schumacher, the immovable adversary. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/schmaucher-f2000.webp (Schumacher F1-2000) | **doğrulanacak** |

## Copse Corner (`hamilton-silverstone`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `hamilton-silverstone/landscape/01.png` | — | Canva export (design Full PC - 22, 2026-01-26); metadata names no author or source | **doğrulanacak** |
| Gövde | `hamilton-silverstone/full/01.png` | Hamilton’s victory lap before 140,000 home spectators, Silverstone 2021. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/hamilton-silverstone-victory.avif (Hamilton flag lap 2021) | **doğrulanacak** |

## The Longest Race (`button-canada`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `button-canada/landscape/01.png` | — | Canva export (design Full PC - 12, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `button-canada/landscape/02.png` | Circuit Gilles Villeneuve under torrential rain. | Canva export (design Full PC - 13, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `button-canada/portrait/01.png` | Button, soaked and relentless on the podium. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jenson-button-2011.avif (Button Canada wet) | **doğrulanacak** |

## The Green Hell (`fangio-nurburgring`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `fangio-nurburgring/landscape/01.png` | — | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/fangio-1957.webp (Fangio 250F cover) | **doğrulanacak** |
| Gövde | `fangio-nurburgring/landscape/02.png` | Maserati 250F balancing on the razor edge of grip. | Canva export (design Full PC - 15, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `fangio-nurburgring/portrait/01.png` | Juan Manuel Fangio after the epic chase. | Canva export (design Portrait PC - 14, 2026-01-25); metadata names no author or source | **doğrulanacak** |

## The Duel (`dijon-1979`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `dijon-1979/landscape/01.png` | — | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/dijon-1979.jpg (Dijon duel cover) | **doğrulanacak** |
| Gövde | `dijon-1979/landscape/02.png` | Villeneuve sliding the Ferrari 312T4. | Canva export (design Portrait PC - 16, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `dijon-1979/portrait/01.png` | René Arnoux in the cockpit of the Renault RS10. | Canva export (design Full PC - 17, 2026-01-25); metadata names no author or source | **doğrulanacak** |

## The Black Weekend (`imola-1994`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `imola-1994/landscape/01.png` | — | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/imola-tamburello.jpg (Tamburello cover) | **doğrulanacak** |
| Gövde | `imola-1994/portrait/01.png` | Senna memorial, Parco delle Acque Minerali, Imola. | Canva export (design Portrait PC - 18, 2026-01-25); metadata names no author or source | **doğrulanacak** |

## The Phoenix (`brawn-2009`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `brawn-2009/landscape/01.png` | — | Canva export (design Full PC - 20, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `brawn-2009/portrait/01.png` | BGP 001 lines, virgin white and neon accents. | Canva export (design Portrait PC - 20, 2026-01-25); metadata names no author or source | **doğrulanacak** |
| Gövde | `brawn-2009/landscape/02.png` | Button celebrating the 2009 World Championship in Brazil. | Canva export (design Full PC - 21, 2026-01-25); metadata names no author or source | **doğrulanacak** |

## The Fifth Gear Symphony (`schumacher-1994-spain`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `schumacher-1994-spain/landscape/01.png` | — | Canva export (design Full PC - 23, 2026-01-27); metadata names no author or source; identical copy of /stories/schumacher-1994-spain/full/01.png | **doğrulanacak** |
| Gövde | `schumacher-1994-spain/full/01.png` | Schumacher piloting the Benetton B194 in Spain, 1994. | Canva export (design Full PC - 23, 2026-01-27); metadata names no author or source; identical copy of /stories/schumacher-1994-spain/landscape/01.png | **doğrulanacak** |
| Gövde | `schumacher-1994-spain/portrait/01.png` | Cockpit controls and wheel, Circuit de Catalunya. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/benetton-cockpit.jpg (B194 cockpit) | **doğrulanacak** |
| Gövde | `schumacher-1994-spain/landscape/02.png` | Benetton B194 Ford Zetec V8 exhaust fire. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/schmaucher-benetton-b194.webp (B194 exhaust flames) | **doğrulanacak** |

## The Ultimate Sacrifice (`collins-fangio-1956`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `collins-fangio-1956/landscape/01.png` | — | Canva export (design Full PC - 26, 2026-01-27); metadata names no author or source; identical copy of /stories/collins-fangio-1956/full/01.png | **doğrulanacak** |
| Gövde | `collins-fangio-1956/full/01.png` | Collins and Fangio, Monza 1956. | Canva export (design Full PC - 26, 2026-01-27); metadata names no author or source; identical copy of /stories/collins-fangio-1956/landscape/01.png | **doğrulanacak** |
| Gövde | `collins-fangio-1956/landscape/02.png` | Ferrari D50 drifting across the Monza banking. | Canva export (design Full PC - 27, 2026-01-27); metadata names no author or source | **doğrulanacak** |
| Gövde | `collins-fangio-1956/portrait/01.png` | Collins handing his car over to Fangio, 1956. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/peter-colling-gives-fangio.webp (Collins to Fangio handover) | **doğrulanacak** |

## The Chaos Theory (`monaco-1982`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `monaco-1982/landscape/01.png` | — | Canva export (design Full PC - 29, 2026-01-27); metadata names no author or source; identical copy of /stories/monaco-1982/full/01.png | **doğrulanacak** |
| Gövde | `monaco-1982/full/01.png` | Monaco GP 1982 final lap chaos across the streets. | Canva export (design Full PC - 29, 2026-01-27); metadata names no author or source; identical copy of /stories/monaco-1982/landscape/01.png | **doğrulanacak** |
| Gövde | `monaco-1982/landscape/02.png` | Didier Pironi coasting from the tunnel with dead electricals. | Canva export (design Full PC - 30, 2026-01-27); metadata names no author or source | **doğrulanacak** |
| Gövde | `monaco-1982/portrait/01.png` | Riccardo Patrese, the bewildered victor of 1982. | Canva export (design Portrait PC - 29, 2026-01-28); metadata names no author or source | **doğrulanacak** |

## The Triple Zero (`jerez-1997`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `jerez-1997/landscape/01.png` | — | Canva export (design Full PC - 32, 2026-01-27); metadata names no author or source | **doğrulanacak** |
| Gövde | `jerez-1997/full/01.png` | Villeneuve, Schumacher, and Frentzen: 1:21.072 timing board. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jerez-qualifying.jfif (Jerez timing screen) | **doğrulanacak** |
| Gövde | `jerez-1997/landscape/02.png` | The contact at Dry Sack that decided the 1997 World Championship. | Canva export (design Full PC - 33, 2026-01-27); metadata names no author or source | **doğrulanacak** |
| Gövde | `jerez-1997/portrait/01.png` | Jacques Villeneuve celebrating Williams’s championship triumph. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/villeneuve-champion.webp (Villeneuve champion) | **doğrulanacak** |

## The Ghost of Donington (`senna-donington-1993`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `senna-donington-1993/landscape/01.png` | — | Canva export (design Full PC - 35, 2026-01-27); metadata names no author or source; identical copy of /stories/senna-donington-1993/full/01.png | **doğrulanacak** |
| Gövde | `senna-donington-1993/full/01.png` | Senna carving through the spray on Lap 1, Donington 1993. | Canva export (design Full PC - 35, 2026-01-27); metadata names no author or source; identical copy of /stories/senna-donington-1993/landscape/01.png | **doğrulanacak** |
| Gövde | `senna-donington-1993/landscape/02.png` | McLaren MP4/8 creating rooster tails down the Craner Curves. | Canva export (design Full PC - 36, 2026-01-27); metadata names no author or source | **doğrulanacak** |
| Gövde | `senna-donington-1993/portrait/01.png` | Ayrton Senna with the iconic Donington trophy. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/senna-donington-trophy.jfif (SEGA Sonic trophy) | **doğrulanacak** |

## The $300,000 Mistake: The Lost Diamond of Monaco (`jaguar-monaco-diamond`)

| Konum | Dosya | Altyazı | Bilinenler | Durum |
|---|---|---|---|---|
| Kapak | `jaguar-monaco-diamond/landscape/01.png` | — | Canva export (design Full PC - 38, 2026-01-31); metadata names no author or source; identical copy of /stories/jaguar-monaco-diamond/full/01.png | **doğrulanacak** |
| Gövde | `jaguar-monaco-diamond/full/01.png` | Jaguar R5 nose with the Steinmetz diamond, Monaco 2004. | Canva export (design Full PC - 38, 2026-01-31); metadata names no author or source; identical copy of /stories/jaguar-monaco-diamond/landscape/01.png | **doğrulanacak** |
| Gövde | `jaguar-monaco-diamond/landscape/02.png` | Christian Klien, Jaguar R5, Loews hairpin crash, Monaco 2004. | Canva export (design Full PC - 39, 2026-01-31); metadata names no author or source | **doğrulanacak** |
| Gövde | `jaguar-monaco-diamond/portrait/01.png` | The enigma of the lost Steinmetz gem. | no embedded metadata; ingested 2026-09-17 from raw web file missing-images/jaguar-diamond.jfif (Steinmetz/Jaguar nose) | **doğrulanacak** |
