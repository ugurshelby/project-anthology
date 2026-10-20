# Argon2id ve scrypt Kavram Karşılaştırma Rehberi: Parola Güvenliğinde Bellek Ağırlıklı Fonksiyonlar

## 1. Giriş: Parola Güvenliğinde Neden Bellek Ağırlığı (Memory-Hardness) Şarttır?

Parolaları korurken neden genel amaçlı hızlı bir özet (hash) fonksiyonu kullanmıyoruz ya da sadece CPU döngülerini artırmıyoruz?

Geleneksel yöntemler ile modern parola özetleme algoritmaları arasındaki ana ayrım, **bellek ağırlığı (memory-hardness)** kavramında yatmaktadır. Geleneksel özet algoritmaları (SHA-256, MD5) veya yalnızca işlemci odaklı (CPU-bound) parola fonksiyonları (bcrypt, PBKDF2), veriyi döngüler halinde işleyerek saldırganı zaman açısından yavaşlatmayı hedefler. 

Ancak günümüzde saldırganlar, binlerce çekirdeğe sahip **GPU kümeleri (GPU clusters)** veya algoritmaya özel üretilmiş **ASIC (Application-Specific Integrated Circuit)** cihazları kullanarak saniyede milyarlarca parola denemesi (brute-force) yapabilmektedir. İşlemci odaklı fonksiyonlar kayda değer bir bellek tüketmediği için saldırganın maliyeti yalnızca hesaplama gücüyle sınırlı kalır.

Bellek ağırlıklı fonksiyonlar ise saldırganın her bir parola tahmini için **gerçek ve yüksek miktarda RAM ayırmasını** zorunlu kılar. Bu durum, saldırganın önündeki temel kısıtlayıcı faktörü işlem gücü yetersizliğinden çıkarıp **bellek bant genişliği ve donanım maliyeti** kısıtına dönüştürür. Bir GPU üzerinde binlerce paralel çekirdek bulunsa da, her çekirdeğe onlarca megabaytlık hızlı bellek alanı tahsis etmek devasa bir fiziksel ve ekonomik engel oluşturur.

### Neden Bellek Ağırlıklı Fonksiyonlar?
1. **Hızlı Özet Fonksiyonlarının (SHA-256, MD5) Yetersizliği:** Genel amaçlı özet fonksiyonları mikrosaniyeler içinde çalışır; bir GPU kümesi üzerinde saniyede milyarlarca tahmin denenerek sızdırılmış parola listeleri anında çözülebilir.
2. **İşlemci Odaklı Yöntemlerin (bcrypt, PBKDF2) Donanım Hızlandırmasına Yenik Düşmesi:** Bellek gereksinimi olmayan algoritmalar, paralel GPU/ASIC donanımlarıyla ölçeklendirilerek CPU gecikme çarpanı kolayca aşılabilir.
3. **Bellek Ağırlığının Saldırgan Maliyetini Üstel Olarak Artırması:** Her bir doğrulama işlemi sırasında büyük bir bellek bloğu doldurulup rastgele taranır. Bu durum saldırı donanımlarının bellek bant genişliğini doyurarak kaba kuvvet saldırılarını ekonomik olarak anlamsız kılar.

---

## 2. Algoritmaların Mimarisi ve Çalışma Prensipleri

### 2.1. Argon2 ve Varyantları (RFC 9106)

Argon2, Temmuz 2015'te uluslararası Parola Özetleme Yarışması'nı (Password Hashing Competition - PHC) birincilikle kazanmış ve Eylül 2021'de IETF tarafından **RFC 9106** olarak standartlaştırılmıştır. Mimarisi; şeritler (lanes), dilimler (slices) ve geçişlerden (passes) oluşan bir bellek dolgu grafiği üzerine kuruludur.

#### Argon2 Varyantları:
* **Argon2d:** Veri bağımlı (data-dependent) bellek erişimi kullanır. Bellek adresleri önceki hesaplama çıktılarına bağlıdır. GPU kırma saldırılarına karşı en yüksek direnci sunar; ancak paylaşımlı/bulut ortamlarda **önbellek zamanlama (cache-timing) yan kanal saldırılarına** karşı hassastır.
* **Argon2i:** Veri bağımsız (data-independent) bellek erişimi kullanır. Bellek adresleri paroladan veya tuzdan (salt) bağımsız üretilir. Yan kanal saldırılarına karşı tam direnç sağlar; fakat GPU kırma direnci Argon2d'ye kıyasla daha düşüktür.
* **Argon2id (Önerilen Hibrit Mimari):** Bellek üzerindeki ilk yinelemenin ilk yarım geçişinde yan kanal saldırılarını engellemek için **Argon2i** yaklaşımını (veri bağımsız adresleme), takip eden tüm geçişlerde ise GPU direncini maksimize etmek için **Argon2d** yaklaşımını (veri bağımlı adresleme) kullanır. Web sistemleri ve kimlik doğrulama servisleri için RFC 9106 ve OWASP standardıdır.

#### Argon2id 3 Ayar Düğmesi (Tuning Knobs):
1. **Bellek Maliyeti ($m$):** Kibibayt (KiB) cinsinden kullanılacak bellek miktarı.
2. **Zaman Maliyeti / Geçiş Sayısı ($t$):** Bellek grafiği üzerinden kaç tam geçiş yapılacağı.
3. **Paralellik / Şerit Sayısı ($p$):** Kaç bağımsız paralel izlek (thread) halinde çalışacağı.

#### RFC 9106 Referans Profilleri:
* **Yüksek Bellek Referansı (High-memory):** 2 GiB RAM ($m=2,097,152\text{ KiB}$), $t=1$, $p=4$ (Örn: Parola yöneticileri, kasa şifreleme).
* **Düşük Bellek Referansı (Low-memory):** 64 MiB RAM ($m=65,536\text{ KiB}$), $t=3$, $p=4$ (Örn: Kısıtlı sunucu ortamları).

---

### 2.2. scrypt (RFC 7914)

scrypt, 2009 yılında Colin Percival tarafından Tarsnap şifreli yedekleme servisi için tasarlanmış ve Ağustos 2016'da IETF tarafından **RFC 7914** olarak standartlaştırılmıştır.

#### Çekirdek Bileşenler:
* **ROMix:** Büyük ve psödorastgele bir bellek dizisini dolduran ana rutin.
* **SMix:** Doldurulan bellek dizisini tekrar tekrar rastgele ziyaret edip karıştıran fonksiyon.
* **BlockMix:** Salsa20/8 akış şifresi çekirdeğini kullanarak verileri dönüştürüp belleğe yazan modül.

#### scrypt Parametreleri:
* **CPU/Bellek Maliyeti ($N$):** $2$'nin kuvveti ($2^n$, örn. $2^{17} = 131,072$) olmak zorundadır.
* **Blok Boyutu ($r$):** Çalışma anındaki blok boyutunu kontrol eder (genellikle $8$).
* **Paralellik ($p$):** Bağımsız paralel scrypt örneklerinin sayısı (genellikle $1$).

$$\text{scrypt Toplam Bellek İhtiyacı} \approx 128 \times r \times N \text{ bayt}$$

---

### 2.3. Bellek Ölçekleme Mekanizmalarının Karşılaştırması

scrypt algoritmasında $N$ parametresi hem CPU hem de bellek maliyetini **birlikte ve üstel olarak ($2^n$)** artırır. $N$ değerinin bir adım yükseltilmesi bellek tüketimini doğrudan ikiye katlar.

Argon2id ise bellek maliyetini ($m$), zaman maliyetini ($t$) ve paralelliği ($p$) **birbirinden tamamen bağımsız ve doğrusal (linear)** ayarlama esnekliği sunar. Bu durum, sistem mimarının CPU'yu aşırı yüklemeden bellek miktarını sunucu RAM bütçesine göre tam olarak kalibre etmesini sağlar.

---

## 3. Argon2id vs. scrypt: Karşılaştırmalı Analiz ve OWASP Tercihleri

| Kriter / Özellik | Argon2id | scrypt |
| :--- | :--- | :--- |
| **Standart / RFC** | RFC 9106 (Eylül 2021) | RFC 7914 (Ağustos 2016) |
| **Geliştirilme Amacı** | 2015 Password Hashing Competition (PHC) Kazananı | Colin Percival (2009, Tarsnap Yedekleme) |
| **Çekirdek Yapı** | Şerit/dilim bellek dolgu grafiği | ROMix / SMix / BlockMix (Salsa20/8) |
| **Ayarlanabilir Parametreler** | Bellek ($m$), Zaman ($t$), Paralellik ($p$) — Bağımsız | CPU/Bellek ($N$), Blok boyutu ($r$), Paralellik ($p$) |
| **OWASP Tercih Sırası** | **Birincil Tercih (First Choice)** | **İkincil / Yedek Tercih (Fallback)** |
| **OWASP Asgari Bellek Gereksinimi** | **~19 MiB** ($19,456\text{ KiB}, t=2, p=1$) | **~128 MiB** ($N=131,072, r=8, p=1$) |
| **OWASP Güçlü Profil** | **~46 MiB** ($47,104\text{ KiB}, t=1, p=1$) | *Mevcut varsayılan yedek profil kullanılır* |
| **Yan Kanal (Side-Channel) Direnci** | **Yüksek** (İlk geçişin ilk yarısında veri bağımsız $Argon2i$ erişimi) | Düşük / Özel sertleştirilmiş yan kanal modu yoktur |
| **ASIC / Donanım Tarihçesi** | Üretim ölçeğinde bilinen bir kırma ASIC'i yok | Litecoin/Dogecoin madenciliği kaynaklı ASIC cihazları (Antminer L-serisi) mevcut |
| **Tuz (Salt) ve Çıktı (Tag) Boyutu** | 128-bit Tuz, 256-bit Çıktı | 128-bit Tuz, 256-bit veya 512-bit türetilmiş anahtar |

### Mimari Sonuç: OWASP Bellek Farkı Neden Önemli?
OWASP eşiklerine göre Argon2id **~19 MiB** bellek harcarken, scrypt **~128 MiB** harcayarak eşdeğer kırma direnci sağlar. Argon2id, **yaklaşık 7 kat daha az bellek bütçesi** ile aynı güvenlik seviyesini yakalar.

**50 Eşzamanlı Login İsteğinde:**
* **scrypt (~128 MiB/istek):** Anlık **>6.4 GiB RAM** tahsisi zorunludur.
* **Argon2id (~19 - 46 MiB/istek):** Anlık yalnızca **0.95 GiB ila 2.3 GiB RAM** gerekir.

Bu verimlilik, yüksek trafikli sunucularda kimlik doğrulama sürecinin sunucuyu RAM tükenmesine (OOM Crash / DoS) sokmasını engeller.

---

## 4. Örnek Kod Uygulamaları ve Canlı Sistem Dağıtım Hataları

### 4.1. Python (`argon2-cffi`) Uygulaması

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# OWASP Güçlü Alternatif Profili (~46 MiB RAM, t=1, p=1)
ph = PasswordHasher(
    time_cost=1,        # t = 1 geçiş
    memory_cost=47104,  # m = 47,104 KiB (~46 MiB)
    parallelism=1,      # p = 1 paralel izlek
    hash_len=32,        # 256-bit çıktı
    salt_len=16         # 128-bit tuz
)

plaintext_password = "ornek-guvenli-parola-123"

# Parola Özetleme (PHC string formatında tuz ve parametreler otomatik dahil edilir)
hashed_password = ph.hash(plaintext_password)
print(f"Argon2id Özeti: {hashed_password}")

# Parola Doğrulama
try:
    ph.verify(hashed_password, "ornek-guvenli-parola-123")
    print("Parola doğrulama başarılı!")
except VerifyMismatchError:
    print("Hata: Parola uyuşmuyor!")
```

---

### 4.2. Node.js (`crypto.scrypt`) Uygulaması

```javascript
const crypto = require('crypto');

const password = 'ornek-guvenli-parola-123';
// 128-bit (16 bayt) CSPRNG rastgele tuz üretimi
const salt = crypto.randomBytes(16);

// OWASP scrypt Yedek Parametreleri (N=131072 => 2^17, ~128 MiB RAM)
const options = {
  N: 131072,                      // CPU/Bellek Maliyeti
  r: 8,                           // Blok boyutu
  p: 1,                           // Paralellik
  maxmem: 256 * 1024 * 1024       // Node.js varsayılan 32MB limitini aşmak için maxmem yükseltilmeli
};

const keyLength = 64; // Çıktı uzunluğu (bayt)

crypto.scrypt(password, salt, keyLength, options, (err, derivedKey) => {
  if (err) throw err;
  
  // Tuz ve özeti standart birleşik formatta saklama (salt:hash)
  const storedHash = salt.toString('hex') + ':' + derivedKey.toString('hex');
  console.log('Veritabanına Saklanacak scrypt Özeti:', storedHash);
});
```

---

### 4.3. Üretim Ortamında Yapılan 5 Kritik Dağıtım Hatası

1. **Varsayılan Kütüphane Parametrelerini Körü Körüne Kullanmak:** Birçok kütüphane zayıf donanımlı cihazları gözeterek yetersiz varsayılanlarla gelir; parametreler mutlaka OWASP eşiklerine göre açıkça ayarlanmalıdır.
2. **Aşırı Paralellik Ayarıyla DoS Riski Yaratmak:** Yüksek paralellik ($p$) ve yüksek bellek ayarları ani giriş dalgalanmalarında sunucu belleğini tüketir.
3. **Parametreleri Yıllarca Güncellememek:** Donanım güçlendikçe eski maliyet değerleri yetersizleşir; parametreler periyodik gözden geçirilmelidir.
4. **Paylaşımlı Bulut Sunucularında `Argon2d` Tercih Etmek:** Çok kiracılı sanal ortamlarda Argon2d yan kanal saldırılarına zemin hazırlar; web uygulamalarında her zaman **Argon2id** kullanılmalıdır.
5. **"Hash Zaten Ağır" Diyerek Rate Limiting'i Atlamak:** Bellek-sert fonksiyonlar çevrimdışı kırma saldırılarına karşıdır. Canlı oturum açma endpoint'lerinde kaba kuvvet ve credential stuffing engellemek için **Rate Limiting** şarttır.

---

## 5. Taşıma (Migration) Stratejisi ve Karar Ağacı

### Karar Ağacı: Hangi Algoritmayı Seçmelisiniz?

```
                 [ Parola Özetleme Algoritması Seçimi ]
                                  │
         ┌────────────────────────┴────────────────────────┐
         │                                                 │
 [ FIPS-140 Zorunlu mu? ]                                  │
         │                                                 │
      (EVET) ──> PBKDF2 (NIST SP 800-132)                  │
                                                           │
                                                [ Argon2id Desteği Var mı? ]
                                                           │
                                             ┌─────────────┴─────────────┐
                                             │                           │
                                          (EVET)                      (HAYIR)
                                             │                           │
                                             ▼                           ▼
                                          Argon2id             [ scrypt Desteği Var mı? ]
                                      (OWASP Birincil)                   │
                                                               ┌─────────┴─────────┐
                                                               │                   │
                                                            (EVET)              (HAYIR)
                                                               │                   │
                                                               ▼                   ▼
                                                            scrypt              bcrypt
                                                         (OWASP Yedek)    (Bağımlılık Güncelle)
```

1. **FIPS-140 Uyumluluğu Zorunlu mu?**
   * *Evet:* **PBKDF2** kullanın (NIST onaylı FIPS standardıdır).
   * *Hayır:* Soru 2'ye geçin.
2. **Platformda Bakımı Yapılan Bir Argon2 Kütüphanesi Mevcut mu?**
   * *Evet:* **Argon2id** kullanın (OWASP birincil tavsiyesi, minimum ~19 MiB ile maksimum güvenlik).
   * *Hayır:* Soru 3'e geçin.
3. **Argon2 Yok Ama Platform Yerel `scrypt` Desteği Sunuyor mu?**
   * *Evet:* **scrypt** kullanın (OWASP yedek profili $N=131,072, r=8, p=1$ ile).
   * *Hayır:* Harici kütüphane ile Argon2id ekleyin veya bcrypt kullanın.

### Özet Karar
Yeni mimari tasarımlarda **Argon2id** varsayılan tercih olmalıdır. Kütüphane kısıtlaması olan veya yerel desteğe bağımlı ortamlarda ise **scrypt** güvenle alternatif olarak konumlandırılabilir.
