# Güvenlik ve Kriptografi Referans Dokümanları İndeksi

Bu dizin, kurumsal parola güvenliği, durağan veri şifreleme (data at rest), kriptografik anahtar yaşam döngüsü ve Hizmet/Maliyet Engelleme (DoS / Denial of Wallet) korumaları için temel mühendislik standartlarını ve uygulama rehberlerini içerir.

---

## Doküman Kılavuzu

| Doküman | Odak Alanı & Kapsam | Birincil Standartlar |
| :--- | :--- | :--- |
| [**Kurumsal Sistemler İçin Mimari Güvenlik Standardı**](./KURUMSAL%20S%C4%B0STEMLER%20%C4%B0%C3%87%C4%B0N%20M%C4%B0MAR%C4%B0%20G%C3%9CVENL%C4%B0K%20STANDARDI_%20PAROLA%20DO%C4%9ERULAMA,%20DURA%C4%9EAN%20VER%C4%B0%20%C5%9E%C4%B0FRELEME%20VE%20MALIYET_KAYNAK%20KORUMA%20REHBER%C4%B0.md) | Kimlik doğrulama mimarisi, Zarf Şifreleme (Envelope Encryption), DEK/KEK hiyerarşisi, CSPRNG, DoS/DoW koruması ve denetim kontrol listesi (Checklist). | RFC 9106, RFC 7914, RFC 3394, NIST SP 800-38D, OWASP LLM 2025 |
| [**Argon2id Standardına Kesintisiz Parola Taşıma Stratejisi Rehberi**](./Argon2id%20Standard%C4%B1na%20Kesintisiz%20Parola%20Ta%C5%9F%C4%B1ma%20Stratejisi%20Rehberi.md) | Canlı sistemlerde kullanıcı parolalarını sıfırlamadan sıfır kesintiyle Argon2id'ye yükseltme modeli (*Verify-then-Rehash*), PHC dizgi biçimi, Python ve Node.js entegrasyonu. | RFC 9106, OWASP Password Storage Cheat Sheet |
| [**Argon2id ve scrypt Kavram Karşılaştırma Rehberi**](./Argon2id%20ve%20scrypt%20Kavram%20Kar%C5%9F%C4%B1la%C5%9Ft%C4%B1rma%20Rehberi_%20Parola%20G%C3%BCvenli%C4%9Finde%20Bellek%20A%C4%9F%C4%B1rl%C4%B1kl%C4%B1%20Fonksiyonlar.md) | Bellek-zorlu (memory-hard) algoritmaların GPU/ASIC direnci, OWASP bellek farkı analizi (~19 MiB vs ~128 MiB), sunucu RAM bütçelemesi ve karar ağacı. | RFC 9106, RFC 7914, OWASP |
| [**Yazılım Geliştiriciler İçin Temel Kriptografi ve Veri Güvenliği Kılavuzu**](./Yaz%C4%B1l%C4%B1m%20Geli%C5%9Ftiriciler%20%C4%B0%C3%A7in%20Temel%20Kriptografi%20ve%20Veri%20G%C3%BCvenli%C4%9Fi%20K%C4%B1lavuzu.md) | Simetrik/asimetrik şifreleme (AES-GCM, HPKE, RSAES-OAEP), PRNG vs CSPRNG fonksiyon haritası, UUID v1/v4 farkı, yaygın geliştirici tuzakları. | RFC 9180 (HPKE), RFC 8017 (OAEP), FIPS 203 (ML-KEM) |

---

## Projedeki Uygulama Bağlantısı
Apex (Project Anthology) projesinin mevcut kod ve veritabanı seviyesindeki güvenlik tespiti için ayrıca bakınız:  
👉 [`docs/reference/guvenlik-durum-tespiti.md`](../guvenlik-durum-tespiti.md)
