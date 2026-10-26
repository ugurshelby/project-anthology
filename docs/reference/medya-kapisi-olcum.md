# Medya ve haber kapısı (Faz 8): ölçüm yöntemi

Last verified: 2026-10-26 (8.0, Opus Architect). Ölçütler: `docs/plans/master-plan.md` Faz 8 (K1–K6). Bu dosya 8.13 yeniden ölçümünün aynı yöntemle yapılması içindir; kapı PASS olunca silinir. Hepsi read-only: SQL yalnızca `SELECT` (project-scoped `supabase` MCP), cron çağrısı yok, gizli değer yok.

## K1 Eksiksiz: 2018 → bugün evren farkı

Sayfaların istediği her kimlik (Jolpica ve F1DB snapshot'ları), okuma katmanının (`lib/media/read.ts`) eşlemesiyle aynı kuralla (`entity_key` ya da `aliases`, tire/alt çizgi varyantı) çözülmüş bir satıra eşleniyor mu. Sonuç satırı = görsel gösteremeyen kimlik; `hit` boşsa alias boşluğu, doluysa kaynak boşluğu (`missing`/`rejected`).

```sql
with s as (select season, data from f1_snapshots where type in ('standings_drivers','standings_constructors') and season between 2018 and 2026),
d as (select distinct jsonb_path_query(data, 'strict $.**.Driver.driverId') #>> '{}' k from s),
t as (select distinct season, jsonb_path_query(data, 'strict $.**.Constructor.constructorId') #>> '{}' k from s),
c as (select distinct jsonb_path_query(data, 'strict $.**.Circuit.circuitId') #>> '{}' k from f1_snapshots where type='calendar' and season between 2018 and 2026),
v as (select 'driver' ty, k, array[k, replace(k,'-','_'), replace(k,'_','-')] vs from d
  union all select 'team', k, array[k, replace(k,'-','_'), replace(k,'_','-')] from (select distinct k from t) x
  union all select 'car', k||':'||season, array[k||':'||season, replace(k,'-','_')||':'||season, replace(k,'_','-')||':'||season] from t
  union all select 'circuit', k, array[k, replace(k,'-','_'), replace(k,'_','-')] from c)
select v.ty, v.k, (select string_agg(m.entity_key||'='||m.status||'/'||m.review, ';') from media_assets m where m.entity_type=v.ty and (m.entity_key = any(v.vs) or m.aliases && v.vs)) hit
from v where not exists (select 1 from media_assets m where m.entity_type=v.ty and (m.entity_key = any(v.vs) or m.aliases && v.vs) and m.status='resolved' and m.review<>'rejected')
order by 1,2;
```

Haber: `select s->>'name' src, count(*) total, count(*) filter (where n.image_url is null) no_img from news_stories n, lateral (select n.sources->0 s) x group by 1;` Hikâye: `grep -c "status: 'unverified'" data/stories/image-credits.ts`.

## K2 Hızlı ve K3 Placeholder yok: tarayıcı taraması

16 sayfa: `scripts/capture-screenshots.ts` `PAGES`. Yerleşik tarayıcı paneli **görünür** olmalı (gizliyken LCP gelmez, lazy görseller yüklenmez); `resize_window` `mobile` (375×812, DPR 2), her sayfada `navigate`, 4 sn bekle, aşağıdaki betik. LCP süresi bu yöntemde K2 sayısı değildir (yavaşlatma yok); K2 süresi 8.12 Lighthouse workflow'undan okunur. Bu betik yapıyı ölçer: LCP öğesi, `fetchpriority`, `loading`, gerçek dosya genişliği, CLS, kırık görsel, yer tutucu.

```js
const K = async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const obs = (type) => new Promise(res => { const out = []; try { const po = new PerformanceObserver(l => out.push(...l.getEntries())); po.observe({ type, buffered: true }); setTimeout(() => { po.disconnect(); res(out); }, 300); } catch { res([]); } });
  const clsOf = (es) => { let cls = 0, win = 0, prev = 0, start = 0; for (const e of es) { if (e.hadRecentInput) continue; if (e.startTime - prev > 1000 || e.startTime - start > 5000) { win = 0; start = e.startTime; } win += e.value; prev = e.startTime; cls = Math.max(cls, win); } return +cls.toFixed(3); };
  const short = (u) => (u || '').replace(/^https?:\/\/[^/]+/, '').split('/').slice(-3).join('/').slice(0, 64);
  // naturalWidth is density-corrected when srcset is used: read the real file width from a fresh Image().
  const realW = (u) => new Promise(res => { if (!u) return res(0); const im = new Image(); im.onload = () => res(im.naturalWidth); im.onerror = () => res(0); im.src = u; setTimeout(() => res(-1), 8000); });
  const info = async (i) => { const r = i.getBoundingClientRect(); return { src: short(i.currentSrc || i.src), cssW: Math.round(r.width), need: Math.round(r.width * devicePixelRatio), srcW: await realW(i.currentSrc || i.src), sizes: i.getAttribute('sizes'), fp: i.getAttribute('fetchpriority'), loading: i.getAttribute('loading') }; };
  const lcpE = await obs('largest-contentful-paint');
  const last = lcpE.at(-1); const el = last?.element; const img = el && el.tagName === 'IMG' ? el : null;
  const lcp = last ? { t: Math.round(last.startTime), tag: el?.tagName, ...(img ? await info(img) : { text: (el?.textContent || '').trim().slice(0, 40) }) } : null;
  for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await sleep(300); }
  await sleep(2500);
  const cls = clsOf(await obs('layout-shift'));
  window.scrollTo(0, 0);
  const imgs = [...document.images];
  const broken = imgs.filter(i => i.complete && i.naturalWidth === 0 && (i.currentSrc || i.getAttribute('src'))).map(i => (i.currentSrc || i.src).slice(0, 110));
  const shown = await Promise.all(imgs.filter(i => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width >= 80).map(info));
  const under = shown.filter(o => o.srcW < o.need * 0.75).map(o => `${o.cssW}css need${o.need} got${o.srcW} ${o.src}`);
  // Placeholders: role=img boxes with no <img> inside (aria-busy = still loading, not counted). Read the labels: charts can match too.
  const ph = [...document.querySelectorAll('div[role=img]:not([aria-busy])')].filter(d => !d.querySelector('img') && d.getBoundingClientRect().width > 0).map(d => d.getAttribute('aria-label')).filter(Boolean);
  return JSON.stringify({ p: location.pathname, vis: document.visibilityState, lcp, cls, imgs: imgs.length, broken, pendingN: imgs.filter(i => !i.complete).length, under, ph });
};
await K()
```

`ph` etiketi "takım işareti" / "team mark" ile biten öğeler tasarlanmış takım işaretidir (sahip kararı 2026-10-27, 8.11), yer tutucu sayılmaz. `pendingN` > 0 ise o görsellerin görünür olup olmadığına bakılır (gizli yuva, kapalı sekme); görünür ve yüklenmemişse kırık sayılır. Önbellek başlıkları: `curl -s -o /dev/null -D - <url> | grep -iE "^(cache-control|x-vercel-cache):"`.

## K4 Güvenli fallback

`tests/` altında çözümleyici kademeleri (`media-resolve-stages`, `media-sync`, `media-read`) ve çalışma anı yükleme hatası (`grep -ln "error" tests/media-components.test.ts` içinde `MediaAssetView`/`ApexImage` hata olayı) testlerinin adları listelenir; her kademe için en az bir test.

## K5 Güvenli otomatik güncelleme

Upstash MCP `logs_list` (`service: qstash`, `region: eu`, `count: 1000`), `cursor` ile en eski olay 7 günü geçene kadar. Çıktı dosyaya düşer; özet Node ile: yol başına `state` + `responseStatus` sayıları, mesaj başına DELIVERED var mı, ardışık DELIVERED arası en büyük boşluk (beklenen ≤ 65 dk). Lisans: `select entity_type, count(*) filter (where license is null or license='') , count(*) filter (where attribution is null or attribution='') from media_assets where status='resolved' group by 1;` (`license_url` boşluğu yalnızca `Public domain` satırlarında kabul).

## K6 Yeni kaynak

`select entity_type, entity_key, created_at, resolved_at, status from media_assets where created_at > '<son ölçüm>' order by created_at;` → `resolved_at - created_at` ≤ 24 sa. Haber: görsel etiketi taşımayan kaynağın son 7 gündeki öğelerinde görsel (yayıncı ya da lisanslı yedek) oranı.
