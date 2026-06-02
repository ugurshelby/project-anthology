# Karardan Koda: Bütünleşik Geliştirme Felsefesi

## Temel fikir

Çoğu proje iki ayrı dünyada yaşar: "ne yapacağız" kararları bir yerde, "nasıl yapacağız" kodu başka bir yerde. Bu iki dünya nadiren gerçekten buluşur. Sonuç: geliştirici bir sabah kalkar ve spec'te yazılı olan şeyin teknik olarak imkânsız — ya da çok daha karmaşık — olduğunu fark eder. Ya da tam tersi: teknik olarak yapılabilir olan şeylerin yarısı hiç tasarlanmamıştır.

Bütünleşik geliştirme bu kopukluğu ortadan kaldırır. Karar, veri, tasarım ve kod aynı anda olgunlaşır. Hiçbiri diğerini beklemez, ama hiçbiri diğerinden habersiz ilerlemez.

---

## Nasıl çalışır

### 1. Gerçekliği önce öğren

Her proje bir dizi varsayımla başlar. Bu varsayımların bir kısmı yanlıştır. Bütünleşik geliştirmede bu yanlışları mümkün olan en erken anda — kod yazmadan önce — öğrenirsin.

Rosso'da bu şu anlama geldi: Spotify'ın audio features endpoint'inin yeni uygulamalara kapalı olduğunu, export verisinin beklenen formatı taşıyıp taşımadığını, hangi API çağrılarının 403 döndüreceğini — bunların hepsini bir satır uygulama kodu yazmadan önce öğrendik. Plan bu gerçeklerin etrafında şekillendi, gerçekler planın etrafında değil.

### 2. Veriyi baştan getir

Bir projenin ne yapabileceği büyük ölçüde hangi veriyle çalıştığına bağlıdır. Bu veriyi ne kadar geç getirirsen, o kadar geç sürprizle karşılaşırsın.

Bütünleşik geliştirmede veri kaynaklarını — API'ler, export'lar, veritabanları, üçüncü taraf servisler — projenin en başında masaya getirirsin. Formatını anlarsın. Sınırlarını öğrenirsin. Eksiklerini belgelersin. Sonra bu bilgiyle hem mimariyi hem de özellikleri tasarlarsın.

### 3. Kararları belgele, varsayımları değil

Her projede onlarca karar alınır. Çoğu zaman bu kararlar ya hiç yazılmaz ya da "biz böyle yaptık" düzeyinde bir yorum satırına sıkıştırılır. Altı ay sonra neden o kararın alındığını kimse hatırlamaz.

Bütünleşik geliştirmede her önemli kararın üç bileşeni vardır: ne seçildi, neden seçildi, ne reddedildi ve neden. Bu belgeler hem insanlar hem de AI agent'lar için çalışır — bir agent'a bağlam vermek için sayfalar dolusu açıklama yazmak yerine, kararların zaten yazılı olduğu bir belgeyi gösterirsin.

### 4. Gerçeklik katmanlarını ayır

Her projede üç farklı gerçeklik katmanı vardır:

**Ne istiyoruz** — ürün kararları, özellikler, kullanıcı deneyimi. Bunlar değişebilir, değişmeli de.

**Ne mümkün** — teknik kısıtlar, API limitleri, veri kalitesi. Bunlar dış gerçeklerdir, onlarla müzakere edemezsin.

**Nasıl yapacağız** — mimari, kod, araçlar. Bunlar birinci ve ikinci katmanın kesişiminde şekillenir.

Bütünleşik geliştirmede bu üç katmanı karıştırmazsın. "İstiyoruz" ile "mümkün" arasındaki gerilimi dürüstçe belgelersin ve o gerilimi çözecek kararları bilinçli olarak alırsın.

### 5. Plan canlı bir belgedir

Geleneksel projede plan bir kez yazılır ve çoğunlukla gerçeklikle ilgisini kaybeder. Bütünleşik geliştirmede plan sürekli güncellenen, agent'ların checkbox işaretlediği, her yeni bilgiyle şekillenen canlı bir dokümandır.

Bu planın yapısı önemlidir: fazlar, adımlar, checkbox'lar. Bu yapı hem insanların hem de AI agent'larının nerede olduğunu, ne yapmaları gerektiğini ve neyin bittiğini tek bakışta görmesini sağlar.

### 6. Entegrasyon süreklidir

Geliştirmenin sonunda "entegrasyon aşaması" diye bir şey yoktur. Her adım, bir öncekinin üzerine oturur. Veritabanı şeması yazılmadan query katmanı yazılmaz. Query katmanı yazılmadan UI yazılmaz. UI yazılmadan production'a çıkılmaz.

Bu sıra kısıtlayıcı değil, koruyucudur. Her katman bir sonrakinin zeminidir ve o zemin sağlam olmadan üstüne bir şey inşa edilmez.

---

## Araçlar bu felsefenin hizmetinde

Bu yaklaşım belirli araçları zorunlu kılmaz. Ama bazı araçlar bu felsefeyle daha iyi çalışır:

**Karar belgeleri** — spec, plan, rules dosyaları. Bunlar projenin hafızasıdır. Agent'lara context vermek için değil, kararların gerçekten yazılı olması için.

**AI agent'lar** — tekrar eden, sıkıcı, hata yapmaya açık görevler için. Schema migration, import scripti, boilerplate. Agent'lar bu işleri daha hızlı ve daha güvenilir yapar. Ama neyi neden yaptıklarını anlamadan değil — plan ve kurallar sayesinde bağlamla birlikte.

**Canlı doğrulama** — her adımın sonunda gerçek veriyle test. Seed data, gerçek API çağrıları, production benzeri ortam. "Çalışıyor olmalı" değil, "çalıştığını gördük."

---

## Bu yaklaşımın getirdiği şeyler

**Sürpriz azalır.** Kötü haberleri geç değil erken öğrenirsin. Bir özelliğin imkânsız olduğunu öğrenmek için o özelliği half-done hale getirmeni beklemek zorunda değilsin.

**Bağlam taşınır.** Altı ay sonra projeye döndüğünde — ya da başka bir insan ya da agent devralacak olduğunda — ne yapıldığını, neden yapıldığını, ne reddedildiğini okuyabilirsin.

**Karar kalitesi artar.** Kararları yazılı hale getirmek onları düşünmeni zorunlu kılar. "Bunu şimdi yapalım" ile "bunu şimdi yapalım çünkü X, Y'ye göre şu avantajları sunuyor" arasındaki fark büyüktür.

**Geliştirme hızı artar.** Bu paradoksal görünür — daha fazla belge, daha yavaş değil mi? Hayır. Çünkü yeniden iş yapmazsın. Agent'lara her seferinde bağlamı yeniden açıklamazsın. Bir özelliğin neden öyle davrandığını araştırmak için saatler harcamazsın.

---

## Yeni bir projeye başlarken

1. **Gerçeklik araştırması** — hangi veriler var, hangi API'ler erişilebilir, hangi kısıtlar var. Bunları öğrenmeden özellik listesi yapma.

2. **Karar belgesi** — ne yapacaksın, neden, hangi alternatifleri neden reddettin. Bir sayfa yeterli.

3. **Canlı plan** — fazlar, adımlar, checkbox'lar. Agent'ların takip edebileceği granülerlikte.

4. **Kurallar dosyası** — projeye özel kararlar, tasarım sistemi, kod standartları. Agent'ların her seferinde sormak zorunda kalmadığı şeyler.

5. **Veriyi getir** — mümkün olan en erken aşamada gerçek veriyle çalış. Seed data başlangıç için yeterlidir, ama gerçek veri hedeftir.

6. **Her adımı doğrula** — bir adım bitmeden bir sonrakine geçme. "Bitti" demek için çalıştığını görmek gerekir.

---

Rosso bu felsefenin uygulamasıdır. 8.5 yıllık dinleme verisi, Spotify API kısıtları, tek kullanıcılı mimari, mood sistemi, timezone tutarlılığı — bunların hepsi baştan öğrenildi, belgelendi ve koda dönüştürüldü. Hiçbir adım bir önceki adımın zemini olmadan atılmadı.
