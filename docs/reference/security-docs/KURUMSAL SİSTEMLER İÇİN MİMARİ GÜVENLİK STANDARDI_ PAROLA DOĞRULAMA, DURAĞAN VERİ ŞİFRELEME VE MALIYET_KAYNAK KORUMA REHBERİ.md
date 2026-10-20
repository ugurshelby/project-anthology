# Kurumsal Sistemler İçin Mimari Güvenlik Standardı
## Parola Doğrulama, Durağan Veri Şifreleme ve Maliyet/Kaynak Koruma Rehberi

---

## 1. Mimari Güvenlik Standardı Prensipleri ve Stratejik Çerçeve

Kurumsal bilgi sistemlerinin güvenli bir şekilde tasarlanması ve işletilmesi; bilginin gizliliği, bütünlüğü ve erişilebilirliği prensiplerini temel alan **CIA (Confidentiality, Integrity, Availability)** üçlüsüne dayanır.

Kimlik bilgisi yönetimi, veri gizliliğinin korunması ve altyapı kaynaklarının sürdürülebilir biçimde işletilmesi, kurumsal risk yönetiminin üç ana sütunudur. Yanlış kurgulanmış parola saklama mekanizmaları veri ihlallerinde sistemik yıkımlara yol açarken; yetersiz şifreleme anahtarı yönetimi ve kontrolsüz kaynak kullanımı, hizmet kesintilerine ve felaket boyutunda finansal maliyetlere (**Denial of Wallet - DoW**) neden olmaktadır.

### Temel Güvenlik Tasarım İlkeleri

* **Hassas Verilerin Depolanmasını Minimize Etme ("Minimize the Storage of Sensitive Information"):** Sistem mimarisinde güvenlik risklerini azaltmanın en etkili yolu, hassas verileri ilk etapta hiç depolamamaktır. Ödeme kartı bilgileri, kimlik numaraları ve kritik kişisel verilerin saklanmasından mimari düzeyde kaçınılmalıdır. Saklanması zorunlu olmayan her veri parçası, olası bir ihlal durumunda sistemin toplam saldırı yüzeyini, finansal kayıp riskini ve yasal yükümlülüklerini katlanarak artırır.
* **Derinlemesine Savunma (Defense in Depth):** Sistemler, kriptografik kontroller veya şifreleme katmanları aşılsa dahi güvenliği koruyacak çok katmanlı bir yapıda tasarlanmalıdır. Yalnızca şifrelenmiş URL parametreleri veya gizli IP adresleri gibi tekil güvenlik bileşenlerine asla güvenilmemeli; her katmanda katı erişim kontrolü (access control) uygulanmalıdır.
* **Tek Başarısızlık Noktalarının (Single Point of Failure - SPOF) Önlenmesi:**
  1. **Durumsuz (Stateless) Bileşenler:** Yatay ölçeklenmeyi (out-scaling) kolaylaştırmak ve sistem üzerindeki yük dağılımını optimize etmek için durumsuz mimari bileşenler tercih edilmelidir.
  2. **Yedeklilik (Redundancy):** Kritik donanımlar, veritabanları, servisler ve ağ yolları coğrafi veya mantıksal olarak yedekli kurgulanmalıdır.
  3. **Bulkhead (Bölme) Mimarisi:** Bir bileşendeki hatanın, aşırı yükün veya kaynak tükenmesinin sistemin geri kalanına yayılmasını engellemek amacıyla bileşenler arasında kesin izolasyon sınırları (bulkheads) oluşturulmalıdır.
  4. **Dış Servis Dayanıklılığı:** Harici bağımlılıkların veya üçüncü taraf API'lerin başarısız olması durumunda dahi çekirdek sistemin bozulmuş kipte (degraded mode) çalışabilmesi sağlanmalıdır.

---

## 2. Parola Saklama ve Doğrulama Mimarisi (RFC 9106 ve RFC 7914 Analizi)

Kurumsal kimlik doğrulama mimarilerinde veritabanı sızıntıları durumunda, parolaların düz metin olarak elde edilmesini önlemek adına kriptografik olarak dayanıklı özet algoritmalarının seçilmesi zorunludur. Modern sistemlerde yalnızca CPU gücüne değil, bellek bant genişliğine dayalı **bellek-zorlu (memory-hard)** algoritmaların kullanılması mimari bir zorunluluktur.

### 2.1. Bellek-Zorlu Algoritmalar

#### Argon2id (RFC 9106)
Password Hashing Competition (PHC) birincisi olan Argon2, Eylül 2021'de IETF tarafından RFC 9106 olarak standartlaştırılmıştır:
* **Argon2d:** Veriye bağımlı (data-dependent) bellek adreslemesi kullanır. GPU kırma saldırılarına karşı en yüksek direnci gösterir; fakat paylaşımlı donanımlarda önbellek zamanlama (cache-timing) yan kanal saldırılarına açık olabilir.
* **Argon2i:** Veriden bağımsız (data-independent) bellek adreslemesi kullanır. Yan kanal saldırılarına karşı tam koruma sağlar; fakat GPU direnci Argon2d'ye göre daha düşüktür.
* **Argon2id (Kurumsal Standart):** Hibrit modeldir. İlk dilimde Argon2i gibi veriden bağımsız adresleme yaparak yan kanal saldırılarını engeller; sonraki dilimlerde ise Argon2d gibi veriye bağımlı adresleme yaparak GPU kırma direncini maksimuma çıkarır.

**Yapılandırma Parametreleri:**
* $m$ : Bellek maliyeti (KiB cinsinden).
* $t$ : Zaman maliyeti (geçiş/pass sayısı).
* $p$ : Paralellik derecesi (paralel çalışacak thread sayısı).

#### scrypt (RFC 7914)
Colin Percival tarafından tasarlanan ve Ağustos 2016'da RFC 7914 olarak yayınlanan scrypt, ROMix, SMix ve BlockMix (Salsa20/8) rutinlerine dayanır:
* $N$ : CPU ve bellek maliyetini belirleyen 2'nin kuvveti ikili sayı ($2^{17} = 131,072$ vb.).
* $r$ : Blok boyutu ($8$).
* $p$ : Bağımsız paralel örneklerin sayısı ($1$).

$$\text{Bellek Maliyeti} = 128 \times r \times N \text{ bayt}$$

---

### 2.2. Algoritma Karşılaştırması

| Kriter | Argon2id | scrypt |
| :--- | :--- | :--- |
| **Standart (RFC)** | RFC 9106 (Eylül 2021) | RFC 7914 (Ağustos 2016) |
| **OWASP Tercih Sıralaması** | **Birincil Tercih (First Choice)** | **İkincil / Yedek (Fallback)** |
| **OWASP Asgari Bellek** | **~19 MiB** ($19,456\text{ KiB}, t=2, p=1$) | **~128 MiB** ($N=131,072, r=8, p=1$) |
| **OWASP Güçlü Profil** | **~46 MiB** ($47,104\text{ KiB}, t=1, p=1$) | *Mevcut varsayılan yedek profil* |
| **Yan Kanal Direnci** | **Yüksek** (Hibrit veri-bağımsız evre) | Düşük / Özel sertleştirilmiş modu yok |
| **GPU / ASIC Direnci** | Veriye bağımlı evre ile GPU'yu kilitler; kırma ASIC'i yoktur | Yüksek bellek duvarı örer; madencilik ASIC'leri (Antminer L-serisi) mevcuttur |

#### Eski (Legacy) Algoritmalar (bcrypt, PBKDF2) Neden Yetersiz?
* **"So What?" Analizi:** bcrypt ve PBKDF2 bellek sertliğine (memory-hardness) sahip değildir. CPU hesaplama süresini uzatırlar ancak bellek tüketimleri istek başına neredeyse sıfırdır. Modern GPU'lar binlerce çekirdekle bellek engeline takılmadan saniyede milyarlarca bcrypt/PBKDF2 özetini paralel olarak deneyebilir.
* **OWASP Kuralı:** bcrypt ve PBKDF2 yalnızca FIPS-140 uyumluluk zorunluluklarının Argon2id ve scrypt kullanımına izin vermediği düzenlemeye tabi sistemlerde ikincil alternatif olarak kabul edilir.

#### Gecikme Bütçeleri ve Sunucu Bellek Kapasitesi Planlaması
50 eşzamanlı login isteğinde bellek tüketimi:
* **scrypt (~128 MiB/istek):** $50 \times 128\text{ MiB} \approx \mathbf{6.4\text{ GiB}}$ RAM
* **Argon2id (Taban: ~19 MiB/istek):** $50 \times 19\text{ MiB} \approx \mathbf{0.95\text{ GiB}}$ RAM
* **Argon2id (Güçlü: ~46 MiB/istek):** $50 \times 46\text{ MiB} \approx \mathbf{2.25\text{ GiB}}$ RAM

Argon2id, scrypt ile eşdeğer güvenliği **3 ila 7 kat daha az bellek tüketerek** sağlar.

---

### 2.3. Örnek Kod Uygulamaları

#### Python (`argon2-cffi`)
```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# OWASP Güçlü Profil (~46 MiB bellek, t=1, p=1, 128-bit salt, 256-bit hash)
ph = PasswordHasher(
    time_cost=1,
    memory_cost=47104,  # 47,104 KiB (~46 MiB)
    parallelism=1,
    hash_len=32,        # 256-bit hash
    salt_len=16         # 128-bit CSPRNG salt
)

user_password = "user-supplied-strong-password"

# Parola Hashleme (CSPRNG salt dahili olarak otomatik üretilir ve PHC string'e eklenir)
hashed_password = ph.hash(user_password)

# Parola Doğrulama
try:
    ph.verify(hashed_password, user_password)
    print("Doğrulama başarılı.")
except VerifyMismatchError:
    print("Geçersiz parola.")
```

#### Node.js (`crypto.scrypt`)
```javascript
const crypto = require('crypto');

const password = 'user-supplied-strong-password';
// CSPRNG ile 128-bit (16 bayt) benzersiz salt
const salt = crypto.randomBytes(16);

// OWASP Fallback Parametreleri (N=131072, r=8, p=1)
const options = {
  N: 131072, // 2^17
  r: 8,
  p: 1,
  // Node.js varsayılan 32 MiB bellek üst sınırını aşmak için maxmem açıkça yükseltilmelidir:
  maxmem: 256 * 1024 * 1024 // 256 MiB üst sınır
};

crypto.scrypt(password, salt, 64, options, (err, derivedKey) => {
  if (err) {
    console.error('scrypt hesaplama hatası:', err);
    return;
  }
  console.log('Türetilen Hash (Hex):', derivedKey.toString('hex'));
});
```

---

## 3. Durağan Veri (Data at Rest) Şifreleme ve Zarf Şifreleme (Envelope Encryption)

Durağan verilerin şifrelenmesi; fiziksel medya hırsızlığı, yetkisiz veritabanı dökümleri ve depolama sızıntılarına karşı temel korumadır. Ancak anahtarların verilerle aynı ortamda saklanması şifrelemeyi anlamsız kılar. Bu durum, veri ve anahtar hiyerarşisinin mimari olarak ayrıştırılmasını gerektirir.

### 3.1. Simetrik Şifreleme ve AEAD Modları
* **AES-256 Standardı:** Simetrik şifrelemede kurumsal standart en az 128-bit, ideal olarak 256-bit AES olmalıdır.
* **AEAD (Authenticated Encryption with Associated Data) Modları:** Veri gizliliği yanında bütünlük ve otantikliği doğrulamak için **Galois/Counter Mode (GCM)** veya **Counter with CBC-MAC (CCM)** zorunlu tutulmalıdır. Yetkisiz değişiklikler şifre çözme aşamasında doğrudan reddedilir.
* **CTR ve CBC Modlarının Yetersizliği:** CTR ve CBC modları tek başlarına veri bütünlüğü sağlamaz. Kullanılmaları gerekiyorsa şifreli metin üzerine harici **Encrypt-then-MAC (HMAC)** eklenmelidir.

---

### 3.2. Zarf Şifreleme (Envelope Encryption) Mimarisi

```
+-------------------------------------------------------------------+
|                         UYGULAMA BELLEĞİ                          |
|                                                                   |
| [Düz Metin Veri] ---> (AES-256-GCM) ---> [Şifreli Veri (Cipher)]   |
|                               ▲                                   |
|                               │                                   |
|                      (Geçici Plaintext DEK)                       |
+-------------------------------│-----------------------------------+
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
+-----------------------+               +-------------------------------+
|     VERİ TABANI       |               |     KMS / HSM (FIPS 140-2/3)  |
|                       |               |                               |
|   [Şifreli Veri]      |  Wrap /       |       [ KEK (256-bit) ]       |
|   [Sarmalanmış DEK] ──┼───────────────┼──>    (Asla Dışarı Çıkmaz)    |
|                       |  Unwrap       |                               |
+-----------------------+               +-------------------------------+
```

#### DEK ve KEK Rol Ayrımı:
* **DEK (Data Encryption Key):** Doğrudan veriyi (dosya, kayıt, nesne) AES-256-GCM ile şifreleyen simetrik anahtardır. Her kaynak veya kiracı için benzersiz üretilir.
* **KEK (Key Encryption Key):** Veriyi doğrudan şifrelemez; tek görevi DEK'i şifrelemek (wrap) ve çözmektir (unwrap). KEK, yüksek güvenlikli KMS/HSM bünyesinde tutulur ve asla dışarı çıkarılmaz.

#### Key Wrapping & AAD Bağlama:
* **AES Key Wrap (RFC 3394 / RFC 5649):** DEK'ler KEK ile şifrelenirken RFC 3394 standartlarına uyulmalıdır.
* **İlişkili Veri (Associated Data - AAD):** Kiracı kimliği (tenant ID), nesne kimliği (object ID) ve kullanım amacı gibi şifrelenmeyen üstveriler AEAD denklemine dahil edilir. Bu sayede kiracılar arası veri yer değiştirme (cross-contamination) saldırıları imkansız hale gelir.

#### Zarf Şifreleme Süreç Adımları:
1. **Şifreleme:**
   1. Uygulama bellekte geçici bir AES-256 DEK üretir.
   2. Veri bu DEK ile AES-256-GCM (AAD dahil) şifrelenir.
   3. DEK, KMS/HSM'e gönderilerek KEK ile sarmalanır (wrap).
   4. Şifreli veri ve sarmalanmış DEK (wrapped DEK) veritabanına kaydedilir.
   5. Düz metin DEK derhal bellekten silinir (`zeroed/discarded`).
2. **Şifre Çözme:**
   1. Sarmalanmış DEK veritabanından okunur ve KMS/HSM'e gönderilir (unwrap).
   2. KMS/HSM düz metin DEK'i döner (KEK dışarı çıkmaz).
   3. Uygulama veriyi çözer ve doğrular.
   4. Düz metin DEK işlem bitince bellekten silinir.

---

## 4. Kriptografik Anahtar Yönetimi, Döngüsü ve Post-Kuantum Hazırlığı

### 4.1. Güvenli Rastgele Sayı Üretimi (CSPRNG)

Güvenlik kritik sistemlerde standart PRNG fonksiyonları (`Math.random`, `rand()`) çıktıları tahmin edilebilir olduğu için kesinlikle yasaktır. **CSPRNG (Cryptographically Secure Pseudo-Random Number Generator)** zorunludur:

| Yazılım Dili | Güvensiz Fonksiyonlar (Kullanmayın) | Güvenli CSPRNG Fonksiyonları (Kullanın) |
| :--- | :--- | :--- |
| **C** | `rand()`, `random()` | `getrandom(2)` |
| **Java** | `Math.random()`, `java.util.Random` | `java.security.SecureRandom`, `UUID.randomUUID()` |
| **PHP** | `rand()`, `mt_rand()`, `uniqid()` | `random_bytes()`, `random_int()` |
| **.NET / C#** | `Random()` | `System.Security.Cryptography.RandomNumberGenerator` |
| **Python** | `random.random()` | `secrets` modülü (`secrets.token_bytes()`) |
| **Node.js** | `Math.random()` | `crypto.randomBytes()`, `crypto.randomUUID()` |
| **Go** | `math/rand` | `crypto/rand` paketi |
| **Rust** | `rand::prng::XorShiftRng` | `rand::rngs::OsRng`, CSPRNG modülleri |

* **UUID Standardı:** UUID v1 (zaman damgası ve MAC tabanlı) tahmin edilebilir olduğu için güvenlik amaçlı kullanılmamalıdır; CSPRNG tabanlı **UUID v4** zorunludur.

---

### 4.2. Anahtar Depolama, Yaşam Döngüsü ve NIST SP 800-38D Sınırı

* **Anahtar ve Veri Ayrıştırması:** Şifreleme anahtarları ile veritabanı kesinlikle aynı sunucuda tutulamaz. Veritabanı sızsa dahi KMS/HSM ayrı sistemde olduğu için verinin çözülmesi engellenir.
* **AES-GCM $2^{32}$ Çağırma Sınırı (NIST SP 800-38D):** Rastgele türetilen 96-bit IV ile aynı anahtar altında yapılan şifreleme sayısı **$2^{32}$ sınırını** (invocation boundary) kesinlikle aşmamalıdır. Bu sınır aşıldığında IV çakışması (nonce reuse) olasılığı kritik seviyeye çıkar ve AES-GCM şifreleme gizliliği çöker. Bu sınıra yaklaşılmadan anahtar rotasyonu tetiklenmelidir.
* **KEK Rotasyonu (Re-Wrapping):** KEK yenilendiğinde terabaytlarca veriyi yeniden şifrelemek gerekmez; yalnızca sarmalanmış DEK'lerin şifresi eski KEK ile çözülüp yeni KEK ile sarmalanır.

---

### 4.3. Post-Kuantum Kriptografi (PQC) Hazırlığı

* **Kuantum Tehdidi:** RSA ve ECC algoritmaları, Shor algoritması çalıştıran gelecekteki kuantum bilgisayarları karşısında savunmasızdır.
* **NIST FIPS 203 (ML-KEM):** Kuantum-güvenli anahtar kapsülleme için ML-KEM standardı kabul edilmiştir.
  * **Kritik Mimari Ayrım:** ML-KEM bir Key Encapsulation Mechanism (KEM) standardıdır; toplu veri şifrelemesinde **AES-256'nın yerini almaz**. Asimetrik anahtar değişimi ve KEK korumasında kullanılır.

---

## 5. Erişim Kontrolü, DoS ve Denial of Wallet (DoW) Koruması

Argon2id ve zarf şifreleme gibi operasyonlar CPU ve bellek açısından maliyetlidir. Bu maliyetlerin kontrol altına alınmaması DoS veya bulut faturalarında **Denial of Wallet (DoW)** patlamalarına yol açar.

### 5.1. DoS ve Kaynak Tüketimi Önleme
* **Düşük Maliyetli Doğrulamaların Önce Yapılması ("Cheap Validation First"):** İstek biçimi, yetkilendirme başlıkları, dosya boyutu ve parametre sınırları gibi ucuz doğrulamalar ağır kriptografik veya AI işlemlerinden önce yapılmalıdır.
* **Slow HTTP Saldırı Koruması:** `requestReadTimeout` yapılandırmalarıyla minimum akış hızı ve mutlak bağlantı zaman aşımı tanımlanmalıdır.

---

### 5.2. Bulut ve Yapay Zeka Mimarilerinde "Denial of Wallet" (DoW) Koruması

```
+------------------+     HTTP İstekleri      +-------------------------+
|    SALDIRGAN     | ----------------------> |    API GATEWAY / WAF    |
|  (Ucuz İstemci)  | (Benzersiz Girdi/Sözlük)|  (Oran Sınırlama / Cap) |
+------------------+                         +-------------------------+
                                                          │
                                                          ▼
                                             +-------------------------+
                                             |    BULUT UYGULAMASI     |
                                             |  (Auto-Scaling Aktif)   |
                                             +-------------------------+
                                                          │
                         ┌────────────────────────────────┴────────────────────────────────┐
                         ▼                                                                 ▼
           +--------------------------+                                      +--------------------------+
           |   PAHALI AI / LLM API    |                                      |  UNBOUNDED AGENTIC LOOP  |
           |    (OWASP LLM10:2025)    |                                      |    (OWASP LLM06:2025)    |
           +--------------------------+                                      +--------------------------+
                         │                                                                 │
                         └────────────────────────────────┬────────────────────────────────┘
                                                          ▼
                                    =====================================
                                    FİNANSAL HASAR / BÜTÇE ŞOKU (DoW)
                                    =====================================
```

* **OWASP LLM10:2025 (Unbounded Consumption):** Kullanıcı isteklerinin token, API maliyeti, bellek veya CPU tüketimi üzerinde üst sınır bulunmaması durumunda bütçenin tükenmesi.
* **OWASP LLM06:2025 (Excessive Agency):** Özerk ajanların sınırsız araç kullanımı ve sonsuz döngülere (unbounded loops) girmesi.

#### DoW Önleme Kuralları:
1. Anonim kullanıcılara metreli/pahalı servisler doğrudan açılmamalıdır.
2. Maksimum girdi, çıktı ve bağlam (context) boyutu kesin olarak sınırlandırılmalıdır.
3. Ajan akışlarında araç çağrılarına ve ardışık adımlara kesin üst sınır konulmalıdır.
4. **Kimlik Tabanlı Oran Sınırlama:** Dağıtık botnet'lere karşı IP yerine kullanıcı/API anahtarı bazında rate limiting uygulanmalıdır.
5. **Sert Harcama Limitleri (Hard Spend Caps):** Bütçe eşiği aşıldığında sistem otomatik devre kesicilerle (circuit breakers / kill switches) pahalı akışları durdurmalıdır.

---

## 6. Canlı Sistem Migrasyon Stratejisi ve Denetim Kontrol Listesi

### 6.1. Kademeli (Rolling Re-hash) Migrasyon

1. **Çift Kütüphane Desteği:** Argon2id kütüphanesi eklenirken eski hash kütüphaneleri aktif tutulur.
2. **Veritabanı Etiketleme:** Hash kayıtları PHC string biçimi (`$argon2id$...`) veya `algorithm` sütunuyla etiketlenir.
3. **Verify-then-Rehash Akışı:**
   * Kullanıcı giriş yaptığında eski algoritma ile doğrulanır.
   * Başarılı olduğu an düz metin parola bellekteyken Argon2id ile yeniden özetlenir ve veritabanına yazılır.
4. **Pasif Kullanıcı Yönetimi:** 6-12 ay sonunda giriş yapmayan hesaplar için parola sıfırlama prosedürü devreye sokulur.

---

### 6.2. Mimari Güvenlik Denetim Kontrol Listesi (Audit Checklist)

- [ ] **1. Argon2id Parametre Uyumluluğu:** Konfigürasyonun OWASP minimum ($m=19,456\text{ KiB}, t=2, p=1$) veya güçlü alternatif ($m=47,104\text{ KiB}, t=1, p=1$) eşiklerini karşıladığı doğrulandı mı?
- [ ] **2. CSPRNG ve Benzersiz Salt:** Her parola için benzersiz bir salt kullanıldığı ve CSPRNG kaynaklarından üretildiği teyit edildi mi?
- [ ] **3. Varyant Seçim Doğrulaması:** Paylaşımlı bulut ortamlarında önbellek zamanlama saldırılarına açık olan `Argon2d` yerine `Argon2id` varyantının seçildiği kontrol edildi mi?
- [ ] **4. DEK / KEK Ayrımı ve HSM:** DEK ile KEK'in ayrıldığı; KEK'lerin FIPS 140-2/3 onaylı HSM/KMS bünyesinde saklandığı doğrulandı mı?
- [ ] **5. AES-GCM $2^{32}$ Çağırma Sınırı:** AES-GCM modunda NIST SP 800-38D uyarınca aynı anahtar altında $2^{32}$ çağırma sınırının aşılmadığı denetlendi mi?
- [ ] **6. DoS ve DoW Korumaları:** Kriptografik operasyonlar ve LLM uç noktalarında (OWASP LLM10 ve LLM06) harcama üst sınırları, devre kesiciler ve kimlik tabanlı oran sınırlamalarının kurulu olduğu teyit edildi mi?
