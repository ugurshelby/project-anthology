# Argon2id Standardına Kesintisiz Parola Taşıma Stratejisi Rehberi

## 1. Stratejik Bağlam ve Argon2id Standardına Geçiş Gereksinimi

Modern uygulama mimarilerinde veritabanı parola özetlerinin (password hashes) güncel standartlara yükseltilmesi, sistem güvenlik mimarisinin temel taşlarından birini oluşturmaktadır. Saldırganların GPU kümeleri, ASIC cihazları ve özel donanımlar aracılığıyla sızdırılmış veritabanı özetlerine karşı yürüttüğü çevrimdışı (offline) kırma saldırılarının maliyeti her geçen gün düşmektedir.

Bu tehdit ortamında, durağan verilerin korunması için yalnızca işlemci (CPU) zamanını değil, sistem belleğini (RAM) de bir maliyet unsuru olarak zorunlu kılan **bellek-sert (memory-hard)** kriptografik fonksiyonların kullanımı stratejik bir zorunluluk haline gelmiştir.

---

### 1.1. Mevcut Parola Özetleme Algoritmalarının (bcrypt, PBKDF2, scrypt) Analizi ve Zafiyetleri

Geleneksel ve mevcut sistemlerde sıklıkla kullanılan parola özetleme algoritmaları, günümüzün paralel hesaplama yetenekleri karşısında belirgin mimari zafiyetler sergilemektedir:

| Özellik / Algoritma | PBKDF2 | bcrypt | scrypt | Argon2id |
| :--- | :--- | :--- | :--- | :--- |
| **Standart Düzeyi** | NIST SP 800-132, RFC 2898 | Kriptografik Topluluk Standardı (1999) | RFC 7914 (Ağustos 2016) | **RFC 9106 (Eylül 2021)** |
| **Temel Yapı** | Yinelemeli HMAC Yapısı | Blowfish Tabanlı Çevrim | ROMix / SMix / BlockMix (Salsa20/8) | Şerit/Dilim Bellek Dolgu Grafiği |
| **Bellek Sertliği (Memory-Hardness)** | Yok (Sadece CPU) | Yok (Sadece CPU Maliyeti) | Var (Yüksek Bellek İhtiyacı) | **Var (Yüksek Bellek Verimliliği)** |
| **Ayarlanabilir Parametreler** | İterasyon Sayısı | Çalışma Faktörü (Work Factor) | $N$ (CPU/Bellek), $r$ (Blok Boyutu), $p$ (Paralellik) | $m$ (Bellek), $t$ (Zaman/Pas), $p$ (Paralellik) |
| **OWASP Sıralaması** | FIPS Zorunluluğunda Son Tercih | İkinci Seviye / Eski Sistem | İkinci Tercih (Yedek) | **Birinci Tercih (Varsayılan)** |
| **OWASP Asgari Bellek Bütçesi** | Yok | Yok | ~128 MiB ($N=2^{17}, r=8, p=1$) | **~19 MiB ($m=19,456\text{ KiB}, t=2, p=1$)** |

#### A. bcrypt Zafiyet Analizi
1999 yılında Niels Provos ve David Mazières tarafından tasarlanan **bcrypt**, iş yükü faktörü (work factor) üzerinden CPU maliyetini ölçeklendirmesine rağmen bellek sertliği bileşenine sahip değildir. Modern GPU'lar sahip oldukları binlerce paralel işlem çekirdeği sayesinde, bcrypt özetlerini eşdeğer güvenlik parametrelerindeki bellek-sert fonksiyonlara kıyasla çok daha hızlı bir şekilde deneyebilmektedir.

#### B. PBKDF2 Zafiyet Analizi
NIST SP 800-132 ve RFC 2898 ile standartlaştırılan **PBKDF2** de benzer bir zafiyeti barındırır; HMAC fonksiyonunu binlerce kez yineleyerek çalışır ancak işlem sırasında neredeyse hiç bellek tüketmez. Bu durum, saldırganın maliyetinin bellek bant genişliğiyle değil, yalnızca saf hesaplama gücüyle sınırlı kalmasına yol açar.

PBKDF2'nin günümüzdeki temel kullanım alanı, FIPS 140 (FIPS 140-2 / FIPS 140-3) uyumluluk zorunluluklarının bulunduğu düzenlemeye tabi sistemlerle sınırlıdır. NIST SP 800-132 standardı FIPS 140 uyumluluğu için PBKDF2'yi onaylarken, Argon2id ve scrypt gibi bellek-sert algoritmalar henüz resmi NIST FIPS doğrulama programından (CAVP/CMVP) geçmemiştir. Bu durum, kamu ve finans sektöründeki eski mevzuat rejimlerini GPU kırma saldırılarına karşı zafiyetine rağmen PBKDF2 kullanmaya zorlamaktadır.

#### C. scrypt Analizi ve Yüksek Bellek Maliyeti
Colin Percival tarafından 2009 yılında tasarlanan ve RFC 7914 ile standartlaştırılan **scrypt** ise ROMix ve SMix mekanizmaları üzerinden bellek sertliği kavramını sisteme kazandırmıştır. Ancak scrypt, OWASP'ın asgari güvenlik eşiğini karşılayabilmek için işlem başına yüksek bir bellek bütçesine ihtiyaç duyar.

Standart önerilen $N=2^{17}$ ($131,072$), $r=8$, $p=1$ parametreleri için bellek gereksinimi:

$$\text{Bellek İhtiyacı} = 128 \times r \times N \text{ bayt}$$
$$\text{Bellek İhtiyacı} = 128 \times 8 \times 131,072 = 134,217,728 \text{ bayt}$$
$$\text{Bellek İhtiyacı} = \frac{134,217,728}{1,048,576} = 128 \text{ MiB}$$

Bu yüksek bellek gereksinimi, sunucu tarafında eşzamanlı oturum açma istekleri işlenirken ciddi bir kaynak yükü ve RAM darboğazı oluşturmaktadır.

---

### 1.2. Argon2id Varyant Yapısı (Argon2d, Argon2i, Argon2id) ve RFC 9106 / OWASP Standartları

Temmuz 2015'te Parola Özetleme Yarışması'nı (Password Hashing Competition) kazanan ve Eylül 2021'de IETF tarafından RFC 9106 olarak standartlaştırılan Argon2, üç temel varyanta sahiptir:

* **Argon2d:** Veriye bağımlı (data-dependent) bellek adreslemesi kullanır. Belleğe erişim kalıpları hesaplanan verilere doğrudan bağlı olduğu için GPU tabanlı kırma saldırılarına karşı en yüksek direnci sunar. Ancak paylaşımlı veya çok kiracılı (multi-tenant) bulut donanımlarında, aynı fiziksel makinedeki kötü niyetli bir süreç önbellek zamanlama (cache-timing) yan kanal saldırılarıyla bellek adreslerini gözlemleyebilir.
* **Argon2i:** Veriden bağımsız (data-independent) bellek adreslemesi gerçekleştirir. Bellek erişimleri işlenen veriden bağımsız olduğu için önbellek zamanlama yan kanal saldırılarına karşı tam koruma sağlar; fakat aynı bellek sertliği seviyesine ulaşmak için daha fazla hesaplama pasına ihtiyaç duyar.
* **Argon2id (Önerilen Varsayılan):** Hibrit bir yaklaşımdır. İşlemin ilk paslarında (bellek diliminin ilk bölümünde) yan kanal saldırılarını engellemek adına Argon2i gibi veriden bağımsız adresleme yapar; sonraki paslarda ise GPU kırma direncini maksimize etmek için Argon2d gibi veriye bağımlı adreslemeye geçer.

RFC 9106 standardı ve OWASP Password Storage Cheat Sheet, parola özetleme senaryoları için **Argon2id** varyantını birinci tercih olarak şart koşar.

---

## 2. Argon2id Konfigürasyon Parametreleri ve Kaynak Bütçelemesi

Argon2id konfigürasyonundaki parametre ince ayarı (parameter tuning), sunucu mimarisinin anlık yük kapasitesi ile olası bir veri sızıntısında saldırgana çıkarılacak çevrimdışı kırma maliyeti arasındaki hassas dengenin kurulmasını sağlar.

### 2.1. RFC 9106 ve OWASP Önerilen Parametre Profilleri

Argon2id algoritması üç temel konfigürasyon parametresi üzerinden ölçeklenir:
1. **Bellek Maliyeti ($m$):** Kibibyte (KiB) cinsinden ayrılacak bellek miktarını ifade eder.
2. **Zaman Maliyeti ($t$):** Bellek grafiği üzerinde atılacak pas (pass) sayısını belirtir.
3. **Paralellik ($p$):** Algoritmanın kullanacağı paralel şerit (lane) ve iş parçacığı sayısını belirler.

| Profil Adı | Standart / Rehber | Bellek Maliyeti ($m$) | Zaman Maliyeti ($t$) | Paralellik ($p$) | Çıktı / Salt Boyutu |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OWASP Asgari Kabul Edilebilir** | OWASP (2026) | $19,456\text{ KiB}$ (~19 MiB) | $t = 2$ | $p = 1$ | 128-bit Salt, 256-bit Tag |
| **OWASP Güçlü Alternatif** | OWASP (2026) | $47,104\text{ KiB}$ (~46 MiB) | $t = 1$ | $p = 1$ | 128-bit Salt, 256-bit Tag |
| **RFC 9106 Düşük Bellek Referansı** | RFC 9106 §4 | $65,536\text{ KiB}$ (64 MiB) | $t = 3$ | $p = 4$ | 128-bit Salt, 256-bit Tag |
| **RFC 9106 Yüksek Bellek Referansı** | RFC 9106 §4 | $2,097,152\text{ KiB}$ (2 GiB) | $t = 1$ | $p = 4$ | 128-bit Salt, 256-bit Tag |

#### Bellek Verimliliği Karşılaştırması
OWASP standartlarına göre scrypt eşdeğer güvenlik seviyesi için ~128 MiB belleğe ihtiyaç duyarken, Argon2id ~19 MiB ila ~46 MiB bellek ayak izi ($m$) ile aynı koruma düzeyini yakalar. Bu durum Argon2id'ye scrypt'e kıyasla **3 ila 7 kat daha yüksek bellek verimliliği** sağlar.

* **50 Eşzamanlı Login İsteğinde RAM Tüketimi:**
  * **scrypt (~128 MiB):** $50 \times 128\text{ MiB} = \mathbf{6.4\text{ GiB}}$ RAM
  * **Argon2id (~19 - 46 MiB):** $50 \times (19 \text{ ila } 46)\text{ MiB} = \mathbf{0.95 \text{ ila } 2.25\text{ GiB}}$ RAM

---

### 2.2. Sunucu Kaynakları, Latency (Gecikme) ve DoS/DoW Risk Yönetimi

Aşırı agresif parametre seçimi, kimlik bilgisi doldurma (credential stuffing) saldırılarında sistemin Hizmet Dışı Kalmasına (DoS) ve otomatik ölçeklenen bulut altyapılarında maliyet patlamasına (Denial of Wallet - DoW) yol açar.

Alınması gereken mimari savunma mekanizmaları:
1. **Kenar Katmanı (WAF/Edge) Rate Limiting:** Anormal trafik artışlarını kimlik doğrulama servisine ulaşmadan önce filtrelemek.
2. **Kimlik Bazlı Daraltma (Per-Identity Throttling):** Yalnızca IP değil, kullanıcı adı/e-posta ve istemci kimliği bazında sınırlandırma.
3. **Anlık Harcama Hızı Alarmları (Real-time Spend-Rate Alerting):** Statik aylık limitler yerine dinamik harcama ivmesi tespiti.
4. **Ucuz Doğrulamaların Öne Alınması (Cheap Validation First):** Var olmayan kullanıcılar veya geçersiz şema girişlerinde ağır Argon2id sürecine girmeden istekleri erken reddetmek.
5. **Devre Kesici (Circuit Breaker):** Kimlik doğrulama servislerindeki CPU/RAM kullanımı %80 eşiğini aştığında istek kabul hızını kademeli düşüren devre kesiciler tanımlamak.
6. **SLA ve Latency Hedefi:** P95 gecikme süresinin canlı donanımda **100 ms ile 500 ms** arasında kalması hedeflenmelidir.

---

## 3. Kesintisiz Taşıma Mimarisi: "Doğrula ve Yeniden Özetle" (Verify-then-Rehash) Modeli

Parola özetleri tek yönlü matematiksel fonksiyonlar olduğundan, düz metin parola olmadan toplu (batch) dönüştürme yapılamaz. Kullanıcıları toplu parola sıfırlamaya zorlamadan kesintisiz geçiş için kademeli **"Doğrula ve Yeniden Özetle" (Verify-then-Rehash)** modeli uygulanır.

```
[ Kullanıcı Giriş İsteği ]
          │
          ▼
[ Hash Formatını Kontrol Et (PHC String Başlığı) ]
          │
          ├──> Başlık "$argon2id$" ise
          │         │
          │         ▼
          │    Argon2id ile Doğrula ───> [ Başarılı Giriş ]
          │
          └──> Eski Biçim ($2a$, $scrypt$, PBKDF2) ise
                    │
                    ▼
               Eski Algoritma ile Doğrula
                    │
             (Doğrulama Başarılı)
                    │
                    ▼
          [ Düz Metin Parolayı Argon2id ile Özetle ]
                    │
                    ▼
          [ Veritabanındaki Hash'i Yeni Değerle Güncelle ]
                    │
                    ▼
               [ Başarılı Giriş & Taşıma Tamamlandı ]
```

---

### 3.1. Veritabanı Şeması ve Özet Etiketleme (PHC Biçimi)

* **PHC String Biçimi (Önerilen):** Argon2id özetleri kendi kendini tanımlayan (self-describing) PHC formatında saklanır:
  ```
  $argon2id$v=19$m=47104,t=1,p=1$<salt>$<hash>
  ```
  Veritabanındaki parola alanı `VARCHAR(255)` olduğunda, uygulama metin önekini (`$argon2id$`, `$2a$`, `$scrypt$`) okuyarak hangi doğrulama fonksiyonunu çağıracağını anında tespit eder.
* **Alternatif Sütun:** Gerekirse şemaya `algorithm` sütunu (`VARCHAR(32)`) eklenerek kaydın durumu açıkça etiketlenir.

---

### 3.2. Kod Entegrasyon Örnekleri

#### Python (`argon2-cffi` ile Entegrasyon)

```python
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# OWASP Güçlü Alternatif Profiline uygun Argon2id Yapılandırması
ph = PasswordHasher(
    time_cost=1,
    memory_cost=47104,  # ~46 MiB (KiB cinsinden)
    parallelism=1,
    hash_len=32,
    salt_len=16
)

def authenticate_and_migrate_user(user_record, input_password, legacy_verify_func, db_update_func):
    stored_hash = user_record.password_hash

    # 1. Kaydın Argon2id olup olmadığının kontrolü (PHC tespiti)
    if stored_hash.startswith("$argon2id$"):
        try:
            ph.verify(stored_hash, input_password)
            return True, "AUTHENTICATED_ARGON2ID"
        except VerifyMismatchError:
            return False, "INVALID_CREDENTIALS"

    # 2. Eski Algoritma Doğrulaması (bcrypt / scrypt / pbkdf2)
    legacy_valid = legacy_verify_func(stored_hash, input_password)
    if legacy_valid:
        # 3. Başarılı doğrulama sonrası anında Argon2id ile yeniden özetleme
        new_argon2id_hash = ph.hash(input_password)
        
        # 4. Veritabanını yeni özetle güncelle
        db_update_func(user_record.id, new_argon2id_hash)
        return True, "AUTHENTICATED_AND_MIGRATED"
    else:
        return False, "INVALID_CREDENTIALS"
```

#### Node.js (`crypto.scrypt` & `argon2` ile Entegrasyon)

```javascript
const crypto = require('crypto');
const argon2 = require('argon2');

/**
 * Kullanıcı kimlik doğrulamasını yapar ve kademeli olarak Argon2id'ye taşır.
 */
async function verifyAndRehash(inputPassword, userRecord, dbUpdateFn) {
  const storedHash = userRecord.passwordHash;

  // 1. Zaten Argon2id PHC formatında mı?
  if (storedHash.startsWith('$argon2id$')) {
    try {
      const valid = await argon2.verify(storedHash, inputPassword);
      return { success: valid, status: valid ? 'AUTHENTICATED_ARGON2ID' : 'INVALID_CREDENTIALS' };
    } catch (err) {
      throw new Error(`Argon2id doğrulama hatası: ${err.message}`);
    }
  }

  // 2. Eski scrypt doğrulaması
  const salt = userRecord.salt;
  const legacyHashBuffer = await new Promise((resolve, reject) => {
    crypto.scrypt(inputPassword, salt, 64, { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(derivedKey);
    });
  });

  const storedHashBuffer = Buffer.from(userRecord.legacyHashHex, 'hex');

  // Zamanlama saldırılarını engellemek için timingSafeEqual
  const isMatch = legacyHashBuffer.length === storedHashBuffer.length &&
                  crypto.timingSafeEqual(legacyHashBuffer, storedHashBuffer);

  if (isMatch) {
    // 3. OWASP Güçlü Alternatif profiliyle Argon2id özetine dönüştür
    const newArgon2idHash = await argon2.hash(inputPassword, {
      type: argon2.argon2id,
      memoryCost: 47104, // ~46 MiB
      timeCost: 1,
      parallelism: 1
    });

    // 4. Veritabanını güncelle
    await dbUpdateFn(userRecord.id, newArgon2idHash);
    return { success: true, status: 'AUTHENTICATED_AND_MIGRATED' };
  }

  return { success: false, status: 'INVALID_CREDENTIALS' };
}
```

---

## 4. Operasyonel Uygulama, İzleme ve Güvenlik Denetim Listesi

### 4.1. Canlıya Alma ve Kalan Hesapların (Tail Accounts) Yönetimi

* **Metrik Loglama:** Her başarılı oturum açma işleminde kullanılan algoritma (`legacy` vs `argon2id`) loglanarak toplam kullanıcı kitlesinin taşınma yüzdesi Grafana/Datadog panolarında izlenir.
* **Zamanlanmış Güvenli Sıfırlama Penceresi:**
  1. Genellikle **6 ila 12 aylık** bir taşıma penceresi tanımlanır.
  2. Pencere kapandığında hala eski algoritmada kalan pasif hesapların oturum token'ları iptal edilir (`revocation`).
  3. Veritabanında `password_reset_required = true` bayrağı konulur.
  4. Kullanıcı tekrar giriş yapmak istediğinde güvenli e-posta/SMS parola sıfırlama akışına yönlendirilir.

---

### 4.2. Güvenlik Denetim Kontrol Listesi (Audit Checklist)

- [ ] **OWASP Taban Değerleri:** Canlı ortamdaki Argon2id konfigürasyonunun en az $m=19,456\text{ KiB}, t=2, p=1$ veya $m=47,104\text{ KiB}, t=1, p=1$ OWASP taban değerlerini karşıladığı doğrulandı mı?
- [ ] **Benzersiz CSPRNG Salt:** Her kullanıcı özeti üretilirken Kriptografik Olarak Güvenli Rastgele Sayı Üreteci (`secrets`, `crypto.randomBytes`) kullanılarak en az 128-bit benzersiz salt üretildiği teyit edildi mi?
- [ ] **Varyant Seçimi:** Çok kiracılı bulut ortamlarında önbellek zamanlama saldırılarını engellemek adına `Argon2d` yerine `Argon2id` varyantının seçildiği doğrulandı mı?
- [ ] **P95 Latency ve SLA Doğrulaması:** Canlı ortama eşdeğer donanımlarda P95 parola doğrulama gecikme sürelerinin hedeflenen SLA limitleri (100–500 ms) içerisinde kaldığı doğrulandı mı?
- [ ] **Eski Bağımlılık Temizliği:** Veritabanındaki tüm eski özetler temizlendikten sonra, bağımlılık ağacından (`package.json`, `requirements.txt`) eski özetleme kütüphaneleri kaldırıldı mı?
