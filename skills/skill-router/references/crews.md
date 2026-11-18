# The 7 Crews — full roster

Your Claude workforce, organized like a company (inspired by the @leadgenman
"Claude Workforce" model) but mapped to YOUR actual installed skills. The router
picks a crew first, then a chain inside it. Skills can appear in more than one
crew.

Namespace key: `sp:`=superpowers, `mps:`=my-personal-skills, `ts:`=taste-skill,
`ui:`=ui-skills, unprefixed = top-level/Anthropic-official.

---

## 🟠 DEV — "Ship code faster, from scaffold to QA"
Process leads, then implement, then verify.
- **Process:** `sp:brainstorming`, `sp:writing-plans`, `sp:test-driven-development`, `sp:systematic-debugging`, `sp:verification-before-completion`
- **Frontend build:** `mps:react-patterns`, `mps:react-performance`, `mps:nextjs-turbopack`, `mps:ui-to-vue`, `mps:nuxt4-patterns`, `mps:frontend-patterns`, `mps:vite-patterns`
- **Backend:** `mps:api-design`, `mps:fastapi-patterns`, `mps:django-patterns`, `mps:springboot-patterns`, `mps:golang-patterns`, `mps:rust-patterns`
- **Data layer:** `mps:postgres-patterns`, `mps:mysql-patterns`, `mps:prisma-patterns`, `mps:redis-patterns`, `mps:database-migrations`
- **Test/QA:** `webapp-testing`, `mps:e2e-testing`, `mps:react-testing`, `mps:python-testing`, `debug-mantra`, `scrutinize`
- **Deploy:** `mps:deployment-patterns`, `mps:docker-patterns`, `mps:kubernetes-patterns`
- **Tooling/meta:** `skill-creator`, `mcp-builder`, `mps:skill-scout`, `sp:writing-skills`
- **Live docs:** Context7 MCP (see Gaps), `mps:documentation-lookup`

## 🟣 DESIGN — "UI that never looks templated"
- **Direction:** `ts:taste-skill`, `frontend-design`, `mps:frontend-design-direction`, `mps:high-end-visual-design`, `mps:design-system`
- **Build UI:** `ui:ui-skills-root`, `ui:baseline-ui`, `web-artifacts-builder`, `mps:image-to-code`
- **A11y:** `ui:fixing-accessibility`, `mps:frontend-a11y`, `mps:accessibility`
- **Motion:** `mps:motion-ui`, `mps:motion-foundations`, `mps:motion-advanced`
- **Visual art:** `canvas-design`, `algorithmic-art`, `theme-factory`, `brand-guidelines`, `slack-gif-creator`
- **Styles:** `ts:minimalist-skill`, `mps:industrial-brutalist-ui`, `mps:liquid-glass-design`

## 🔴 MARKETING — "Copy, SEO and ads that convert"
- **SEO:** `mps:seo-audit`, `mps:seo`, `mps:programmatic-seo`, `mps:ai-seo`, `mps:site-architecture`
- **Conversion:** `mps:cro`, `mps:ab-testing`, `mps:paywalls`, `mps:popups`
- **Ads:** `mps:ads`, `mps:ad-creative`
- **Copy:** `mps:copywriting`, `mps:copy-editing`, `mps:marketing-psychology`, `mps:brand-voice`
- **Plan:** `mps:marketing-plan`, `mps:marketing-campaign`, `mps:content-strategy`

## 🔵 SOCIAL & CONTENT — "Feed the algorithm on autopilot"
- **Posting:** `mps:social`, `mps:social-publisher`, `mps:crosspost`
- **Strategy:** `mps:content-strategy`, `mps:content-engine`, `mps:programmatic-seo`
- **Long-form:** `mps:article-writing`, `mps:edit-article`, `mps:writing-shape`, pillar content via `mps:content-engine`
- **Video:** `mps:video`, `mps:video-editing`, `mps:remotion-video-creation`, `mps:manim-video`
- **Email:** `mps:emails`, `mps:cold-email`, `mps:email-ops`

## 🟢 FINANCE — "Model the numbers before you spend"
- **Have:** `mps:pricing`, `mps:investor-materials`, `mps:investor-outreach`, `xlsx` (Excel w/ live formulas), `mps:market-research`, `mps:cost-tracking`
- **Pitch:** `mps:investor-materials` + `pptx` + DESIGN crew for the deck
- **Gaps (proprietary in ad):** dcf-model, lbo-model, 3-statements, comps-analysis
  → build with `xlsx` + a finance prompt; see Gaps section.

## 🟩 OPS — "Run the business like a machine"
- **Runbooks/SOPs:** `mps:launch`, `mps:handoff`, `mps:knowledge-ops`, `mps:project-flow-ops`
- **Post-mortems:** `post-mortem`, `mps:verification-loop`
- **Comms:** `internal-comms`, `management-talk`, `mps:unified-notifications-ops`
- **Docs/sheets:** `docx`, `xlsx`, `pdf`, `doc-coauthoring`
- **Business case:** `mps:product-capability`, `mps:pricing` + `xlsx`

## ⚫ LEGAL — "Read the fine print for you"
- **Have (partial):** `mps:security-review`, `mps:hipaa-compliance`,
  `mps:healthcare-phi-compliance`, `mps:customs-trade-compliance`, `docx`, `pdf`
- **Gaps (proprietary in ad):** contract-review, nda-triage, legal-risk,
  general compliance, sql-queries → see Gaps section.

---

## Gaps — ad cards with NO free/public source
These were @leadgenman's own proprietary skills. Not installable; build from what
you own instead:

| Ad card | How to replicate with your skills |
|---|---|
| dcf-model / lbo-model / 3-statements / comps-analysis | `xlsx` skill + a finance-modeling prompt; treat as an OPS/FINANCE `xlsx` chain |
| contract-review / nda-triage / legal-risk | `docx`/`pdf` to read + `mps:security-review`-style clause-by-clause prompt |
| compliance | `mps:hipaa-compliance` / `mps:customs-trade-compliance` as templates |
| sql-queries | DEV crew: `mps:postgres-patterns` + write queries directly |
| Context7 (live docs) | Install separately as MCP: `npx -y @upstash/context7-mcp` (not a skill) |
| Claude-Mem (cross-session memory) | You already have file-based auto-memory (MEMORY.md) |
