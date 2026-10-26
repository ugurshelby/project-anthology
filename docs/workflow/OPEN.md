# OPEN

Builder appends blocked decisions. `To:` says who answers: `Opus` (Architect answers into `DECISIONS.md` and removes the entry), `Sonnet` or `Haiku` (a Builder session must redo or check something), `Owner` (only when the step cannot continue without the owner; owner questions that do not block a step stay in the final report).

<!-- Entry format
## <short title>
- To: Opus | Sonnet | Haiku | Owner
- Step: PLAN.md / master-plan step number
- What / why blocked:
- Options:
- Builder's lean:
-->

## R18 quali gecesi ölçülmedi; Jolpica gecikmesi > 13 sa
- To: Opus
- Step: PLAN.md Session F (1.1, 1.7, 1.9 quali; Jolpica taban çizgisi), master-plan 1.10
- What / why blocked: 10-24/25 gecesi Builder oturumu çalışmadı (makine uyudu ya da uygulama kapandı); quali için canlı `/api/live-timing`, ham OpenF1 401 ve kilit açılma dakikası (1.9) yakalanamadı, yalnız yarışta tekrarlanabilir. Geri kurulan: 1.4 quali satırı 20:30:04Z, tetikleyici QStash. Jolpica R18 qualifying 11:00Z'de hâlâ `total: 0` (bitişten ~13 sa), bu 1.10 için gecikme tabanı olarak > 13 sa anlamına gelir. Ayrıntı: `logs/2026-10-25.md`.
- Options: (a) quali eksikliğini kabul et, yarışta ölç; (b) yarış gecesi keep-awake'e güvenme, ikinci bir yedek oturum kur; (c) 1.10'un varsayımını Jolpica yerine OpenF1 kaynağına göre yeniden değerlendir. (d) R19 Meksika quali gecesini (Cmt 2026-10-31 21:00Z, TR Paz 00:00) tekrar ölç: 1.1/1.7 quali canlı ve 1.9 quali kilit açılma dakikası, yeni bir Sonnet Session F kopyasıyla (quali 21:00–22:00Z; yarış 11-01 20:00Z).
- Builder's lean: (a) + (d) yalnızca R18 yarışı kilit ölçümünü de kaçırırsa; yarış gecesi makine uyanık ve fişte; 1.10 kararı yarış sonrası Jolpica gecikmesi de ölçülünce.

## 1.3 idempotency ölçütü: yeniden yazma due+24 sa'e kadar sürüyor
- To: Opus
- Step: PLAN.md Session F 1.3; master-plan 1.1, 1.3
- What / why blocked: 2026-10-26 00:37Z ölçümünde R18 `results` (id 64500) ve `pitstops` (id 64504) satırlarının `fetched_at` değeri her QStash tikinde yenilendi (23:30:04Z → 00:30:07Z; 23:30:06Z → 00:30:09Z). Kod bir satırı due+24 sa (`SNAPSHOT_SETTLE_AFTER_MS`) dolmadan "settled" saymıyor (results/pitstops 22:30Z 10-26, standings 23:00Z 10-26); quali satırı (id 64481) settle'dan sonra sabit kaldı. Yani rehberdeki "ardışık iki tikte değişmedi" ölçütü bu pencerede karşılanamaz; içerik hash'i önceki tikte alınmadığı için yeniden yazmanın içeriği değiştirip değiştirmediği bilinmiyor. Mevcut md5(data) değerleri: results 90cfe7645b96dcbdca61b9e732e2a5da, pitstops 936352b791b739a4887b04f583d76364, quali 62a1a2ef9c9f3d911846249d2a9068ef (`logs/2026-10-26.md`).
- Options: (a) ölçütü "settle eşiğinden sonra iki ardışık tikte değişmedi" olarak değiştir ve 10-26 23:30Z sonrası bir Sonnet oturumuna ölç; (b) yeniden yazmayı tasarım gereği kabul edip 1.3'ün idempotency ölçütünü içerik hash'ine (aynı md5 = aynı içerik) çevir; (c) 1.3'ü R19'a taşı.
- Builder's lean: (a), çünkü kod davranışı (settle) açık ve ölçülebilir; (b) ile birleştirilebilir (md5 karşılaştırması ucuz).

## QStash error/retry 64 / 3 gün atfedilmemiş (1.6 kapısı)
- To: Opus
- Step: master-plan 1.6 (kapı: QStash `sync-f1` hafta sonu SUCCESS)
- What / why blocked: `qstash_get_stats` (eu, 3d, 2026-10-25T23:37Z): `failed` 0, `canceled` 0, `dlq_message_count` 0; `error` ve `retry` serilerinde toplam 64, 2026-10-23T23:37Z'den beri neredeyse her ~72 dk'lık kovada 1 adet. Hangi zamanlamanın (sync-f1, sync-news, sync-media, notify-sessions) hata verdiği istatistikten okunamıyor; `sync-f1`'in 22:30/23:00/23:30/00:00/00:30Z tikleri 200 ama tüm hafta sonu tikleri tek tek doğrulanmadı.
- Options: (a) `logs_list` sayfalayarak RETRY/ERROR durumlarını zamanlamaya göre say; (b) yalnız yarış penceresindeki tikleri (10-24 20:00Z → 10-26 01:00Z) say; (c) 1.6 kapısını "failed 0 ve dlq 0" olarak gevşet.
- Builder's lean: (b) ile başla (maliyeti düşük); tekrar eden 1/saat örüntüsü saatlik bir zamanlamaya (sync-news `11 *` veya sync-media `41 *`) benziyor, ama bu tahmindir, ölçülmedi.

## Quali satırı settle'da yerinde yeniden yazıldı
- To: Opus
- Step: PLAN.md Session F 1.3
- What / why blocked: R18 `qualifying` (id 64481) `fetched_at` 20:00:06.302Z'den 22:30:03.716Z'ye yerinde güncellendi (due 22:30Z 10-24 + 24 sa = 22:30Z 10-25, yani settle eşiği); sonraki tiklerde değişmedi. Zamanlama koddaki settle mantığıyla uyumlu, ayrıca doğrulanmadı.
- Options: (a) beklenen davranış olarak kabul et, karar gerekmez; (b) settle çekimini bir testle sabitle.
- Builder's lean: (a).

## OpenF1 kilit açılma süresi (1.10 girdisi)
- To: Opus
- Step: master-plan 1.10 (beklenen gecikme)
- What / why blocked: Yarış `date_end` 22:00:00Z; son 401 22:27:16Z, ilk 200 22:32:16Z (27,3–32,3 dk, 60 dk eşiğinin altında, karar gerekmez); `session_result` 22 satır. OpenF1 `results` geçici satırı `sync-f1` 22:30:09.8Z'de yazıldı (bitişten 30 dk 10 sn). Quali kilit süresi canlı ölçülmedi (tek veri noktası yarış).
- Options: (a) 1.10'un beklenen gecikmesini ~30 dk al; (b) R19'da quali için ikinci bir ölçüm al.
- Builder's lean: (a), (b) ucuzsa.
