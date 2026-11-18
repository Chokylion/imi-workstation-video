# Decision Tree — yes/no flowchart

The router walks this top-down. First matching branch wins. Every build/design
branch starts with a **process** skill and ends with **verification**.

```
START: read the prompt
│
├─ Is it a BUG / failing test / error?
│    └─ YES → superpowers:systematic-debugging
│             → debug-mantra
│             → scrutinize            (review the fix)
│             → post-mortem           (if notable / recurring)
│    (skip the rest)
│
├─ Is it "make / find / manage a SKILL"?
│    └─ YES → mps:skill-scout (search first)
│             → superpowers:writing-skills OR mps:write-a-skill
│
├─ Is it DESIGN-FIRST? (landing, redesign, "make it look good", brand)
│    └─ YES → superpowers:brainstorming
│         ├─ Marketing / landing / portfolio?
│         │     └─ taste-skill:taste-skill
│         ├─ Product UI / dashboard / multi-step?
│         │     └─ ui-skills:ui-skills-root + mps:frontend-design-direction
│         └─ then: ui-skills:fixing-accessibility → mps:motion-ui
│         │
│         └─ Will it be BUILT now?
│               ├─ NO  → stop after design (deliver mockup/direction)
│               └─ YES → continue into WEB-APP BUILD ↓
│
├─ Is it a WEB / APP BUILD?
│    └─ YES → superpowers:brainstorming
│         ├─ Web or native?
│         │     ├─ Native mobile → iOS: mps:swiftui-patterns · Android: mps:android-clean-architecture · Flutter: mps:dart-flutter-patterns
│         │     └─ Web → framework?
│         │            ├─ React/Next → mps:react-patterns (+ mps:react-performance)
│         │            ├─ Vue        → mps:ui-to-vue
│         │            └─ Nuxt       → mps:nuxt4-patterns
│         ├─ Starting from an image/mockup? → prepend mps:image-to-code
│         ├─ Tests wanted? → mps:react-testing / mps:<lang>-testing
│         ├─ Deploy? → mps:deployment-patterns (+ mps:docker-patterns)
│         └─ END → superpowers:verification-before-completion
│
├─ Is it BACKEND / API / DATA?
│    └─ YES → superpowers:brainstorming → mps:api-design
│         ├─ Language/framework?
│         │     ├─ Python → mps:fastapi-patterns OR mps:django-patterns
│         │     ├─ JVM    → mps:springboot-patterns OR mps:quarkus-patterns
│         │     ├─ PHP    → mps:laravel-patterns
│         │     └─ Go/Rust→ mps:golang-patterns / mps:rust-patterns
│         ├─ Database? → mps:postgres-patterns / mps:mysql-patterns / mps:prisma-patterns (+ mps:database-migrations)
│         ├─ Security-sensitive? → mps:<framework>-security OR mps:security-review
│         └─ END → mps:<framework>-verification OR superpowers:verification-before-completion
│
├─ Is it DATA / DASHBOARD / ANALYTICS? (BI, charts, metrics)
│    └─ YES → mps:dashboard-builder OR mps:analytics → dataviz → verification
│
├─ Is it RESEARCH?
│    └─ YES → how deep?
│         ├─ Deep, cited report → deep-research (top-level)
│         ├─ Market/competitor  → mps:market-research + mps:competitor-profiling
│         └─ then → mps:research-ops (organize findings)
│
├─ Is it MARKETING / GROWTH?
│    └─ YES → mps:marketing-plan
│         ├─ Channel? ads → mps:ads · SEO → mps:seo · email → mps:cold-email · social → mps:social
│         ├─ Need copy? → mps:copywriting (+ mps:ad-creative)
│         └─ Measure? → mps:ab-testing / mps:analytics
│
├─ Is it 3D / WebGL / shader?
│    └─ YES → threejs-fundamentals → relevant threejs-* (geometry/materials/lighting/animation/shaders/…)
│
├─ Is it DOCS / WRITING?
│    └─ YES → PRD → mps:to-prd · issues → mps:to-issues · article → mps:article-writing → mps:edit-article
│
├─ Is it AGENTS / ORCHESTRATION / AUTOMATION?
│    └─ YES → build an agent? → mps:agent-harness-construction / mps:mcp-server-patterns
│           multi-step orchestration? → mps:orch-pipeline / mps:plan-orchestrate
│           evaluate an agent? → mps:agent-eval / mps:eval-harness
│
└─ BIG / UNCLEAR / MULTI-DOMAIN?
     └─ superpowers:brainstorming → superpowers:writing-plans
        → mps:orch-pipeline (execute in phases)
        → superpowers:verification-before-completion
```

## Tie-breakers
- Two design skills match → prefer the one whose description fits the brief;
  still tied → more specific (`taste-skill:minimalist-skill` over generic).
- A `my-personal-skills` skill and a bundle skill overlap → pick by description
  match, not namespace.
- Never name a skill you can't confirm exists — run `mps:skill-scout` instead.

## Chain length
Keep to 2–6 steps. If the natural chain is longer, split into **phases** and run
phase 1, report, then continue — don't dump a 10-step pipeline at once.
