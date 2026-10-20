# Yazılım Geliştiriciler İçin Temel Kriptografi ve Veri Güvenliği Kılavuzu

---

## 1. Kriptografik Veri Depolama ve Doğru Algoritma Seçimi

### 1.1. Simetrik ve Asimetrik Şifreleme Standartları (AES-GCM, HPKE ve RSAES-OAEP)

Durağan verilerin (data at rest) korunması, veritabanlarında, dosya sistemlerinde veya nesne depolama servislerinde saklanan hassas bilgilerin yetkisiz erişimlere karşı şifrelenmesini ifade eder. Modern yazılım mimarilerinde veri güvenliğini tasarlarken, gizlilik kadar bütünlük ve otantikliğin de korunması esastır.

#### Simetrik Şifreleme (AEAD)
Simetrik şifrelemede, verinin sadece gizliliğini değil, aynı zamanda değiştirilmediğini (bütünlük) ve yetkili bir kaynaktan geldiğini (otantiklik) doğrulayan **Yetkilendirilmiş Şifreleme (AEAD - Authenticated Encryption with Associated Data)** modları kullanılmalıdır. 
* Birinci tercih olarak **AES-GCM** (Galois/Counter Mode) veya **AES-CCM** modları seçilmelidir.
* Anahtar boyutu en az **128-bit**, kurumsal standartta ise **256-bit** olmalıdır.

#### Asimetrik Şifreleme (Açık Anahtar)
Asimetrik şifreleme senaryolarında yapılan en yaygın hatalardan biri, X25519 veya Curve25519 gibi anahtar anlaşma ilkellerinin (key-agreement primitives) doğrudan veri şifrelemede kullanılabileceği yanılgısıdır. Curve25519 üzerindeki X25519, yalnızca iki taraf arasında ortak bir gizli anahtar türetmeye yarar; toplu (bulk) veriyi tek başına şifrelemez.
* Asimetrik şifreleme gerektiğinde, anahtar anlaşması, anahtar türetimi ve yetkilendirilmiş simetrik şifrelemeyi standart bir kapsülleme içinde birleştiren **HPKE (Hybrid Public Key Encryption - RFC 9180)** tercih edilmelidir.
* Mevcut/eski sistemlerle uyumluluk nedeniyle **RSA** kullanılması zorunlu ise, anahtar boyutu en az **2048-bit** olmalı ve RFC 8017 uyarınca rastgele maskeleme üreten **RSAES-OAEP** (Optimal Asymmetric Encryption Padding) dolgu mekanizması uygulanmalıdır.

| Algoritma / Şifreleme Türü | Minimum Gereksinim | Kullanım Amacı ve Avantajı |
| :--- | :--- | :--- |
| **AES-GCM / AES-CCM** *(Simetrik)* | En az 128-bit anahtar (İdeal: 256-bit) | Yüksek hızlı blok veri şifreleme; AEAD yapısı sayesinde hem gizlilik hem de veri bütünlüğü doğrulaması sağlar. |
| **HPKE (Curve25519 / X25519)** *(Hibrit Asimetrik)* | RFC 9180 standardı | Açık anahtarlı şifreleme senaryolarında simetrik ve asimetrik teknikleri birleştirerek güvenli anahtar türetimi ve veri şifreleme sunar. |
| **RSAES-OAEP** *(Asimetrik)* | En az 2048-bit anahtar boyutu ve OAEP dolgusu | Asimetrik veri ve anahtar taşıma; RFC 8017 standartlarına uygun rastgele maskeleme ile güvenli şifreleme sağlar. |

---

### 1.2. Kuantum Sonrası Kriptografi (PQC) Bilinci

RSA ve ECC (Curve25519 dahil) gibi geleneksel açık anahtarlı algoritmalar, gelecekte ortaya çıkacak kriptografik açıdan gelişmiş kuantum bilgisayarları (CRQC) karşısında matematiksel olarak savunmasızdır (Shor algoritması).

Uzun süreli gizlilik gerektiren verilerin korunması için **NIST FIPS 203** standardı olan **ML-KEM** (Module-Lattice-Based Key-Encapsulation Mechanism) gibi kuantum sonrası algoritmaların, klasik algoritmalarla birlikte hibrit yapılar halinde geçiş planlarına dahil edilmesi gerekmektedir.
* **Kritik Ayrım:** ML-KEM ortak bir gizli anahtar oluşturmak (Key Encapsulation) için kullanılır; toplu simetrik veri şifrelemesinde **AES-256'nın yerini almaz**.

---

### 1.3. Yaygın Güvenlik Hataları: Özel Algoritmalar ve Geçersiz Cipher Modları

Geliştiricilerin kriptografi uygularken düşebileceği en kritik hata, kendi şifreleme algoritmalarını veya dolgu mantıklarını yazmaya çalışmaktır (*"Don't roll your own crypto"*).

#### Yapılması Gerekenler:
- [x] Bağımsız kriptologlarca doğrulanmış, NIST, IETF (RFC) veya FIPS tarafından kabul görmüş standart algoritmaları ve kütüphaneleri kullanın.
- [x] Blok şifreleyicilerde (AES) mutlaka GCM veya CCM gibi AEAD destekli modları tercih edin.
- [x] RSA şifrelemesinde standartlara uygun RSAES-OAEP dolgu kütüphanelerini kullanın.

#### Asla Yapılmaması Gerekenler:
- [ ] **"Kendi algoritmamı yazabilirim" hatası:** Standart dışı, özel ("custom") şifreleme algoritmaları veya karıştırma (obfuscation) fonksiyonları tasarlamayın.
- [ ] **AES-ECB Modu Kullanımı:** Electronic Codebook (ECB) modunu kesinlikle kullanmayın. ECB modu aynı düz metin bloklarını her zaman aynı şifreli metin bloklarına dönüştürür ve verideki örüntüleri (örneğin görseldeki hatları) dışa vurur.
- [ ] **Rastgele Bayt Ekleme (Random Padding) Yanılgısı:** RSA şifrelemesinde metnin önüne doğrudan rastgele baytlar eklemek, OAEP dolgu mekanizmasının sağladığı matematiksel güvenliğin yerini tutmaz. Dolgusuz (raw/plain) RSA asla kullanılmamalıdır.

---

## 2. Güvenli Parola Depolama: Hash Algoritmaları ve Bellek Zorluğu (Memory-Hardness)

### 2.1. Düz Hash Fonksiyonlarının (MD5, SHA-256) Yetersizliği

MD5 veya yalın SHA-256 gibi genel amaçlı hash fonksiyonları verileri olabildiğince hızlı işlemek üzere tasarlanmıştır. Ancak **hız, parola depolamasında en büyük zafiyettir**. Bir veritabanı sızdırıldığında, saldırganlar GPU ve ASIC cihazlarının muazzam paralelleştirme gücünü kullanarak bu hızlı fonksiyonlar üzerinde saniyede milyarlarca parola tahmini yürütebilir.

* **GPU Mimarisi Zafiyeti:** GPU'lar çok sayıda küçük yazmaç (register) belleğine sahip çekirdeklerle devasa sayıda matematiksel işlemi paralel olarak yürütür. Eğer kullanılan hash fonksiyonu bellek gerektirmiyorsa, GPU binlerce çekirdeğini tam kapasite çalıştırabilir.
* **Bellek Zorluklu (Memory-Hard) Çözüm:** Her bir parola doğrulama adımı için saldıran tarafı megabaytlarca RAM tahsis etmeye zorlar. Bu durum, GPU çekirdeklerinin bellek bant genişliğini tüketerek kilitlenmesine ve saldırganın paralel işlem avantajının nötralize edilmesine yol açar.

---

### 2.2. Argon2id ve scrypt Karşılaştırması

OWASP Parola Depolama Rehberi'nde birinci tercih olarak **Argon2id** (RFC 9106), ikincil alternatif (fallback) olarak ise **scrypt** (RFC 7914) önerilmektedir.

Argon2id, OWASP'ın minimum güvenlik profili için **~19 MiB ($19,456\text{ KiB}, t=2, p=1$)** bellek harcarken; scrypt benzer bir çevrimdışı saldırı direncini sağlamak için **~128 MiB ($N=2^{17}, r=8, p=1$)** bellek alanına ihtiyaç duyar. Dolayısıyla Argon2id, **yaklaşık 7 kat daha az bellek harcayarak** aynı güvenlik seviyesini sunar.

| Karşılaştırma Kriteri | Argon2id | scrypt |
| :--- | :--- | :--- |
| **Standart** | RFC 9106 (Eylül 2021) / PHC Şampiyonu | RFC 7914 (Ağustos 2016) |
| **OWASP Tercih Sırası** | **1. Tercih (Birincil Öneri)** | 2. Tercih (İkincil / Fallback) |
| **Minimum Bellek (OWASP)** | **~19 MiB** ($19,456\text{ KiB}, t=2, p=1$) | **~128 MiB** ($N=2^{17}, r=8, p=1$) |
| **Yan Kanal Koruması** | **Var** (Hibrit Argon2i evresiyle önbellek zamanlama koruması) | Dikkatli uygulama ve inceleme gerektirir |
| **Ayarlanabilir Parametreler** | $m$ (bellek), $t$ (zaman/geçiş), $p$ (paralellik) | $N$ (CPU/bellek), $r$ (blok boyutu), $p$ (paralellik) |

#### Argon2 Türevleri:
1. **Argon2d:** Veriye bağımlı bellek erişimi kullanır. GPU kırma saldırılarına karşı en yüksek direnci gösterir; fakat çok kiracılı bulut ortamlarda önbellek zamanlama yan kanal saldırılarına maruz kalabilir.
2. **Argon2i:** Veriden bağımsız bellek erişimi kullanır. Yan kanal saldırılarına karşı korumalıdır; ancak GPU kırma direnci daha düşüktür.
3. **Argon2id (Önerilen):** İlk geçişlerde Argon2i, sonraki geçişlerde Argon2d davranışını birleştiren hibrit yapıdır. RFC 9106 uyarınca varsayılandır.

---

### 2.3. Uygulamalı Kod Örnekleri

#### Python (`argon2-cffi` ile Argon2id)

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# OWASP Güçlü Alternatif Profili (~46 MiB RAM, t=1, p=1)
ph = PasswordHasher(
    time_cost=1,
    memory_cost=47104, # ~46 MiB (KiB cinsinden)
    parallelism=1,
    hash_len=32,
    salt_len=16,
)

# Parolayı hash'leme (Tuz ve parametreler otomatik PHC string formatında üretilir)
hashed_password = ph.hash("kullanici-guclu-parolasi-123")

# Parola doğrulama
try:
    if ph.verify(hashed_password, "kullanici-guclu-parolasi-123"):
        print("Parola doğrulandı.")
except VerifyMismatchError:
    print("Geçersiz parola!")
```

#### Node.js (`crypto.scrypt` ile Asenkron scrypt)

```javascript
const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

async function hashPassword(password) {
  const salt = crypto.randomBytes(16); // 128-bit CSPRNG tuzu
    
  // OWASP fallback parametreleri (N=131072 -> 2^17, r=8, p=1, ~128 MiB RAM)
  const derivedKey = await scryptAsync(password, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024 // 256 MiB bellek sınırı
  });

  return {
    salt: salt.toString('hex'),
    hash: derivedKey.toString('hex')
  };
}
```

---

### 2.4. Güvenli Hash Göçü (Verify-then-Rehash)

Mevcut sistemlerde bcrypt veya PBKDF2 kullanan ekipler, kullanıcıları toplu sıfırlamaya zorlamadan şu adımlarla Argon2id'ye geçiş yapmalıdır:
1. Uygulamaya mevcut doğrulayıcının yanına Argon2id kütüphanesini ekleyin.
2. Veritabanındaki kayıtları algoritma ve parametre bilgisiyle etiketleyin (PHC dize biçimi).
3. Kullanıcı giriş yaptığında parolayı eski algoritma ile doğrulayın.
4. Doğrulama başarılı olduğu an düz metin parolayı bellekteyken Argon2id ile yeniden hash'leyip veritabanına kaydedin.
5. 6-12 ay sonunda giriş yapmamış pasif hesaplar için zorunlu parola sıfırlama politikası uygulayarak eski kütüphaneyi kaldırın.

---

## 3. Güvenli Rastgele Sayı Üretimi: PRNG ve CSPRNG Farkı

### 3.1. Sahte Rastgelelik (PRNG) ve Kriptografik Rastgelelik (CSPRNG)

* **PRNG (Pseudo-Random Number Generator):** Hız odaklı, istatistiksel rastgelelik sunan matematiksel algoritmalardır. Başlangıç tohumundan (seed) türetilirler ve çıktıları matematiksel olarak tahmin edilebilir. Şifreleme anahtarları, oturum kimlikleri (session ID), CSRF token'ları veya parola sıfırlama bağlantıları için **kesinlikle kullanılmamalıdır**.
* **CSPRNG (Cryptographically Secure PRNG):** İşletim sisteminin entropi havuzundan (`/dev/urandom`, sistem kesmeleri) beslenen, çıktılarının geriye veya ileriye dönük tahmin edilmesi imkansız olan fonksiyonlardır. Güvenlik kritik tüm süreçlerde yalnızca CSPRNG kullanılmalıdır.

---

### 3.2. Programlama Dillerinde Fonksiyon Haritası

| Yazılım Dili | Güvensiz Fonksiyonlar (Kullanmayın) | Güvenli CSPRNG Fonksiyonları (Mutlaka Kullanın) |
| :--- | :--- | :--- |
| **C** | `rand()`, `random()` | `getrandom(2)` |
| **Java** | `Math.random()`, `java.util.Random`, `ThreadLocalRandom` | `java.security.SecureRandom`, `UUID.randomUUID()` |
| **PHP** | `array_rand()`, `lcg_value()`, `mt_rand()`, `rand()`, `uniqid()` | `Random\Engine\Secure`, `random_bytes()`, `random_int()` |
| **.NET / C#** | `Random()` | `System.Security.Cryptography.RandomNumberGenerator` |
| **Python** | `random` modülü fonksiyonları | `secrets` modülü (`secrets.token_bytes()`, `secrets.choice()`) |
| **Node.js** | `Math.random()` | `crypto.randomBytes()`, `crypto.randomInt()`, `crypto.randomUUID()` |
| **Go** | `math/rand` paketi | `crypto/rand` paketi |
| **Rust** | `rand::prng::XorShiftRng` | `rand::rngs::OsRng`, standart CSPRNG yapıları |

---

### 3.3. UUID / GUID Güvenlik Standartları

* **UUID v1 (Tahmin Edilebilir):** Zaman damgası ve ağ kartı MAC adresinden oluşturulur. Rastgele değildir; sıralı ve tahmin edilebilir olduğu için güvenlik token'ı olarak kullanılamaz.
* **UUID v4 (Kriptografik Rastgele):** Tamamen rastgele değerlerden üretilir. Ancak arkasındaki çalışma zamanının güvenli bir CSPRNG (`crypto.randomUUID()`) kullanması zorunludur.

---

## 4. Anahtar Yönetimi ve Zarf Şifreleme (Envelope Encryption)

### 4.1. Veri ve Anahtar Ayrıştırması: DEK ve KEK Rolleri

Şifreli veri ile anahtarın aynı ortamda saklanması şifrelemeyi etkisiz kılar. Savunma derinliği (defense-in-depth) ilkesi gereği anahtarlar ve veriler birbirinden ayrılır.

* **DEK (Data Encryption Key):** Doğrudan veriyi (dosya, kayıt) simetrik olarak (AES-256-GCM) şifreleyen anahtardır.
* **KEK (Key Encryption Key):** DEK'i şifreleyerek koruma altına alan üst düzey anahtardır.

| Özellik / Kriter | DEK (Data Encryption Key) | KEK (Key Encryption Key) |
| :--- | :--- | :--- |
| **Ne Şifreler?** | Doğrudan ham verileri (dosya, tablo, nesne). | Yalnızca DEK'leri (Anahtar şifreler). |
| **Nerede Yaşar?** | Kullanım anında uygulama belleğinde; saklanırken sarmalanmış (wrapped) halde verinin yanında. | Yalnızca HSM veya Cloud KMS içerisinde; asla düz metin dışarı çıkmaz. |
| **Değişim Sıklığı** | Çok sık (Her veri, dosya veya kayıt başına benzersiz). | Seyrek (Sistem genelinde; yıllık/politika tabanlı rotasyon). |
| **Sızma Etki Alanı (Blast Radius)** | Yalnızca o spesifik DEK ile şifrelenmiş tek bir kayıt sızar. | Kritik (Tüm wrapped DEK'leri çözebilir; bu yüzden donanımsal korunur). |

---

### 4.2. Zarf Şifreleme (Envelope Encryption) Mekanizması

```
+-----------------------------------------------------------------------------------+
|                                 Uygulama Belleği                                  |
|                                                                                   |
|   1. Düz Metin Veri + [Düz Metin DEK] + [AAD: TenantID, ObjectID] ---> AES-256-GCM|
|                                                                          │        |
|                                                                          ▼        |
|                                                                    Şifreli Veri   |
+--------------------------------------------------------------------------│--------+
                                                                           │
                                                                           ▼
+-----------------------------------------------------------------------------------+
|                            KMS / Donanımsal HSM (KEK)                             |
|                                                                                   |
|   2. [Düz Metin DEK] + [KEK] ---> RFC 3394 (AES Key Wrap)                         |
|                                           │                                       |
|                                           ▼                                       |
|                                   Sarmalanmış DEK                                 |
+--------------------------------------------------------------------------│--------+
                                                                           │
                                                                           ▼
+-----------------------------------------------------------------------------------+
|                                Veri Depolama Alanı                                |
|                                                                                   |
|   3. Saklanan Paket: [ Şifreli Veri ] + [ Sarmalanmış DEK ] + [ AAD Üstverisi ]   |
+-----------------------------------------------------------------------------------+
```

#### Adım Adım İşleyiş:
1. Uygulama bellekte benzersiz bir simetrik DEK (AES-256) üretir.
2. Veri, DEK ve ilişkili bağlamsal üstveriler (**AAD: Tenant ID, Object ID**) kullanılarak AES-256-GCM modunda şifrelenir.
3. Düz metin DEK, KMS/HSM'e gönderilerek KEK ile **RFC 3394 (AES Key Wrap)** standardında sarmalanır (wrap edilir).
4. Sarmalanmış DEK (wrapped DEK), şifreli veri ve AAD üstverisi veritabanına kaydedilir.
5. Düz metin DEK bellekten derhal silinir (`zeroed/discarded`).

---

### 4.3. Anahtar Depolama ve Yaşam Döngüsü

* **Güvenli Saklama:** KEK'ler kaynak kodda, Git reposunda veya `/proc/self/environ` gibi ortamlardan sızabilecek çevre değişkenlerinde tutulmamalı; **AWS KMS, Azure Key Vault** veya donanımsal **HSM (FIPS 140-2/3 Level 2/3)** üzerinde saklanmalıdır.
* **KEK Rotasyonu (Re-Wrapping):** KEK yenilendiğinde veritabanındaki ham veriyi yeniden şifrelemeye gerek yoktur; sadece saklanan sarmalanmış DEK'ler eski KEK ile çözülüp yeni KEK ile yeniden sarmalanır.
* **AES-GCM $2^{32}$ Çağırma Sınırı (NIST SP 800-38D):** Rastgele 96-bit IV ile aynı anahtar altında yapılan şifreleme sayısı $2^{32}$ sınırını aşamaz; sınır yaklaştığında anahtar rotasyonu zorunludur.

---

## 5. Hizmet Engelleme (DoS) ve Maliyet Saldırıları (Denial of Wallet - DoW)

### 5.1. Kriptografik İşlemlerin Maliyeti ve DoS

Argon2id ve scrypt gibi bellek-zorlu fonksiyonlar yüksek miktarda CPU ve RAM tüketir. Giriş filtrelemesi yapılmayan uç noktalara yöneltilen aşırı istek akışı sunucu belleğini tüketerek sistemi çökertebilir (DoS).

---

### 5.2. Bulut Mimarilerinde "Denial of Wallet" (DoW) ve AI Amplifikasyonu

Oto-ölçeklenen bulut mimarilerinde amaç sistemi çökertmek değil, ayakta tutarak organizasyona **devasa bulut faturaları çıkarmaktır**. Ajan tabanlı (agentic) AI ve LLM sistemlerinde bir kullanıcının tek bir istemi arka planda onlarca araç çağrısına, yeniden denemeye ve pahalı API çağrısına dönüşebilir (**Dahili İş Akışı Amplifikasyonu**).

#### DoW Saldırısının 3 Temel Unsuru:
1. **Girdi Açısından Ucuz, Sunucu Açısından Pahalı İşlemler:** Tek bir HTTP isteğiyle tetiklenen metreli LLM çağrıları veya bellek-yoğun hash operasyonları.
2. **Önbellek Baypası (Cache Bypass):** Önbellekten yanıt dönmesini engellemek için sözlükler üzerinden sürekli benzersiz girdiler gönderilmesi.
3. **Tüketim Esnekliği (Elasticity):** Trafiğe yanıt vermek için otomatik sunucu satın alan auto-scaler'lar.

---

### 5.3. Savunma Kontrol Listesi (Checklist)

- [ ] **Ucuz Doğrulamaları Öne Alın:** CPU ve RAM açısından pahalı işlemlere veya LLM çağrılarına geçmeden önce girdi boyutu, sözdizimi, format ve yetkilendirme kontrollerini en başta yapın.
- [ ] **Çok Katmanlı ve Kimlik Bazlı Rate Limiting:** Hız sınırlamasını sadece IP bazlı değil; kullanıcı kimliği (identity), oturum ve API anahtarı bazında uygulayın.
- [ ] **Ajan İstek ve Araç Sınırları (Tool Call Caps):** AI ajanlarının tek bir istekte yapabileceği maksimum adım, araç çağrısı ve retry sayılarına sert tavan koyun (OWASP LLM06 ve LLM10 koruması).
- [ ] **Harcama Hızı (Spend-Rate Velocity) Alarmları:** Aylık bütçe yerine anlık (dakikalık/saatlik) harcama ivmesini izleyen alarmlar ve otomatik devre kesiciler (*circuit breakers*) kurun.
- [ ] **Sert Harcama Sınırları (Hard Spend Caps):** Bulut hesaplarında ve harici API'lerde üst bütçe sınırları tanımlayın; sınır aşıldığında sistemi güvenli biçimde durdurun.
- [ ] **CDN ve WAF Kenar Filtreleme:** Anormal trafik kalıplarını ve yavaş HTTP saldırılarını (Slow HTTP) uygulamanıza ulaşmadan önce kenar sunucu (Edge/WAF) seviyesinde süzün.
