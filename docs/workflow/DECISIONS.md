# DECISIONS

Architect appends; newest last. One entry per decision.

<!-- Entry format
## YYYY-MM-DD <title>
- Decision:
- Why / rejected alternative:
- Affects: PLAN.md steps, files
-->

## 2026-10-20 Two-session workflow
- Decision: Opus (Architect) plans and decides; Sonnet (Builder) implements; files in `docs/workflow/` are the only bridge. Rules live in `AGENTS.md`.
- Why: Cheaper builds, no reliance on chat history. Root-file rule forbids PLAN/OPEN/DECISIONS/ARCHITECTURE in the root, hence `docs/workflow/`.
- Affects: `AGENTS.md`, `.claude/agents/`, `.github/workflows/ci.yml` (wip/** push trigger).

## 2026-10-20 Production migrations: Opus audit, then agent applies
- Decision: the owner does not read migrations; an Opus/xhigh audit (PASS recorded here) authorizes an agent to apply via the Supabase connector's `apply_migration`. Destructive statements and data changes still need the owner. Rules in `AGENTS.md` "Migration safety".
- Why: the owner delegated review; a model-restricted gate keeps the review meaningful. Live migration versions match the repo files 1:1 (10 of 10) on 2026-10-20.
- Affects: `AGENTS.md`, `docs/workflow/model-effort.md`.
- Amendment 2026-10-20: the owner does not read SQL and delegated destructive statements too to the Opus/xhigh auditor, narrowed: the audit must record row counts, dependents and a recovery path that exists beforehand, the statement sits alone in its file, and non-regenerable data without recovery, unbounded scope or auditor doubt = FAIL. Data/content changes still need the owner.

## 2026-10-20 Model/effort per phase and step
- Decision: every plan phase/step carries `Run: model / effort`, chosen by the plan writer from `docs/workflow/model-effort.md` without being asked. Owner-mandated models (Faz 13, 14: Opus 5.5) win; `max` and `ultracode` need the owner's OK.
- Why: effort levels are recalibrated per model version; the right level is a planning decision, not a runtime guess.
- Affects: `AGENTS.md`, `docs/plans/master-plan.md`, `docs/workflow/PLAN.md`, `.claude/agents/architect.md`.
