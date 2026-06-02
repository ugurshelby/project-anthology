# PLAN: Görsel Asset Üretimi (User Tasks)

**Sorumlu:** İnsan (Kullanıcı)
**Bağlam:** Bu aşama tamamen senin sorumluluğundadır. Agent'lar kod yazarken sen bu materyalleri hazırlayacak ve belirlediğimiz klasörlere (veya Supabase Storage'a) yükleyeceksin. Agent'lar ilk aşamada "placeholder" (yer tutucu) kullanacak, sen dosyaları ekledikçe tasarımlar otomatik olarak hydrate edilecektir.

## Task 1: Takım Kimlikleri (Team Identities)
- **Format:** `.svg`
- **Görev:** Resmi logolar yerine, telif riski taşımayan 10 güncel takımın minimalist araç silüetlerini veya soyutlanmış amblemlerini bul/çiz. 
- **Entegrasyon:** Bu görseller `config/team-colors.ts` dosyasındaki renk kodlarıyla eşleşecektir.

## Task 2: Pilot Portreleri (Driver Portraits)
- **Format:** `.png` veya `.webp` (şeffaf arka plan)
- **Görev:** 20 güncel pilotun Creative Commons lisanslı fotoğrafları veya kask illüstrasyonları. Hepsini aynı omuz hizasından kırp ve aydınlatmalarını eşitle.

## Task 3: 24 Güncel Pist Haritası (Circuit Maps)
- **Format:** Katmanlı `.svg`
- **Görev:** GeoJSON veya açık kaynaklı SVG'lerden 24 pistin haritasını çıkar. CSS ile manipüle edilebilmesi için start düzlüğünü, DRS bölgelerini ve sektörleri ayrı `path` veya `g` etiketleri içinde grupla.

## Task 4: Lastik Hamurları (Tyre Compounds)
- **Format:** `.svg`
- **Görev:** Pirelli C1-C5 lastiklerinin (Kırmızı, Sarı, Beyaz şeritli) ikonik yandan görünümleri.

## Task 5: Anthology & Glossary Destek Görselleri
- **Format:** `.webp`
- **Görev:** Hikayeleri destekleyecek vintage fotoğraflar (CC lisanslı) veya konsept vektörel çizimler (Google Flow / Stitch vb. kullanılarak üretilebilir).