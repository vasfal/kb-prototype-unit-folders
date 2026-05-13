# AI Pilot — Process Learnings

This file collects process learnings from the AI-assisted product-discovery pilot. It is **separate from product decisions** (`DECISIONS.md`) and PRDs: entries here are about *how the team uses agents to do the work*, not about the KB product itself.

Format: each entry has a date, source, and short body. Append new entries at the bottom.

---

## 2026-05-12 — KB Discovery Review

**Source:** [MEETING_NOTES_2026-05-12_kb_discovery_review.md](meetings/MEETING_NOTES_2026-05-12_kb_discovery_review.md)

### L1 — Solution-design agent under-validates context before producing prototypes

Zhenya observed that the concept-architect agent ("concept architect / solution design") jumped from discovery to prototype without thoroughly reconciling the unit/sub-unit model with the stories it generated. Stories contradicted each other; the second pass after restart still missed pieces.

**Implication.** The pipeline's current "fast to prototype, iterate on the prototype" trade-off (Vasyl's chosen flow) maximizes time-to-visible-artifact at the cost of internal consistency in the spec. The team is open to inverting this — validate the spec more deeply up front — if it reduces total loop count.

**Action.** Vasyl to experiment with stronger up-front spec validation. Not committed yet — current flow stays as default until tested.

### L2 — Two-level / judge-layer architecture is the next agent-pipeline upgrade

Yan articulated, and the room agreed, that the agent pipeline needs a critic/judge layer: a second agent that reviews each artifact (research output, epic, prototype description) produced by the primary agent and writes back issues/suggestions before the primary agent is asked to revise.

**Implication.** Vasyl already runs a "3 Amigos" review (EM + QA + PM agents) over epics, but it isn't applied to every artifact. The judge pattern should generalize: for every key artifact, a downstream agent inspects and annotates.

**Action.** Erik to prototype the judge layer as part of the orchestration work due before the next group meeting.

### L3 — Per-agent base context (digest of project docs) is needed

Yan proposed: each agent, on initialization, should ingest the project docs once and write its own short context digest (CLAUDE.md-style file) capturing what's load-bearing for *that role*. Subsequent runs hydrate from this digest instead of re-reading every doc.

**Implication.** Documentation quality limits agent quality regardless of model choice ("в реальному світі документації які можна довіряти зараз не дуже багато" — in the real world there isn't much documentation you can trust). Per-role digests are a partial mitigation: even if root docs are uneven, the agent has a curated frame.

**Action.** Defer to Erik's orchestration work. No immediate change.

### L4 — PRD chunking hypothesis: ~1000-character MD files outperform 50-page Confluence pages

Vasyl raised, and the team accepted as a test: instead of feeding agents a multi-page Confluence PRD, try three small MD files of ~1000 characters each as the canonical brief for an epic. The hypothesis is that smaller, focused chunks are easier for both human reviewers and agents to keep coherent.

**Implication.** This trades comprehensiveness for reviewability. Worth a controlled test before committing.

**Action.** Vasyl will trial on the next epic. No process change yet.

### L5 — Star-rating per agent for quality calibration

Vasyl has implemented a simple per-agent quality signal: +1 star when an agent produces a correct artifact, –2 when a reviewer (human or downstream agent) catches an error the agent should have prevented. At epic-close ("demystification"), the team reviews per-agent stars and decides which agents to keep, retrain, or retire.

**Implication.** Provides a feedback loop that scales with agent count. Not yet automated.

**Action.** Continue informally. Worth formalizing into a small dashboard later.

### L6 — Cross-prototype comparison via AI is unproven

Vasyl, Zhenya, and Alex each produced a prototype variant. Yan asked whether an AI agent could compare two prototypes side-by-side and synthesize differences. Erik's caution: at first encounter, model quality on this task is likely poor — the prototypes are stateful UIs, not text artifacts, and tokens needed to crawl all flows would be high.

**Implication.** Cross-prototype comparison is currently a manual job. A textual "prototype contract" (functional spec extracted from the prototype) might bridge the gap; we don't have one yet.

**Action.** Open question. Vasyl mentioned exploring a discipline where every prototype emits a small companion doc describing its contracts; nothing committed.

### L7 — Engineering-Manager agent (architecture) is currently underpowered

Vasyl said the EM agent that inspects current architecture before proposing solutions "недопрацьовує сильно" (underperforms significantly). It's part of the 3-Amigos pipeline but produces shallow analysis.

**Implication.** The EM agent is the bridge between product design and engineering reality; if it's weak, technical infeasibilities leak through.

**Action.** Erik to harden as part of the orchestration work.

### L8 — Team collaboration substrate for prompts/agents/artifacts is unresolved

Yuliana raised that the team has no shared substrate for prompts, agent definitions, evaluation artifacts, or experiment runs — Vasyl, Zhenya, and Erik are working locally.

**Implication.** Without this, the pilot can't multiply. Each person reinvents the same agents and the team can't compare like-for-like.

**Action.** Vasyl + Zhenya + Erik to settle the collaboration setup independently before the next group meeting.

---

*End of log.*
