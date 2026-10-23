# TUM (FTM) Yarış Simülasyonu: Heilmeier ve arkadaşlarının makaleleri ve `TUMFTM/race-simulation` reposu

*Araştırma raporu. Hazırlayan: Grok Bot, Ömer Küçükali için. Tarih: 21 Ekim 2026 (TSİ).*
*Bütün bibliyografik bilgiler Crossref, OpenAlex, Semantic Scholar, MDPI ve GitHub üzerinden bu tarihte kontrol edildi. Doğrulayamadığım noktalar en sondaki "Doğrulanamayanlar" bölümünde listeleniyor.*

---

## 1. Özet

Münih Teknik Üniversitesi'nin Taşıt Teknolojisi Kürsüsü (Lehrstuhl für Fahrzeugtechnik, FTM) bünyesinde Alexander Heilmeier 2018–2022 arasında devre yarışları için bir **strateji simülasyonu** geliştirdi. Ekipte Michael Graf (BMW Motorsport), Johannes Betz, Markus Lienkamp ve André Thomaser da vardı. Çalışma üç ana makaleye dayanıyor:

1. **ITSC 2018:** Tur bazında ayrıklaştırılmış (lap-wise) deterministik yarış simülasyonu. Lastik aşınması, yakıt kütlesi, pit kayıpları ve sollama modelini içeriyor.
2. **Applied Sciences 2020a:** Kaza, arıza, SC/VSC, start performansı ve tur süresi ile pit süresi saçılımı gibi olasılıksal etkileri Monte Carlo yöntemiyle ekliyor. Safety car için "SC ghost" kavramını getiriyor.
3. **Applied Sciences 2020b:** "Virtual Strategy Engineer" (VSE). Pit kararını ve lastik hamuru seçimini iki ayrı sinir ağına veriyor ve ağları 2014–2019 F1 zamanlama verisiyle eğitiyor. Rakipsiz durumda en iyi temel stratejiyi bulmak için bir MIQP (karma tamsayılı karesel programlama) formülasyonu da sunuyor.

Bu çalışmaların hepsi açık kaynak [TUMFTM/race-simulation](https://github.com/TUMFTM/race-simulation) reposunda Python ile uygulanmış durumda. Lisans LGPL-3.0. Repoda 2014–2019 sezonlarındaki 121 F1 yarışı için hazır parametre dosyaları ile önceden eğitilmiş VSE modelleri (TFLite) bulunuyor. Varsayılan daldaki son commit **18 Eylül 2021** tarihli, yani repo fiilen bakımsız. Bağımlılıklar da 2020 sürümlerine sabitlenmiş (TensorFlow 2.2, numpy 1.18).

Repoyu Python 3.13 ile kurup çalıştırdım. VSE'siz Monte Carlo modu üç küçük düzeltmeyle çalışıyor: TF içe aktarımını taklit etmek (stub), sürüm kontrolünü atlamak ve cvxpy ile setuptools<81 kurmak. Bu kurulumla Şanghay 2019 için 1000 koşu yaklaşık 12 saniye sürdü.

F1 içerik sitesi açısından en değerli kısımlar şunlar:

- Tur süresi modeli, yani pit penceresi ve undercut hesaplarının temeli.
- SC/VSC olasılık tabloları.
- "Pozisyon dağılımı" biçiminde verilen Monte Carlo çıktısı.

Güncel sezonlar için parametreleri FastF1, Jolpica (Ergast'ın halefi) ve OpenF1 verileriyle yeniden kestirmek gerekiyor. 2014–2019 dışındaki dönemlerde modelin doğrudan kullanılması doğru olmaz.

---

## 2. Kaynaklar tablosu

| # | Başlık | Yazarlar | Yıl | Yayın yeri | Link |
|---|---|---|---|---|---|
| 1 | A Race Simulation for Strategy Decisions in Circuit Motorsports | A. Heilmeier, M. Graf, M. Lienkamp | 2018 | 2018 21st Int. Conf. on Intelligent Transportation Systems (ITSC), s. 2986–2993 (IEEE) | [doi:10.1109/ITSC.2018.8570012](https://doi.org/10.1109/ITSC.2018.8570012) · [açık erişim kopyası (mediaTUM)](http://mediatum.ub.tum.de/node?id=1462798) |
| 2 | Application of Monte Carlo Methods to Consider Probabilistic Effects in a Race Simulation for Circuit Motorsport | A. Heilmeier, M. Graf, J. Betz, M. Lienkamp | 2020 | *Applied Sciences* 10(12), 4229 (MDPI, açık erişim) | [doi:10.3390/app10124229](https://doi.org/10.3390/app10124229) |
| 2a | Erratum: Heilmeier, A., et al. Application of Monte Carlo Methods… Appl. Sci. 2020, 10, 4229 | A. Heilmeier, M. Graf, J. Betz, M. Lienkamp | 2020 | *Applied Sciences* | [doi:10.3390/app10175745](https://doi.org/10.3390/app10175745) |
| 3 | Virtual Strategy Engineer: Using Artificial Neural Networks for Making Race Strategy Decisions in Circuit Motorsport | A. Heilmeier, A. Thomaser, M. Graf, J. Betz | 2020 | *Applied Sciences* 10(21), 7805 (MDPI, açık erişim) | [doi:10.3390/app10217805](https://doi.org/10.3390/app10217805) |
| 4 | A Quasi-Steady-State Lap Time Simulation for Electrified Race Cars (`laptime-simulation` reposunun makalesi) | A. Heilmeier, M. Geisslinger, J. Betz | 2019 | 2019 14th Int. Conf. on Ecological Vehicles and Renewable Energies (EVER), IEEE | [doi:10.1109/EVER.2019.8813646](https://doi.org/10.1109/EVER.2019.8813646) |
| 5 | Minimum curvature trajectory planning and control for an autonomous race car (`global_racetrajectory_optimization`) | A. Heilmeier, A. Wischnewski, L. Hermansdorfer, J. Betz, M. Lienkamp, B. Lohmann | 2019 (çevrimiçi), 2020 (cilt) | *Vehicle System Dynamics* 58(10), 1497–1527 | [doi:10.1080/00423114.2019.1631455](https://doi.org/10.1080/00423114.2019.1631455) |
| 6 | Simulation of Circuit Races for the Objective Evaluation of Race Strategy Decisions (doktora tezi, 205 s.) | A. M. Heilmeier (danışman: M. Lienkamp) | 2022 | TUM School of Engineering and Design, mediaTUM | [mediatum.ub.tum.de/1647512](https://mediatum.ub.tum.de/1647512) · [URN](https://nbn-resolving.org/urn:nbn:de:bvb:91-diss-20221208-1647512-1-8) |
| 7 | Energy Management Strategy for an Autonomous Electric Racecar using Optimal Control | T. Herrmann, F. Christ, J. Betz, M. Lienkamp | 2019 | 2019 IEEE ITSC | [doi:10.1109/ITSC.2019.8917154](https://doi.org/10.1109/ITSC.2019.8917154) |
| 8 | Minimum Race-Time Planning-Strategy for an Autonomous Electric Racecar | T. Herrmann, F. Passigato, J. Betz, M. Lienkamp | 2020 | 2020 IEEE 23rd ITSC | [doi:10.1109/ITSC45102.2020.9294681](https://doi.org/10.1109/ITSC45102.2020.9294681) |

**İlgili TUM repoları** (GitHub API, 21.10.2026):

| Repo | İçerik | Lisans | Yıldız / fork | Varsayılan daldaki son commit |
|---|---|---|---|---|
| [TUMFTM/race-simulation](https://github.com/TUMFTM/race-simulation) | Tur bazlı yarış simülasyonu, MCS, VSE | LGPL-3.0 | 121 / 42 | 2021-09-18 |
| [TUMFTM/laptime-simulation](https://github.com/TUMFTM/laptime-simulation) | Yarı-durağan (quasi-steady-state) tur süresi simülasyonu | LGPL-3.0 | 165 / 45 | 2021-12-31 |
| [TUMFTM/global_racetrajectory_optimization](https://github.com/TUMFTM/global_racetrajectory_optimization) | Minimum eğrilik / minimum süre yarış çizgisi optimizasyonu | LGPL-3.0 | 621 / 243 | (repo pushed_at: 2023-07-06) |
| [TUMFTM/f1-timing-database](https://github.com/TUMFTM/f1-timing-database) | 2014–2019 F1 tur/yarış verisi içeren SQLite veritabanı (Ergast tabanlı ve genişletilmiş) | **CC BY-NC-SA 3.0** | 55 | (pushed_at: 2021-09-18) |
| [TUMFTM/racetrack-database](https://github.com/TUMFTM/racetrack-database) | 20'den fazla pistin merkez çizgisi, genişliği ve yarış çizgisi | LGPL-3.0 | 323 | (pushed_at: 2021-09-18) |
| [heilmeiera/time-discrete-race-simulator](https://github.com/heilmeiera/time-discrete-race-simulator) | Rust ile yazılmış zaman-ayrık yarış simülatörü | Apache-2.0 | 37 | (pushed_at: 2021-09-16) |

> **Not (Formula E / enerji stratejisi):** TUM'da elektrikli yarış aracı enerji stratejisi üzerine yayınlar var (#7 ve #8). Ancak bunların ilk yazarı Heilmeier değil Thomas Herrmann ve konu gerçek Formula E değil, otonom elektrikli yarış aracı (Roborace bağlamı). Heilmeier'in Formula E'ye özel bir enerji stratejisi makalesine rastlamadım. #4'teki tur süresi simülasyonu ise elektrikli ve hibrit güç aktarma organlarını ve enerji tüketimini modelliyor.

---

## 3. Yöntem açıklaması

### 3.1 Temel fikir: tur bazında ayrıklaştırma (ITSC 2018)

Simülasyon yarışı saniye saniye değil **tur tur** hesaplıyor. Her turda her pilotun tur süresi bileşenlerin toplamı olarak bulunuyor (Applied Sciences 2020a ve 2020b'de yeniden verilen Denklem 1):

```
t_lap(l) = t_base + t_tire(a, c) + t_fuel(m_fuel) + t_car + t_driver + t_grid(p_g) + t_pit,in/out-lap
t_race(l) = Σ_{i=1..l} t_lap(i)
```

| Bileşen | Anlamı | Repo parametresi (örnek: `pars_Shanghai_2019.ini`) |
|---|---|---|
| `t_base` | Pistin teorik en hızlı yarış turu (taze lastik, neredeyse boş depo) | `t_q` = 91.547 s (en iyi sıralama turu) + `t_gap_racepace` = 1.812 s |
| `t_tire(a,c)` | Lastik yaşı `a` ve hamur `c`'ye bağlı zaman kaybı | Pilot ve hamur bazında `k_0`, `k_1_lin`; modeller: lineer, karesel, kübik, logaritmik |
| `t_fuel` | Taşınan yakıtın tur süresine etkisi | `t_lap_sens_mass` = 0.031 s/kg; `m_fuel` = 110 kg; `b_fuel_perlap` = 1.964 kg/tur |
| `t_car`, `t_driver` | Araç ve pilot farkı (en hızlı kombinasyona göre) | Takım bazında `t_car` (ör. Mercedes 0.0 s, Ferrari 0.317 s, Williams 2.595 s) |
| `t_grid` | Durarak kalkıştan ve grid sırasından gelen kayıp (1. tur) | `t_loss_firstlap` = 2.238 s, `t_loss_pergridpos` = 0.139 s |
| `t_pit` | In-lap ve out-lap'teki pit şeridi kaybı ile duruş süresi | `t_pitdrive_inlap` 4.881 s, `t_pitdrive_outlap` 15.045 s, `t_pit_tirechange_min` 1.9 s + takıma özel ek süre |

**Lastik modeli** (`helper_funcs/src/calc_tire_degradation.py`):

- lineer: `t_tire = k_0 + k_1·a`
- karesel: `k_0 + k_1·a + k_2·a²`
- kübik: `k_0 + k_1·a + k_2·a² + k_3·a³`
- logaritmik: `k_0 + k_1·ln(k_2·a + 1)`

`k_0` hamurun taze lastikteki hız ofsetidir; yumuşak hamurda `k_0` küçük, `k_1` büyük olur. SC sırasında aşınma çarpanı 0.25, VSC sırasında 0.5. Soğuk lastik cezası `t_add_coldtires` ile veriliyor. Yazarlar kamuya açık zamanlama verisiyle en sağlam sonucu **lineer modelin** verdiğini belirtiyor (VSE makalesi, §3.4.2).

**Sollama ve etkileşim modeli:** Her turun sonunda yarış süreleri karşılaştırılıyor. Takipçinin önündekine göre yeterli zaman avantajı varsa sollama gerçekleşiyor. Repodaki parametreler şunlar:

- Gerekli avantaj `t_gap_overtake` = 1.5 s. Son hıza göre `t_gap_overtake_vel` = −0.037 s/(km/h) ile ayarlanıyor.
- Düello kaybı `t_duel` = 0.3 s, sollanan pilotun kaybı `t_overtake_loser` = 0.3 s.
- Minimum takip aralığı `min_t_dist` = 0.5 s (SC altında 0.8 s).
- DRS penceresi 1.0 s, DRS etkisi −0.553 s/tur. DRS 3. turdan itibaren ve SC'den 2 tur sonra yeniden açılıyor.

ITSC 2018 makalesinin özeti modeli şöyle tarif ediyor: tur bazlı, lastik aşınması, yakıt kütlesi azalması, pit stoplar ve sollama manevraları içeren, parametreleri kamuya açık tur süresi verisinden kestirilebilen bir model. Örnek uygulama 2017 Abu Dabi GP'si.

**Hız:** Python ile 20 araçlı bir yarış Intel i7-6820HQ üzerinde 90–110 ms sürüyor. 10.000 Monte Carlo koşusu dört çekirdekte yaklaşık 250–300 s (2020a, §4).

### 3.2 Olasılıksal etkiler ve Monte Carlo (Applied Sciences 2020a)

| Etki | Model | Parametre kaynağı |
|---|---|---|
| **Start performansı** | Grid pozisyonuna göre karekök referans eğrisi (sabit ivme varsayımı). Bu eğriden sapmalar pilota özel bir Gauss dağılımından örnekleniyor ve 1. tur süresine ekleniyor | 2019 kokpit kamerası videoları (F1 TV) |
| **Tur süresi saçılımı** | Her stinte karesel polinom uyduruluyor, kalanlar `N(0, σ_pilot²)` olarak modelleniyor (ör. HAM σ = 0.459 s, KUB σ = 0.841 s) | 2014–2019 temiz turlar |
| **Pit süresi saçılımı** | Takıma özel log-lojistik (Fisk) dağılım | 2014–2019 pit süreleri |
| **Kaza ve arıza** | Ayrı ayrı modelleniyor: kaza pilota, arıza takıma bağlı. Beta önsel ve Bernoulli olabilirlik ile Bayesçi çıkarım yapılıyor (sıfır DNF'li pilot bile küçük bir olasılık alıyor) | Ergast ve RaceFans DNF istatistikleri |
| **SC / VSC (FCY)** | Yarış başlamadan önce olaylar örnekleniyor. SC sayısı olasılıkları: 0: 0.455, 1: 0.413, 2: 0.099, 3: 0.033. Başlangıç %36.4 olasılıkla 1. turda. Süre 2–8 tur. Her SC bir kazaya bağlanıyor. VSC arızadan koşullu olasılıkla türetiliyor (0.227), süresi 1–4 tur | 2014–2019 (VSC için 2015–2019) |
| **FCY altında tur ve pit** | VSC'de tur süresi ≈ %140, SC'de ≈ %160. FCY altında pit kaybı piste göre azalıyor (ör. Catalunya: normal 19.04 s, VSC 10.03 s, SC 7.88 s) | F1 TV kokpit videolarından ölçüm |

Makalenin önemli bir katkısı **"Safety Car Ghost" (SCG)** kavramı. Tur bazlı ayrıklaştırmada SC'nin her pilotu farklı turda etkileyebilmesi sorununu çözmek için her pilota yalnızca onun "gördüğü" sanal bir SC atanıyor. Pilot bu sanal SC'ye yetişince onu geçemiyor ve aralar kapanıyor. FCY fazları yarış ilerlemesine göre değil **yarış zamanına göre** tanımlanıyor; böylece tur bindirilmiş pilotlar da doğru anda etkileniyor.

**Raporlanan doğrulama sonuçları:**

- 2018 Çin GP'sinde SC fazında gerçek ve simüle edilmiş ara farkları görsel olarak "iyi uyum" gösteriyor (Şekil 10). Bu sonuç nicel bir hata metriği değil.
- 10.000 koşuda simüle edilen SC sayısı oranları gerçeğe çok yakın. 0/1/2/3 SC için gerçek değerler 0.455/0.413/0.099/0.033, simülasyonda 0.462/0.416/0.091/0.031. VSC'de fark biraz daha büyük, en fazla ±0.027.
- Yakınsama: Hamilton'ın ortalama pozisyonundaki %95 sapma 100 koşuda ±0.309, 10.000 koşuda ±0.029, 100.000 koşuda ±0.011. Yazarlar pratikte 10.000 koşuyu öneriyor.
- Ana mesaj: deterministik sonuç çoğu zaman en olası sonuç değil, "en hızlı" teorik strateji olasılıksal etkiler altında kırılgan olabiliyor.

### 3.3 Virtual Strategy Engineer (Applied Sciences 2020b)

**Temel strateji (MIQP):** Rakipsiz ve FCY'siz bir yarışta, lineer lastik modeli varsayımıyla, en kısa yarış süresini veren stint uzunlukları karma tamsayılı karesel program olarak çözülüyor (CVXPY / ECOS_BB). 22 hamur kombinasyonu (1–3 stop; iki farklı hamur kuralı uygulanmış) 55 turluk bir yarış için yaklaşık 150 ms'de çözülüyor. Kaba kuvvetle aynı iş yaklaşık 20 s sürüyor. Ek bir pit stopun seçilmesi için en az 2 s kazanç şartı konmuş.

**İki aşamalı karar yapısı:**

1. **Pit kararı ağı** (ikili sınıflandırma). Girdiler:
   - yarış ilerlemesi
   - lastik yaşı ilerlemesi (VSC'de %50, SC'de %75 yavaş artıyor)
   - lider/takipçi bilgisi
   - göreli hamur (S/M/H)
   - pist kategorisi (1–3, lastik zorlanması)
   - FCY durumu (0–4)
   - kalan pit stop sayısı
   - "arkamdaki pilot bir önceki turda lastik değiştirdi mi"
   - "önümdekine ≤1.5 s yakın mıyım"

   Mimari: 3×64 ReLU katmanlı ileri beslemeli ağ (FFNN), L2 = 0.0005, Nadam optimizer, sınıf ağırlığı 1:5, batch 256. Bu ağa 4 turluk diziler üzerinde eğitilen tek bir **LSTM nöronu** ekleniyor ve FFNN katmanları donduruluyor. Ortaya çıkan hibrit ağın F1 skorları:

   | Model | F1 skoru |
   |---|---|
   | Sadece FFNN | ≈ 0.35 |
   | Saf RNN | ≈ 0.90, ama kararları "anlaşılmaz" |
   | **Hibrit** | **≈ 0.59** |

   Filtrelenmiş tüm veride hibrit ağın karmaşıklık matrisi: 1855 doğru pit, 537 kaçırılmış pit, 2048 yanlış alarm, 57.836 doğru "pit yok". Yanlış alarmların çoğu pit kararını birkaç tur erken vermekten kaynaklanıyor.

2. **Hamur seçimi ağı** (3 sınıf). Girdiler: yarış ilerlemesi, kalan stop sayısı, mevcut hamur, pist, "ikinci hamur kuralı sağlandı mı", mevcut hamur sayısı (2 veya 3). Mimari: tek katman, 32 nöron. Test doğruluğu **≈ 0.77**.

**Eğitim verisi:** [TUMFTM/f1-timing-database](https://github.com/TUMFTM/f1-timing-database). Ergast verisinin üzerine hamur, FCY ve kaza/arıza bilgisi eklenmiş. Toplam 121 yarış, 131.527 tur ve 4.087 lastik değişimi var (turların %3.1'i, yani sınıflar çok dengesiz). Uygulanan filtreler: ıslak yarışlar, 3'ten fazla stop, son %10'daki stoplar ve ilk 10 dışında bitirenler çıkarılmış. Pit ağı için 62.276 tur, hamur ağı için 2.757 kayıt kalıyor. Hız için modeller TensorFlow Lite'a çevrilmiş. VSE açıkken bir koşu yaklaşık 200 ms sürüyor.

**Simülasyondaki sonuçlar (2019 Avusturya GP, 10.000 koşu, ortalama bitiş pozisyonu):**

| Senaryo | Hamilton (FCY kapalı) | Hamilton (rastgele FCY açık) |
|---|---|---|
| V1: herkes gerçek stratejisini kullanıyor | 3.4 | 3.5 |
| V2: HAM optimize temel strateji | 3.1 | 3.4 |
| V3: HAM'ı VSE yönetiyor | 2.9 | **2.7** |
| V5: herkesi VSE yönetiyor | 3.6 | 3.6 |

Hamilton o yarışı gerçekte 5. bitirdi. Simülasyonla aradaki farkın sebebi pit stopta ön kanat değişimi (yaklaşık +8 s), bu da modelde yok. Yazarlar sonuçların gerçek yarışla değil, yalnızca senaryolar arasında karşılaştırılabileceğini vurguluyor.

**RL taslağı (bölüm 6):** Yarışa özel eğitilen bir DQN ajanı, 2019 Çin GP'sinde rastgele seçilen pilotla 1000 koşuda ortalama **8.46**. pozisyona ulaşıyor; denetimli VSE'nin ortalaması **9.51**. Bu ajan repoda `reinforcement` tipi olarak yer alıyor.

---

## 4. Repo incelemesi: `TUMFTM/race-simulation`

### 4.1 Genel durum

| Özellik | Değer |
|---|---|
| Lisans | **LGPL-3.0** (kod). Veritabanı ayrı repoda ve CC BY-NC-SA 3.0 lisanslı |
| Yıldız / fork | 121 / 42 (21.10.2026) |
| Son commit | 2021-09-18 "Updated readme". Önceki anlamlı commit 2021-01-31 (parametre güncellemesi) |
| Arşivlenmiş mi | Hayır, ama fiilen bakımsız. Açık konular arasında "QNetwork cannot use save_weights()" (2024) ve yıllardır bekleyen dependabot PR'ları (TF 2.11, numpy 1.22) var |
| Dil ve ortam | Python 3.8 (Windows 10'da geliştirilmiş, Ubuntu'da test edilmiş). Yaklaşık 9.500 satır Python |
| Sabitlenmiş bağımlılıklar | numpy 1.18.4, pandas 1.0.4, scipy 1.4.1, matplotlib 3.2.1, cvxpy 1.1.7, tensorflow 2.2.0, tensorflow-probability 0.10.1, tf-agents 0.5.0 |

### 4.2 Mimari

```
race-simulation/
├── main_racesim.py            # tam yarış simülasyonu + MCS (kullanıcı ayarları dosyanın sonunda)
├── main_racesim_basic.py      # rakipsiz, en hızlı temel strateji (MIQP / brute force)
├── main_train_rl_agent_dqn.py # yarışa özel RL-VSE eğitimi (tf-agents DQN)
├── racesim/
│   ├── src/  race.py, driver.py, car.py, combustioncar.py, electriccar.py, tireset.py, track.py,
│   │         _race_montecarlo.py, _race_raceanalysis.py, mcs_analysis.py,
│   │         vse.py, vse_supervised.py, vse_reinforcement.py, vse_basestrategy.py, vse_realstrategy.py
│   └── input/
│       ├── parameters/  pars_<Pist>_<Yıl>.ini  (121 yarış) + pars_mcs.ini (olasılık parametreleri)
│       └── vse/         nn_supervised_*.tflite, preprocessor_*.pkl, nn_reinforcement_<Pist>_<Yıl>.tflite
├── racesim_basic/             # basit strateji optimizasyonu (cvxpy)
├── machine_learning/          # VSE ön işlemcisi
├── machine_learning_rl_training/  # RL ortamı (tek ve çok ajanlı)
└── helper_funcs/              # lastik aşınması, strateji kombinasyonları
```

Kod nesne yönelimli: Race → Driver → Car (yanmalı veya elektrikli) → Tireset. Elektrikli araç desteği (`energy`, `energy_perlap`, `t_pit_charge_perkwh`) ve yakıt ikmali (`t_pit_refuel_perkg`) de var, yani model F1'e kilitli değil.

### 4.3 Girdiler (parametre dosyaları)

Her `pars_<Pist>_<Yıl>.ini` dosyasında şu bölümler var:

- `RACE_PARS`: tur sayısı, DRS kuralları, katılımcılar
- `TRACK_PARS`: tur süresi tabanı, kütle hassasiyeti, normal/VSC/SC altında pit kayıpları, sollama eşikleri, SC/VSC çarpanları
- `CAR_PARS`: takım bazında `t_car`, yakıt, pit ek süresi, renk
- `DRIVER_PARS`
- `TIRESET_PARS`: pilot bazında aşınma modeli ve katsayıları
- `EVENT_PARS`: FCY fazları ve emeklilikler. `null` olursa olay yok, `[]` olursa rastgele üretilir, dolu liste olursa gerçek olaylar kullanılır
- `VSE_PARS`: mevcut hamurlar, pist kategorisi, temel ve gerçek strateji, pilot bazında VSE tipi

Dosyalar, Marcel Faist'in yüksek lisans tezinde geliştirilen bir araçla TUM veritabanından **otomatik olarak** üretilmiş. Hamurlar mutlak kodlarla tutuluyor (A1 en sert, A7 en yumuşak). Dikkat: bu kodlar Pirelli'nin C1–C6 adlandırmasıyla bire bir aynı değil, eşleştirme gerekiyor. `pars_mcs.ini` dosyasında sezon bazında kaza ve arıza olasılıkları, SC/VSC dağılımları, takım bazında Fisk parametreleri ve pilot bazında σ ile start performansı var.

### 4.4 Nasıl çalıştırılır

1. `pip install -r requirements.txt` (Python 3.8 ortamında).
2. `main_racesim.py` dosyasının sonunda `race_pars_file_` (ör. `pars_Spielberg_2019.ini`) ve `sim_opts_` ayarlanır: `use_prob_infl`, `create_rand_events`, `use_vse`, `no_sim_runs`, `no_workers`, `use_plot`.
3. `python main_racesim.py`. Tek koşuda tur süreleri, yarış süreleri ve pozisyonlar `racesim/output` altına CSV olarak yazılır. Çoklu koşuda pozisyon ve yarış süresi histogramları üretilir.
4. İstenirse önce `main_racesim_basic.py` ile temel strateji, sonra `main_train_rl_agent_dqn.py` ile RL-VSE eğitimi yapılır. Eğitimin çıktıları `racesim/input/vse` altına kopyalanır.

**Benim smoke testim (21.10.2026, Python 3.13.5, numpy/pandas/scipy/cvxpy güncel sürümler):**

- `main_racesim.py`, `pkg_resources.require()` ile birebir sabit sürümleri zorunlu tutuyor (tf-agents==0.5.0 bulunamadı). Ayrıca VSE kapalıyken bile `tensorflow` modül düzeyinde içe aktarılıyor. Bir sarmalayıcı betikle (repo dosyalarına dokunmadan) sürüm kontrolünü atladım, `tensorflow`'u boş bir modül olarak taklit ettim ve `setuptools<81` kurdum. Bundan sonra VSE'siz MCS sorunsuz çalıştı.
- `pars_Shanghai_2019.ini` gerçek olaylarla (1 VSC, 3 emeklilik) çalıştırıldığında 200 koşu 4 işçiyle 2.6 s sürdü.
- Olaylar rastgeleleştirildiğinde (`EVENT_PARS` = `[]`) 1000 koşu 12.2 s sürdü. Ortalama pozisyonlar BOT 2.7, HAM 3.1, VER 5.1, LEC 5.6, VET 6.2 çıktı. (Gerçek yarışı Hamilton kazanmıştı. Bu fark, parametre kestirimine ve pole pozisyonundaki Bottas'ın avantajına duyarlılığı gösteren iyi bir örnek.)
- VSE'nin (TF 2.2 ve TFLite) modern Python'da çalıştırılmasını test etmedim. TF 2.2 Python 3.8'den sonraki sürümleri desteklemiyor, bu yüzden VSE için ayrı bir Python 3.8 ortamı (ör. conda veya Docker) gerekir.

### 4.5 Veri kaynakları

- **Ergast API**, TUM veritabanının temeli. Ergast 2025 başında kapandı. Halefi, uyumlu uç noktalar sunan [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (`api.jolpi.ca/ergast/f1/`).
- DNF istatistikleri için **RaceFans**.
- Start performansı ve FCY altındaki pit kayıplarını ölçmek için **F1 TV kokpit videoları** (elle ölçüm).
- Hamur, FCY ve kaza bilgileri TUM tarafından elle veya yarı otomatik eklenmiş.

---

## 5. F1 sitesi için uygulama fikirleri

### 5.1 Doğrudan üretilebilecek içerikler

1. **Pit penceresi grafiği:** `racesim_basic` mantığıyla (lineer lastik modeli ve pit kaybı) "pit turu → toplam yarış süresi" eğrisi çizilir. VSE makalesindeki Şekil 1 ve 2 tam olarak bunu gösteriyor. Grafikte S→M ve S→H karşılaştırması ile "VSC 14–17. turlarda gelirse optimum tur kayar" senaryosu birlikte gösterilebilir. Tamamen istemci tarafında (JS) çalışabilecek kadar hafif bir hesap.
2. **Undercut ve overcut hesaplayıcı:** Kullanıcı iki pilot arasındaki farkı, taze ve eski lastik farkını (`k_0`, `k_1`), pit kaybını ve out-lap soğuk lastik cezasını girer. Araç undercut'ın tutup tutmayacağını tur tur gösterir.
3. **"Ya olsaydı?" Monte Carlo kartları:** "X 14. yerine 19. turda girseydi" gibi bir senaryo için 1.000–10.000 koşuluk bir **pozisyon dağılımı histogramı** gösterilir (2020a'daki Şekil 11 gibi). Kalıcı sayfalar için sonuçlar önceden hesaplanıp JSON olarak servis edilebilir.
4. **Yarış öncesi SC/VSC olasılık kutusu:** "Bu yarışta en az bir SC olasılığı ≈ %55" gibi bir bilgi (2014–2019 tablosu: 1 − 0.455). Hangi yarış dilimlerinin riskli olduğu da gösterilebilir; 1. tur %36. Güncel sezon verisiyle yeniden kestirilmesi şart.
5. **FCY altında "ucuz pit" tablosu:** Pist bazında normal, VSC ve SC pit kayıpları (ör. Catalunya 19.0 / 10.0 / 7.9 s). Canlı blog ve yarış analizi için çok kullanışlı.
6. **Strateji otopsisi:** Yarıştan sonra gerçek stratejiler "realstrategy" ile, alternatifler "basestrategy" ile simüle edilip "kaybedilen veya kazanılan pozisyon beklentisi" raporlanır.
7. **Lastik aşınma panosu:** Stint başına yakıt düzeltmeli tur süresine lineer veya karesel fit yapılır. `k_1` (s/tur) değerleri pilot, takım ve hamur bazında karşılaştırılır.

### 5.2 Güncel sezonlar için veri boru hattı (TUM `.ini` parametresi → kaynak)

| İhtiyaç | Önerilen kaynak |
|---|---|
| Tur süreleri, stint, hamur, lastik yaşı, pit in/out, track status (SC/VSC) | [FastF1](https://docs.fastf1.dev/) (Python; F1 live-timing arşivi) |
| Sonuçlar, grid, pit stop süreleri, tarihsel arşiv (1950'den bu yana) | [Jolpica-F1](https://github.com/jolpica/jolpica-f1) (Ergast-uyumlu; FastF1'in `Ergast` modülü artık otomatik olarak Jolpica kullanıyor) |
| Stintler, pit, race control mesajları, hava durumu (2023 ve sonrası), canlı veri | [OpenF1](https://openf1.org/) (geçmiş veri ücretsiz, canlı veri ücretli; **ticari olmayan kullanım** şartı) |
| Pist geometrisi (tur süresi simülasyonu ve görselleştirme) | [TUMFTM/racetrack-database](https://github.com/TUMFTM/racetrack-database) |

Kestirim adımları:

- `t_q`: sıralama verisinden.
- `t_gap_racepace`, `t_car`, `t_driver`, `k_0`, `k_1`: temiz turlara (ilk 2 tur, pit ve FCY turları çıkarılmış) karışık etkili regresyon veya stint bazlı fit.
- `t_lap_sens_mass`: literatür değeri (yaklaşık 0.03 s/kg) veya `laptime-simulation` ile.
- Pit kayıpları: in-lap ve out-lap ile medyan tur arasındaki farktan.
- SC/VSC olasılıkları: race control mesajlarından.

### 5.3 Dikkat edilmesi gerekenler

- **Lisans:** Kod LGPL-3.0, yani site arka ucunda kullanmak serbest; değişiklikler kütüphane düzeyinde paylaşılmalı. Ancak **TUM F1 veritabanı CC BY-NC-SA 3.0**, OpenF1 ise ticari olmayan kullanım için. Reklam veya abonelik geliri olan bir site "ticari" sayılabilir. Parametre dosyaları bu veritabanından türetildiği için onların da NC kapsamında olup olmadığı belirsiz. Hukuki teyit önerilir.
- **Kural değişiklikleri:** Parametreler 2014–2019 hibrit dönemine ait. 2022 yer etkisi dönemi ve özellikle 2026 kuralları (yeni güç ünitesi, aktif aerodinamik, DRS'in yerine geçen yeni sollama yardımı) DRS, yakıt kütlesi ve sollama parametrelerinin baştan kalibre edilmesini gerektirir. Bu noktada modelin yapısı korunabilir, ama sayıların hiçbiri doğrudan taşınamaz.
- **Hesaplama:** Python MCS, sunucuda arka plan işi olarak (cron veya kuyruk) rahatça çalışır. Gerçek zamanlı web etkileşimi için temel model JS veya WASM'a taşınabilir ya da önceden hesaplanmış senaryo ızgaraları kullanılabilir. Heilmeier'in Rust ile yazdığı zaman-ayrık simülatörü de alternatif bir başlangıç noktası.
- **Sunum:** Sonuçları "tahmin" olarak değil "model senaryosu" olarak etiketlemek gerekiyor. Yazarlar da simülasyonun gerçek yarışı birebir üretemeyeceğini açıkça söylüyor.

---

## 6. Sınırlılıklar ve eleştiriler

**Yazarların kendi belirttikleri:**

- Tur bazlı ayrıklaştırma yüzünden SC sonunda tur bindirilmiş araçların turunu geri alması simüle edilemiyor. SC liderin önünde değil, belirli bir yarış zamanında başlıyor.
- Her SC tek bir kazaya ve tek bir pilota bağlanıyor. Hasar alıp yarışa devam eden araçlar modellenmiyor.
- SC ve VSC altında aşınma ve tüketim çarpanları (0.25 ve 0.5) veriden değil tahmine dayanıyor.
- Temel strateji optimizasyonu rakipsiz bir pist, lineer aşınma ve aşınmanın kütleden bağımsız olduğu varsayımlarına dayanıyor. Sonuç lastik parametrelerine çok duyarlı ve FCY olduğunda avantajı kayboluyor.
- VSE tüm veritabanı üzerinde "ortalama" kararlar öğreniyor. Gerçek takımların hataları da eğitim verisinde. Kamuya açık veriyle tur süresi kaybının lastikten mi yoksa motor modundan mı geldiği ayırt edilemiyor. Undercut'ı aktif olarak kullanmayı öğrenemedi. Oyun teorisi boyutu eksik. Islak koşullar kapsam dışında. Pit kararı ile hamur seçiminin ayrı ağlarda olması stint uzunluklarını bozabiliyor.
- RL-VSE simülasyonun ve parametre kestiriminin hatalarını da öğreniyor. Repodaki önceden eğitilmiş RL ağlarının karar davranışı yazarlarca "kontrol edilmedi; suboptimal olabilir" diye işaretlenmiş.

**Benim gözlemlerim:**

- Doğrulama büyük ölçüde nitel: tek yarışta görsel ara farkı uyumu ve SC frekanslarının tutarlılığı. Yarış genelinde nicel bir doğruluk ölçütü yayınlanmamış, örneğin çok sayıda yarışta bitiş pozisyonu MAE'si veya tur süresi RMSE'si.
- Sollama modeli deterministik bir eşiğe dayanıyor (1.5 s ve hız düzeltmesi). Pist bazında bu eşik kaba kalıyor.
- Pist evrimi, sıcaklık ve yakıt-lastik etkileşimi modellenmiyor. "Cliff" gibi doğrusal olmayan aşınma desteklenen modellerle kısmen karşılanabilir, ama otomatik parametre üretimi lineer modeli kullanıyor.
- Yazılım tarafında: bağımlılıklar 2020'ye sabitlenmiş, TF içe aktarımı VSE kapalıyken bile zorunlu, `pkg_resources` kullanılıyor (setuptools ≥81'de kaldırılmış) ve CI yok.

**İkincil literatür:** Rohan ve Farhan (2026), 2023 OpenF1 verisiyle yedi pistte literatürdeki lineer aşınma varsayımını parçalı ("cliff") modelle test ediyor. Özete göre BIC parçalı modeli genel olarak tercih etmiyor. Thomas ve arkadaşları (2026), mevcut yaklaşımların çok ajanlı etkileşimleri yeterince yakalamadığını savunup RL ile pit stratejisi öneriyor.

---

## 7. Bu çalışmalara atıf yapan takip literatürü (seçki)

Kaynak: OpenAlex atıf indeksi (21.10.2026). Toplam atıf sayıları, aynı tarihte:

| Makale | Crossref | OpenAlex | Semantic Scholar |
|---|---|---|---|
| ITSC 2018 | 22 | 26 | 31 |
| MCS 2020 | 17 | 19 | – |
| VSE 2020 | 24 | 26 | – |

Aşağıdaki kayıtların başlık, yazar, yıl ve yayın yeri bilgilerini OpenAlex ve DOI ile doğruladım. Açıklamalar özetlerden alındı; tam metinleri okumadım.

| Yıl | Başlık | Yazarlar | Yayın yeri | Link |
|---|---|---|---|---|
| 2021 | Formula-E race strategy development using distributed policy gradient reinforcement learning | X. Liu, A. Fotouhi, D. J. Auger | *Knowledge-Based Systems* | [doi](https://doi.org/10.1016/j.knosys.2021.106781) |
| 2021 | Optimal adaptive race strategy for a Formula-E car | P. G. Anselma | *Proc. IMechE Part D* | [doi](https://doi.org/10.1177/09544070211047343) |
| 2022 | On the optimization of pit stop strategies via dynamic programming | O. F. Carrasco Heine, C. Thraves | *Central European J. of Operations Research* | [doi](https://doi.org/10.1007/s10100-022-00806-4) |
| 2022 | The Use of Simulation with Machine Learning and Optimization for a Digital Twin – A Case on Formula 1 DSS | A. Greasley, G. Panchal, A. Samvedi | Winter Simulation Conference | [doi](https://doi.org/10.1109/WSC57314.2022.10015299) |
| 2022 | Competitors-Aware Stochastic Lap Strategy Optimisation for Race Hybrid Vehicles | L. Paparusso, M. Riani, F. Ruggeri, F. Braghin vd. | *IEEE Trans. Vehicular Technology* | [doi](https://doi.org/10.1109/TVT.2022.3215171) |
| 2022 | Autonomous Vehicles on the Edge: A Survey on Autonomous Vehicle Racing | J. Betz, H. Zheng, A. Liniger, U. Rosolia vd. | *IEEE Open J. of ITS* | [doi](https://doi.org/10.1109/OJITS.2022.3181510) |
| 2023 | Minimum-Race-Time Energy Allocation Strategies for the Hybrid-Electric Formula 1 Power Unit | P. Duhr, D. Buccheri, C. Balerna, A. Cerofolini vd. | *IEEE Trans. Vehicular Technology* | [doi](https://doi.org/10.1109/TVT.2023.3237388) |
| 2024 | Optimizing pit stop strategies in Formula 1 with dynamic programming and game theory | F. Aguad, C. Thraves | *European J. of Operational Research* | [doi](https://doi.org/10.1016/j.ejor.2024.07.011) |
| 2024 | Formula-E Multi-Car Race Strategy Development – A Novel Approach Using Reinforcement Learning | X. Liu, A. Fotouhi, D. J. Auger | *IEEE Trans. ITS* | [doi](https://doi.org/10.1109/TITS.2024.3389155) |
| 2024 | On the Co-Design of Components and Racing Strategies in Formula 1 | M.-P. Neumann, G. Zardini, A. Cerofolini, C. H. Onder | IEEE Intelligent Vehicles Symposium | [doi](https://doi.org/10.1109/IV55156.2024.10588533) |
| 2025 | AutoF1: An RNN-Based Approach to Simulating Strategic Decision-Making in Formula 1 (FastF1 verisiyle) | V. Mistry, W. A. P. Smith | IEEE ITSC 2025 | [doi](https://doi.org/10.1109/ITSC60802.2025.11423678) |
| 2025 | Data-driven pit stop decision support for Formula 1 using deep learning models | A. N. Sasikumar, A. Anny Leema, P. Balakrishnan | *Frontiers in AI* | [doi](https://doi.org/10.3389/frai.2025.1673148) |
| 2026 | Race Strategy Reinforcement Learning: Optimising Pitstop Strategy with Emergent Tactics in Formula One | D. Thomas, J. Jiang, A. Kori, A. Russo vd. | *Machine Learning* (Springer) | [doi](https://doi.org/10.1007/s10994-026-07081-3) |
| 2026 | A simulation framework for Formula 1 race strategy based on pit-stop optimization | P. Avella, M. Borruso, M. Marino, A. Masone | *Simulation Modelling Practice and Theory* | [doi](https://doi.org/10.1016/j.simpat.2026.103341) |
| 2026 | When does piecewise tire degradation modeling outperform linear models in F1 race strategy? … OpenF1 2023 telemetry … | M. H. Rohan, M. H. Farhan | *Proc. IMechE Part P (Sports Eng. & Tech.)* | [doi](https://doi.org/10.1177/17543371261495643) |

Site açısından en ilgili olanlar şunlar:

- **Aguad & Thraves (2024):** dinamik programlama ve oyun teorisi ile rakip etkileşimi. Heilmeier'in "oyun teorisi eksik" eleştirisine doğrudan cevap veriyor.
- **Thomas ve arkadaşları (2026):** RL ile ortaya çıkan taktikler.
- **Mistry & Smith (2025):** FastF1 verisiyle RNN tabanlı strateji simülasyonu. Güncel veriyle VSE benzeri bir yaklaşım.
- **Rohan & Farhan (2026):** OpenF1 ile lastik aşınma modeli seçimi.

---

## 8. Kaynakça

1. Heilmeier, A.; Graf, M.; Lienkamp, M. (2018). *A Race Simulation for Strategy Decisions in Circuit Motorsports.* 2018 21st International Conference on Intelligent Transportation Systems (ITSC), Maui, s. 2986–2993. [https://doi.org/10.1109/ITSC.2018.8570012](https://doi.org/10.1109/ITSC.2018.8570012)
2. Heilmeier, A.; Graf, M.; Betz, J.; Lienkamp, M. (2020). *Application of Monte Carlo Methods to Consider Probabilistic Effects in a Race Simulation for Circuit Motorsport.* Applied Sciences 10(12), 4229. [https://doi.org/10.3390/app10124229](https://doi.org/10.3390/app10124229). Erratum: [https://doi.org/10.3390/app10175745](https://doi.org/10.3390/app10175745)
3. Heilmeier, A.; Thomaser, A.; Graf, M.; Betz, J. (2020). *Virtual Strategy Engineer: Using Artificial Neural Networks for Making Race Strategy Decisions in Circuit Motorsport.* Applied Sciences 10(21), 7805. [https://doi.org/10.3390/app10217805](https://doi.org/10.3390/app10217805)
4. Heilmeier, A.; Geisslinger, M.; Betz, J. (2019). *A Quasi-Steady-State Lap Time Simulation for Electrified Race Cars.* 2019 14th Int. Conf. on Ecological Vehicles and Renewable Energies (EVER). [https://doi.org/10.1109/EVER.2019.8813646](https://doi.org/10.1109/EVER.2019.8813646)
5. Heilmeier, A.; Wischnewski, A.; Hermansdorfer, L.; Betz, J.; Lienkamp, M.; Lohmann, B. (2020). *Minimum curvature trajectory planning and control for an autonomous race car.* Vehicle System Dynamics 58(10), 1497–1527. [https://doi.org/10.1080/00423114.2019.1631455](https://doi.org/10.1080/00423114.2019.1631455)
6. Heilmeier, A. M. (2022). *Simulation of Circuit Races for the Objective Evaluation of Race Strategy Decisions.* Doktora tezi, TU München. [https://mediatum.ub.tum.de/1647512](https://mediatum.ub.tum.de/1647512)
7. Herrmann, T.; Christ, F.; Betz, J.; Lienkamp, M. (2019). *Energy Management Strategy for an Autonomous Electric Racecar using Optimal Control.* IEEE ITSC 2019. [https://doi.org/10.1109/ITSC.2019.8917154](https://doi.org/10.1109/ITSC.2019.8917154)
8. Herrmann, T.; Passigato, F.; Betz, J.; Lienkamp, M. (2020). *Minimum Race-Time Planning-Strategy for an Autonomous Electric Racecar.* IEEE ITSC 2020. [https://doi.org/10.1109/ITSC45102.2020.9294681](https://doi.org/10.1109/ITSC45102.2020.9294681)
9. TUMFTM. *race-simulation* (GitHub, LGPL-3.0). [https://github.com/TUMFTM/race-simulation](https://github.com/TUMFTM/race-simulation)
10. TUMFTM. *f1-timing-database* (GitHub, CC BY-NC-SA 3.0). [https://github.com/TUMFTM/f1-timing-database](https://github.com/TUMFTM/f1-timing-database)
11. TUMFTM. *laptime-simulation*, *global_racetrajectory_optimization*, *racetrack-database* (GitHub). [https://github.com/TUMFTM](https://github.com/TUMFTM)
12. Heilmeier, A. *time-discrete-race-simulator* (GitHub, Rust, Apache-2.0). [https://github.com/heilmeiera/time-discrete-race-simulator](https://github.com/heilmeiera/time-discrete-race-simulator)
13. FastF1 belgeleri: Jolpica-F1 API arayüzü. [https://docs.fastf1.dev/api_reference/jolpica.html](https://docs.fastf1.dev/api_reference/jolpica.html)
14. Jolpica-F1. [https://github.com/jolpica/jolpica-f1](https://github.com/jolpica/jolpica-f1)
15. OpenF1. [https://openf1.org/](https://openf1.org/)
16. Bölüm 7'deki takip çalışmaları (DOI bağlantıları tabloda).

---

## Ek: Doğrulanamayanlar ve notlar

- **ITSC 2018 tam metni:** IEEE ücretli olduğu ve mediaTUM'daki kopyaya otomatik erişimim başarısız olduğu için tam metni okuyamadım. Bu makaleye ait ayrıntıları özetten (Semantic Scholar), 2020 makalelerindeki özetten ve kodun kendisinden aldım. Örneğin 2017 Abu Dabi GP'si doğrulamasının nicel hata değerlerini doğrulayamadım.
- **Erratum (doi:10.3390/app10175745):** Var olduğunu doğruladım, içeriğini okumadım. 2020a'dan aktardığım sayılar MDPI'deki güncel HTML sürümünden.
- **Doktora tezi:** PDF indirmesi engellendi. Bilgiler mediaTUM kayıt sayfasından ve arama özetinden alındı.
- **Heilmeier'e ait bir Formula E enerji stratejisi makalesi bulamadım.** TUM'daki ilgili çalışmalar Herrmann ve arkadaşlarına ait ve otonom elektrikli yarış aracı üzerine.
- **Takip literatürü:** Bölüm 7'deki çalışmaların yalnızca meta verilerini (ve bazılarının özetlerini) doğruladım, tam metinlerini okumadım.
- **Yıldız sayıları ve tarihler:** GitHub API'den 21.10.2026 tarihinde alındı ve değişebilir. `laptime-simulation` için repo `pushed_at` değeri 2026-04-13, ama varsayılan daldaki son commit 2021-12-31. Aradaki farkın nedenini (başka bir dal veya PR) incelemedim.
- **VSE'nin modern Python'da çalışması** test edilmedi. Yalnızca VSE'siz MCS yolu test edildi.
- **2026 kuralları** (DRS'in kaldırılması, aktif aerodinamik) hakkındaki ifadeler genel bilgiye dayanıyor. Bu rapor için ayrıca resmî kaynaktan kontrol edilmedi.
