# Mock Data Specification

This document defines the mock data for the KB prototype. All data should be created in `src/data/mock-data.ts` following the types in `src/types/index.ts`.

## People (Contacts)

```
Oleksii Ku — Recruiter at HRM, avatar placeholder
Kushina Wu — Recruiter at HRM, avatar placeholder
Temari Kim — temarikim@develux.com, avatar placeholder
Yuliana Pankiv — HR Manager, avatar placeholder
Dmytro Koval — CTO, avatar placeholder
Anna Shevchenko — Head of Design, avatar placeholder
Mykola Bondar — Engineering Lead, avatar placeholder
```

## Business Unit Tree

```
Develux (root, id: "develux")
├── Employo (id: "employo")
│   ├── Development (id: "employo-dev")
│   ├── Product (id: "employo-product")
│   │   ├── Design (id: "employo-design")
│   │   └── UX research (id: "employo-ux")
│   ├── Marketing (id: "employo-marketing")
│   ├── Front office (id: "employo-front")
│   ├── Back office (id: "employo-back")
│   │   └── Admin space (id: "employo-admin")
│   └── (other units from screenshot)
├── Client "Successful success" (id: "client-ss")
│   ├── Administrators (id: "ss-admin")
│   ├── People partners (id: "ss-people")
│   ├── Marketing (id: "ss-marketing")
│   ├── Product (id: "ss-product")
│   ├── Front office (id: "ss-front")
│   ├── Development (id: "ss-dev")
│   └── Back office (id: "ss-back")
└── EDU (id: "edu")
    ├── Product (id: "edu-product")
    ├── Development (id: "edu-dev")
    └── Marketing (id: "edu-marketing")
```

**Selected unit for prototype demo:** "Employo" (id: "employo")

## KB Folders — Employo (own folders)

### Top-level folders:

1. **Onboarding** (id: "f-emp-onboarding")
   - visibility: unit_and_subunits
   - Sub-folder: **Engineering setup** (id: "f-emp-eng-setup")
   - Sub-folder: **Design team setup** (id: "f-emp-design-setup")

2. **Engineering handbook** (id: "f-emp-eng-handbook")
   - visibility: unit_and_subunits

3. **Policies & processes** (id: "f-emp-policies")
   - visibility: unit_and_subunits

4. **QA standards** (id: "f-emp-qa")
   - visibility: unit_and_subunits

## KB Folders — Develux root (these will appear as "shared" for Employo)

1. **Company policies** (id: "f-dev-policies")
   - visibility: all_units
   - Sub-folder: **Leave policies** (id: "f-dev-leave")

2. **General onboarding** (id: "f-dev-onboarding")
   - visibility: all_units

3. **Benefits & perks** (id: "f-dev-benefits")
   - visibility: all_units

4. **Internal — HR only** (id: "f-dev-hr-internal")
   - visibility: current_unit_only
   - (This folder should NOT appear in Employo's shared section)

## KB Articles — Employo

### In "Onboarding" folder:
1. **Welcome to Employo** (published, unit_and_subunits)
   - Content: Welcome message, team overview, key contacts, first week schedule
   - Owner: Yuliana Pankiv
   - Updated: 2 days ago

2. **Communication tools guide** (published, unit_and_subunits)
   - Content: Slack channels, email conventions, meeting cadence
   - Owner: Anna Shevchenko
   - Updated: 1 week ago

### In "Onboarding > Engineering setup" sub-folder:
3. **Development environment setup** (published, unit_and_subunits)
   - Content: IDE setup, repository access, CI/CD overview, local environment config
   - Owner: Mykola Bondar
   - Updated: 3 days ago

4. **Git workflow & branching strategy** (draft, unit_and_subunits)
   - Content: Branch naming, PR process, code review guidelines
   - Owner: Dmytro Koval
   - Updated: yesterday

### In "Onboarding > Design team setup" sub-folder:
5. **Design tools & licenses** (published, unit_and_subunits)
   - Content: Figma access, design system link, handoff process
   - Owner: Anna Shevchenko
   - Updated: 5 days ago

### In "Engineering handbook" folder:
6. **Code review guidelines** (published, unit_and_subunits)
   - Content: Review checklist, approval requirements, feedback etiquette
   - Owner: Mykola Bondar
   - Updated: 2 weeks ago

7. **Release process** (published, unit_and_subunits)
   - Content: Release cadence, version tagging, deployment steps, rollback procedure
   - Owner: Dmytro Koval
   - Updated: 1 week ago

8. **Incident response procedure** (published, current_unit_only)
   - Content: Severity levels, on-call rotation, escalation paths, post-mortem template
   - Owner: Dmytro Koval
   - Updated: 3 weeks ago

### In "Policies & processes" folder:
9. **Time off request process** (published, unit_and_subunits)
   - Content: How to request PTO, approval chain, blackout dates
   - Owner: Yuliana Pankiv
   - Updated: 1 month ago

10. **Remote work policy** (published, unit_and_subunits)
    - Content: Eligibility, equipment, work hours, communication expectations
    - Owner: Yuliana Pankiv
    - Updated: 2 weeks ago

### In "QA standards" folder:
11. **Testing requirements** (published, unit_and_subunits)
    - Content: Unit test coverage targets, E2E testing strategy, QA sign-off process
    - Owner: Mykola Bondar
    - Updated: 1 week ago

12. **Bug reporting template** (draft, unit_and_subunits)
    - Content: Template for bug reports: steps to reproduce, expected vs actual, severity
    - Owner: Mykola Bondar
    - Updated: 2 days ago

### Archived:
13. **Old onboarding checklist (v1)** (archived, unit_and_subunits)
    - In "Onboarding" folder
    - Content: Previous version of the onboarding checklist, superseded
    - Owner: Yuliana Pankiv

## KB Articles — Develux root (visible to Employo via "Shared with you")

### In "Company policies" folder:
14. **Code of conduct** (published, all_units)
    - Content: Company values, expected behavior, reporting violations
    - Owner: Yuliana Pankiv

15. **Data security policy** (published, all_units)
    - Content: Password requirements, data classification, handling PII
    - Owner: Dmytro Koval

### In "Company policies > Leave policies" sub-folder:
16. **Vacation policy** (published, all_units)
    - Content: Annual leave allowance, booking process, carry-over rules
    - Owner: Yuliana Pankiv

17. **Sick leave policy** (published, all_units)
    - Content: Reporting procedure, documentation requirements, return to work
    - Owner: Yuliana Pankiv

### In "General onboarding" folder:
18. **First day checklist** (published, all_units)
    - Content: HR paperwork, system access, team introductions, office tour
    - Owner: Yuliana Pankiv

19. **Company history & mission** (published, all_units)
    - Content: Founding story, mission statement, core values, company milestones
    - Owner: Yuliana Pankiv

### In "Benefits & perks" folder:
20. **Health insurance overview** (published, all_units)
    - Content: Plan options, enrollment process, covered services
    - Owner: Yuliana Pankiv

21. **Learning & development budget** (published, all_units)
    - Content: Annual budget per employee, approved categories, reimbursement process
    - Owner: Yuliana Pankiv

## Article content guidelines

For the prototype, each article should have 2-4 paragraphs of realistic HR/engineering content. Use actual headings (H2, H3), bullet lists, bold text, and links to make the content feel real. Don't use lorem ipsum.

Example content structure for "Development environment setup":

```html
<h2>Prerequisites</h2>
<p>Before starting, make sure you have the following installed on your machine:</p>
<ul>
  <li><strong>Node.js</strong> (v18 or higher) — <a href="#">Download here</a></li>
  <li><strong>Docker Desktop</strong> — Required for running local services</li>
  <li><strong>VS Code</strong> — Our recommended editor with team extensions</li>
</ul>

<h2>Repository access</h2>
<p>Request access to the following repositories through your team lead:</p>
<ul>
  <li><strong>hrm-platform</strong> — Main application monorepo</li>
  <li><strong>hrm-design-system</strong> — Shared component library</li>
  <li><strong>hrm-infrastructure</strong> — Deployment configurations</li>
</ul>
<p>Clone the main repository and follow the setup instructions in the README.</p>

<h2>Local environment</h2>
<p>Run <code>docker compose up</code> to start all local services. The application will be available at <strong>localhost:3000</strong>. Database seeds are automatically applied on first run.</p>
<p>If you encounter issues, check the <a href="#">troubleshooting guide</a> or reach out in the <strong>#dev-help</strong> Slack channel.</p>
```
