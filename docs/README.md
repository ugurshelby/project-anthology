# Docs — Dizin Rehberi

Bu klasör proje dokümantasyonunun tek giriş noktasıdır. Agent ve geliştirici önce buradan başlamalıdır.

## Hızlı başlangıç

| Ne yapıyorsun? | Oku |
|---|---|
| Projede dosya arıyorsun / yeni kod yazıyorsun | [`reference/proje-dizini.md`](reference/proje-dizini.md) |
| Frontend / UI | [`reference/apex-design-system.md`](reference/apex-design-system.md) + `.cursor/rules/design-rules.md` |
| Asset pipeline, sezon görseli ekleme | [`reference/ASSETS.md`](reference/ASSETS.md) |
| Geçmiş hatalar, tuzaklar | [`reference/PROJECT_LESSONS_AND_ROADMAP.md`](reference/PROJECT_LESSONS_AND_ROADMAP.md) |
| Aktif yol haritası, fazlar | [`plans/APEX_MASTER_PLAN.md`](plans/APEX_MASTER_PLAN.md) |

## Klasör yapısı

```
docs/
├── README.md              ← bu dosya
├── reference/             ← güncel, aktif referanslar (agent kuralları burayı işaret eder)
├── guides/                ← özellik spesifikasyonları ve kurulum talimatları
├── plans/
│   ├── APEX_MASTER_PLAN.md    ← tek aktif master plan
│   └── completed/             ← uygulanmış faz / sprint planları
└── archive/               ← yerini alan veya tamamlanmış eski dokümanlar
    ├── council/               ← 2026-06 council tarama raporları
    ├── plans/                 ← eski master plan kopyası
    └── YOL_HARITASI.md        ← APEX_MASTER_PLAN ile değiştirildi
```

## `reference/` — Aktif referanslar

- **proje-dizini.md** — Kök dizin haritası ve mimari katmanlar
- **apex-design-system.md** — UI token'ları, tipografi, bileşen kuralları
- **ASSETS.md** — Görsel pipeline, public layout, entity asset ekleme
- **PROJECT_LESSONS_AND_ROADMAP.md** — Tekrarlanmaması gereken hatalar ve mimari kararlar

## `guides/` — Spesifikasyonlar

- **design-anayasa.md** — Tasarım ilkeleri (frontend anayasa)
- **weather-widget.md** — Hava durumu bileşeni entegrasyon brief'i
- **test-prosedürü-kurulum.md** — Playwright + Lighthouse CI kurulum talebi

## `plans/completed/` — Uygulanmış planlar

Arşiv amaçlı saklanır; yeni iş için `plans/APEX_MASTER_PLAN.md` kullanılır.

| Dosya | Faz | Durum |
|---|---|---|
| PLAN_COUNCIL_FINAL_2026-06-11.md | Council sprint | ✅ Uygulandı |
| PLAN_FAZ0_LAUNCH_2026-06-12.md | Faz 0 — Launch | ✅ Uygulandı |
| PLAN_FAZ3_PROFILE_PAGES_2026-06-13.md | Faz 3 — Profil sayfaları | ✅ Uygulandı |

## `archive/` — Tarihsel

Bu dosyalar bağlam için duruyor; günlük geliştirmede okunması gerekmez.

- **council/** — Güvenlik, SEO, performans vb. bağımsız tarama raporları (2026-06-11)
- **YOL_HARITASI.md** — Kullanıcı odaklı eski yol haritası; `APEX_MASTER_PLAN` ile birleştirildi
