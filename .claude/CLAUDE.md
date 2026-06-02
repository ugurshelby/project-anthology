# Claude Code — Çalışma Anayasası

## Temel Prensipler
- Backend ve mimari her zaman önce gelir. Frontend ikincildir.
- Read `docs/DESIGN_SYSTEM.md` before any frontend work.
- Her büyük değişiklik için önce bir plan dosyası oluştur:
  docs/plans/PLAN_{KONU}_{TARIH}.md
  Planı oluştur, sonra uygula.
- Minimum token, maksimum etkinlik: gereksiz açıklama yapma,
  direkt işe giriş. Kod > yorum.

## Loglama Zorunluluğu
Her işlemden sonra logs/ klasörüne log yaz:
logs/AGENT_{KONU}_{TARIH}.md formatında.
Log içeriği:
- Ne yapıldı (maddeler halinde)
- Hangi dosyalar değişti
- Hangi komutlar çalıştırıldı
- Karşılaşılan hatalar ve çözümleri
- Sonraki adım nedir

## Manuel Aksiyon Uyarısı
Eğer görev sırasında kullanıcının manuel yapması gereken bir şey varsa
(Supabase dashboard, Vercel env var, API key alma gibi) işi durdurup
şunu yaz:
⚠️ MANUEL AKSİYON GEREKLİ: [Ne yapılması gerektiği]
Sonra devam et.

## Dosya Yapısı Kuralları
- Her değişiklikten önce ilgili dosyaları oku
- Silmeden önce yedekle veya uyar
- Build her adımda geçmeli: npm run build başarısız olursa dur ve düzelt
- TypeScript hataları sıfır olmalı

## F1 Temporal Context
- F1 sezon, yarış takvimi, takım ve pilot listesi için tek kaynak: `@/lib/f1Calendar`
- Sezon yılı, takım listesi veya pilot listesini başka dosyalarda hardcode etme
- Belirsizlikte `getF1Context()` kullan

## Entegrasyon Kuralları
- Supabase: her zaman service role key server-side, anon key client-side
- Vercel: env var'lar hem .env.local hem Vercel dashboard'da olmalı
- GitHub: her büyük adım ayrı commit, açıklayıcı mesaj
- Cloudinary: URL'ler her zaman .env'den, asla hardcode

## API Güvenliği
- Tüm external API çağrıları server-side (API routes veya Server Components)
- Client'a asla API key expose etme
- Her API route'ta error handling ve logging zorunlu
- Rate limiting kritik endpoint'lerde olmalı

## Raporlama
Her görev sonunda Türkçe özet:
✅ Tamamlananlar
⚠️ Manuel aksiyon gerekenler
❌ Tamamlanamayan varsa neden
📁 Değiştirilen dosyalar
