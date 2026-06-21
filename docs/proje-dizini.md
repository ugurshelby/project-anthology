# Proje Dizini — Anthology (Apex)

> **Oluşturulma:** 2026-06-21  
> **Kök:** `anthology/`  
> Formula 1 odaklı arşiv ve canlı veri sitesi. Tam klasör ve dosya yapısı aşağıdadır.

## Özet

| Klasör | Açıklama |
|--------|----------|
| `app/` | Next.js App Router — sayfalar, API rotaları, SEO/PWA |
| `lib/` | Veri katmanı, F1 ingest, Supabase, haber aggregate |
| `data/` | Statik metin içerik (pilotlar, takımlar, hikâyeler, glossary) |
| `public/` | Yayınlanan assetler (SVG/PNG, hikâye görselleri, PWA) |
| `assets/` | Kaynak asset paketi ve üretim scriptleri |
| `config/` | Takım renk paleti |
| `scripts/` | Seed, sync ve içerik build scriptleri |
| `supabase/` | Veritabanı migration'ları ve CLI yapılandırması |
| `tests/` | Vitest birim testleri |
| `docs/` | Proje dokümantasyonu ve referans materyaller |
| `.claude/` | Claude Code skill'leri ve agent yapılandırması |
| `old-versions-valuable-files/` | Eski ama değerli kod/snapshot arşivi |

## Hariç tutulan büyük dizinler

Aşağıdaki dizinler **üretilmiş** veya **bağımlılık** klasörleridir; tam dosya listesi pratik değildir. Yalnızca özet verilmiştir:

| Dizin | Alt klasör | Dosya |
|-------|------------|-------|
| `.git/` | 275 | 5 514 |
| `.next/` | 430 | 4 016 |
| `node_modules/` | 3 940 | 35 290 |

> Mimari harita ve agent kuralları için: [reference/proje-dizini.md](reference/proje-dizini.md)

---

## Tam dizin ağacı

```text
├── .claude/
│   ├── skills/
│   │   ├── design-motion-principles/
│   │   │   ├── skills/
│   │   │   │   └── design-motion-principles/
│   │   │   │       ├── references/
│   │   │   │       │   ├── accessibility.md
│   │   │   │       │   ├── anti-checklist.md
│   │   │   │       │   ├── audit-checklist.md
│   │   │   │       │   ├── creation-gotchas.md
│   │   │   │       │   ├── demo-shell.html
│   │   │   │       │   ├── emil-kowalski.md
│   │   │   │       │   ├── jakub-krehel.md
│   │   │   │       │   ├── jhey-tompkins.md
│   │   │   │       │   ├── motion-cookbook.md
│   │   │   │       │   ├── output-format.md
│   │   │   │       │   ├── performance.md
│   │   │   │       │   └── report-template.html
│   │   │   │       ├── workflows/
│   │   │   │       │   ├── audit.md
│   │   │   │       │   └── create.md
│   │   │   │       └── SKILL.md
│   │   │   ├── CHANGELOG.md
│   │   │   ├── LICENSE
│   │   │   └── README.md
│   │   ├── graphify/
│   │   │   ├── docs/
│   │   │   │   ├── superpowers/
│   │   │   │   │   ├── plans/
│   │   │   │   │   │   └── 2026-05-04-incremental-updates-dedup.md
│   │   │   │   │   └── specs/
│   │   │   │   │       └── 2026-05-04-incremental-updates-dedup-design.md
│   │   │   │   ├── docker-mcp-sqlite.md
│   │   │   │   ├── how-it-works.md
│   │   │   │   ├── logo-icon.svg
│   │   │   │   ├── logo-text.svg
│   │   │   │   └── node-summaries-rfc.md
│   │   │   ├── graphify/
│   │   │   │   ├── always_on/
│   │   │   │   │   ├── agents-md.md
│   │   │   │   │   ├── antigravity-rules.md
│   │   │   │   │   ├── claude-md.md
│   │   │   │   │   ├── gemini-md.md
│   │   │   │   │   ├── kiro-steering.md
│   │   │   │   │   └── vscode-instructions.md
│   │   │   │   ├── skills/
│   │   │   │   │   └── claude/
│   │   │   │   │       └── references/
│   │   │   │   │           ├── add-watch.md
│   │   │   │   │           ├── exports.md
│   │   │   │   │           ├── extraction-spec.md
│   │   │   │   │           ├── github-and-merge.md
│   │   │   │   │           ├── hooks.md
│   │   │   │   │           ├── query.md
│   │   │   │   │           ├── transcribe.md
│   │   │   │   │           └── update.md
│   │   │   │   ├── __init__.py
│   │   │   │   ├── __main__.py
│   │   │   │   ├── _minhash.py
│   │   │   │   ├── affected.py
│   │   │   │   ├── analyze.py
│   │   │   │   ├── benchmark.py
│   │   │   │   ├── build.py
│   │   │   │   ├── cache.py
│   │   │   │   ├── callflow_html.py
│   │   │   │   ├── cargo_introspect.py
│   │   │   │   ├── cluster.py
│   │   │   │   ├── command-kilo.md
│   │   │   │   ├── dedup.py
│   │   │   │   ├── detect.py
│   │   │   │   ├── diagnostics.py
│   │   │   │   ├── export.py
│   │   │   │   ├── extract.py
│   │   │   │   ├── file_slice.py
│   │   │   │   ├── global_graph.py
│   │   │   │   ├── google_workspace.py
│   │   │   │   ├── hooks.py
│   │   │   │   ├── ids.py
│   │   │   │   ├── ingest.py
│   │   │   │   ├── llm.py
│   │   │   │   ├── manifest.py
│   │   │   │   ├── manifest_ingest.py
│   │   │   │   ├── mcp_ingest.py
│   │   │   │   ├── multigraph_compat.py
│   │   │   │   ├── pg_introspect.py
│   │   │   │   ├── prs.py
│   │   │   │   ├── querylog.py
│   │   │   │   ├── report.py
│   │   │   │   ├── scip_ingest.py
│   │   │   │   ├── security.py
│   │   │   │   ├── semantic_cleanup.py
│   │   │   │   ├── serve.py
│   │   │   │   ├── skill.md
│   │   │   │   ├── skill-aider.md
│   │   │   │   ├── skill-amp.md
│   │   │   │   ├── skill-claw.md
│   │   │   │   ├── skill-codex.md
│   │   │   │   ├── skill-copilot.md
│   │   │   │   ├── skill-devin.md
│   │   │   │   ├── skill-droid.md
│   │   │   │   ├── skill-kilo.md
│   │   │   │   ├── skill-kiro.md
│   │   │   │   ├── skill-opencode.md
│   │   │   │   ├── skill-pi.md
│   │   │   │   ├── skill-trae.md
│   │   │   │   ├── skill-vscode.md
│   │   │   │   ├── skill-windows.md
│   │   │   │   ├── symbol_resolution.py
│   │   │   │   ├── transcribe.py
│   │   │   │   ├── tree_html.py
│   │   │   │   ├── validate.py
│   │   │   │   ├── watch.py
│   │   │   │   └── wiki.py
│   │   │   ├── .dockerignore
│   │   │   ├── .pre-commit-config.yaml
│   │   │   ├── AGENTS.md
│   │   │   ├── ARCHITECTURE.md
│   │   │   ├── CHANGELOG.md
│   │   │   ├── Dockerfile
│   │   │   ├── LICENSE
│   │   │   ├── pyproject.toml
│   │   │   ├── README.md
│   │   │   ├── SECURITY.md
│   │   │   └── uv.lock
│   │   ├── impeccable/
│   │   │   ├── plugin/
│   │   │   │   ├── .claude-plugin/
│   │   │   │   │   └── plugin.json
│   │   │   │   ├── agents/
│   │   │   │   │   └── impeccable-manual-edit-applier.md
│   │   │   │   ├── hooks/
│   │   │   │   │   └── hooks.json
│   │   │   │   └── skills/
│   │   │   │       └── impeccable/
│   │   │   │           ├── reference/
│   │   │   │           │   ├── adapt.md
│   │   │   │           │   ├── animate.md
│   │   │   │           │   ├── audit.md
│   │   │   │           │   ├── bolder.md
│   │   │   │           │   ├── brand.md
│   │   │   │           │   ├── clarify.md
│   │   │   │           │   ├── codex.md
│   │   │   │           │   ├── colorize.md
│   │   │   │           │   ├── craft.md
│   │   │   │           │   ├── critique.md
│   │   │   │           │   ├── delight.md
│   │   │   │           │   ├── distill.md
│   │   │   │           │   ├── document.md
│   │   │   │           │   ├── extract.md
│   │   │   │           │   ├── harden.md
│   │   │   │           │   ├── hooks.md
│   │   │   │           │   ├── init.md
│   │   │   │           │   ├── interaction-design.md
│   │   │   │           │   ├── layout.md
│   │   │   │           │   ├── live.md
│   │   │   │           │   ├── onboard.md
│   │   │   │           │   ├── optimize.md
│   │   │   │           │   ├── overdrive.md
│   │   │   │           │   ├── polish.md
│   │   │   │           │   ├── product.md
│   │   │   │           │   ├── quieter.md
│   │   │   │           │   ├── shape.md
│   │   │   │           │   └── typeset.md
│   │   │   │           ├── scripts/
│   │   │   │           │   ├── detector/
│   │   │   │           │   │   ├── browser/
│   │   │   │           │   │   │   └── injected/
│   │   │   │           │   │   │       └── index.mjs
│   │   │   │           │   │   ├── cli/
│   │   │   │           │   │   │   └── main.mjs
│   │   │   │           │   │   ├── engines/
│   │   │   │           │   │   │   ├── browser/
│   │   │   │           │   │   │   │   └── detect-url.mjs
│   │   │   │           │   │   │   ├── regex/
│   │   │   │           │   │   │   │   └── detect-text.mjs
│   │   │   │           │   │   │   ├── static-html/
│   │   │   │           │   │   │   │   ├── css-cascade.mjs
│   │   │   │           │   │   │   │   └── detect-html.mjs
│   │   │   │           │   │   │   └── visual/
│   │   │   │           │   │   │       └── screenshot-contrast.mjs
│   │   │   │           │   │   ├── node/
│   │   │   │           │   │   │   └── file-system.mjs
│   │   │   │           │   │   ├── profile/
│   │   │   │           │   │   │   └── profiler.mjs
│   │   │   │           │   │   ├── registry/
│   │   │   │           │   │   │   └── antipatterns.mjs
│   │   │   │           │   │   ├── rules/
│   │   │   │           │   │   │   └── checks.mjs
│   │   │   │           │   │   ├── shared/
│   │   │   │           │   │   │   ├── color.mjs
│   │   │   │           │   │   │   ├── constants.mjs
│   │   │   │           │   │   │   └── page.mjs
│   │   │   │           │   │   ├── design-system.mjs
│   │   │   │           │   │   ├── detect-antipatterns.mjs
│   │   │   │           │   │   ├── detect-antipatterns-browser.js
│   │   │   │           │   │   └── findings.mjs
│   │   │   │           │   ├── lib/
│   │   │   │           │   │   ├── design-parser.mjs
│   │   │   │           │   │   ├── impeccable-config.mjs
│   │   │   │           │   │   ├── impeccable-paths.mjs
│   │   │   │           │   │   ├── is-generated.mjs
│   │   │   │           │   │   └── target-args.mjs
│   │   │   │           │   ├── live/
│   │   │   │           │   │   ├── browser-script-parts.mjs
│   │   │   │           │   │   ├── completion.mjs
│   │   │   │           │   │   ├── event-validation.mjs
│   │   │   │           │   │   ├── insert-ui.mjs
│   │   │   │           │   │   ├── manual-apply.mjs
│   │   │   │           │   │   ├── manual-edit-routes.mjs
│   │   │   │           │   │   ├── manual-edits-buffer.mjs
│   │   │   │           │   │   ├── session-store.mjs
│   │   │   │           │   │   ├── svelte-component.mjs
│   │   │   │           │   │   ├── sveltekit-adapter.mjs
│   │   │   │           │   │   ├── ui-core.mjs
│   │   │   │           │   │   └── vocabulary.mjs
│   │   │   │           │   ├── command-metadata.json
│   │   │   │           │   ├── context.mjs
│   │   │   │           │   ├── context-signals.mjs
│   │   │   │           │   ├── critique-storage.mjs
│   │   │   │           │   ├── detect.mjs
│   │   │   │           │   ├── detect-csp.mjs
│   │   │   │           │   ├── hook.mjs
│   │   │   │           │   ├── hook-admin.mjs
│   │   │   │           │   ├── hook-before-edit.mjs
│   │   │   │           │   ├── hook-lib.mjs
│   │   │   │           │   ├── live.mjs
│   │   │   │           │   ├── live-accept.mjs
│   │   │   │           │   ├── live-browser.js
│   │   │   │           │   ├── live-browser-dom.js
│   │   │   │           │   ├── live-browser-session.js
│   │   │   │           │   ├── live-commit-manual-edits.mjs
│   │   │   │           │   ├── live-complete.mjs
│   │   │   │           │   ├── live-copy-edit-agent.mjs
│   │   │   │           │   ├── live-discard-manual-edits.mjs
│   │   │   │           │   ├── live-inject.mjs
│   │   │   │           │   ├── live-insert.mjs
│   │   │   │           │   ├── live-manual-edit-evidence.mjs
│   │   │   │           │   ├── live-poll.mjs
│   │   │   │           │   ├── live-resume.mjs
│   │   │   │           │   ├── live-server.mjs
│   │   │   │           │   ├── live-status.mjs
│   │   │   │           │   ├── live-target.mjs
│   │   │   │           │   ├── live-wrap.mjs
│   │   │   │           │   ├── modern-screenshot.umd.js
│   │   │   │           │   ├── palette.mjs
│   │   │   │           │   └── pin.mjs
│   │   │   │           └── SKILL.md
│   │   │   ├── skill/
│   │   │   │   ├── agents/
│   │   │   │   │   ├── impeccable-asset-producer.md
│   │   │   │   │   └── impeccable-manual-edit-applier.md
│   │   │   │   ├── reference/
│   │   ├── proje-dizini.md
│   │   │   │   │   ├── adapt.md
│   │   │   │   │   ├── animate.md
│   │   │   │   │   ├── audit.md
│   │   │   │   │   ├── bolder.md
│   │   │   │   │   ├── brand.md
│   │   │   │   │   ├── clarify.md
│   │   │   │   │   ├── codex.md
│   │   │   │   │   ├── colorize.md
│   │   │   │   │   ├── craft.md
│   │   │   │   │   ├── critique.md
│   │   │   │   │   ├── delight.md
│   │   │   │   │   ├── distill.md
│   │   │   │   │   ├── document.md
│   │   │   │   │   ├── extract.md
│   │   │   │   │   ├── harden.md
│   │   │   │   │   ├── hooks.md
│   │   │   │   │   ├── init.md
│   │   │   │   │   ├── interaction-design.md
│   │   │   │   │   ├── layout.md
│   │   │   │   │   ├── live.md
│   │   │   │   │   ├── onboard.md
│   │   │   │   │   ├── optimize.md
│   │   │   │   │   ├── overdrive.md
│   │   │   │   │   ├── polish.md
│   │   │   │   │   ├── product.md
│   │   │   │   │   ├── quieter.md
│   │   │   │   │   ├── shape.md
│   │   │   │   │   └── typeset.md
│   │   │   │   ├── scripts/
│   │   │   │   │   ├── lib/
│   │   │   │   │   │   ├── design-parser.mjs
│   │   │   │   │   │   ├── impeccable-paths.mjs
│   │   │   │   │   │   ├── is-generated.mjs
│   │   │   │   │   │   └── target-args.mjs
│   │   │   │   │   ├── live/
│   │   │   │   │   │   ├── browser-script-parts.mjs
│   │   │   │   │   │   ├── completion.mjs
│   │   │   │   │   │   ├── event-validation.mjs
│   │   │   │   │   │   ├── insert-ui.mjs
│   │   │   │   │   │   ├── manual-apply.mjs
│   │   │   │   │   │   ├── manual-edit-routes.mjs
│   │   │   │   │   │   ├── manual-edits-buffer.mjs
│   │   │   │   │   │   ├── session-store.mjs
│   │   │   │   │   │   ├── svelte-component.mjs
│   │   │   │   │   │   ├── sveltekit-adapter.mjs
│   │   │   │   │   │   ├── ui-core.mjs
│   │   │   │   │   │   └── vocabulary.mjs
│   │   │   │   │   ├── command-metadata.json
│   │   │   │   │   ├── context.mjs
│   │   │   │   │   ├── context-signals.mjs
│   │   │   │   │   ├── critique-storage.mjs
│   │   │   │   │   ├── detect.mjs
│   │   │   │   │   ├── detect-csp.mjs
│   │   │   │   │   ├── hook.mjs
│   │   │   │   │   ├── hook-admin.mjs
│   │   │   │   │   ├── hook-before-edit.mjs
│   │   │   │   │   ├── hook-lib.mjs
│   │   │   │   │   ├── live.mjs
│   │   │   │   │   ├── live-accept.mjs
│   │   │   │   │   ├── live-browser.js
│   │   │   │   │   ├── live-browser-dom.js
│   │   │   │   │   ├── live-browser-session.js
│   │   │   │   │   ├── live-commit-manual-edits.mjs
│   │   │   │   │   ├── live-complete.mjs
│   │   │   │   │   ├── live-copy-edit-agent.mjs
│   │   │   │   │   ├── live-discard-manual-edits.mjs
│   │   │   │   │   ├── live-inject.mjs
│   │   │   │   │   ├── live-insert.mjs
│   │   │   │   │   ├── live-manual-edit-evidence.mjs
│   │   │   │   │   ├── live-poll.mjs
│   │   │   │   │   ├── live-resume.mjs
│   │   │   │   │   ├── live-server.mjs
│   │   │   │   │   ├── live-status.mjs
│   │   │   │   │   ├── live-target.mjs
│   │   │   │   │   ├── live-wrap.mjs
│   │   │   │   │   ├── modern-screenshot.umd.js
│   │   │   │   │   ├── palette.mjs
│   │   │   │   │   └── pin.mjs
│   │   │   │   └── SKILL.src.md
│   │   │   ├── .gitignore
│   │   │   ├── AGENTS.md
│   │   │   ├── CLAUDE.md
│   │   │   ├── DESIGN.md
│   │   │   ├── LICENSE
│   │   │   ├── PRODUCT.md
│   │   │   └── README.md
│   │   ├── stitch-design-taste/
│   │   ├── stitch-skill/
│   │   │   ├── DESIGN.md
│   │   │   └── SKILL.md
│   │   ├── supabase/
│   │   │   ├── assets/
│   │   │   │   └── feedback-issue-template.md
│   │   │   ├── references/
│   │   │   │   └── skill-feedback.md
│   │   │   ├── CHANGELOG.md
│   │   │   └── SKILL.md
│   │   ├── supabase-postgres-best-practices/
│   │   │   ├── references/
│   │   │   │   ├── _contributing.md
│   │   │   │   ├── _sections.md
│   │   │   │   ├── _template.md
│   │   │   │   ├── advanced-full-text-search.md
│   │   │   │   ├── advanced-jsonb-indexing.md
│   │   │   │   ├── conn-idle-timeout.md
│   │   │   │   ├── conn-limits.md
│   │   │   │   ├── conn-pooling.md
│   │   │   │   ├── conn-prepared-statements.md
│   │   │   │   ├── data-batch-inserts.md
│   │   │   │   ├── data-n-plus-one.md
│   │   │   │   ├── data-pagination.md
│   │   │   │   ├── data-upsert.md
│   │   │   │   ├── lock-advisory.md
│   │   │   │   ├── lock-deadlock-prevention.md
│   │   │   │   ├── lock-short-transactions.md
│   │   │   │   ├── lock-skip-locked.md
│   │   │   │   ├── monitor-explain-analyze.md
│   │   │   │   ├── monitor-pg-stat-statements.md
│   │   │   │   ├── monitor-vacuum-analyze.md
│   │   │   │   ├── query-composite-indexes.md
│   │   │   │   ├── query-covering-indexes.md
│   │   │   │   ├── query-index-types.md
│   │   │   │   ├── query-missing-indexes.md
│   │   │   │   ├── query-partial-indexes.md
│   │   │   │   ├── schema-constraints.md
│   │   │   │   ├── schema-data-types.md
│   │   │   │   ├── schema-foreign-key-indexes.md
│   │   │   │   ├── schema-lowercase-identifiers.md
│   │   │   │   ├── schema-partitioning.md
│   │   │   │   ├── schema-primary-keys.md
│   │   │   │   ├── security-privileges.md
│   │   │   │   ├── security-rls-basics.md
│   │   │   │   └── security-rls-performance.md
│   │   │   ├── CHANGELOG.md
│   │   │   └── SKILL.md
│   │   ├── taste-skills/
│   │   │   ├── .claude-plugin/
│   │   │   │   ├── marketplace.json
│   │   │   │   └── plugin.json
│   │   │   ├── .github/
│   │   │   │   ├── copilot-instructions.md
│   │   │   │   └── FUNDING.yml
│   │   │   ├── assets/
│   │   │   │   ├── .gitkeep
│   │   │   │   ├── readme-banner.png
│   │   │   │   └── taste-skill-logo.webp
│   │   │   ├── examples/
│   │   │   │   ├── floria-bottom.webp
│   │   │   │   ├── floria-full.webp
│   │   │   │   └── floria-top.webp
│   │   │   ├── research/
│   │   │   │   ├── laziness/
│   │   │   │   │   ├── findings/
│   │   │   │   │   │   ├── empirical-results.md
│   │   │   │   │   │   └── references.md
│   │   │   │   │   ├── remediation/
│   │   │   │   │   │   ├── architectural-patterns.md
│   │   │   │   │   │   ├── parameter-tuning.md
│   │   │   │   │   │   ├── prompt-engineering.md
│   │   │   │   │   │   └── reference-prompts.md
│   │   │   │   │   ├── root-causes/
│   │   │   │   │   │   ├── cognitive-shortcuts.md
│   │   │   │   │   │   ├── output-limits.md
│   │   │   │   │   │   ├── rlhf-and-compute.md
│   │   │   │   │   │   └── training-data-bias.md
│   │   │   │   │   └── README.md
│   │   │   │   └── README.md
│   │   │   ├── skills/
│   │   │   │   ├── brandkit/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── brutalist-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── design-taste-frontend/
│   │   │   │   ├── gpt-tasteskill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── imagegen-frontend-mobile/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── imagegen-frontend-web/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── image-to-code-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── minimalist-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── output-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── redesign-existing-projects/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── redesign-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── soft-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── stitch-skill/
│   │   │   │   │   ├── DESIGN.md
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── taste-skill/
│   │   │   │   │   └── SKILL.md
│   │   │   │   ├── taste-skill-v1/
│   │   │   │   │   └── SKILL.md
│   │   │   │   └── llms.txt
│   │   │   ├── CHANGELOG.md
│   │   │   ├── favicon.svg
│   │   │   ├── LICENSE
│   │   │   ├── README.md
│   │   │   └── skill.sh
│   │   └── ui-ux-pro-max/
│   │       ├── data/
│   │       │   ├── stacks/
│   │       │   │   ├── astro.csv
│   │       │   │   ├── flutter.csv
│   │       │   │   ├── html-tailwind.csv
│   │       │   │   ├── jetpack-compose.csv
│   │       │   │   ├── nextjs.csv
│   │       │   │   ├── nuxtjs.csv
│   │       │   │   ├── nuxt-ui.csv
│   │       │   │   ├── react.csv
│   │       │   │   ├── react-native.csv
│   │       │   │   ├── shadcn.csv
│   │       │   │   ├── svelte.csv
│   │       │   │   ├── swiftui.csv
│   │       │   │   └── vue.csv
│   │       │   ├── charts.csv
│   │       │   ├── colors.csv
│   │       │   ├── icons.csv
│   │       │   ├── landing.csv
│   │       │   ├── products.csv
│   │       │   ├── react-performance.csv
│   │       │   ├── styles.csv
│   │       │   ├── typography.csv
│   │       │   ├── ui-reasoning.csv
│   │       │   ├── ux-guidelines.csv
│   │       │   └── web-interface.csv
│   │       ├── scripts/
│   │       │   ├── __pycache__/
│   │       │   │   ├── core.cpython-313.pyc
│   │       │   │   ├── core.cpython-314.pyc
│   │       │   │   ├── design_system.cpython-313.pyc
│   │       │   │   ├── design_system.cpython-314.pyc
│   │       │   │   └── search.cpython-314.pyc
│   │       │   ├── core.py
│   │       │   ├── design_system.py
│   │       │   └── search.py
│   │       └── SKILL.md
│   ├── CLAUDE.md
│   ├── scheduled_tasks.lock
│   └── settings.local.json
├── .cursor/
│   ├── plans/
│   └── rules/
│       └── CURSOR.md
├── .git/  _(özet: 275 alt klasör, 5514 dosya — tam liste hariç)_
├── .github/
│   └── workflows/
│       └── sync-f1-race-aware.yml
├── .next/  _(özet: 430 alt klasör, 4016 dosya — tam liste hariç)_
├── .vercel/
│   ├── .env.development.local
│   ├── README.txt
│   └── repo.json
├── app/
│   ├── anthology/
│   │   ├── [slug]/
│   │   │   ├── opengraph-image.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── cron/
│   │   │   ├── sync-f1/
│   │   │   │   └── route.ts
│   │   │   ├── sync-news/
│   │   │   │   └── route.ts
│   │   │   └── sync-radio/
│   │   │       └── route.ts
│   │   ├── f1-season/
│   │   │   └── route.ts
│   │   ├── news/
│   │   │   └── route.ts
│   │   └── season/
│   │       └── [year]/
│   │           └── route.ts
│   ├── circuits/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── drivers/
│   │   ├── [driverId]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── feed.xml/
│   │   └── route.ts
│   ├── news/
│   │   └── page.tsx
│   ├── season/
│   │   ├── [year]/
│   │   │   └── round/
│   │   │       └── [n]/
│   │   │           └── page.tsx
│   │   └── page.tsx
│   ├── teams/
│   │   ├── [constructorId]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── tech-glossary/
│   │   └── page.tsx
│   ├── favicon.ico
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── opengraph-image.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── assets/
│   ├── asset-package/
│   │   ├── 2026-cars/
│   │   │   ├── 1.svg
│   │   │   ├── 10.svg
│   │   │   ├── 11.svg
│   │   │   ├── 2.svg
│   │   │   ├── 3.svg
│   │   │   ├── 4.svg
│   │   │   ├── 5.svg
│   │   │   ├── 6.svg
│   │   │   ├── 7.svg
│   │   │   ├── 8.svg
│   │   │   └── 9.svg
│   │   ├── 2026-drivers/
│   │   │   ├── 1.svg
│   │   │   ├── 10.svg
│   │   │   ├── 11.svg
│   │   │   ├── 12.svg
│   │   │   ├── 13.svg
│   │   │   ├── 14.svg
│   │   │   ├── 15.svg
│   │   │   ├── 16.svg
│   │   │   ├── 17.svg
│   │   │   ├── 18.svg
│   │   │   ├── 19.svg
│   │   │   ├── 2.svg
│   │   │   ├── 20.svg
│   │   │   ├── 21.svg
│   │   │   ├── 22.svg
│   │   │   ├── 3.svg
│   │   │   ├── 4.svg
│   │   │   ├── 5.svg
│   │   │   ├── 6.svg
│   │   │   ├── 7.svg
│   │   │   ├── 8.svg
│   │   │   └── 9.svg
│   │   ├── 2026-team-logos/
│   │   │   ├── alpine.svg
│   │   │   ├── aston_martin.svg
│   │   │   ├── audi.svg
│   │   │   ├── cadillac.svg
│   │   │   ├── ferrari.svg
│   │   │   ├── haas.svg
│   │   │   ├── mclaren.svg
│   │   │   ├── mercedes.svg
│   │   │   ├── redbull.svg
│   │   │   ├── visa_cash_racing_bulls.svg
│   │   │   └── williams.svg
│   │   ├── circuit-images/
│   │   │   ├── albert-park-circuit.png
│   │   │   ├── autodromo-hermanos-rodriguez.png
│   │   │   ├── autodromo-nazionale-monza.png
│   │   │   ├── bahrain-international-circuit.png
│   │   │   ├── baku-city-circuit.png
│   │   │   ├── circuit-de-barcelona-catalunya.png
│   │   │   ├── circuit-de-monaco.png
│   │   │   ├── circuit-de-spa-francorchamps.png
│   │   │   ├── circuit-gilles-villeneuve.png
│   │   │   ├── circuito-de-madrid.png
│   │   │   ├── circuit-of-the-americas.png
│   │   │   ├── circuit-zandvoort.png
│   │   │   ├── hungaroring.png
│   │   │   ├── interlagos-circuit.png
│   │   │   ├── jeddah-corniche-circuit.png
│   │   │   ├── las-vegas-strip-circuit.png
│   │   │   ├── lusail-international-circuit.png
│   │   │   ├── marina-bay-street-circuit.png
│   │   │   ├── miami-international-autodrome.png
│   │   │   ├── red-bull-ring.png
│   │   │   ├── shanghai-international-circuit.png
│   │   │   ├── silverstone-circuit.png
│   │   │   ├── suzuka-circuit.png
│   │   │   └── yas-marina-circuit.png
│   │   ├── icons/
│   │   │   ├── green-flag.svg
│   │   │   ├── racing-flag.svg
│   │   │   ├── red-flag.svg
│   │   │   ├── safety-car.svg
│   │   │   └── virtual-safety-car.svg
│   │   └── tyres/
│   │       ├── full-wet.svg
│   │       ├── hard.svg
│   │       ├── intermediate.svg
│   │       ├── medium.svg
│   │       └── soft.svg
│   ├── data/
│   │   ├── constructor-palette.json
│   │   └── season-rosters.json
│   ├── f1-circuits/
│   │   ├── championships/
│   │   │   ├── f1-locations-2020.json
│   │   │   ├── f1-locations-2021.json
│   │   │   ├── f1-locations-2022.json
│   │   │   ├── f1-locations-2023.json
│   │   │   ├── f1-locations-2024.json
│   │   │   ├── f1-locations-2025.json
│   │   │   └── f1-locations-2026.json
│   │   ├── circuits/
│   │   │   ├── ae-2009.geojson
│   │   │   ├── at-1969.geojson
│   │   │   ├── au-1953.geojson
│   │   │   ├── az-2016.geojson
│   │   │   ├── be-1925.geojson
│   │   │   ├── bh-2002.geojson
│   │   │   ├── br-1940.geojson
│   │   │   ├── ca-1978.geojson
│   │   │   ├── cn-2004.geojson
│   │   │   ├── es-1991.geojson
│   │   │   ├── es-2026.geojson
│   │   │   ├── gb-1948.geojson
│   │   │   ├── hu-1986.geojson
│   │   │   ├── it-1922.geojson
│   │   │   ├── jp-1962.geojson
│   │   │   ├── mc-1929.geojson
│   │   │   ├── mx-1962.geojson
│   │   │   ├── nl-1948.geojson
│   │   │   ├── qa-2004.geojson
│   │   │   ├── sa-2021.geojson
│   │   │   ├── sg-2008.geojson
│   │   │   ├── us-2012.geojson
│   │   │   ├── us-2022.geojson
│   │   │   └── us-2023.geojson
│   │   ├── .gitignore
│   │   ├── f1-circuits.geojson
│   │   ├── f1-locations.geojson
│   │   ├── f1-locations.json
│   │   ├── LICENSE.md
│   │   └── README.md
│   ├── icons/
│   │   └── app-icon.svg
│   └── scripts/
│       ├── lib/
│       │   └── svg-builders.mjs
│       ├── audit-missing-assets.ts
│       ├── generate-drivers.mjs
│       ├── generate-historical-assets.mjs
│       ├── generate-pwa-icons.mjs
│       ├── generate-teams.mjs
│       ├── generate-tyres.mjs
│       ├── geojson-to-svg.mjs
│       └── reorganize-stories.mjs
├── config/
│   └── team-colors.ts
├── data/
│   ├── circuits/
│   │   └── facts.ts
│   ├── drivers/
│   │   └── index.ts
│   ├── glossary/
│   │   ├── terms.ts
│   │   └── tyres.ts
│   ├── stories/
│   │   ├── content.ts
│   │   └── types.ts
│   └── teams/
│       └── index.ts
├── docs/
│   ├── additional-projects-ideas/
│   │   └── F1 Race Replay/
│   │       └── f1-race-replay-main/
│   │           ├── docs/
│   │           │   ├── InsightsMenu.md
│   │           │   └── PitWallWindow.md
│   │           ├── images/
│   │           │   ├── controls/
│   │           │   │   ├── arrow-down.png
│   │           │   │   ├── arrow-left.png
│   │           │   │   ├── arrow-right.png
│   │           │   │   ├── arrow-up.png
│   │           │   │   ├── pause.png
│   │           │   │   ├── play.png
│   │           │   │   ├── rewind.png
│   │           │   │   ├── speed-.png
│   │           │   │   └── speed+.png
│   │           │   ├── tyres/
│   │           │   │   ├── 0.0.png
│   │           │   │   ├── 1.0.png
│   │           │   │   ├── 2.0.png
│   │           │   │   ├── 3.0.png
│   │           │   │   └── 4.0.png
│   │           │   ├── tyre-strategy/
│   │           │   │   ├── f1 insight live tyre strategy.png
│   │           │   │   └── tyre-strategy-preview.png
│   │           │   └── weather/
│   │           │       ├── drop.png
│   │           │       ├── rain.png
│   │           │       ├── thermometer.png
│   │           │       └── wind.png
│   │           ├── resources/
│   │           │   ├── cli-menu.gif
│   │           │   ├── gui-menu.png
│   │           │   ├── insights-menu.png
│   │           │   ├── pit-wall-window-template.png
│   │           │   ├── preview.png
│   │           │   └── telemetry-logger.png
│   │           ├── src/
│   │           │   ├── cli/
│   │           │   │   └── race_selection.py
│   │           │   ├── gui/
│   │           │   │   ├── insights_menu.py
│   │           │   │   ├── pit_wall_window.py
│   │           │   │   ├── pit_wall_window_template.py
│   │           │   │   ├── race_selection.py
│   │           │   │   └── settings_dialog.py
│   │           │   ├── insights/
│   │           │   │   ├── driver_telemetry_window.py
│   │           │   │   ├── example_pit_wall_window.py
│   │           │   │   ├── race_control_feed_window.py
│   │           │   │   ├── telemetry_stream_viewer.py
│   │           │   │   ├── track_position_window.py
│   │           │   │   └── tyre_strategy_window.py
│   │           │   ├── interfaces/
│   │           │   │   ├── qualifying.py
│   │           │   │   └── race_replay.py
│   │           │   ├── lib/
│   │           │   │   ├── season.py
│   │           │   │   ├── settings.py
│   │           │   │   ├── time.py
│   │           │   │   └── tyres.py
│   │           │   ├── services/
│   │           │   │   └── stream.py
│   │           │   ├── bayesian_tyre_model.py
│   │           │   ├── f1_data.py
│   │           │   ├── run_session.py
│   │           │   ├── tyre_degradation_integration.py
│   │           │   └── ui_components.py
│   │           ├── .gitattributes
│   │           ├── .gitignore
│   │           ├── contributors.md
│   │           ├── main.py
│   │           ├── README.md
│   │           ├── requirements.txt
│   │           ├── roadmap.md
│   │           └── telemetry.md
│   ├── guides/
│   │   ├── test-prosedürü-kurulum.md
│   │   └── weather-widget.md
│   ├── proje-dizini.md
│   ├── reference/
│   │   ├── PROJECT_LESSONS_AND_ROADMAP.md
│   │   └── proje-dizini.md
│   └── mimari.md
├── lib/
│   ├── assets/
│   │   └── f1-icons.ts
│   ├── data/
│   │   ├── circuits.ts
│   │   ├── entities.ts
│   │   ├── f1.ts
│   │   ├── fs.ts
│   │   ├── logger.ts
│   │   ├── news.ts
│   │   ├── radio.ts
│   │   ├── siteUrl.ts
│   │   ├── stories.ts
│   │   └── types.ts
│   ├── f1/
│   │   ├── sources/
│   │   │   ├── f1db.ts
│   │   │   ├── jolpica.ts
│   │   │   └── openf1.ts
│   │   ├── mrdata.ts
│   │   ├── snapshotStaleness.ts
│   │   └── syncSchedule.ts
│   ├── news/
│   │   └── aggregate.ts
│   ├── circuits-public.ts
│   ├── cronAuth.ts
│   ├── f1Calendar.ts
│   ├── f1Ingest.ts
│   ├── rateLimit.ts
│   ├── seo.ts
│   └── supabase.ts
├── logo/
│   ├── logo.png
│   └── logo.svg
├── logs/
│   ├── AGENT_5FIX2_2026-06-09.md
│   ├── AGENT_5fix_2026-06-08.md
│   ├── AGENT_ASSET_FIX_2026-06-10.md
│   ├── AGENT_ASSETS_SEASON_LAYOUT_2026-06-09.md
│   ├── AGENT_COUNCIL_FINAL_2026-06-11.md
│   ├── AGENT_FAZ0_LAUNCH_2026-06-12.md
│   ├── AGENT_FAZ0_STABILIZE_2026-06-20.md
│   ├── AGENT_FAZ2_CONTENT_DEPTH_2026-06-20.md
│   ├── AGENT_HEALTH_CHECK_2026-06-07.md
│   ├── AGENT_PHASE0_SETUP_2026-06-02.md
│   ├── AGENT_PHASE1_DB_DATA_LAYER_2026-06-03.md
│   ├── AGENT_PHASE2_INGESTION_2026-06-04.md
│   ├── AGENT_PHASE6_CONTENT_20260605.md
│   ├── AGENT_PHASE7_SEO_QA_20260605.md
│   ├── AGENT_SEED_CRON_20260604.md
│   └── AGENT_SENTRY_20260604.md
├── node_modules/  _(özet: 3940 alt klasör, 35290 dosya — tam liste hariç)_
├── old-versions-valuable-files/
│   ├── 001_f1_snapshots.sql
│   ├── audit-raporu.md
│   ├── news.test.ts
│   ├── news.ts
│   ├── newsService.ts
│   ├── newsSummary.ts
│   ├── README.md
│   ├── route.ts
│   ├── shimmer.tsx
│   ├── site-nav.tsx
│   ├── sync-f1-snapshots.mjs
│   ├── sync-f1-to-supabase.mjs
│   ├── tailwind.config.js
│   └── team-colors.ts
├── public/
│   ├── cars/
│   │   ├── alpine.svg
│   │   ├── aston_martin.svg
│   │   ├── audi.svg
│   │   ├── cadillac.svg
│   │   ├── ferrari.svg
│   │   ├── haas.svg
│   │   ├── mclaren.svg
│   │   ├── mercedes.svg
│   │   ├── rb.svg
│   │   ├── red_bull.svg
│   │   └── williams.svg
│   ├── circuits/
│   │   ├── ae-2009.svg
│   │   ├── albert-park-circuit.png
│   │   ├── at-1969.svg
│   │   ├── au-1953.svg
│   │   ├── autodromo-hermanos-rodriguez.png
│   │   ├── autodromo-nazionale-monza.png
│   │   ├── az-2016.svg
│   │   ├── bahrain-international-circuit.png
│   │   ├── baku-city-circuit.png
│   │   ├── be-1925.svg
│   │   ├── bh-2002.svg
│   │   ├── br-1940.svg
│   │   ├── ca-1978.svg
│   │   ├── circuit-de-barcelona-catalunya.png
│   │   ├── circuit-de-monaco.png
│   │   ├── circuit-de-spa-francorchamps.png
│   │   ├── circuit-gilles-villeneuve.png
│   │   ├── circuito-de-madrid.png
│   │   ├── circuit-of-the-americas.png
│   │   ├── circuit-zandvoort.png
│   │   ├── cn-2004.svg
│   │   ├── es-1991.svg
│   │   ├── es-2026.svg
│   │   ├── gb-1948.svg
│   │   ├── hu-1986.svg
│   │   ├── hungaroring.png
│   │   ├── interlagos-circuit.png
│   │   ├── it-1922.svg
│   │   ├── jeddah-corniche-circuit.png
│   │   ├── jp-1962.svg
│   │   ├── las-vegas-strip-circuit.png
│   │   ├── lusail-international-circuit.png
│   │   ├── marina-bay-street-circuit.png
│   │   ├── mc-1929.svg
│   │   ├── miami-international-autodrome.png
│   │   ├── mx-1962.svg
│   │   ├── nl-1948.svg
│   │   ├── qa-2004.svg
│   │   ├── red-bull-ring.png
│   │   ├── sa-2021.svg
│   │   ├── sg-2008.svg
│   │   ├── shanghai-international-circuit.png
│   │   ├── silverstone-circuit.png
│   │   ├── suzuka-circuit.png
│   │   ├── us-2012.svg
│   │   ├── us-2022.svg
│   │   ├── us-2023.svg
│   │   └── yas-marina-circuit.png
│   ├── drivers/
│   │   └── 2026/
│   │       ├── albon.svg
│   │       ├── alonso.svg
│   │       ├── antonelli.svg
│   │       ├── bearman.svg
│   │       ├── bortoleto.svg
│   │       ├── bottas.svg
│   │       ├── colapinto.svg
│   │       ├── doohan.svg
│   │       ├── gasly.svg
│   │       ├── hadjar.svg
│   │       ├── hamilton.svg
│   │       ├── hulkenberg.svg
│   │       ├── lawson.svg
│   │       ├── leclerc.svg
│   │       ├── lindblad.svg
│   │       ├── norris.svg
│   │       ├── ocon.svg
│   │       ├── perez.svg
│   │       ├── piastri.svg
│   │       ├── russell.svg
│   │       ├── sainz.svg
│   │       ├── stroll.svg
│   │       ├── tsunoda.svg
│   │       └── verstappen.svg
│   ├── icons/
│   │   ├── apple-touch-icon.png
│   │   ├── green-flag.svg
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   ├── racing-flag.svg
│   │   ├── red-flag.svg
│   │   ├── safety-car.svg
│   │   └── virtual-safety-car.svg
│   ├── stories/
│   │   ├── brawn-2009/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── button-canada/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── collins-fangio-1956/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── dijon-1979/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── fangio-nurburgring/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── hakkinen-schumacher/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── hamilton-silverstone/
│   │   │   ├── full/
│   │   │   │   └── 01.png
│   │   │   ├── landscape/
│   │   │   │   └── 01.png
│   │   │   └── portrait/
│   │   │       └── 01.png
│   │   ├── hunt-lauda/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   └── 02.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       └── 02.png
│   │   ├── imola-1994/
│   │   │   ├── full/
│   │   │   │   └── 01.png
│   │   │   ├── landscape/
│   │   │   │   └── 01.png
│   │   │   └── portrait/
│   │   │       └── 01.png
│   │   ├── jaguar-monaco-diamond/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── jerez-1997/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── massa-2008/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── monaco-1982/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── schumacher-1994-spain/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── schumacher-ferrari/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   ├── senna-donington-1993/
│   │   │   ├── full/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   ├── landscape/
│   │   │   │   ├── 01.png
│   │   │   │   ├── 02.png
│   │   │   │   └── 03.png
│   │   │   └── portrait/
│   │   │       ├── 01.png
│   │   │       ├── 02.png
│   │   │       └── 03.png
│   │   └── senna-monaco/
│   │       ├── full/
│   │       │   ├── 01.png
│   │       │   └── 02.png
│   │       ├── landscape/
│   │       │   ├── 01.png
│   │       │   └── 02.png
│   │       └── portrait/
│   │           ├── 01.png
│   │           └── 02.png
│   ├── teams/
│   │   └── 2026/
│   │       ├── alpine.svg
│   │       ├── aston-martin.svg
│   │       ├── audi.svg
│   │       ├── cadillac.svg
│   │       ├── ferrari.svg
│   │       ├── haas.svg
│   │       ├── mclaren.svg
│   │       ├── mercedes.svg
│   │       ├── racing-bulls.svg
│   │       ├── red-bull.svg
│   │       └── williams.svg
│   ├── tyres/
│   │   ├── c1.svg
│   │   ├── c2.svg
│   │   ├── c3.svg
│   │   ├── c4.svg
│   │   ├── c5.svg
│   │   ├── full-wet.svg
│   │   ├── hard.svg
│   │   ├── intermediate.svg
│   │   ├── medium.svg
│   │   ├── soft.svg
│   │   └── wet.svg
│   ├── favicon.svg
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── placeholder.svg
│   ├── sw.js
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   ├── build-story-content.ts
│   ├── dedupe-f1-snapshots.ts
│   ├── normalize-driver-slugs.ps1
│   ├── seed-f1-history.ts
│   ├── seed-stories.ts
│   └── sync-f1-scheduled.ts
├── supabase/
│   ├── .temp/
│   │   ├── cli-latest
│   │   ├── gotrue-version
│   │   ├── linked-project.json
│   │   ├── pooler-url
│   │   ├── postgres-version
│   │   ├── project-ref
│   │   ├── rest-version
│   │   ├── storage-migration
│   │   └── storage-version
│   ├── migrations/
│   │   ├── 20260603000001_initial_schema.sql
│   │   └── 20260606000001_partial_unique_index.sql
│   ├── .gitignore
│   └── config.toml
├── test-results/
│   └── .last-run.json
├── tests/
│   ├── aggregate.test.ts
│   ├── cronAuth.test.ts
│   ├── f1Calendar.test.ts
│   ├── f1-icons.test.ts
│   ├── f1-read-fallback.test.ts
│   ├── mrdata-round.test.ts
│   └── rateLimit.test.ts
├── types/
│   └── database.ts
├── .env.example
├── .env.local
├── .env.local.append
├── .env.sentry-build-plugin
├── .gitignore
├── AGENTS.md
├── eslint.config.mjs
├── instrumentation.ts
├── instrumentation-client.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── proxy.ts
├── README.md
├── sentry.edge.config.ts
├── sentry.server.config.ts
├── tsconfig.json
├── tsconfig.tsbuildinfo
├── vercel.json
└── vitest.config.ts

```

---

*Bu dosya otomatik olarak kök dizin taramasıyla üretilmiştir.*