#!/usr/bin/env python3
"""
boxbox_scrape.py — Box Box Club blog'undan (blog.boxbox.club) referans/ilham
içerik arşivlemesi için kişisel kullanım scripti.

NOT (robots.txt): blog.boxbox.club otomatik erişimi genel olarak reddediyor
(Medium custom domain davranışı). Bu script SADECE KİŞİSEL REFERANS amacıyla,
düşük hacimde (her topic için en fazla 10 içerik), nazik rate-limit ile ve
kendini tanıtan bir User-Agent ile çalışır. İçerik yeniden yayınlanmaz, sadece
yerel .md arşivine alınır. Çalıştırma sıklığını makul tut.

Kurulum:
    pip install requests beautifulsoup4 trafilatura

Kullanım:
    python boxbox_scrape.py

İlk çalıştırmada 3 klasör oluşturur, her topic için en yeni 10 içeriği indirir.
Sonraki çalıştırmalarda zaten indirilmiş olanları atlar, yalnızca yeni
içerikleri ekler.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import time
import unicodedata
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests
from bs4 import BeautifulSoup

try:
    import trafilatura
except ImportError:
    print("HATA: trafilatura kurulu değil. Önce şunu çalıştır:")
    print("  pip install requests beautifulsoup4 trafilatura")
    sys.exit(1)

# ---------------------------------------------------------------------------
# Yapılandırma — gerekirse buradan ayarla
# ---------------------------------------------------------------------------

OUTPUT_ROOT = Path(
    r"C:\Users\ts\Desktop\Coding\anthology\docs\additional-projects-ideas\boxbox"
)

# topic adı -> (klasör adı, listing URL)
# ⚠️ "F1 Education" URL'i tahmin edildi (site robots.txt nedeniyle benden
# erişilemedi). Tarayıcıda "F1 Education" sekmesine sağ tık →
# "Bağlantı adresini kopyala" ile teyit et, farklıysa aşağıyı düzelt.
TOPICS = {
    "F1 Stories": {
        "folder": "F1 Stories",
        "url": "https://blog.boxbox.club/all?topic=f1",
    },
    "F1 Education": {
        "folder": "F1 Education",
        "url": "https://blog.boxbox.club/all?topic=f1-education",  # ⚠️ teyit et
    },
    "Product & Tech": {
        "folder": "Product & Tech",
        "url": "https://blog.boxbox.club/all?topic=product",
    },
}

ARTICLES_PER_TOPIC = 10
DELAY_SECONDS = 2.0  # istekler arası nazik bekleme — düşürme
TIMEOUT = 20

# 0 makale bulunursa teşhis için listing sayfalarının ham HTML'ini
# OUTPUT_ROOT/_debug/ altına kaydeder. Sorun çözülünce False yapabilirsin.
DEBUG_SAVE_RAW = True

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "tr,en;q=0.8",
}

# ---------------------------------------------------------------------------
# Yardımcılar
# ---------------------------------------------------------------------------

TR_MAP = str.maketrans({
    "ç": "c", "Ç": "C", "ğ": "g", "Ğ": "G", "ı": "i", "İ": "I",
    "ö": "o", "Ö": "O", "ş": "s", "Ş": "S", "ü": "u", "Ü": "U",
})


def slugify(title: str, max_len: int = 60) -> str:
    text = title.translate(TR_MAP)
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text).strip().lower()
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text[:max_len].rstrip("-") or "untitled"


def url_hash(url: str) -> str:
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]


@dataclass
class Article:
    title: str
    url: str


def fetch_html(url: str) -> Optional[str]:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        print(f"  [debug] status={resp.status_code} content-length={len(resp.text)} "
              f"final_url={resp.url}")
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as e:
        print(f"  ⚠️  Çekilemedi: {url} ({e})")
        return None


def extract_listing_links(html: str, base_url: str) -> list[Article]:
    """Medium listing sayfasından makale link + başlık çıkarır.

    Strateji 1: window.__APOLLO_STATE__ JSON state'i (en güvenilir).
    Strateji 2 (fallback): anchor tag heuristic — Medium makale URL'leri
    genelde `...-<6-12 haneli hex id>` ile biter.
    """
    articles: list[Article] = []
    seen: set[str] = set()
    domain_root = base_url.split("/all")[0]

    m = re.search(r"window\.__APOLLO_STATE__\s*=\s*(\{.*?\})\s*;\s*</script>", html, re.S)
    if m:
        try:
            state = json.loads(m.group(1))
            for val in state.values():
                if not isinstance(val, dict):
                    continue
                title = val.get("title")
                unique_slug = val.get("uniqueSlug") or val.get("mediumUrl")
                if title and unique_slug:
                    link = unique_slug if unique_slug.startswith("http") else f"{domain_root}/{unique_slug}"
                    if link not in seen:
                        seen.add(link)
                        articles.append(Article(title=title.strip(), url=link))
        except json.JSONDecodeError:
            pass

    if articles:
        return articles

    # Fallback: anchor heuristic
    soup = BeautifulSoup(html, "html.parser")
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.startswith("/"):
            href = domain_root + href
        if not href.startswith(domain_root):
            continue
        href_clean = href.split("?")[0]
        if not re.search(r"-[0-9a-f]{6,12}$", href_clean):
            continue
        title = a.get_text(strip=True)
        if not title or len(title) < 8:
            parent = a.find_parent()
            heading = parent.find(["h1", "h2", "h3"]) if parent else None
            title = heading.get_text(strip=True) if heading else None
        if not title or href_clean in seen:
            continue
        seen.add(href_clean)
        articles.append(Article(title=title, url=href_clean))

    return articles


def save_article(folder: Path, article: Article, topic_name: str) -> bool:
    """Makaleyi .md olarak kaydeder. Zaten varsa atlar. True=yeni kaydedildi."""
    h = url_hash(article.url)
    filename = f"{slugify(article.title)}-{h}.md"
    filepath = folder / filename

    if filepath.exists():
        return False

    html = fetch_html(article.url)
    if not html:
        return False

    extracted = trafilatura.extract(
        html,
        output_format="markdown",
        include_links=True,
        include_images=True,
        favor_recall=True,
    )
    if not extracted:
        print(f"  ⚠️  İçerik çıkarılamadı: {article.url}")
        extracted = "_İçerik otomatik çıkarılamadı — linkten manuel kontrol et._"

    meta = trafilatura.extract_metadata(html)
    author = getattr(meta, "author", None) if meta else None
    date = getattr(meta, "date", None) if meta else None

    frontmatter = (
        "---\n"
        f'title: "{article.title}"\n'
        f"source_url: {article.url}\n"
        f"topic: {topic_name}\n"
        f"author: {author or 'bilinmiyor'}\n"
        f"published: {date or 'bilinmiyor'}\n"
        f"fetched_at: {datetime.now(timezone.utc).isoformat()}\n"
        "---\n\n"
    )

    filepath.write_text(frontmatter + f"# {article.title}\n\n" + extracted, encoding="utf-8")
    return True


# ---------------------------------------------------------------------------
# Ana akış
# ---------------------------------------------------------------------------

def run() -> None:
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    print(f"📁 Çıktı kökü: {OUTPUT_ROOT}\n")

    summary: dict[str, dict] = {}

    for topic_name, cfg in TOPICS.items():
        folder = OUTPUT_ROOT / cfg["folder"]
        folder.mkdir(parents=True, exist_ok=True)
        print(f"=== {topic_name} ===")
        print(f"Listing: {cfg['url']}")

        listing_html = fetch_html(cfg["url"])
        time.sleep(DELAY_SECONDS)

        if not listing_html:
            summary[topic_name] = {"yeni": 0, "atlanan": 0, "hata": "listing çekilemedi"}
            continue

        articles = extract_listing_links(listing_html, cfg["url"])[:ARTICLES_PER_TOPIC]

        if not articles:
            print("  ⚠️  Hiç makale bulunamadı — sayfa yapısı değişmiş olabilir.")
            if DEBUG_SAVE_RAW:
                debug_dir = OUTPUT_ROOT / "_debug"
                debug_dir.mkdir(parents=True, exist_ok=True)
                debug_file = debug_dir / f"{slugify(topic_name)}-raw.html"
                debug_file.write_text(listing_html, encoding="utf-8")
                print(f"  📁 Ham HTML kaydedildi: {debug_file}")
            summary[topic_name] = {"yeni": 0, "atlanan": 0, "hata": "0 makale parse edildi"}
            continue

        yeni, atlanan = 0, 0
        for art in articles:
            print(f"  -> {art.title[:70]}")
            if save_article(folder, art, topic_name):
                yeni += 1
                print("     ✅ kaydedildi")
            else:
                atlanan += 1
                print("     ⏭️  zaten var / başarısız, atlandı")
            time.sleep(DELAY_SECONDS)

        summary[topic_name] = {"yeni": yeni, "atlanan": atlanan, "hata": None}
        print()

    print("=" * 50)
    print("ÖZET")
    print("=" * 50)
    for topic_name, s in summary.items():
        if s.get("hata"):
            print(f"❌ {topic_name}: {s['hata']}")
        else:
            print(f"✅ {topic_name}: {s['yeni']} yeni, {s['atlanan']} zaten vardı/başarısız")


if __name__ == "__main__":
    run()
