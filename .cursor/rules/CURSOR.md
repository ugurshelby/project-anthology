# Cursor — Çalışma Anayasası

## Temel Prensipler
- Backend ve mimari her zaman önce gelir. Frontend ikincildir.
- Read `pre-plans/DESIGN_SYSTEM.md` before any frontend work.
- Büyük değişiklikler için önce plan: docs/plans/PLAN_{KONU}_{TARIH}.md
- Soru sorma, tahmin yürütme: belirsizlik varsa en makul varsayımı
  seç ve devam et, sonunda söyle.
- Minimum token: gereksiz açıklama, monolog, uzun düşünme süreci yok.

## Loglama
Her önemli işlem sonrası logs/ klasörüne yaz:
logs/CURSOR_{KONU}_{TARIH}.md
İçerik: ne yapıldı, hangi dosyalar değişti, hatalar, sonraki adım.

## Manuel Aksiyon
Kullanıcının manuel yapması gereken şeyler için:
⚠️ MANUEL AKSİYON GEREKLİ: [açıklama]
Sonra devam et.

## Multi-Agent Koordinasyonu
Bu projede hem Cursor hem Claude Code kullanılıyor.
- Cursor: planlama, büyük mimari kararlar, çok dosyalı refactor
- Claude Code: terminal komutları, build/test, hızlı tek dosya değişimleri
Görev çakışmasını önlemek için hangi aracın ne yaptığını
logs/ dosyalarından takip et.

## F1 Temporal Context
- F1 sezon, yarış takvimi, takım ve pilot listesi için tek kaynak: `@/lib/f1Calendar`
- Sezon yılı, takım listesi veya pilot listesini başka dosyalarda hardcode etme
- Belirsizlikte `getF1Context()` kullan

## F1 Takım Renkleri
- Kaynak: `config/team-colors.ts` (2026 grid, 11 takım)
- **Her sezon başında güncelle** (Ocak–Şubat): FIA entry list, livery lansmanları,
  yeni takım/rebrand kontrolü. Eski düz metin `Colors` dosyası kaldırıldı.
- Canlı API rengi yoksa `resolveTeamUiColor()` bu dosyadan fallback kullanır.

## Kod Kalitesi
- TypeScript strict mode, sıfır any
- Her component için prop types zorunlu
- Build geçmeden commit yok
- Her PR'da en az bir test

## Next.js Kuralları
- Veri çekme: Server Components varsayılan, Client Component istisnai
- API routes: app/api/ altında, her biri tek sorumluluk
- Image: next/image her zaman, asla img tag
- Font: next/font, asla CDN import

## Raporlama
Görev sonunda Türkçe özet:
✅ Tamamlananlar
⚠️ Manuel aksiyon gerekenler  
❌ Tamamlanamayan varsa neden
📁 Değiştirilen dosyalar
