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
