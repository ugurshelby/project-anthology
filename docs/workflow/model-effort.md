# Model and effort selection

Last verified: 2026-10-20 (Claude Code effort levels; Opus 5.5, Sonnet 5.5, Haiku 5.5 start at `medium`). Changes 2026-10-20: Haiku Builder row added; "production migration" removed from the `max` row (it contradicted the AGENTS migration audit at Opus / xhigh); rule 4 clarified (mandated-model sessions take the effort of the task row). Levels are recalibrated per model and version: when a new model ships, re-test a level, update this file, then re-check the `Run:` lines of open plans.

Whoever writes or changes a plan reads this file first and puts a `Run:` line on every phase and every step, without being asked. Authority: `AGENTS.md` section "Two-session workflow".

## Levels

| Level | Use for |
|---|---|
| low | Mechanical: rename, format, boilerplate, tick checkboxes, "read this and report" |
| medium | Daily coding: clear scope, simple fix, tests for known behavior |
| high | Verification matters or edge cases appear: hard debugging, multi-file refactor, API/route/data changes, design questions |
| xhigh | Hardest judgment: architecture, security design, migration design, "must be right"; long unattended runs |
| max | Deepest analysis, no token limit, overthinking risk. Only for decisions that are costly to reverse. No measurable gain over xhigh seen = do not use |

Separate switches, not levels:
- `ultracode`: Claude Code setting (`/effort ultracode`, off with `/effort ultracode off`; or the word "ultracode" in one prompt). Runs dynamic multi-agent workflows; very expensive (over 1.5M tokens = "large"). Only when the owner asks, for codebase-wide security sweeps, large migrations, wide verification. Turn it off afterwards.
- `ultrathink`: pins one turn to `high`. Never use it in an `xhigh`/`max` session (it lowers effort).
- Persistence: the `effortLevel` setting stores low/medium/high/xhigh only; `max` and `ultracode` last for the session.
- Set with `/effort <level>`, `claude --effort <level>`, or `CLAUDE_CODE_EFFORT_LEVEL`.

## Task to Run

| Task | Model / effort |
|---|---|
| Plan or answer `OPEN.md` for non-trivial work, architecture, security or crypto design, migration design, data-model or API-shape decisions | Opus / xhigh |
| Plan for a small, well-understood change | Opus / medium |
| Implement security-sensitive code, migrations, multi-file refactor, hard bug, live-race debugging, first CI failure that is not obvious | Sonnet / high |
| Scoped feature, simple fix, tests for known behavior, route wiring, doc updates that need judgment | Sonnet / medium |
| Rename, format, boilerplate, tick/untick plan boxes, log entries, placeholder swaps, read-only SQL lookups | Sonnet / low |
| A step the plan fully specifies (exact files, exact edit, exact verify, no choice left): file deletion, placeholder swap, removing a named block | Haiku / low (Builder session) |
| Exploration, "where does X live", reading more than 3 files | `scout` subagent (Haiku, read-only) |
| Audit a migration before it is applied to production (only Opus may give this verdict) | Opus / xhigh |
| Decision costly to reverse (auth scheme, public data model). Not migration audits: AGENTS "Migration safety" fixes those at Opus / xhigh | Opus / max, only after the owner says "max OK" |
| Codebase-wide audit or large migration | `ultracode`, only when the owner asks |

## Rules for plan writers

1. Every phase heading carries `Run: <model> / <effort> — <reason, max 10 words>`. A step repeats the line only when it differs from its phase.
2. A phase is one session and one model. Never mix models inside a phase; effort may change between steps (`/effort`). Group steps so this holds. Since 2026-10-28 (owner) there are three standing sessions, one per model (Opus, Sonnet, Haiku), each working its queue in `PLAN.md` in order; never two sessions on the same model at once.
3. Unlisted task: `Sonnet / medium`. Choose the lowest level whose row fits; justify anything higher in the reason.
4. Owner-mandated model wins (for example Faz 13 and 14 name Opus 5.5 for execution; such a session is a Builder session, see `DECISIONS.md` 2026-10-20 "Faz 13/14 execution"). The effort is still chosen from the table, using the row of the task (e.g. security code = high), not the Architect row.
5. Non-Claude agents: write `Run: <agent> (own model)`; effort does not apply. Owner steps: write `Run: owner`.
6. A level the model does not offer: use the next lower one and say so in the reason.
7. Builder escalation: on the third attempt at the same error it may raise effort one level; after that it writes `OPEN.md` and stops (the 3-attempt rule still holds). Changing model needs a new session.
8. A plan or plan item without a `Run:` line is incomplete: the Architect adds it before the Builder starts, and any session that edits a plan item adds or updates the line in the same change.
