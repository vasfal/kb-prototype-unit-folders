---
artifact_type: user-mental-model
feature: knowledge-base
stage: domain-modeling
status: draft
version: 1.0
created_by: landscape-mapper
created_at: 2026-04-22
reviewed_by: —
reviewed_at: —
approved_by: —
approved_at: —
inputs:
  - artifact_type: research-synthesis
    feature: knowledge-base
    version: 1.0
  - artifact_type: user-signals
    feature: knowledge-base
    version: 1.0
  - artifact_type: domain-facts
    feature: knowledge-base
    version: 1.0
changelog:
  - version: 1.0
    date: 2026-04-22
    author: landscape-mapper
    note: Initial user mental model extraction from research synthesis, user signals, and domain facts.
pm_action_required: false
pm_action_description: —
---

> **About this document**
>
> **What:** User Mental Model for the Knowledge Base feature -- how the four Employo personas (Andrii, Maryna, Dmytro, Oksana) think about, categorize, and interact with HR knowledge. This maps the mental landscape, not the system landscape.
> **Why:** Before building a conceptual model or framing problems, we must understand how users already think about this domain. Every mismatch between user mental model and system model creates friction, confusion, or adoption failure. This artifact makes mismatches visible.
> **Stage:** Domain Modeling (post-Research) -- Discovery: Knowledge Base

> **TL;DR**
>
> Users think about HR knowledge through four distinct frames: employees organize it by "when I need it" (trigger-based), HR admins organize it by content type and audience (structural), managers organize it by "what my team needs" (scope-based), and HR directors organize it by compliance risk and measurability (outcome-based). The deepest terminology gap is between employees who say "where do I find..." and vendors who say "Knowledge Base" -- employees do not think in terms of repositories, they think in terms of answers. Three critical mental model tensions emerge: (1) users expect "delete" to mean "gone" but compliance requires retention; (2) users conflate "I read it" with "I agree to it" but these are legally distinct; (3) users expect Notion-like editing but HRIS platforms typically deliver file upload. All user signals are indirect (no interviews conducted), which is the single largest confidence limitation.
>
> **Status:** draft -- 2026-04-22

---

# User Mental Model -- Knowledge Base

## 1. How Users Categorize HR Knowledge

Users do NOT think in terms of "Knowledge Base" as a product feature. They think in terms of what they need and when they need it. Four distinct categorization frames emerge from the evidence, one per persona.

### 1.1 Andrii (Employee IC) -- "When I need it" frame

Andrii organizes HR knowledge by **trigger moments**, not by topic hierarchy.

| Category (Andrii's frame) | What it contains | Evidence |
|---|---|---|
| **"Day one stuff"** | Onboarding checklist, who's who, where things are, first-week survival info | User Signals 6.1: "31% describe onboarding as overwhelming"; Research Synthesis JTBD-5 (onboarding) |
| **"How do I..."** | Leave requests, expense reports, sick day procedures, working from home rules | User Signals 5.2: employees search using action-oriented terms -- "request time off", "submit leave", "expense report" |
| **"What's the rule on..."** | PTO policy, dress code, remote work policy, holiday schedule | User Signals 5.2: search terms are colloquial -- "PTO", "vacation", "sick day"; not "Absence Management Policy v3.2" |
| **"Something changed"** | Policy updates, new benefits, organizational changes | User Signals 6.2: policy changes trigger a cascade of "did I miss something?" questions |
| **"I need to sign something"** | Documents requiring acknowledgement or signature | User Signals 1.4: users see acknowledgement as an administrative task, not a learning moment |

Andrii does NOT categorize by department, folder hierarchy, or content type. He categorizes by **the moment he needs the information**. He will never browse a folder tree -- he will search, ask, or give up and email HR.

**Evidence:** User Signals 4.1 -- "it should just answer my question" (HIGH density); User Signals 1.2 -- "if employees can't find what they need quickly, they'll default to emailing HR" [Desk365]; Research Synthesis Pattern 3 -- AI is reshaping expectations from "search and find" to "ask and get."

### 1.2 Maryna (HR Admin) -- "Content type and audience" frame

Maryna organizes HR knowledge by **what kind of content it is** and **who should see it**.

| Category (Maryna's frame) | What it contains | Evidence |
|---|---|---|
| **Policies** | Formal rules: code of conduct, leave policy, remote work policy, anti-harassment | User Signals 5.3: HR admins distinguish "policies" as formal rules with compliance weight |
| **Playbooks** | Step-by-step HR process guides: onboarding playbook, offboarding checklist, probation review process | Discovery Intake: PM stated "HR-admin KB with internal HR playbooks, process templates, and checklists" |
| **Templates** | Reusable documents: offer letter template, performance review template, exit interview questions | User Signals 5.3; confirmed by Notion HR template ecosystem (User Signals 3.1) |
| **Checklists** | Task-based process lists: new hire checklist, equipment return list, compliance audit checklist | Discovery Intake: PM explicitly mentioned "checklists" |
| **FAQ / How-to** | Answers to common employee questions: "How do I request leave?", "What's the dress code?" | User Signals 5.3; Research Synthesis JTBD-1 (find the answer myself) |
| **Announcements / Updates** | Policy changes, new benefits, organizational news | Cluster Registry: Engagement & Collaboration > Announcements; User Signals 6.2 |

Maryna thinks about **audience** as a first-class concept: "This policy goes to Engineering, this one goes to everyone, this playbook is HR-only." She distinguishes between employee-facing content and HR-internal content.

**Evidence:** Discovery Intake -- PM described "two-part" audience (employees + HR admins); User Signals 4.3 -- "different people should see different things" (MEDIUM density); Internal Context -- colleague analyzed decentralization approaches specifically for audience scoping.

### 1.3 Dmytro (Manager) -- "What my team needs" frame

Dmytro organizes HR knowledge by **team relevance** and **action triggers**.

| Category (Dmytro's frame) | What it contains | Evidence |
|---|---|---|
| **"Things I approve"** | Leave policies (to understand what he's approving), expense rules, remote work eligibility | Product Context: Dmytro's job -- "approve leaves, run 1:1s, review team performance" |
| **"How do I handle..."** | Termination procedure, performance improvement steps, conflict resolution | Market Landscape use case #4: "manager looks up termination procedure" |
| **"My team's onboarding"** | New hire orientation materials, team-specific guides, role-specific procedures | Research Synthesis JTBD-5; Product Context persona |
| **"Company rules I should know"** | Policies that affect how he manages: harassment policy, performance review process, promotion criteria | Inferred from Product Context (Dmytro uses Employo 2-3 times/month for approvals and reviews) |

Dmytro's mental model is **scoped to his team**. He does not want to see policies for the Sales team if he manages Engineering. He expects the system to know his context and show him what is relevant.

**Evidence:** User Signals 4.3 -- "well-configured permissions don't just protect sensitive data; they also improve usability -- when employees only see content that applies to them, the knowledge base becomes easier to navigate and less cluttered" [Pylon]; Research Synthesis Pattern 6 -- Unit-scoped content is Employo's unique architectural advantage.

### 1.4 Oksana (HR Director) -- "Risk and measurement" frame

Oksana organizes HR knowledge by **compliance risk** and **measurability**.

| Category (Oksana's frame) | What it contains | Evidence |
|---|---|---|
| **"Must-have compliance"** | Mandatory policies (labor law familiarization, anti-harassment, data protection, safety) | Domain Facts 1.4: Art. 29 KZpP mandates familiarization before work; Domain Facts 2.2: three levels of acknowledgement |
| **"Who has and hasn't read this"** | Acknowledgement tracking dashboard -- compliance status per policy, per team | User Signals 4.5: "tell me who has and hasn't read this" (MEDIUM density) |
| **"What are they asking that we haven't answered?"** | Content gaps, search failures, unanswered questions | Research Synthesis JTBD-7 (measure KB effectiveness); Functional Checklist 7.7 (content gap identification) |
| **"Is our content still current?"** | Content freshness, review dates, stale content alerts | Research Synthesis Pattern 5 (content lifecycle is the weakest layer); User Signals 1.3 (version control concerns) |

Oksana does not browse articles. She consumes **dashboards and reports** about KB health. Her mental model is meta-level: she thinks about the KB as an organizational asset, not as individual articles.

**Evidence:** Product Context -- Oksana needs "dashboards, headcount analytics, turnover trends, compliance confidence"; Market Landscape use case #6 -- "HR Director reviews analytics"; Research Synthesis JTBD-7.

---

## 2. Terminology: Users vs. System vs. Legal

The vocabulary gap between users, vendors, and legal domains is the single largest source of mental model friction.

### 2.1 Core terminology gaps

| User term | Vendor / system term | Legal term (UA/EU) | Gap type | Risk |
|---|---|---|---|---|
| "where do I find..." | "Knowledge Base", "Help Center" | -- | Action vs. entity | HIGH -- users think in verbs, vendors name nouns. Employo must bridge with search and AI, not just a feature label. |
| "employee handbook" | "Policy Management", "Document Center", "KB" | -- | Synonym with scope mismatch | MEDIUM -- users think "handbook" = one big document; KB = many articles. Migration from handbook model to article model requires explicit guidance. |
| "company policies" / "rules" | "Legal Policies", "Compliance Documents" | "Internal regulatory acts" (ЛНА -- локальні нормативні акти) in Ukrainian law | Register mismatch | HIGH -- same content, three different frames. Legal frame carries compliance weight that user frame ignores. |
| "PTO" / "vacation" / "sick day" | "Absence Management" / "Time-Off Policies" | "Щорічна відпустка" (annual leave), "Лікарняний" (sick leave) per KZpP | Colloquial vs. formal | HIGH for search -- if search cannot map "PTO" to "annual leave policy," employees will not find what they need. Synonym dictionary is architecturally mandatory. |
| "read and sign" / "sign off" | "Policy Acknowledgement" / "Acknowledgement Tracking" | "Ознайомлення під підпис" (familiarization under signature) per Art. 29 KZpP | Action vs. feature vs. legal requirement | HIGH -- users describe a physical action; vendors name a feature category; Ukrainian law requires a specific legal act. The system must bridge all three. |
| "I read it" / "I got it" | "Read confirmation" / "Read receipt" | "Ознайомлення" (familiarization) -- legally distinct from "Згода" (consent) | Conflation of legally distinct concepts | CRITICAL -- see Tension 2 below. Users do not distinguish receipt, understanding, and agreement. The system must enforce the distinction. |
| "delete it" | "Archive" / "Delete" | Data retention requirements (GDPR storage limitation, employment + statute of limitations) | Irreversibility mismatch | HIGH -- see Tension 1 below. Users expect "delete" = "gone"; compliance requires retention of acknowledgement records. |
| "internal wiki" | "Knowledge Base" | -- | Structural mismatch | MEDIUM -- "wiki" implies open editing by anyone; KB implies curated content with controlled authoring. Employo builds a KB (curated), not a wiki (open). Domain Facts 2.3 explicitly distinguishes these. |
| "FAQ" / "help" | "Self-Service Portal", "Employee Help Desk" | -- | Simplicity vs. formality | LOW -- users want quick answers; the vendor framing is not user-facing. |
| "how-to" / "step-by-step" | "Process Documentation" / "SOP" | -- | Informality vs. formality | LOW -- purely vocabulary; no compliance risk. |
| "who's read it" | "Read Receipts" / "Engagement Metrics" / "View Tracking" | "Журнал ознайомлення" (familiarization log) | Simple question vs. analytics vs. legal record | MEDIUM -- Oksana asks a simple question; the vendor answers with a reporting module; Ukrainian law requires a specific record format. |
| "the latest version" | "Published version" / "Current version" | "Діюча редакція" (effective edition) | Ambiguity about what "latest" means | MEDIUM -- users assume "latest" = most recently edited. System has "published" (visible) vs. "draft" (newest but not published). Stale published content with an unpublished draft creates confusion. |

### 2.2 Employo-specific terminology risks

| Employo concept | User understanding | Risk |
|---|---|---|
| **Unit** | Users may not know this term. They think "my department" or "my team." | LOW -- Unit is an internal Employo concept; users see it as scoping, not as a named entity. |
| **Space** | Employo already uses "Space" for top-level organizational containers. If KB also uses "Space" for KB content areas, users face a naming collision. | HIGH -- Domain Facts 7 identifies this as an open conflict. "I created a Space" -- organizational or KB? |
| **Article** | Users may expect a "document" or "page." "Article" implies published, polished content -- HR admins may feel pressure to write formally. | MEDIUM -- the term "article" may create a psychological barrier for HR admins accustomed to "just putting things in Notion." |
| **Acknowledgement** | Users think "I read it." System means "legally recorded confirmation of receipt/understanding tied to a specific article version with timestamp." | HIGH -- the gap between casual understanding and system precision is large. UI must make the act feel simple while the backend records with precision. |

---

## 3. Expected Behaviors and Flows

What users expect to happen, based on their current mental models from workaround tools and general software experience.

### 3.1 Andrii (Employee) expectations

| User expectation | Evidence | Current reality in HRIS market |
|---|---|---|
| **"I type a question, I get an answer."** Conversational, not navigational. | User Signals 4.1: "it should just answer my question" (HIGH density); Market Landscape trend #1: AI-powered self-service replaces static search | Only BambooHR (Ask BambooHR) and Guru deliver this. Most HR KBs require folder browsing. |
| **"I search with my own words and find what I need."** Expects "PTO" to find "annual leave policy." | User Signals 5.2: employees use colloquial terms; Research Synthesis PC-5 (poor search) | Most HR platforms lack synonym handling. PeopleForce search is undocumented. |
| **"I can do this on my phone."** Mobile is the default device for employee self-service. | User Signals 4.4: "mobile access is non-negotiable" (MEDIUM density); Product Context Wedge 5: "for Andrii, mobile IS the product" | BambooHR has mobile file access. No HR platform has mobile-optimized KB browsing. |
| **"One place for everything."** Expects all HR info in one location, not scattered across tools. | User Signals 4.2: "one trusted location" (HIGH density) | Current state: Notion + Google Docs + email + HRIS = fragmented. KB must consolidate. |
| **"If something changed, tell me."** Expects proactive notification of policy updates. | User Signals 6.2: policy changes are a HIGH density trigger | PeopleForce sends email on publish. Kenjo sends push notification for read receipts. Most others: manual. |
| **"I don't want to sign a form every time."** Expects lightweight confirmation, not formal signature. | Competitor Analysis Gap 1: the spectrum from e-signature to read confirmation; Kenjo: "I confirm I have read" (one click) vs. BambooHR: full e-signature process | 14/23 competitors have acknowledgement, but most use formal e-signature (heavy). Kenjo/Breathe have lightweight read confirmation (light). |

### 3.2 Maryna (HR Admin) expectations

| User expectation | Evidence | Current reality in HRIS market |
|---|---|---|
| **"I write content like I do in Notion."** Expects a rich, modern editor -- not a file upload dialog. | User Signals 3.1: Notion is the primary workaround; Internal Context: colleague specified block editor with / commands | PeopleForce has block editor. Sloneek has WYSIWYG. Most HR platforms: file upload only. |
| **"I publish and the right people see it."** Expects audience targeting to be automatic, not manual per-article. | User Signals 4.3: "different people should see different things"; Internal Context: colleague recommended Unit-scoped spaces | PeopleForce: manual department targeting. No competitor auto-scopes by org structure. |
| **"I can see who read it and who didn't."** Expects read tracking dashboard. | User Signals 4.5: "tell me who has and hasn't read this"; Research Synthesis JTBD-2 (prove compliance) | Kenjo: read status + export + reminders. Breathe: read tracking. Most others: e-signature status only. |
| **"When I update a policy, people need to re-read it."** Expects re-acknowledgement to be triggered automatically. | Research Synthesis Pattern 4: re-ack on update is a gap; Competitor Analysis Gap 8 | Only Rippling (auto re-send) and Trainual (re-ack trigger). No HR platform KB has this. |
| **"I can organize content my way."** Expects flexible hierarchy (folders, categories, nesting). | Internal Context: colleague analyzed 2 hierarchy models; Competitor Analysis: BambooHR 4-level folders, PeopleForce categories | Approaches vary: flat categories (PeopleForce), deep folders (BambooHR), tags (Kenjo). No standard. |
| **"I can import from Notion/Confluence."** Expects migration path from current tools. | Research Synthesis Pattern 2: real competition is Notion/Confluence; Discovery Intake: PM confirmed clients use these tools | Only Personio has import (Confluence, Notion, SharePoint -- but retiring). Functional Checklist 1.13: market-derived, no HR platform has bulk import. |

### 3.3 Dmytro (Manager) expectations

| User expectation | Evidence | Current reality in HRIS market |
|---|---|---|
| **"Show me what's relevant to my team."** Expects KB to be filtered by his team/Unit. | User Signals 4.3; Product Context: Dmytro uses Employo for "team calendar, performance reviews" | No competitor auto-filters by manager's team context. |
| **"I can share an article with my team member."** Expects easy sharing (link, Slack message). | PeopleForce: shareable direct links; Competitor Analysis 4.7 | PeopleForce and general tools (Notion, Confluence) support direct links. Most HR platforms: no deep linking. |
| **"I don't need to learn a new tool."** Low friction tolerance -- uses Employo 2-3 times/month. | Product Context: Dmytro persona | KB must be discoverable within existing Employo UI, not a separate module requiring learning. |

### 3.4 Oksana (HR Director) expectations

| User expectation | Evidence | Current reality in HRIS market |
|---|---|---|
| **"Dashboard shows me compliance status at a glance."** Expects visual summary: X% acknowledged, Y articles overdue for review. | Product Context: Oksana needs "dashboards, analytics"; Research Synthesis JTBD-7 | Kenjo: read status export. Most others: no KB analytics. Functional Checklist Layer 7: "extremely thin" across HR platforms. |
| **"I can prove we informed employees during an audit."** Expects exportable compliance report with timestamps and versions. | User Signals 6.4: compliance audit trigger; Domain Facts 2.2: minimum metadata for defensible acknowledgement record | BambooHR: document status reports. Kenjo: export read status. No HR platform has article-version-specific audit trail. |
| **"The system tells me when content is outdated."** Expects proactive staleness alerts. | Research Synthesis Pattern 5: content lifecycle weakest layer; Domain Facts 2.1: industry standard 12-month review cycle | Only Guru has content freshness tracking (author verification prompts). No HR platform alerts for stale KB content. |

---

## 4. Assumptions Users Bring

Assumptions users carry from their experience with current tools (Notion, Google Docs, Confluence, email) that may not hold in Employo's KB.

| Assumption | Source | Correct in Employo context? | Risk if uncorrected |
|---|---|---|---|
| **"It should just answer my question."** AI-powered conversational access is expected, not browsing. | User Signals 4.1 (HIGH density); Market Landscape trend #1 | NOT in iteration 1. Iteration 1 is keyword search; AI Q&A is iteration 2. | HIGH -- if employees expect conversational AI and get folder browsing, adoption will suffer. Must set expectations clearly. RAG-ready architecture in iteration 1 mitigates technical risk but not UX expectation risk. |
| **"One place for everything."** Single source of truth expectation. | User Signals 4.2 (HIGH density) | PARTIALLY -- KB consolidates HR knowledge, but some content lives in other modules (leave rules in Absence Management, review templates in Performance). | MEDIUM -- if employees still need to check multiple places, the "one place" promise breaks. Cross-module article linking (E4) addresses this but is architecturally dependent on other modules being ready. |
| **"Different people should see different things."** Role-scoped content visibility. | User Signals 4.3 (MEDIUM density) | YES -- Unit-scoped visibility is Employo's core differentiator. | LOW if implemented well. But HIGH if permissions are confusing or break (employee sees content not meant for them, or cannot find content that should be visible). |
| **"I can find it on my phone."** Mobile-first access expectation. | User Signals 4.4 (MEDIUM density); Product Context Wedge 5 | YES -- mobile-responsive KB is in iteration 1 scope. | LOW if mobile UX is good. But search on mobile is harder (smaller screen, less precise input) -- must optimize for mobile search patterns. |
| **"Edit is like Notion."** Expects rich, modern editing experience. | User Signals 3.1: Notion is primary workaround; implicit from Maryna's current workflow | PARTIALLY -- Employo plans article editor, but scope of editor richness (blocks vs. WYSIWYG vs. basic) is a design decision. | MEDIUM -- if the editor feels basic compared to Notion, HR admins may resist migrating. The editor must be "good enough" that Maryna does not keep a parallel Notion. |
| **"If I delete it, it's gone."** Expects deletion to be permanent and immediate. | General software mental model | NO -- compliance requires retention of acknowledgement records even after article deletion. Archived articles remain in system for admins. | HIGH -- users may be surprised when "deleted" content persists in audit trails. Must communicate: "article hidden from employees but compliance records retained." |
| **"Reading it means I agree."** Users conflate acknowledgement with consent/agreement. | Domain Facts 4: "Acknowledgement is NOT consent"; Three legally distinct levels (receipt, understanding, agreement) | NO -- acknowledgement confirms receipt/understanding, NOT agreement. Employees cannot "opt out" of policies. | CRITICAL -- if the UI says "I agree" but the legal basis is legitimate interest (not consent), there is a compliance risk. The acknowledgement text must be precise: "I have read and understood" NOT "I agree." |
| **"The latest version is what I see."** Assumes published content = most current. | General software mental model | PARTIALLY -- only one version is published at a time, but content may be outdated between reviews. A published article can be stale if its review date has passed. | MEDIUM -- users trust "published" to mean "current." Content freshness tracking (Domain Facts 2.1: 12-month review cycle) is needed to maintain trust. |
| **"Versioning = Google Docs history."** Expects automatic, granular edit tracking. | User experience with Google Docs and Notion | PARTIALLY -- KB has versions (major snapshots) and revisions (minor edits). Google Docs tracks every keystroke; KB tracks intentional versions. | LOW -- the distinction between version and revision is an authoring concern (Maryna), not a reading concern (Andrii). But Maryna may expect Google Docs-level granularity. |
| **"Search works like Google."** Expects typo tolerance, synonym matching, intent understanding. | User Signals 1.2 (HIGH density); 5.2 (search term analysis) | NOT in iteration 1 -- iteration 1 has keyword search with synonym dictionary. Semantic/AI search is iteration 2. | HIGH -- this is the #1 adoption risk. "Poor search leads to poor adoption" [Desk365]. Synonym dictionary for HR terms is architecturally mandatory in iteration 1. |

---

## 5. Mental Model Tensions

Where the user's model of how things work conflicts with system reality or domain constraints. These tensions cannot be "solved" -- they must be designed around with clear communication.

### Tension 1: "Delete means gone" vs. compliance retention

| Dimension | Detail |
|---|---|
| **User model** | "I deleted the article, so it's gone. Nobody can see it." |
| **System/domain model** | Deleted articles are removed from user visibility, but acknowledgement records tied to that article must be retained for compliance (employment duration + 3-6 years statute of limitations). Domain Facts 1.2: acknowledgement records are personal data under GDPR but exempt from erasure under Art. 17(3)(b) legal obligation exception. Internal Context: colleague specified cascade deletion of files but not acknowledgement records. |
| **Affected personas** | Maryna (deletes articles), Oksana (needs audit trail), Legal/compliance |
| **Severity** | HIGH |
| **Design implication** | The UI must distinguish between "hide from employees" (archive) and "permanently remove content" (delete). Acknowledgement records must persist regardless. The deletion confirmation should explain: "This article will be removed. Compliance records for employees who acknowledged this article will be retained." |
| **Evidence** | Domain Facts 2.1 (archived content not visible to end users but retained); Domain Facts 1.2 (GDPR retention); Internal Context Section 3 (cascade deletion rules) |

### Tension 2: "I read it" vs. legally distinct acknowledgement levels

| Dimension | Detail |
|---|---|
| **User model** | "I read it" = "I agree" = "I signed it." Users see these as the same action. |
| **System/domain model** | Three legally distinct levels: (1) "I have received" -- confirms receipt only, weakest. (2) "I have read and understood" -- confirms awareness, standard for most policies. (3) "I agree to comply" -- strongest, implies contractual obligation. Domain Facts 2.2: most HR policy acknowledgements use level 2. Acknowledgement is NOT consent -- employees cannot "opt out." |
| **Affected personas** | Andrii (acknowledges), Maryna (configures), Oksana (audits), Legal |
| **Severity** | CRITICAL |
| **Design implication** | Default acknowledgement text should be "I have read and understood this [policy/article]" (level 2). Avoid "I agree" language unless intentionally using level 3. The UI should feel lightweight (one click) but the backend must record with legal precision (employee ID, article version, timestamp, action type). |
| **Evidence** | Domain Facts 2.2 (three levels); Domain Facts 4 terminology (acknowledgement vs. consent); User Signals 1.4 ("Google Docs won't tell you who's read the handbook") |

### Tension 3: Notion-like editing vs. HRIS file upload

| Dimension | Detail |
|---|---|
| **User model** | "I create content in a rich editor with blocks, images, embeds -- like Notion or Confluence." |
| **System/domain model** | Most HR platform KBs deliver file upload (BambooHR, HiBob, Factorial, Kenjo, Breathe). Only PeopleForce (block editor) and Sloneek (WYSIWYG) have in-platform article authoring among HR platforms. The expectation gap between "Notion-like" and "file upload" is vast. |
| **Affected personas** | Maryna (creates content), indirectly Andrii (consumes content quality) |
| **Severity** | HIGH |
| **Design implication** | Employo must deliver an article editor that is closer to Notion/PeopleForce than to BambooHR's file upload. This is a competitive requirement: if Maryna cannot create content as easily as in Notion, she will not migrate. The editor does not need to match Notion's full flexibility -- it needs to handle the HR content types (policies, playbooks, checklists, FAQ) well. |
| **Evidence** | Competitor Analysis: PeopleForce block editor, Sloneek WYSIWYG vs. 13+ competitors with file-upload-only; Internal Context: colleague specified file upload methods (file picker, drag & drop, paste) but also @mentions and publishing workflow; User Signals 3.1 (Notion is primary workaround) |

### Tension 4: "Instant search" vs. folder browsing

| Dimension | Detail |
|---|---|
| **User model** | "I type what I need and find it instantly." Users expect Google-quality search. |
| **System/domain model** | Most HR platform KBs rely on folder/category browsing. Even BambooHR (the strongest implementation) had user complaints about search: "didn't have a great search function" [Capterra]. Keyword search without synonyms fails for HR use cases where employees use colloquial terms. |
| **Affected personas** | Andrii (primary searcher), Dmytro (occasional searcher) |
| **Severity** | HIGH |
| **Design implication** | Search is the #1 adoption lever. "Poor search leads to poor adoption" [Desk365]. Iteration 1 must include keyword search with an HR-specific synonym dictionary (at minimum: PTO/vacation/leave/time-off, sick day/medical leave, etc.). The browsing hierarchy is a fallback, not the primary access path. |
| **Evidence** | User Signals 1.2 (HIGH density); User Signals 5.2 (search term analysis); Research Synthesis PC-5 (poor search kills adoption); Domain Facts 3.3 (synonym handling critical) |

### Tension 5: "One version I trust" vs. content decay reality

| Dimension | Detail |
|---|---|
| **User model** | "If it's published, it's current and correct." Users trust the KB as authoritative. |
| **System/domain model** | Content decays silently. Policies written 18 months ago may reference outdated procedures. Without content freshness tracking, there is no mechanism to flag stale content. Employees accessing outdated policies face compliance risk. Confluence users describe this: "packed with tons of irrelevant, outdated, poorly organized piles of miscellaneous information" [New Verve]. |
| **Affected personas** | All -- but especially Andrii (trusts content), Oksana (accountable for accuracy) |
| **Severity** | HIGH |
| **Design implication** | Published does NOT mean "guaranteed current." Review dates, freshness indicators, and owner accountability are needed. Employees should see "Last reviewed: [date]" on articles to calibrate trust. Content freshness tracking (review date + staleness alerts) must be in iteration 1 scope to prevent the Confluence failure pattern. |
| **Evidence** | User Signals 1.3 (HIGH density: "unread or outdated handbook is a major compliance risk"); Research Synthesis Pattern 5 (content lifecycle is weakest layer); Domain Facts 2.1 (12-month default review cycle); Competitor Analysis Gap 7 (only Guru has freshness tracking) |

### Tension 6: "Space" means two different things

| Dimension | Detail |
|---|---|
| **User model** | Employo users already know "Space" as a top-level organizational container (e.g., "Develux" space). If KB introduces "KB Space" as Unit-scoped content area, users face ambiguity: "Create a new Space" -- organizational or knowledge? |
| **System/domain model** | Employo uses "Space" for multi-Space architecture (Product Context). Colleague's notes and competitor analysis (Confluence spaces, Notion workspaces) suggest "Space" for KB content areas. Two meanings of the same word in the same product. |
| **Affected personas** | All users, but especially Maryna (creates KB spaces) and Ihor (manages Space settings) |
| **Severity** | MEDIUM |
| **Design implication** | Requires terminology decision before implementation. Options: (a) use "Space" for both and disambiguate with context, (b) use a different term for KB containers -- "Library," "Knowledge Area," "KB Section." Domain Facts 7 flags this as an open conflict requiring PM/UX decision. |
| **Evidence** | Domain Facts 7 (terminology collision); Product Context (Space defined as top-level container); Internal Context Section 5 (colleague used "space" for KB); Competitor precedent: Confluence = "Spaces," Notion = "Workspaces," Guru = "Collections" |

---

## 6. Per-Persona Mental Model Summary

### 6.1 Andrii (Employee IC)

```
Andrii's mental model:

"I have a question about HR stuff"
    → I search or ask (expecting instant answer)
    → If I find it: done
    → If I don't find it: email/Slack HR (defeats the purpose)
    → Sometimes I need to "read and confirm" something
    → I do this on my phone
    → I never browse folders
```

**Primary access pattern:** Search-first, mobile-first
**Primary content types consumed:** Policies, FAQ, how-to guides
**Frequency:** Weekly (routine questions), episodic (onboarding, policy changes)
**Tolerance for friction:** Very low -- will abandon KB after one failed search
**Current workaround:** Asks HR directly, or searches Notion/Google Docs

### 6.2 Maryna (HR Admin)

```
Maryna's mental model:

"I need to write/update HR content and get it to the right people"
    → I create or edit in a rich editor (like Notion)
    → I organize by content type (policy, playbook, FAQ)
    → I target specific audiences (departments, all employees, HR-only)
    → I publish and track who read it
    → When I update, people need to re-read
    → I need to keep things current and organized
```

**Primary access pattern:** Create-publish-track workflow
**Primary content types created:** Policies, playbooks, templates, checklists, FAQ
**Frequency:** Daily
**Tolerance for friction:** Moderate -- will tolerate some complexity for powerful features, but will not accept worse than Notion
**Current workaround:** Notion, Confluence, Google Docs

### 6.3 Dmytro (Manager)

```
Dmytro's mental model:

"I need to find the right procedure for my team situation"
    → I search for a specific process (termination, onboarding, approval)
    → I expect to see only what's relevant to my team
    → I want to share articles with team members
    → I rarely create content
    → I use this on mobile occasionally
```

**Primary access pattern:** Search-and-share, scoped to team
**Primary content types consumed:** Procedures, policies relevant to management
**Frequency:** Monthly
**Tolerance for friction:** Low -- uses Employo infrequently, does not want to learn a new tool
**Current workaround:** Asks HR, or looks in shared Notion/Confluence

### 6.4 Oksana (HR Director)

```
Oksana's mental model:

"I need to know our knowledge is distributed, current, and auditable"
    → Show me a compliance dashboard (who read what)
    → Alert me when content is stale
    → Let me prove to auditors that employees were informed
    → Tell me what questions employees are asking that we haven't answered
    → I never write or browse articles myself
```

**Primary access pattern:** Dashboard and reports consumer
**Primary content types consumed:** Analytics, compliance reports, freshness dashboards
**Frequency:** Weekly (content gaps), monthly (analytics dashboards)
**Tolerance for friction:** Moderate -- expects polished analytics, not raw data
**Current workaround:** No workaround exists -- compliance tracking is a complete blind spot with current tools

---

## 7. Research Notes

### Evidence sources used

1. **Research Synthesis v1.0** -- JTBD map, pain clusters, patterns, competitive signals, functional decomposition summary
2. **User Signals v1.0** -- complaints, praise, workarounds, expectations, terminology, contextual triggers (45 sources, 6 signal types)
3. **Domain Facts v1.0** -- regulatory requirements, business rules, technical constraints, domain terminology, authority boundaries
4. **Market Landscape v1.1** -- market definition, segmentation, archetypes, trends, regulatory forces
5. **Competitor Analysis v2.0** -- 23 products, feature matrix, gap analysis, architecture patterns
6. **Internal Context v1.0** -- colleague's UX research notes
7. **Functional Components Checklist v1.2** -- 93 components across 8 layers
8. **Discovery Intake v1.1** -- PM trigger, scope, constraints
9. **Product Context** -- personas, architecture, wedges, terminology
10. **Product Cluster Registry** -- cluster structure, areas, dependencies

### Confidence assessment

**Overall confidence: MEDIUM**

**Supporting factors:**
- Strong indirect evidence base (45 user signal sources, 23 competitors, 93 functional components)
- Cross-source convergence on core mental model patterns (scattered knowledge, search-first, compliance blind spot)
- Four personas well-defined in Product Context with clear role differentiation
- Domain terminology gaps well-documented across legal, vendor, and user frames

**Limiting factors:**
- **No user interviews conducted.** All mental model evidence is indirect -- industry reports, vendor documentation, review sites, and PM descriptions. We have NOT validated these mental models with actual Employo users or prospects. This is the single largest gap.
- **No internal behavioral data.** No search logs, no support ticket themes, no feature request counts from existing Employo users.
- **Ukrainian-specific mental model not captured.** The evidence is predominantly English-language, Western-market. How Ukrainian HR professionals and employees think about "knowledge base" may differ (e.g., the strong role of "internal regulatory acts" / ЛНА in Ukrainian labor practice).
- **AI expectation may be inflated.** The strong "it should just answer my question" signal may reflect industry blog aspirations more than actual mid-market employee expectations. Without interviews, we cannot calibrate.

### Thin areas (where evidence was sparse)

1. **Dmytro's mental model** -- least direct evidence. Inferred from Product Context persona and general manager patterns. No manager-specific user signals found.
2. **Content type taxonomy from Maryna's perspective** -- we have the categories (policies, playbooks, templates, etc.) but not how she mentally prioritizes them or which creates the most friction.
3. **Mobile interaction patterns** -- "mobile access is non-negotiable" is stated, but what specifically employees do on mobile KB (search? browse? acknowledge?) is not captured.
4. **Multilingual mental model** -- how users in bilingual environments (Ukrainian + English) expect to navigate bilingual content is not modeled.
5. **Transition mental model** -- how users will mentally transition from current workarounds (Notion, Confluence) to KB. What does migration feel like from the user's perspective?
