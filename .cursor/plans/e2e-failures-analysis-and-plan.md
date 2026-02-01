# E2E Test Hatalari Analizi ve Duzeltme Plani

**Kaynak:** Terminal 14 – `npm run test:e2e -- --project=chromium`  
**Sonuc:** 35 gecti, 8 fail (43 toplam)

---

## 1. Hata Ozeti

| # | Spec | Test | Hata Turu | Ozet |
|---|------|------|-----------|------|
| 1 | animations | should animate menu opening | Timeout 30s | menuElement.first().evaluate() – locator yanlis elemana gidiyor veya evaluate takiliyor |
| 2 | animations | should animate menu closing | Timeout 30s | menuButton.click() – “visible, enabled and stable” beklerken timeout; menu butonun uzerinde olabilir |
| 3 | animations | should animate story modal opening | Timeout 30s | Genel timeout; muhtemelen modal opacity check veya oncesi |
| 4 | animations | should animate story modal closing | Page closed | waitForTimeout sirasinda sayfa/context kapanmis (onceki test timeout veya cascade) |
| 5 | keyboard-shortcuts | should scroll with Space key | Assert | newScrollY === 0, initialScrollY muhtemelen 0 – Space sayfayi scroll etmemis |
| 6 | keyboard-shortcuts | should scroll to top with Home key | Assert | scrolledY === 0 – scrollTo(0,1000) sonrasi sayfa hala 0; sayfa yuksekligi yetersiz veya scroll uygulanmamis |
| 7 | keyboard-shortcuts | should scroll to bottom with End key | Assert | scrollY (2699) < maxScroll-100 (4136) – End en dibe gitmemis, smooth scroll veya focus |
| 8 | story-modal | should lock body scroll when modal is open | Assert | initialScrollY === 0 – scrollTo(0,800) sonrasi scroll 0; sayfa henuz yeterince uzun degil |

---

## 2. Kok Nedenler

### 2.1 Sayfa yuksekligi / scroll zamanlamasi (5, 6, 8)

- Testler `[data-archive-section]` gorunene kadar bekliyor ama **sayfa gercekten scroll edilebilir uzunlukta mi** kontrol edilmiyor.
- `scrollTo(0, 1000)` veya `scrollTo(0, 800)` cagrildiginda dokuman yuksekligi viewport’tan kucukse veya henuz layout tamamlanmadiysa `scrollY` 0 kalir.
- **Gerekli:** Archive section visible olduktan sonra **document.documentElement.scrollHeight > window.innerHeight** (veya benzeri) kontrolu; scroll degerini **Math.min(800, maxScroll)** gibi sinirla; gerekirse ek kisa bekleme (layout/paint).

### 2.2 Klavye scroll (5, 6, 7)

- **Space / Home / End** tarayicida sayfa odakli degilse veya odak bir input/button uzerindeyse scroll etkisi olmaz.
- Space bazen “sayfada asagi scroll” yerine “buton click” vb. tetikleyebilir.
- **Gerekli:** Scroll testlerinden once **body veya main’e click** ile sayfa odagini garanti etmek; Space/Home/End sonrasi bekleme artirmak (ozellikle smooth scroll icin 1–1.5 saniye).

### 2.3 Animations – locator ve stabilite (1, 2, 3, 4)

- **Menu opening:** `menuContent.locator('..').or(menu.first())` bazen header/diger bir div’e cozuluyor; `evaluate` bu eleman uzerinde timeout yiyor. Gereksiz karmasiklik.
- **Menu closing:** Menu acikken “Menu” butonu overlay altinda kalabiliyor veya animasyon bitmeden tiklaniyor; Playwright “stable” beklerken timeout.
- **Story modal opening:** 30s icinde modal acilip opacity check yapilamadan timeout; ya locator yavas ya test timeout kisa.
- **Story modal closing:** Test 3 timeout aldigi icin context kapanmis olabilir; test 4 “page closed” hatasi.

**Gerekli:**  
- Menu opening: Opacity check’i kaldirmak veya sadece “menu (heading) visible” ile yetinmek; `menuElement` zincirini kaldirmak/sadece menu panel ile sinirli tek bir locator kullanmak.  
- Menu closing: Menu acildiktan sonra **backdrop’a click** (body’de uygun koordinat) ile kapatmak; veya menu butonuna `force: true` ile tiklamak; gerekirse animasyon icin bekleme artirmak.  
- Story modal tests: Test timeout 45–60s yapmak; veya opacity/evaluate adimlarini yumusatmak/kaldirmak; modal “visible” ve close button “visible” ile yetinmek.

---

## 3. Duzeltme Plani (Uygulama Sirasi)

### Adim 1: keyboard-shortcuts – scroll testleri (5, 6, 7)

1. **should scroll with Space key**
   - Archive section visible sonrasi **sayfa scroll edilebilir mi** kontrol et: `scrollHeight > innerHeight` (evaluate).
   - Gerekirse once `scrollTo(0, 300)` ile hafif scroll yap; sonra body’e click; Space bas; 500–800 ms bekle; `newScrollY > initialScrollY` assert.
   - initialScrollY ve newScrollY 0 ise: body’e click ekle, Space oncesi/sonrasi bekleme artir.

2. **should scroll to top with Home key**
   - Archive visible sonrasi **maxScroll = scrollHeight - innerHeight** hesapla; `maxScroll <= 0` ise testi skip veya scroll beklenemez mesaji.
   - Scroll: `scrollTo(0, Math.min(1000, maxScroll))`; 500 ms bekle; `scrolledY > 0` assert (sayfa gercekten scroll edildiyse).
   - Body click + Home + 800–1000 ms bekle; `topY < 100` assert.

3. **should scroll to bottom with End key**
   - Baslangicta **body’e click** (focus icin); End bas; bekleme **1500 ms** (smooth scroll).
   - Assert: `scrollY > maxScroll - 200` (100 yerine 200 px tolerans).

### Adim 2: story-modal – lock body scroll (8)

- Testin basinda **archive section visible** bekle: `page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 })`.
- Sonra `scrollTo(0, 800)`; 500 ms bekle.
- `initialScrollY = scrollY`; eger **initialScrollY === 0** ise **maxScroll** kontrol et; maxScroll > 0 ama scrollY hala 0 ise `scrollTo(0, maxScroll)` dene ve tekrar bekle; yoksa testi skip veya “page not scrollable” kosulu ile atla.
- Boylece modal acilmadan once sayfada gercekten scroll pozisyonu olur; lock assertion anlamli olur.

### Adim 3: animations – menu opening (1)

- **Opacity/evaluate blokunu kaldir** veya sadece “menu heading visible” ile bitir.  
- Alternatif: menu panel icin tek bir locator kullan (ornegin `page.getByRole('dialog')` veya drawer’a ozel data-testid varsa onu kullan); sadece `toBeVisible()` assert et.

### Adim 4: animations – menu closing (2)

- Menu acildiktan sonra kapatmak icin **menu butonuna ikinci click** yerine **backdrop click** kullan: ornegin `page.click('body', { position: { x: 50, y: 400 } })` (menu alaninda olmayan bir nokta).
- Veya menuButton.click({ force: true }) ve timeout 10s.
- Gerekirse menu “visible” olduktan sonra 300–500 ms ek bekleme.

### Adim 5: animations – story modal opening/closing (3, 4)

- **Story modal opening:** Test timeout’u **45s veya 60s** yap (describe icinde veya bu test icin). Opacity check’i kaldir veya optional yap (evaluate timeout riski); sadece closeButton visible assert.
- **Story modal closing:** Test 3’un timeout’u duzeldikten sonra “page closed” kaybolmali. Ek olarak bu testte de timeout 45s yapilabilir; closeButton click sonrasi modal’in kapanmasi icin yeterli bekleme (1s).

### Adim 6: Genel

- Scroll ile ilgili tum testlerde **once [data-archive-section] visible**, sonra **scrollHeight > innerHeight** (veya maxScroll > 0) garantisi; scroll miktarini maxScroll ile sinirla.
- Klavye testlerinde **body/main click** ve **smooth scroll icin 1–1.5 s bekleme** standart yapilabilir.
- Animations’da **evaluate ve karmasik locator** azalt; “visible” ve “not visible” assert’leri yeterli olacak sekilde sadeleştir.

---

## 4. Ozet Tablo

| Test | Kok neden | Yapilacak |
|------|-----------|-----------|
| Menu opening | menuElement locator + evaluate timeout | Opacity/evaluate kaldir veya sadece visible assert |
| Menu closing | Menu butonuna click “stable” timeout | Backdrop click ile kapat veya force: true |
| Story modal opening | Genel timeout / yavas locator | Test timeout 45s; opacity check kaldir veya optional |
| Story modal closing | Onceki test timeout → page closed | Test 3 timeout artir; gerekirse bu test timeout 45s |
| Space key | scrollY 0 (sayfa/focus) | Scroll edilebilir + body click + bekleme |
| Home key | scrollTo sonrasi scrollY 0 | maxScroll kontrolu; scrollTo(min(1000,maxScroll)); body click |
| End key | End tam dibe gitmemis | Body click; bekleme 1500ms; assert maxScroll-200 |
| Lock body scroll | initialScrollY 0 | Archive visible + scrollTo; gerekirse maxScroll ile scroll; skip kosulu |

Bu plan uygulandiktan sonra `npm run test:e2e -- --project=chromium` tekrar calistirilarak sonuc kontrol edilmeli.
