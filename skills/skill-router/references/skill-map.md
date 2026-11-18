# Skill Map — domain → skill index

The router uses this to classify a prompt and pick candidate skills. Namespaces:
`my-personal-skills:*` (mps), `taste-skill:*`, `ui-skills:*`, `superpowers:*`,
`threejs-*`, `ponytail:*`, plus 9arm (`debug-mantra`, `post-mortem`,
`qwen-agent`, `scrutinize`, `management-talk`, `qwenchance`).

> Only representative skills are listed per domain (the library has 380+). When a
> match isn't here, fall back to `skill-scout` to search the full set.

---

## 1. design / frontend
**Signals:** design, landing page, redesign, UI, look, aesthetic, brand, mockup, style.
- Direction: `taste-skill:taste-skill`, `mps:frontend-design-direction`, `mps:design-system`, `mps:high-end-visual-design`
- Styles: `taste-skill:minimalist-skill`, `mps:industrial-brutalist-ui`, `mps:liquid-glass-design`, `mps:minimalist-ui`
- Accessibility: `ui-skills:fixing-accessibility`, `mps:frontend-a11y`, `mps:accessibility`
- Motion: `mps:motion-ui`, `mps:motion-foundations`, `mps:motion-advanced`, `mps:motion-patterns`
- Image→UI: `mps:image-to-code`, `mps:imagegen-frontend-web`, `mps:imagegen-frontend-mobile`
- Slides/brand: `mps:frontend-slides`, `mps:brandkit`
- Entry point: `ui-skills:ui-skills-root` (selects smallest UI context)

## 2. web-app build
**Signals:** build app, website, component, page, framework name.
- React: `mps:react-patterns`, `mps:react-performance`, `mps:react-testing`, `mps:nextjs-turbopack`
- Vue/Nuxt: `mps:ui-to-vue`, `mps:nuxt4-patterns`
- Angular: `mps:angular-developer`
- Patterns/build: `mps:frontend-patterns`, `mps:vite-patterns`, `mps:orch-build-mvp`, `mps:post-build-flow`
- Deploy: `mps:deployment-patterns`, `mps:docker-patterns`, `mps:kubernetes-patterns`

## 3. backend / data
**Signals:** API, endpoint, database, server, model, query, migration.
- API: `mps:api-design`, `mps:api-connector-builder`, `mps:backend-patterns`
- Python: `mps:fastapi-patterns`, `mps:django-patterns`, `mps:django-celery`, `mps:python-patterns`
- JVM: `mps:springboot-patterns`, `mps:quarkus-patterns`, `mps:jpa-patterns`
- PHP/Go/Rust: `mps:laravel-patterns`, `mps:golang-patterns`, `mps:rust-patterns`
- DB: `mps:postgres-patterns`, `mps:mysql-patterns`, `mps:redis-patterns`, `mps:prisma-patterns`, `mps:clickhouse-io`, `mps:database-migrations`
- Data/BI: `mps:dashboard-builder`, `mps:analytics`, `mps:data-table-manager`

## 4. mobile / native
**Signals:** iOS, Android, Swift, Kotlin, Flutter, app store.
- iOS: `mps:swiftui-patterns`, `mps:swift-concurrency-6-2`, `mps:ios-icon-gen`
- Android/Kotlin: `mps:android-clean-architecture`, `mps:kotlin-patterns`, `mps:compose-multiplatform-patterns`
- Flutter: `mps:dart-flutter-patterns`, `mps:flutter-dart-code-review`

## 5. research
**Signals:** research, find out, compare, analyze market, literature, sources.
- `mps:deep-research` (or top-level `deep-research`), `mps:market-research`, `mps:research-ops`
- `mps:literature-review`, `mps:competitor-profiling`, `mps:customer-research`, `mps:iterative-retrieval`

## 6. marketing / growth
**Signals:** launch, ads, SEO, copy, campaign, email, social, pricing.
- Plan: `mps:marketing-plan`, `mps:marketing-campaign`, `mps:launch`, `mps:content-strategy`
- Copy: `mps:copywriting`, `mps:copy-editing`, `mps:ad-creative`, `mps:brand-voice`
- Channels: `mps:ads`, `mps:seo`, `mps:ai-seo`, `mps:social`, `mps:cold-email`, `mps:emails`
- Optimize: `mps:cro`, `mps:ab-testing`, `mps:pricing`, `mps:analytics`

## 7. debug / review / quality
**Signals:** bug, broken, failing, error, review, audit, secure, test.
- Debug: `superpowers:systematic-debugging`, `debug-mantra`, `mps:agent-introspection-debugging`
- Review: `scrutinize`, `mps:review`, `mps:security-review`, `mps:repo-scan`, `mps:production-audit`
- Post-fix: `post-mortem`, `mps:verification-loop`
- Test/TDD: `superpowers:test-driven-development`, `mps:tdd`, `mps:e2e-testing`, `mps:<lang>-testing`

## 8. agents / infra / orchestration
**Signals:** agent, orchestrate, pipeline, multi-step, MCP, harness, eval, automate.
- Orchestrate: `mps:orch-pipeline`, `mps:plan-orchestrate`, `mps:team-agent-orchestration`, `superpowers:dispatching-parallel-agents`
- Build agents: `mps:agent-harness-construction`, `mps:autonomous-agent-harness`, `mps:mcp-server-patterns`, `mps:workflow-builder`
- Eval/audit: `mps:agent-eval`, `mps:eval-harness`, `mps:agent-architecture-audit`
- n8n: `mps:n8n-*` family

## 9. docs / writing
**Signals:** write, article, document, PRD, issue, explain, handoff.
- `mps:article-writing`, `mps:edit-article`, `mps:writing-shape`, `mps:writing-beats`
- `mps:to-prd`, `mps:to-issues`, `mps:blueprint`, `mps:handoff`, `mps:teach`, `mps:documentation-lookup`

## 10. 3D / graphics
**Signals:** three.js, WebGL, 3D, shader, mesh, scene, animation.
- Start: `threejs-fundamentals` → then `threejs-geometry`, `threejs-materials`,
  `threejs-lighting`, `threejs-animation`, `threejs-shaders`, `threejs-postprocessing`,
  `threejs-interaction`, `threejs-loaders`, `threejs-textures`

## 11. meta — make / manage skills
**Signals:** create a skill, is there a skill, orchestrate my skills.
- `mps:skill-scout` (search first), `superpowers:writing-skills`, `mps:write-a-skill`
- `mps:skill-stocktake`, `mps:agent-sort`, `skill-router` (this skill)

## 12. process (always available, lead the chain)
- New/creative work → `superpowers:brainstorming`
- Any bug → `superpowers:systematic-debugging`
- Multi-step spec → `superpowers:writing-plans` → `superpowers:executing-plans`
- Before "done" → `superpowers:verification-before-completion`
- Codebase questions / architecture → `graphify`
