import type {
  Contact,
  BusinessUnit,
  KBFolder,
  KBArticle,
  ArticleVersion,
} from '@/types';

/** The on-disk shape for an article literal. Lacks the versioning fields,
 *  which the normalizer below fills in from publish metadata. */
type ArticleSeed = Omit<
  KBArticle,
  'draftContent' | 'draftUpdatedAt' | 'draftUpdatedBy' | 'versions'
>;

// ============================================================
// CONTACTS
// ============================================================

export const contacts: Record<string, Contact> = {
  oleksii: {
    id: 'c-oleksii',
    name: 'Oleksii Ku',
    email: 'oleksii@develux.com',
    role: 'Recruiter at HRM',
  },
  kushina: {
    id: 'c-kushina',
    name: 'Kushina Wu',
    email: 'kushina@develux.com',
    role: 'Recruiter at HRM',
  },
  temari: {
    id: 'c-temari',
    name: 'Temari Kim',
    email: 'temarikim@develux.com',
    role: 'Product Manager',
  },
  yuliana: {
    id: 'c-yuliana',
    name: 'Yuliana Pankiv',
    email: 'yuliana@develux.com',
    role: 'HR Manager',
  },
  dmytro: {
    id: 'c-dmytro',
    name: 'Dmytro Koval',
    email: 'dmytro@develux.com',
    role: 'CTO',
  },
  anna: {
    id: 'c-anna',
    name: 'Anna Shevchenko',
    email: 'anna@develux.com',
    role: 'Head of Design',
  },
  mykola: {
    id: 'c-mykola',
    name: 'Mykola Bondar',
    email: 'mykola@develux.com',
    role: 'Engineering Lead',
  },
};

// ============================================================
// BUSINESS UNITS
// ============================================================

export const unitTree: BusinessUnit = {
  id: 'develux',
  name: 'Develux',
  parentId: null,
  children: [
    {
      id: 'employo',
      name: 'Employo',
      parentId: 'develux',
      children: [
        { id: 'employo-dev', name: 'Development', parentId: 'employo' },
        {
          id: 'employo-product',
          name: 'Product',
          parentId: 'employo',
          children: [
            { id: 'employo-design', name: 'Design', parentId: 'employo-product' },
            { id: 'employo-ux', name: 'UX research', parentId: 'employo-product' },
          ],
        },
        { id: 'employo-marketing', name: 'Marketing', parentId: 'employo' },
        { id: 'employo-front', name: 'Front office', parentId: 'employo' },
        {
          id: 'employo-back',
          name: 'Back office',
          parentId: 'employo',
          children: [
            { id: 'employo-admin', name: 'Admin space', parentId: 'employo-back' },
          ],
        },
      ],
    },
    {
      id: 'client-ss',
      name: 'Client "Successful success"',
      parentId: 'develux',
      children: [
        { id: 'ss-admin', name: 'Administrators', parentId: 'client-ss' },
        { id: 'ss-people', name: 'People partners', parentId: 'client-ss' },
        { id: 'ss-marketing', name: 'Marketing', parentId: 'client-ss' },
        { id: 'ss-product', name: 'Product', parentId: 'client-ss' },
        { id: 'ss-front', name: 'Front office', parentId: 'client-ss' },
        { id: 'ss-dev', name: 'Development', parentId: 'client-ss' },
        { id: 'ss-back', name: 'Back office', parentId: 'client-ss' },
      ],
    },
    {
      id: 'edu',
      name: 'EDU',
      parentId: 'develux',
      children: [
        { id: 'edu-product', name: 'Product', parentId: 'edu' },
        { id: 'edu-dev', name: 'Development', parentId: 'edu' },
        { id: 'edu-marketing', name: 'Marketing', parentId: 'edu' },
      ],
    },
  ],
};

/** The unit selected in the prototype by default */
export const selectedUnitId = 'employo';

/** The current user's positions — unit IDs where the user has a role.
 *  For the prototype: one in Employo > Product > Design (deep, leaf),
 *  one in EDU > Marketing (separate branch). Used by the Home scope to
 *  aggregate KB content the user can access across all their positions. */
export const currentUserPositions: string[] = ['employo-design', 'edu-marketing'];

/** Flat map of all units for quick lookups */
export function flattenUnits(unit: BusinessUnit): BusinessUnit[] {
  const result: BusinessUnit[] = [unit];
  if (unit.children) {
    for (const child of unit.children) {
      result.push(...flattenUnits(child));
    }
  }
  return result;
}

export const allUnits = flattenUnits(unitTree);

export function getUnit(id: string): BusinessUnit | undefined {
  return allUnits.find((u) => u.id === id);
}

export function getUnitPath(id: string): BusinessUnit[] {
  const path: BusinessUnit[] = [];
  let current = getUnit(id);
  while (current) {
    path.unshift(current);
    current = current.parentId ? getUnit(current.parentId) : undefined;
  }
  return path;
}

/** All ancestor unit ids of a given unit (excluding self). */
export function getAncestorUnitIds(unitId: string): Set<string> {
  return new Set(getUnitPath(unitId).slice(0, -1).map((u) => u.id));
}

/** All descendant unit ids of a given unit (excluding self). */
export function getDescendantUnitIds(unitId: string): Set<string> {
  const unit = getUnit(unitId);
  const ids = new Set<string>();
  if (!unit) return ids;
  flattenUnits(unit).forEach((u) => {
    if (u.id !== unitId) ids.add(u.id);
  });
  return ids;
}

// ============================================================
// KB FOLDERS — owned by units. Each unit has its own folder tree.
// ============================================================

export const allFolders: KBFolder[] = [
  // ── Develux (parent unit) — visible to all sub-units via shared section ──
  {
    id: 'f-dx-policies',
    unitId: 'develux',
    parentFolderId: null,
    name: 'Company policies',
    color: '#16a34a',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-16T09:00:00Z',
  },
  {
    id: 'f-dx-policies-leave',
    unitId: 'develux',
    parentFolderId: 'f-dx-policies',
    name: 'Leave policies',
    color: '#16a34a',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'f-dx-benefits',
    unitId: 'develux',
    parentFolderId: null,
    name: 'Benefits & perks',
    color: '#7c3aed',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 1,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-07-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'f-dx-onboarding',
    unitId: 'develux',
    parentFolderId: null,
    name: 'Company onboarding',
    color: '#ff9124',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 2,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-10T10:00:00Z',
  },

  // ── Employo (own folders) ──
  {
    id: 'f-em-onboarding',
    unitId: 'employo',
    parentFolderId: null,
    name: 'Employo onboarding',
    color: '#ff9124',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-11-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-28T09:00:00Z',
  },
  {
    id: 'f-em-onboarding-eng',
    unitId: 'employo',
    parentFolderId: 'f-em-onboarding',
    name: 'Engineering setup',
    color: '#ff9124',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2025-12-01T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-27T14:00:00Z',
  },
  {
    id: 'f-em-onboarding-eng-mac',
    unitId: 'employo',
    parentFolderId: 'f-em-onboarding-eng',
    name: 'macOS toolbox',
    color: '#ff9124',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2026-01-20T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-12T14:00:00Z',
  },
  {
    id: 'f-em-onboarding-design',
    unitId: 'employo',
    parentFolderId: 'f-em-onboarding',
    name: 'Design team setup',
    color: '#ff9124',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 1,
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-10T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-03-25T11:00:00Z',
  },
  {
    id: 'f-em-engineering',
    unitId: 'employo',
    parentFolderId: null,
    name: 'Engineering handbook',
    color: '#006bd6',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 1,
    owner: contacts.dmytro,
    createdBy: contacts.dmytro,
    createdAt: '2025-10-20T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-23T16:00:00Z',
  },
  {
    id: 'f-em-qa',
    unitId: 'employo',
    parentFolderId: null,
    name: 'QA standards',
    color: '#e11d48',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 2,
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2026-01-05T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-23T10:00:00Z',
  },
  {
    id: 'f-em-hr-internal',
    unitId: 'employo',
    parentFolderId: null,
    name: 'HR — internal',
    color: '#0891b2',
    visibility: 'current_unit_only',
    status: 'active',
    sortOrder: 3,
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2026-02-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-20T10:00:00Z',
  },

  // ── Employo > Product > Design (own folders) ──
  {
    id: 'f-design-handbook',
    unitId: 'employo-design',
    parentFolderId: null,
    name: 'Design team handbook',
    color: '#7c3aed',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-08T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-12T10:00:00Z',
  },
  {
    id: 'f-design-handbook-components',
    unitId: 'employo-design',
    parentFolderId: 'f-design-handbook',
    name: 'Components library',
    color: '#7c3aed',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-20T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-08T10:00:00Z',
  },
  {
    id: 'f-design-handbook-components-forms',
    unitId: 'employo-design',
    parentFolderId: 'f-design-handbook-components',
    name: 'Form patterns',
    color: '#7c3aed',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-02-10T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-05T10:00:00Z',
  },
  {
    id: 'f-design-confidential',
    unitId: 'employo-design',
    parentFolderId: null,
    name: 'Hiring rubric (internal)',
    color: '#dc2626',
    visibility: 'current_unit_only',
    status: 'active',
    sortOrder: 1,
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-02-02T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-10T10:00:00Z',
  },

  // ── EDU > Marketing (own folders) ──
  {
    id: 'f-edu-mk-playbook',
    unitId: 'edu-marketing',
    parentFolderId: null,
    name: 'Marketing playbook',
    color: '#0891b2',
    visibility: 'unit_and_subunits',
    status: 'active',
    sortOrder: 0,
    owner: contacts.temari,
    createdBy: contacts.temari,
    createdAt: '2026-01-12T10:00:00Z',
    updatedBy: contacts.temari,
    updatedAt: '2026-04-18T10:00:00Z',
  },
];

// ============================================================
// KB ARTICLES
// ============================================================

const articleSeeds: ArticleSeed[] = [
  // ── Employo > Employo onboarding (root) ──
  {
    id: 'a-1',
    folderId: 'f-em-onboarding',
    unitId: 'employo',
    title: 'Welcome to Employo',
    content: `<h2>Welcome aboard!</h2><p>We're excited to have you join the Employo team. This guide will help you navigate your first days and get set up for success.</p><h3>Key contacts</h3><ul><li><strong>Yuliana Pankiv</strong> — HR Manager, your go-to for any administrative questions</li><li><strong>Dmytro Koval</strong> — CTO, oversees all technical teams</li><li><strong>Anna Shevchenko</strong> — Head of Design, leads the product design practice</li></ul><h3>Your first week</h3><p>During your first week, you'll complete onboarding sessions with HR, meet your team, get access to all necessary tools, and attend a product overview presentation. Your manager will share a detailed schedule on your first day.</p><p>Don't hesitate to ask questions — everyone remembers what it's like to be new, and we're here to help you settle in quickly.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-11-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-28T09:00:00Z',
    publishedAt: '2025-11-16T10:00:00Z',
  },
  {
    id: 'a-2',
    folderId: 'f-em-onboarding',
    unitId: 'employo',
    title: 'Communication tools guide',
    content: `<h2>Communication at Employo</h2><p>We use several tools to stay connected. Here's what you need to know about each one.</p><h3>Slack</h3><p>Slack is our primary communication tool. Key channels to join:</p><ul><li><strong>#general</strong> — Company-wide announcements</li><li><strong>#random</strong> — Non-work chat, memes, and social stuff</li><li><strong>#dev-help</strong> — Technical questions and troubleshooting</li><li><strong>#your-team</strong> — Your team's private channel (your manager will invite you)</li></ul><h3>Email</h3><p>Use email for external communication and formal internal matters. For day-to-day team communication, prefer Slack.</p><h3>Meetings</h3><p>We use Google Meet for video calls. Calendar invites include meeting links automatically. We try to keep meetings focused and under 30 minutes when possible.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2025-12-01T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-03-23T14:00:00Z',
    publishedAt: '2025-12-02T10:00:00Z',
  },
  {
    id: 'a-13',
    folderId: 'f-em-onboarding',
    unitId: 'employo',
    title: 'Old onboarding checklist (v1)',
    content: `<h2>Onboarding checklist — Version 1</h2><p><em>This document has been superseded by the updated onboarding guides. Kept for reference only.</em></p><ul><li>Sign employment contract</li><li>Set up email account</li><li>Request laptop from IT</li><li>Complete HR orientation</li><li>Meet your team</li></ul>`,
    status: 'archived',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-01-15T10:00:00Z',
    publishedAt: '2025-06-02T10:00:00Z',
  },

  // ── Employo > Employo onboarding > Engineering setup ──
  {
    id: 'a-3',
    folderId: 'f-em-onboarding-eng',
    unitId: 'employo',
    title: 'Development environment setup',
    content: `<h2>Prerequisites</h2><p>Before starting, make sure you have the following installed on your machine:</p><ul><li><strong>Node.js</strong> (v18 or higher) — <a href="https://nodejs.org">download here</a></li><li><strong>Docker Desktop</strong> — Required for running local services</li><li><strong>VS Code</strong> — Our recommended editor with team extensions</li></ul><h2>Repository access</h2><p>Request access to the following repositories through your team lead:</p><ul><li><strong>hrm-platform</strong> — Main application monorepo</li><li><strong>hrm-design-system</strong> — Shared component library</li><li><strong>hrm-infrastructure</strong> — Deployment configurations</li></ul><p>Clone the main repository and follow the setup instructions in the README.</p><h2>Local environment</h2><p>Run <code>docker compose up</code> to start all local services. The application will be available at <strong>localhost:3000</strong>. Database seeds are automatically applied on first run.</p><p>If you encounter issues, check the troubleshooting guide or reach out in the <strong>#dev-help</strong> Slack channel.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2025-12-05T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-27T14:00:00Z',
    publishedAt: '2025-12-06T10:00:00Z',
  },
  {
    id: 'a-4',
    folderId: 'f-em-onboarding-eng',
    unitId: 'employo',
    title: 'Git workflow & branching strategy',
    content: `<h2>Branching model</h2><p>We follow a trunk-based development approach with short-lived feature branches.</p><h3>Branch naming</h3><ul><li><strong>feature/TICKET-123-short-description</strong> — New features</li><li><strong>fix/TICKET-456-bug-description</strong> — Bug fixes</li><li><strong>chore/description</strong> — Maintenance tasks</li></ul><h3>Pull request process</h3><p>All changes require a pull request with at least one approval. PRs should be small and focused — aim for under 400 lines of changes. Include a clear description of what changed and why.</p><h2>Code review guidelines</h2><p>When reviewing code, focus on correctness, readability, and maintainability. Be constructive in your feedback and explain the reasoning behind suggestions. We use conventional comments to indicate the type of feedback (suggestion, issue, nitpick).</p>`,
    status: 'draft',
    visibility: 'unit_and_subunits',
    owner: contacts.dmytro,
    createdBy: contacts.dmytro,
    createdAt: '2026-03-25T10:00:00Z',
    updatedBy: contacts.dmytro,
    updatedAt: '2026-03-29T16:00:00Z',
    publishedAt: null,
  },

  // ── Employo > Employo onboarding > Engineering setup > macOS toolbox (level-3) ──
  {
    id: 'a-mac-1',
    folderId: 'f-em-onboarding-eng-mac',
    unitId: 'employo',
    title: 'Recommended Homebrew formulae',
    content: `<h2>Core toolchain</h2><p>Install via <code>brew bundle</code> using the team's <code>Brewfile</code>. Includes:</p><ul><li><strong>git</strong>, <strong>gh</strong>, <strong>git-lfs</strong> — source control</li><li><strong>node</strong> (managed via fnm), <strong>pnpm</strong>, <strong>jq</strong>, <strong>yq</strong></li><li><strong>docker</strong>, <strong>colima</strong> — local containers</li></ul><h2>Editor tools</h2><p>Optional but useful: <strong>fd</strong>, <strong>ripgrep</strong>, <strong>bat</strong>, <strong>eza</strong>, <strong>zoxide</strong>.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2026-01-22T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-12T14:00:00Z',
    publishedAt: '2026-01-23T10:00:00Z',
  },

  // ── Employo > Employo onboarding > Design team setup ──
  {
    id: 'a-5',
    folderId: 'f-em-onboarding-design',
    unitId: 'employo',
    title: 'Design tools & licenses',
    content: `<h2>Figma</h2><p>Figma is our primary design tool. You'll be added to the Employo workspace by your team lead. Key projects to bookmark:</p><ul><li><strong>Design System</strong> — Component library and design tokens</li><li><strong>Product Screens</strong> — Current production designs organized by module</li><li><strong>Explorations</strong> — Work-in-progress concepts and experiments</li></ul><h2>Other tools</h2><ul><li><strong>FigJam</strong> — For workshops, brainstorming, and flow mapping</li><li><strong>Loom</strong> — Screen recordings for async design reviews</li><li><strong>Maze</strong> — User testing and prototype testing</li></ul><h2>Design handoff</h2><p>We use Figma's Dev Mode for engineering handoff. All production-ready designs should be marked as "Ready for development" in Figma and linked in the Jira ticket.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-10T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-03-25T11:00:00Z',
    publishedAt: '2026-01-12T10:00:00Z',
  },

  // ── Employo > Engineering handbook ──
  {
    id: 'a-6',
    folderId: 'f-em-engineering',
    unitId: 'employo',
    title: 'Code review guidelines',
    content: `<h2>Purpose</h2><p>Code reviews are a critical part of our development process. They help us maintain code quality, share knowledge across the team, and catch issues before they reach production.</p><h2>Review checklist</h2><ul><li>Does the code solve the stated problem?</li><li>Is the code readable and well-organized?</li><li>Are there adequate tests?</li><li>Are there any security concerns?</li><li>Does it follow our coding standards?</li></ul><h2>Approval requirements</h2><p>All pull requests require at least <strong>one approval</strong> from a team member. Changes to core infrastructure or shared libraries require <strong>two approvals</strong>, including one from a senior engineer.</p><h2>Feedback etiquette</h2><p>Use conventional comments to categorize your feedback. Prefix with <strong>suggestion:</strong>, <strong>issue:</strong>, <strong>question:</strong>, or <strong>nitpick:</strong> to help the author understand the severity and intent of each comment.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2025-11-01T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-16T09:00:00Z',
    publishedAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 'a-7',
    folderId: 'f-em-engineering',
    unitId: 'employo',
    title: 'Release process',
    content: `<h2>Release cadence</h2><p>We release every <strong>two weeks</strong> on Tuesdays. Release branches are cut from main on the preceding Thursday, giving us Friday and Monday for final testing and fixes.</p><h2>Version tagging</h2><p>We use semantic versioning: <strong>MAJOR.MINOR.PATCH</strong>. The release manager creates the tag after all checks pass.</p><h2>Deployment steps</h2><ul><li>Merge release branch to main</li><li>CI/CD pipeline runs automated tests</li><li>Staging deployment (automatic)</li><li>QA sign-off on staging</li><li>Production deployment (manual trigger by release manager)</li><li>Post-deployment smoke tests</li></ul><h2>Rollback procedure</h2><p>If a critical issue is found post-deployment, the release manager can trigger a rollback to the previous version. Rollback should be completed within <strong>15 minutes</strong> of identifying the issue.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.dmytro,
    createdBy: contacts.dmytro,
    createdAt: '2025-10-20T10:00:00Z',
    updatedBy: contacts.dmytro,
    updatedAt: '2026-03-23T16:00:00Z',
    publishedAt: '2025-10-22T10:00:00Z',
  },
  {
    id: 'a-8',
    folderId: 'f-em-engineering',
    unitId: 'employo',
    title: 'Incident response procedure',
    content: `<h2>Severity levels</h2><ul><li><strong>SEV-1 (Critical):</strong> Complete service outage or data loss. Response within 15 minutes.</li><li><strong>SEV-2 (Major):</strong> Significant functionality degraded. Response within 1 hour.</li><li><strong>SEV-3 (Minor):</strong> Non-critical issue affecting some users. Response within 4 hours.</li></ul><h2>On-call rotation</h2><p>The on-call engineer is responsible for initial triage and response. The rotation schedule is managed in PagerDuty and changes weekly on Mondays.</p><h2>Escalation path</h2><p>If the on-call engineer cannot resolve the issue within the target response time, escalate to the Engineering Lead, then to the CTO if needed.</p><h2>Post-mortem</h2><p>Every SEV-1 and SEV-2 incident requires a blameless post-mortem within 48 hours. Use the post-mortem template in the Engineering Handbook folder.</p>`,
    status: 'published',
    visibility: 'current_unit_only',
    owner: contacts.dmytro,
    createdBy: contacts.dmytro,
    createdAt: '2025-11-10T10:00:00Z',
    updatedBy: contacts.dmytro,
    updatedAt: '2026-03-07T10:00:00Z',
    publishedAt: '2025-11-12T10:00:00Z',
  },

  // ── Employo > QA standards ──
  {
    id: 'a-11',
    folderId: 'f-em-qa',
    unitId: 'employo',
    title: 'Testing requirements',
    content: `<h2>Coverage targets</h2><p>All new code must meet the following minimum test coverage:</p><ul><li><strong>Unit tests:</strong> 80% line coverage for business logic</li><li><strong>Integration tests:</strong> Critical user flows must have E2E coverage</li><li><strong>API tests:</strong> All public endpoints must have contract tests</li></ul><h2>E2E testing strategy</h2><p>We use Playwright for end-to-end testing. E2E tests run on every PR and must pass before merging. Focus E2E tests on critical user journeys, not edge cases.</p><h2>QA sign-off</h2><p>Before a feature is considered "done," it must pass QA sign-off on the staging environment. The QA team uses a standardized checklist based on the acceptance criteria in the ticket.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2026-01-15T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-23T10:00:00Z',
    publishedAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'a-12',
    folderId: 'f-em-qa',
    unitId: 'employo',
    title: 'Bug reporting template',
    content: `<h2>Bug report structure</h2><p>When reporting a bug, include the following information:</p><h3>Summary</h3><p>A clear, concise one-line description of the issue.</p><h3>Steps to reproduce</h3><p>Numbered steps that anyone can follow to reproduce the bug. Be specific about inputs, clicks, and navigation.</p><h3>Expected behavior</h3><p>What should happen when following the steps above.</p><h3>Actual behavior</h3><p>What actually happens. Include screenshots or screen recordings if possible.</p><h3>Severity</h3><ul><li><strong>Blocker:</strong> Prevents core functionality from working</li><li><strong>Critical:</strong> Major feature broken, no workaround</li><li><strong>Major:</strong> Feature broken but workaround exists</li><li><strong>Minor:</strong> Cosmetic or low-impact issue</li></ul>`,
    status: 'draft',
    visibility: 'unit_and_subunits',
    owner: contacts.mykola,
    createdBy: contacts.mykola,
    createdAt: '2026-03-26T10:00:00Z',
    updatedBy: contacts.mykola,
    updatedAt: '2026-03-28T15:00:00Z',
    publishedAt: null,
  },

  // ── Employo > HR — internal (current_unit_only) ──
  {
    id: 'a-hr-1',
    folderId: 'f-em-hr-internal',
    unitId: 'employo',
    title: 'Investigation procedure (HR-only)',
    content: `<h2>Scope</h2><p>Internal procedure for HR-led investigations. Visible only inside Employo — not to Develux or any other unit, even with "Show sub-units" enabled.</p><h2>Steps</h2><ol><li>Receive and log the report.</li><li>Initial confidential interview with the reporter.</li><li>Cross-reference policies and prior incidents.</li><li>Draft a confidential summary for HR leadership.</li></ol>`,
    status: 'published',
    visibility: 'current_unit_only',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2026-02-10T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-20T10:00:00Z',
    publishedAt: '2026-02-11T10:00:00Z',
  },
  {
    id: 'a-hr-2',
    folderId: 'f-em-hr-internal',
    unitId: 'employo',
    title: 'Compensation review — internal notes',
    content: `<h2>Process</h2><p>HR-internal notes on compensation review cycles. Not for sharing outside Employo.</p>`,
    status: 'draft',
    visibility: 'current_unit_only',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2026-03-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-18T10:00:00Z',
    publishedAt: null,
  },

  // ── Develux > Company policies (root) ──
  {
    id: 'a-14',
    folderId: 'f-dx-policies',
    unitId: 'develux',
    title: 'Code of conduct',
    content: `<h2>Our values</h2><p>At Develux, we are committed to creating a respectful, inclusive, and productive work environment. Every team member is expected to uphold these standards in all professional interactions.</p><h2>Expected behavior</h2><ul><li>Treat colleagues with respect and professionalism</li><li>Communicate openly and constructively</li><li>Support diversity and inclusion</li><li>Protect confidential information</li><li>Report concerns through proper channels</li></ul><h2>Reporting violations</h2><p>If you witness or experience behavior that violates this code, report it to your manager or HR. All reports are treated confidentially.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-01-20T10:00:00Z',
    publishedAt: '2025-06-02T10:00:00Z',
  },
  {
    id: 'a-15',
    folderId: 'f-dx-policies',
    unitId: 'develux',
    title: 'Data security policy',
    content: `<h2>Password requirements</h2><p>All accounts must use passwords of at least <strong>12 characters</strong> including uppercase, lowercase, numbers, and special characters. Enable two-factor authentication on all company accounts.</p><h2>Data classification</h2><ul><li><strong>Public:</strong> Marketing materials, public documentation</li><li><strong>Internal:</strong> Internal processes, team information</li><li><strong>Confidential:</strong> Employee data, financial records, client information</li><li><strong>Restricted:</strong> Authentication credentials, encryption keys</li></ul><h2>Handling PII</h2><p>Personal Identifiable Information must never be shared via Slack, email, or any unsecured channel. Use the company's secure file sharing system for all PII transfers.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.dmytro,
    createdBy: contacts.dmytro,
    createdAt: '2025-07-01T10:00:00Z',
    updatedBy: contacts.dmytro,
    updatedAt: '2026-02-10T10:00:00Z',
    publishedAt: '2025-07-02T10:00:00Z',
  },

  // ── Develux > Company policies > Leave policies ──
  {
    id: 'a-16',
    folderId: 'f-dx-policies-leave',
    unitId: 'develux',
    title: 'Vacation policy',
    content: `<h2>Annual leave allowance</h2><p>All full-time employees receive <strong>24 working days</strong> of paid annual leave per calendar year. Part-time employees receive leave proportional to their working hours.</p><h2>Booking process</h2><p>Submit your leave request through the HRM platform at least 5 business days in advance. Extended leave (5+ consecutive days) should be discussed with your manager before submitting.</p><h2>Carry-over rules</h2><p>Up to <strong>5 unused days</strong> can be carried over to the following year. Carried-over days must be used by March 31st. Days exceeding the carry-over limit are forfeited.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-01-10T10:00:00Z',
    publishedAt: '2025-06-16T10:00:00Z',
  },
  {
    id: 'a-17',
    folderId: 'f-dx-policies-leave',
    unitId: 'develux',
    title: 'Sick leave policy',
    content: `<h2>Reporting procedure</h2><p>Notify your manager and HR by <strong>9:00 AM</strong> on the first day of absence. A Slack message or email is sufficient for the initial notification.</p><h2>Documentation</h2><p>For absences of <strong>3 or more consecutive days</strong>, a medical certificate is required. Submit the certificate to HR within 3 business days of returning to work.</p><h2>Return to work</h2><p>After extended illness (5+ days), a brief check-in with your manager is required on your first day back to discuss workload and any accommodations needed.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-01-10T10:00:00Z',
    publishedAt: '2025-06-16T10:00:00Z',
  },

  // ── Develux > Company onboarding ──
  {
    id: 'a-18',
    folderId: 'f-dx-onboarding',
    unitId: 'develux',
    title: 'First day checklist',
    content: `<h2>Before you arrive</h2><p>HR will send you a pre-boarding email with all the details. Please complete the following before your first day:</p><ul><li>Sign and return your employment contract</li><li>Provide banking details for payroll</li><li>Send a photo for your company profile</li></ul><h2>Day 1 schedule</h2><ul><li><strong>9:00</strong> — Welcome meeting with HR</li><li><strong>9:30</strong> — Office tour and security badge</li><li><strong>10:00</strong> — IT setup: laptop, accounts, and access</li><li><strong>11:00</strong> — Meet your team and manager</li><li><strong>12:00</strong> — Team lunch</li><li><strong>14:00</strong> — Product overview presentation</li><li><strong>15:30</strong> — Free time to explore tools and documentation</li></ul>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-03-10T10:00:00Z',
    publishedAt: '2025-06-02T10:00:00Z',
  },
  {
    id: 'a-19',
    folderId: 'f-dx-onboarding',
    unitId: 'develux',
    title: 'Company history & mission',
    content: `<h2>Our story</h2><p>Develux was founded in 2018 with a simple mission: to build HR software that actually helps people do their best work. Starting as a small team of five, we've grown into a multi-product company serving organizations across Europe.</p><h2>Mission statement</h2><p><strong>"Empower organizations to build thriving workplaces through intuitive, people-first technology."</strong></p><h2>Core values</h2><ul><li><strong>People first</strong> — Technology serves people, not the other way around</li><li><strong>Build with care</strong> — Quality over speed, always</li><li><strong>Stay curious</strong> — Learn, experiment, improve</li><li><strong>Win together</strong> — Collaboration over competition</li></ul>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-06-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2025-12-15T10:00:00Z',
    publishedAt: '2025-06-02T10:00:00Z',
  },

  // ── Develux > Benefits & perks ──
  {
    id: 'a-20',
    folderId: 'f-dx-benefits',
    unitId: 'develux',
    title: 'Health insurance overview',
    content: `<h2>Plan options</h2><p>Develux offers two health insurance plans through our provider:</p><ul><li><strong>Standard Plan:</strong> Covers general medical, dental, and vision. Company pays 80% of the premium.</li><li><strong>Premium Plan:</strong> Includes everything in Standard plus mental health coverage, physiotherapy, and extended specialist network. Company pays 70% of the premium.</li></ul><h2>Enrollment</h2><p>New employees are enrolled automatically in the Standard Plan during onboarding. You can upgrade to Premium during the annual enrollment period (November 1-15) or within 30 days of a qualifying life event.</p><h2>Covered services</h2><p>Both plans cover preventive care, emergency services, hospitalization, prescription medications, and mental health support. Check the detailed benefits guide in HR for the full list of covered services and co-pay amounts.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-07-01T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-02-15T10:00:00Z',
    publishedAt: '2025-07-02T10:00:00Z',
  },
  // ── Employo > Product > Design > Design team handbook ──
  {
    id: 'a-design-1',
    folderId: 'f-design-handbook',
    unitId: 'employo-design',
    title: 'Brand guidelines & design tokens',
    content: `<h2>Brand foundations</h2><p>Everything you need to keep our visual language consistent across product and marketing surfaces.</p><h3>Logo usage</h3><ul><li>Always preserve minimum clear space equal to the height of the logo glyph.</li><li>Never recolor the wordmark outside of the approved palette.</li><li>Use the monochrome variant on photographic backgrounds.</li></ul><h3>Tokens</h3><p>Color, type, and spacing tokens live in the <strong>Design System</strong> Figma library. Engineers consume them via <code>@employo/design-tokens</code>.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-10T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-12T10:00:00Z',
    publishedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'a-design-2',
    folderId: 'f-design-handbook',
    unitId: 'employo-design',
    title: 'Design critique rituals',
    content: `<h2>Weekly crit</h2><p>Designers present in-progress work for structured feedback every Wednesday at 14:00. Bring two screens: where you started, where you are now.</p><h2>Feedback rubric</h2><ul><li>Does the design solve the user problem?</li><li>Is the visual hierarchy clear?</li><li>Does it match the design system?</li></ul>`,
    status: 'draft',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-04-05T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-18T15:00:00Z',
    publishedAt: null,
  },

  // ── Employo > Product > Design > Design team handbook > Components library ──
  {
    id: 'a-design-comp-1',
    folderId: 'f-design-handbook-components',
    unitId: 'employo-design',
    title: 'Button system overview',
    content: `<h2>Variants</h2><p>The button system covers four variants — <strong>primary</strong>, <strong>secondary</strong>, <strong>ghost</strong>, <strong>destructive</strong> — and three sizes (sm / md / lg).</p><h2>States</h2><ul><li>Default · Hover · Focus · Active · Disabled · Loading</li></ul><h2>Usage rules</h2><p>Only one primary button per surface. Destructive variant requires a confirmation step.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-01-22T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-08T10:00:00Z',
    publishedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'a-design-comp-2',
    folderId: 'f-design-handbook-components',
    unitId: 'employo-design',
    title: 'Color tokens',
    content: `<h2>Brand colors</h2><p>Primary blue <code>#006bd6</code>, hover <code>#0052a3</code>. Use the semantic tokens (<code>color-action</code>, <code>color-text-primary</code>) in code — never hardcode hex values.</p><h2>Surface tokens</h2><ul><li><code>surface-bg</code> · <code>surface-elevated</code> · <code>surface-muted</code></li></ul>`,
    status: 'draft',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-03-15T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-08T10:00:00Z',
    publishedAt: null,
  },

  // ── …Components library > Form patterns ──
  {
    id: 'a-design-comp-form-1',
    folderId: 'f-design-handbook-components-forms',
    unitId: 'employo-design',
    title: 'Input field anatomy',
    content: `<h2>Anatomy</h2><p>Label · Hint · Input · Validation message · Optional adornments (prefix / suffix / clear).</p><h2>Validation</h2><p>Inline error appears below the input on blur, not on every keystroke. Required fields use <code>aria-required</code> + visible asterisk.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-02-12T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-05T10:00:00Z',
    publishedAt: '2026-02-14T10:00:00Z',
  },

  // ── Employo > Product > Design > Hiring rubric (internal) ──
  {
    id: 'a-design-hiring-1',
    folderId: 'f-design-confidential',
    unitId: 'employo-design',
    title: 'Senior designer scorecard',
    content: `<h2>Scope</h2><p>Internal hiring rubric for Senior Designer roles. Confidential — only visible inside the Design unit.</p><h2>Criteria</h2><ul><li>Visual craft</li><li>Systems thinking</li><li>Cross-functional collaboration</li><li>Mentorship</li></ul>`,
    status: 'published',
    visibility: 'current_unit_only',
    owner: contacts.anna,
    createdBy: contacts.anna,
    createdAt: '2026-02-05T10:00:00Z',
    updatedBy: contacts.anna,
    updatedAt: '2026-04-10T10:00:00Z',
    publishedAt: '2026-02-06T10:00:00Z',
  },

  // ── EDU > Marketing > Marketing playbook ──
  {
    id: 'a-edu-mk-1',
    folderId: 'f-edu-mk-playbook',
    unitId: 'edu-marketing',
    title: 'Campaign launch checklist',
    content: `<h2>Pre-launch (T-7)</h2><ul><li>Final creative review with brand</li><li>Landing page QA across breakpoints</li><li>Analytics events implemented and verified</li></ul><h2>Launch day</h2><ul><li>Schedule social posts at 9:00, 12:00, 17:00</li><li>Monitor support inbox for unusual volume</li><li>Send launch summary to leadership at 18:00</li></ul>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.temari,
    createdBy: contacts.temari,
    createdAt: '2026-01-15T10:00:00Z',
    updatedBy: contacts.temari,
    updatedAt: '2026-04-18T10:00:00Z',
    publishedAt: '2026-01-16T10:00:00Z',
  },
  {
    id: 'a-edu-mk-2',
    folderId: 'f-edu-mk-playbook',
    unitId: 'edu-marketing',
    title: 'Course naming conventions',
    content: `<h2>Format</h2><p>Each course title follows the pattern <strong>{Audience} · {Topic} · {Level}</strong>, e.g. "Engineers · Kubernetes · Intermediate".</p><h2>Length</h2><p>Keep titles under 60 characters so they fit the marketplace card without truncation.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.temari,
    createdBy: contacts.temari,
    createdAt: '2026-02-01T10:00:00Z',
    updatedBy: contacts.temari,
    updatedAt: '2026-03-22T10:00:00Z',
    publishedAt: '2026-02-02T10:00:00Z',
  },

  {
    id: 'a-21',
    folderId: 'f-dx-benefits',
    unitId: 'develux',
    title: 'Learning & development budget',
    content: `<h2>Annual budget</h2><p>Every employee has an annual <strong>learning and development budget of €1,500</strong>. This resets on January 1st and does not carry over.</p><h2>Approved categories</h2><ul><li>Online courses and certifications (Udemy, Coursera, etc.)</li><li>Conference attendance (ticket + travel)</li><li>Books and educational materials</li><li>Professional coaching or mentoring</li><li>Language courses</li></ul><h2>Reimbursement process</h2><p>Submit your receipt and a brief description of the learning activity through the HRM platform's expense module. Reimbursements are processed within 10 business days and added to your next paycheck.</p><p>For expenses over <strong>€500</strong>, get pre-approval from your manager before purchasing.</p>`,
    status: 'published',
    visibility: 'unit_and_subunits',
    owner: contacts.yuliana,
    createdBy: contacts.yuliana,
    createdAt: '2025-07-15T10:00:00Z',
    updatedBy: contacts.yuliana,
    updatedAt: '2026-02-15T10:00:00Z',
    publishedAt: '2025-07-16T10:00:00Z',
  },
];

/** Promote each seed to a fully-typed KBArticle:
 *   - Already-published seeds get a single v1 version snapshot (current
 *     content, publishedAt timestamp, createdBy as the publisher).
 *   - All seeds start with no pending draft. */
function normalizeSeed(seed: ArticleSeed): KBArticle {
  const versions: ArticleVersion[] = [];
  if (seed.status === 'published' && seed.publishedAt) {
    versions.push({
      version: 1,
      content: seed.content,
      publishedAt: seed.publishedAt,
      publishedBy: seed.createdBy,
    });
  }
  return {
    ...seed,
    draftContent: null,
    draftUpdatedAt: null,
    draftUpdatedBy: null,
    versions,
  };
}

export const allArticles: KBArticle[] = articleSeeds.map(normalizeSeed);

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/** Get a single folder by ID */
export function getFolder(id: string): KBFolder | undefined {
  return allFolders.find((f) => f.id === id);
}

/** Get a single article by ID */
export function getArticle(id: string): KBArticle | undefined {
  return allArticles.find((a) => a.id === id);
}

interface FolderQueryOptions {
  /** When true, archived folders are included. Default: false. */
  includeArchived?: boolean;
}

function folderActive(f: KBFolder, opts?: FolderQueryOptions): boolean {
  return opts?.includeArchived ? true : f.status === 'active';
}

/** Get top-level folders owned by a unit (for the unit's own tree). */
export function getOwnRootFolders(
  unitId: string,
  opts?: FolderQueryOptions
): KBFolder[] {
  return allFolders
    .filter(
      (f) => f.unitId === unitId && f.parentFolderId === null && folderActive(f, opts)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Get child folders of a given folder. */
export function getChildFolders(
  parentFolderId: string,
  opts?: FolderQueryOptions
): KBFolder[] {
  return allFolders
    .filter((f) => f.parentFolderId === parentFolderId && folderActive(f, opts))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Whether a folder's visibility makes it visible to the given unit. */
function folderVisibleToUnit(folder: KBFolder, viewingUnitId: string): boolean {
  if (folder.unitId === viewingUnitId) return true;
  if (folder.visibility === 'current_unit_only') return false;
  return getDescendantUnitIds(folder.unitId).has(viewingUnitId);
}

/** Whether an article is visible to the given viewing unit. */
function articleVisibleToUnit(article: KBArticle, viewingUnitId: string): boolean {
  if (article.unitId === viewingUnitId) return true;
  if (article.visibility === 'current_unit_only') return false;
  return getDescendantUnitIds(article.unitId).has(viewingUnitId);
}

/** Top-level shared folders: owned by other units, visible to viewingUnitId,
 *  containing at least one published article visible to viewingUnitId. */
export function getSharedRootFolders(viewingUnitId: string): KBFolder[] {
  return allFolders
    .filter(
      (f) =>
        f.unitId !== viewingUnitId &&
        f.parentFolderId === null &&
        f.status === 'active' &&
        folderVisibleToUnit(f, viewingUnitId) &&
        hasVisiblePublishedArticle(f.id, viewingUnitId)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

/** Top-level folders owned by descendant units of viewingUnitId — used by the
 *  "Show sub-units" toggle so a parent admin can browse downward.
 *  `current_unit_only` folders are intentionally hidden: a sub-unit's "Current
 *  unit" visibility is strict and parents cannot see them even with the toggle. */
export function getSubUnitRootFolders(viewingUnitId: string): KBFolder[] {
  const descendants = getDescendantUnitIds(viewingUnitId);
  return allFolders
    .filter(
      (f) =>
        descendants.has(f.unitId) &&
        f.parentFolderId === null &&
        f.status === 'active' &&
        f.visibility === 'unit_and_subunits'
    )
    .sort((a, b) => {
      const u = a.unitId.localeCompare(b.unitId);
      return u !== 0 ? u : a.name.localeCompare(b.name);
    });
}

/** Recursive: does this folder (or any sub-folder) contain a published article visible to viewingUnitId? */
function hasVisiblePublishedArticle(folderId: string, viewingUnitId: string): boolean {
  const direct = allArticles.some(
    (a) =>
      a.folderId === folderId &&
      a.status === 'published' &&
      articleVisibleToUnit(a, viewingUnitId)
  );
  if (direct) return true;
  const children = getChildFolders(folderId);
  return children.some((c) => hasVisiblePublishedArticle(c.id, viewingUnitId));
}

/** Articles directly in a folder, filtered for the viewing unit.
 *  - Own folder: drafts + published; archived only when includeArchived.
 *  - Sub-unit folder (parent-admin view): published articles regardless of visibility.
 *  - Shared folder (cascaded down from parent): only published with visibility cascading
 *    to the viewer. */
export function getArticlesInFolder(
  folderId: string,
  viewingUnitId: string,
  opts?: FolderQueryOptions
): KBArticle[] {
  const folder = getFolder(folderId);
  if (!folder) return [];
  const isOwn = folder.unitId === viewingUnitId;
  const isSubUnit = !isOwn && getDescendantUnitIds(viewingUnitId).has(folder.unitId);
  const includeArchived = !!opts?.includeArchived;

  return allArticles
    .filter((a) => a.folderId === folderId)
    .filter((a) => {
      if (isOwn) {
        if (a.status === 'archived') return includeArchived;
        return true;
      }
      if (isSubUnit) {
        // Parent viewing child via sub-units toggle: strict — current_unit_only stays hidden.
        return a.status === 'published' && a.visibility === 'unit_and_subunits';
      }
      if (a.status !== 'published') return false;
      return articleVisibleToUnit(a, viewingUnitId);
    })
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
}

/** Visible (non-archived) article count for a folder including its sub-folders. */
export function getArticleCount(folderId: string, viewingUnitId: string): number {
  const folder = getFolder(folderId);
  if (!folder) return 0;
  const isOwn = folder.unitId === viewingUnitId;
  const isSubUnit = !isOwn && getDescendantUnitIds(viewingUnitId).has(folder.unitId);

  const direct = allArticles.filter((a) => {
    if (a.folderId !== folderId) return false;
    if (isOwn) return a.status !== 'archived';
    if (isSubUnit) return a.status === 'published' && a.visibility === 'unit_and_subunits';
    return a.status === 'published' && articleVisibleToUnit(a, viewingUnitId);
  }).length;

  const childCounts = getChildFolders(folderId).reduce(
    (sum, c) => sum + getArticleCount(c.id, viewingUnitId),
    0
  );
  return direct + childCounts;
}

/** Build the breadcrumb path of folders from a leaf folder up to the root. */
export function getFolderPath(folderId: string): KBFolder[] {
  const path: KBFolder[] = [];
  let current = getFolder(folderId);
  while (current) {
    path.unshift(current);
    current = current.parentFolderId ? getFolder(current.parentFolderId) : undefined;
  }
  return path;
}

/** Folder depth: top-level = 1, sub-folder = 2, sub-sub-folder = 3.
 *  Capped at 3 per D-2026-05-12-02 in docs/DECISIONS.md (was 2 in PRD §3.3). */
export function getFolderDepth(folderId: string): number {
  return getFolderPath(folderId).length;
}

/** Walks up to the root (level-1) ancestor. Returns undefined if the folder is
 *  missing entirely; returns the folder itself if it is already a root. */
export function getRootFolder(folderId: string): KBFolder | undefined {
  const path = getFolderPath(folderId);
  return path[0];
}

/** Display style (color) inherited from the root ancestor. Sub-folders always
 *  render with their root's color — sub-folder's own `color` field is ignored. */
export function getFolderDisplayStyle(folderId: string): { color: string } {
  const root = getRootFolder(folderId);
  return {
    color: root?.color ?? '#006bd6',
  };
}

/** Flat list of every article visible to a viewing unit, across all reachable
 *  folders. Used by the "All articles" view. Respects the same lens rules as
 *  the per-folder views, plus optional includeSubUnits to mirror the toolbar
 *  toggle. Default sort: updatedAt desc. */
export function getAllVisibleArticles(
  viewingUnitId: string,
  opts?: {
    includeArchived?: boolean;
    includeSubUnits?: boolean;
    search?: string;
  }
): KBArticle[] {
  const folderIds = new Set<string>();

  const collectTree = (rootId: string, includeArchivedFolders: boolean) => {
    folderIds.add(rootId);
    getChildFolders(rootId, { includeArchived: includeArchivedFolders }).forEach((c) =>
      collectTree(c.id, includeArchivedFolders)
    );
  };

  // Own folders (archived included if asked)
  const ownRoots = getOwnRootFolders(viewingUnitId, {
    includeArchived: !!opts?.includeArchived,
  });
  ownRoots.forEach((f) => collectTree(f.id, !!opts?.includeArchived));

  // Shared roots (only active — archived sharing not exposed to other units)
  getSharedRootFolders(viewingUnitId).forEach((f) => collectTree(f.id, false));

  // Sub-unit roots (mirrors the sidebar toggle)
  if (opts?.includeSubUnits) {
    getSubUnitRootFolders(viewingUnitId).forEach((f) => collectTree(f.id, false));
  }

  const seen = new Set<string>();
  const out: KBArticle[] = [];
  for (const fid of folderIds) {
    const articles = getArticlesInFolder(fid, viewingUnitId, {
      includeArchived: !!opts?.includeArchived,
    });
    for (const a of articles) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      out.push(a);
    }
  }

  let result = out;
  const q = opts?.search?.trim().toLowerCase();
  if (q) {
    result = out.filter((a) => a.title.toLowerCase().includes(q));
  }
  result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return result;
}

/** Root folders the current user can reach across all their positions, split
 *  into two buckets that mirror the unit-view sectioning:
 *    - `own`     — folders owned by any position unit (the user's "My folders")
 *    - `parent`  — folders owned by ancestor units, cascaded down via
 *                  `unit_and_subunits`, deduped across positions.
 *  No `sub-units` bucket on Home — that drill-down belongs to the specific
 *  unit's view. */
export function getHomeFolderSections(): {
  own: KBFolder[];
  parent: KBFolder[];
} {
  const seenOwn = new Set<string>();
  const own: KBFolder[] = [];
  const seenParent = new Set<string>();
  const parent: KBFolder[] = [];
  for (const posUnitId of currentUserPositions) {
    for (const f of getOwnRootFolders(posUnitId)) {
      if (!seenOwn.has(f.id)) {
        seenOwn.add(f.id);
        own.push(f);
      }
    }
    for (const f of getSharedRootFolders(posUnitId)) {
      if (!seenParent.has(f.id)) {
        seenParent.add(f.id);
        parent.push(f);
      }
    }
  }
  const byUnitThenName = (a: KBFolder, b: KBFolder) =>
    a.unitId.localeCompare(b.unitId) || a.name.localeCompare(b.name);
  own.sort(byUnitThenName);
  parent.sort(byUnitThenName);
  return { own, parent };
}

/** When rendering a folder inside the Home scope, FolderView needs a "viewing
 *  unit" lens to filter articles correctly. Use the folder's owning unit if
 *  the user has a position there; otherwise pick the first user position that
 *  can see this folder (via `unit_and_subunits` cascade). */
export function findHomeViewingUnit(folder: KBFolder): string {
  if (currentUserPositions.includes(folder.unitId)) return folder.unitId;
  for (const pos of currentUserPositions) {
    if (folder.visibility === 'unit_and_subunits' &&
        getDescendantUnitIds(folder.unitId).has(pos)) {
      return pos;
    }
  }
  return currentUserPositions[0];
}

/** Aggregated view across every unit where the current user holds a position.
 *  Unions `getAllVisibleArticles` per position with de-duplication. Mirrors the
 *  natural unit-view: includes own + parent-cascaded shared content, but does
 *  NOT auto-expand into descendant sub-units (the user can still flip into a
 *  specific unit to use that toggle). */
export function getHomeArticles(opts?: {
  includeArchived?: boolean;
  search?: string;
}): KBArticle[] {
  const seen = new Set<string>();
  const out: KBArticle[] = [];
  for (const unitId of currentUserPositions) {
    const articles = getAllVisibleArticles(unitId, {
      includeArchived: !!opts?.includeArchived,
      includeSubUnits: false,
    });
    for (const a of articles) {
      if (seen.has(a.id)) continue;
      seen.add(a.id);
      out.push(a);
    }
  }
  let result = out;
  const q = opts?.search?.trim().toLowerCase();
  if (q) result = result.filter((a) => a.title.toLowerCase().includes(q));
  result.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return result;
}

/** Folders that can serve as a parent for a NEW sub-folder in the given unit:
 *  must be own + active + at depth < 3 (so the child won't exceed max depth).
 *  Returned in tree (DFS) order so the UI can render hierarchy via indentation. */
export function getEligibleParentFolders(unitId: string): KBFolder[] {
  const result: KBFolder[] = [];
  const walk = (folder: KBFolder) => {
    if (folder.status !== 'active') return;
    if (getFolderDepth(folder.id) >= 3) return;
    result.push(folder);
    getChildFolders(folder.id).forEach(walk);
  };
  getOwnRootFolders(unitId).forEach(walk);
  return result;
}

/** Visibility a new (or edited) folder/article is allowed to have, given the
 *  ancestor chain. Walks up from the given parent folder id; if any ancestor
 *  is `current_unit_only`, the answer is `current_unit_only` (Public option
 *  is forbidden — children can never be more visible than their parent).
 *  Pass `null` to indicate "no parent" (root folder, unrestricted). */
export function getMaxAllowedVisibility(
  parentFolderId: string | null
): KBFolder['visibility'] {
  let id = parentFolderId;
  while (id) {
    const f = getFolder(id);
    if (!f) break;
    if (f.visibility === 'current_unit_only') return 'current_unit_only';
    id = f.parentFolderId;
  }
  return 'unit_and_subunits';
}

/** Every own + active folder in the unit, in tree (DFS) order. Unlike
 *  `getEligibleParentFolders`, this includes level-3 folders — articles can
 *  live at any folder level. Used by the article-creation picker. */
export function getOwnFoldersInTreeOrder(unitId: string): KBFolder[] {
  const result: KBFolder[] = [];
  const walk = (folder: KBFolder) => {
    if (folder.status !== 'active') return;
    result.push(folder);
    getChildFolders(folder.id).forEach(walk);
  };
  getOwnRootFolders(unitId).forEach(walk);
  return result;
}

// ============================================================
// MUTATIONS + PERSISTENCE
// All mutations bump the kb version (so subscribers re-render) and snapshot
// state to localStorage so changes survive a page refresh.
// ============================================================

import type { ArticleStatus, ArticleActivity, ArticleActivityKind } from '@/types';
import { notifyFoldersChanged } from '@/state/folder-store';
import {
  loadKbState,
  saveKbState,
  clearKbState,
  loadActivity,
  saveActivity,
} from '@/state/persistence';

// Snapshot the seed data so "Reset" can restore it later.
const defaultFolders: KBFolder[] = JSON.parse(JSON.stringify(allFolders));
const defaultArticles: KBArticle[] = JSON.parse(JSON.stringify(allArticles));

// Hydrate from localStorage if present. Replace array contents in place so
// existing imports keep their reference.
(() => {
  const persisted = loadKbState();
  if (!persisted) return;
  allFolders.length = 0;
  allFolders.push(...persisted.folders);
  allArticles.length = 0;
  allArticles.push(...persisted.articles);
})();

// === Activity log ===========================================================
// Append-only. Seeded once at module load from the current article set; user
// actions add new entries. Persists separately from folders/articles.

/** Stand-in for "the current user" in this single-user prototype. */
const currentUser = contacts.oleksii;

export const allActivity: ArticleActivity[] = [];

function buildSeedActivity(): ArticleActivity[] {
  const out: ArticleActivity[] = [];
  let counter = 0;
  for (const a of allArticles) {
    const createdBy = a.createdBy ?? currentUser;
    out.push({
      id: `act-seed-${counter++}`,
      articleId: a.id,
      actor: createdBy,
      timestamp: a.createdAt,
      kind: 'created',
      data: {},
    });
    if (a.publishedAt) {
      out.push({
        id: `act-seed-${counter++}`,
        articleId: a.id,
        actor: createdBy,
        timestamp: a.publishedAt,
        kind: 'status_changed',
        data: { fromStatus: 'draft', toStatus: 'published' },
      });
    }
    // Surface a recent edit if updatedAt is significantly newer than created.
    if (
      a.updatedAt &&
      new Date(a.updatedAt).getTime() - new Date(a.createdAt).getTime() > 86_400_000
    ) {
      out.push({
        id: `act-seed-${counter++}`,
        articleId: a.id,
        actor: a.updatedBy ?? currentUser,
        timestamp: a.updatedAt,
        kind: 'content_updated',
        data: {},
      });
    }
  }
  // A couple of seeded comments for demo flavor.
  const welcome = allArticles.find((a) => a.id === 'a-1');
  if (welcome) {
    out.push({
      id: `act-seed-${counter++}`,
      articleId: welcome.id,
      actor: contacts.anna,
      timestamp: '2026-04-02T11:30:00Z',
      kind: 'comment',
      data: {
        comment:
          "Thanks for putting this together — added a few links to the design wiki for newcomers.",
      },
    });
    out.push({
      id: `act-seed-${counter++}`,
      articleId: welcome.id,
      actor: contacts.dmytro,
      timestamp: '2026-04-05T09:10:00Z',
      kind: 'comment',
      data: { comment: "Looks great. Should we mention the on-call rotation here too?" },
    });
  }
  return out;
}

(() => {
  const persisted = loadActivity();
  if (persisted) {
    allActivity.push(...persisted);
  } else {
    allActivity.push(...buildSeedActivity());
  }
})();

const defaultActivity: ArticleActivity[] = JSON.parse(JSON.stringify(allActivity));

function persist(): void {
  saveKbState(allFolders, allArticles);
  saveActivity(allActivity);
}

function commit(): void {
  notifyFoldersChanged();
  persist();
}

function pushActivity(
  articleId: string,
  kind: ArticleActivityKind,
  data: ArticleActivity['data']
): void {
  allActivity.push({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    articleId,
    actor: currentUser,
    timestamp: new Date().toISOString(),
    kind,
    data,
  });
}

/** Activities for a given article, oldest first. */
export function getActivity(articleId: string): ArticleActivity[] {
  return allActivity
    .filter((a) => a.articleId === articleId)
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

/** Append a user-authored comment to an article's activity. */
export function addComment(articleId: string, text: string): ArticleActivity | undefined {
  const trimmed = text.trim();
  if (!trimmed) return undefined;
  const entry: ArticleActivity = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    articleId,
    actor: currentUser,
    timestamp: new Date().toISOString(),
    kind: 'comment',
    data: { comment: trimmed },
  };
  allActivity.push(entry);
  commit();
  return entry;
}

// ── Folder mutations ──

export function addFolder(folder: KBFolder): void {
  allFolders.push(folder);
  commit();
}

export function renameFolder(folderId: string, name: string): void {
  const folder = getFolder(folderId);
  if (!folder) return;
  folder.name = name;
  folder.updatedAt = new Date().toISOString();
  commit();
}

export function setFolderVisibility(folderId: string, visibility: KBFolder['visibility']): void {
  const folder = getFolder(folderId);
  if (!folder) return;
  // Enforce the invariant: a folder cannot be more visible than its parent.
  const maxAllowed = getMaxAllowedVisibility(folder.parentFolderId);
  if (visibility === 'unit_and_subunits' && maxAllowed === 'current_unit_only') {
    return; // Caller's UI should prevent this; defensive no-op.
  }
  if (folder.visibility === visibility) return;
  folder.visibility = visibility;
  folder.updatedAt = new Date().toISOString();
  // Cascade BOTH directions: children always sync with the new parent value.
  // Going Private → child must be Private (invariant). Going Public → child
  // also flips to Public per the product rule.
  cascadeFolderVisibility(folderId, visibility);
  commit();
}

/** Internal: syncs every descendant folder + article inside `folderId` to the
 *  given visibility. Does not commit; callers commit after their own state
 *  changes. */
function cascadeFolderVisibility(
  folderId: string,
  visibility: KBFolder['visibility']
): void {
  const now = new Date().toISOString();
  const children = getChildFolders(folderId, { includeArchived: true });
  for (const child of children) {
    if (child.visibility !== visibility) {
      child.visibility = visibility;
      child.updatedAt = now;
    }
    cascadeFolderVisibility(child.id, visibility);
  }
  for (const a of allArticles) {
    if (a.folderId === folderId && a.visibility !== visibility) {
      a.visibility = visibility;
      a.updatedAt = now;
    }
  }
}

/** Update a folder's color. Only meaningful on root folders since sub-folders
 *  resolve their color from the root ancestor at render time. */
export function setFolderColor(folderId: string, color: string): void {
  const folder = getFolder(folderId);
  if (!folder) return;
  folder.color = color;
  folder.updatedAt = new Date().toISOString();
  commit();
}

/** Archive a folder and all descendants (sub-folders + articles). */
export function archiveFolderTree(folderId: string): void {
  const folder = getFolder(folderId);
  if (!folder) return;

  const collect = (id: string): string[] => {
    const ids = [id];
    getChildFolders(id, { includeArchived: true }).forEach((c) => ids.push(...collect(c.id)));
    return ids;
  };

  const ids = collect(folderId);
  const now = new Date().toISOString();
  for (const f of allFolders) {
    if (ids.includes(f.id)) {
      f.status = 'archived';
      f.updatedAt = now;
    }
  }
  for (const a of allArticles) {
    if (ids.includes(a.folderId) && a.status !== 'archived') {
      a.status = 'archived';
      a.updatedAt = now;
    }
  }
  commit();
}

/** Restore an archived folder. Articles inside come back as drafts (PRD §10.5). */
export function restoreFolderTree(folderId: string): void {
  const folder = getFolder(folderId);
  if (!folder) return;

  const collect = (id: string): string[] => {
    const ids = [id];
    getChildFolders(id, { includeArchived: true }).forEach((c) => ids.push(...collect(c.id)));
    return ids;
  };

  const ids = collect(folderId);
  const now = new Date().toISOString();
  for (const f of allFolders) {
    if (ids.includes(f.id) && f.status === 'archived') {
      f.status = 'active';
      f.updatedAt = now;
    }
  }
  for (const a of allArticles) {
    if (ids.includes(a.folderId) && a.status === 'archived') {
      a.status = 'draft';
      a.updatedAt = now;
    }
  }
  commit();
}

/** Counts of articles + sub-folders inside a folder (recursive). For
 *  archive/delete impact summary. Includes articles in any status. */
export function getFolderImpact(folderId: string): { articles: number; subFolders: number } {
  let articles = 0;
  let subFolders = 0;
  const walk = (id: string, isRoot: boolean) => {
    if (!isRoot) subFolders++;
    articles += allArticles.filter((a) => a.folderId === id).length;
    getChildFolders(id, { includeArchived: true }).forEach((c) => walk(c.id, false));
  };
  walk(folderId, true);
  return { articles, subFolders };
}

/** Hard-delete a folder, all its sub-folders, and every article inside. */
export function deleteFolderTree(folderId: string): void {
  const collect = (id: string): string[] => {
    const ids = [id];
    getChildFolders(id, { includeArchived: true }).forEach((c) => ids.push(...collect(c.id)));
    return ids;
  };
  const folderIds = new Set(collect(folderId));
  // Articles first (so re-renders see the parent folder still exist briefly).
  for (let i = allArticles.length - 1; i >= 0; i--) {
    if (folderIds.has(allArticles[i].folderId)) allArticles.splice(i, 1);
  }
  for (let i = allFolders.length - 1; i >= 0; i--) {
    if (folderIds.has(allFolders[i].id)) allFolders.splice(i, 1);
  }
  commit();
}

// ── Article mutations ──

/** Insert a new article or replace an existing one (matched by id). Records
 *  a `created` activity for inserts and `content_updated` for content diffs
 *  on replaces. Other field changes flow through the typed mutations and
 *  log their own events; we don't double-log here. */
export function upsertArticle(article: KBArticle): void {
  const idx = allArticles.findIndex((a) => a.id === article.id);
  if (idx >= 0) {
    const prev = allArticles[idx];
    allArticles[idx] = article;
    if (prev.content !== article.content) {
      pushActivity(article.id, 'content_updated', {});
    }
  } else {
    allArticles.push(article);
    pushActivity(article.id, 'created', {});
  }
  commit();
}

export function setArticleStatus(id: string, status: ArticleStatus): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  const fromStatus = article.status;
  if (fromStatus === status) return article;
  const now = new Date().toISOString();
  article.status = status;
  article.updatedAt = now;
  // Publish via the status menu: snapshot current content as the next
  // version. Bumps the version counter and logs version_published instead
  // of the generic status_changed.
  if (status === 'published') {
    const prevVersion = article.versions.length;
    const newVersion: ArticleVersion = {
      version: prevVersion + 1,
      content: article.content,
      publishedAt: now,
      publishedBy: currentUser,
    };
    article.versions.push(newVersion);
    article.publishedAt = now;
    article.draftContent = null;
    article.draftUpdatedAt = null;
    article.draftUpdatedBy = null;
    pushActivity(article.id, 'version_published', {
      fromVersion: prevVersion,
      toVersion: newVersion.version,
    });
    commit();
    return article;
  }
  // Reverting from published → draft drops any pending unpublished
  // changes: the article is now editable as a regular draft.
  if (status === 'draft') {
    article.draftContent = null;
    article.draftUpdatedAt = null;
    article.draftUpdatedBy = null;
  }
  pushActivity(article.id, 'status_changed', {
    fromStatus,
    toStatus: status,
  });
  commit();
  return article;
}

export function moveArticle(id: string, folderId: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  const folder = getFolder(folderId);
  if (!folder) return article;
  if (article.folderId === folderId) return article;
  const prevFolder = getFolder(article.folderId);
  article.folderId = folderId;
  // Article's owning unit follows its folder. In MVP folders live in a single
  // unit so this stays consistent.
  article.unitId = folder.unitId;
  article.updatedAt = new Date().toISOString();
  // Enforce visibility invariant: if the new folder chain is private,
  // demote the article to private too. (Promotions never happen on move.)
  const folderEffectiveMax =
    folder.visibility === 'current_unit_only'
      ? 'current_unit_only'
      : getMaxAllowedVisibility(folder.parentFolderId);
  if (
    folderEffectiveMax === 'current_unit_only' &&
    article.visibility === 'unit_and_subunits'
  ) {
    article.visibility = 'current_unit_only';
  }
  pushActivity(article.id, 'folder_moved', {
    fromFolder: prevFolder?.name ?? '—',
    toFolder: folder.name,
  });
  commit();
  return article;
}

/** Rename an article. Bumps updatedAt. */
export function setArticleTitle(id: string, title: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  const fromTitle = article.title;
  if (fromTitle === title) return article;
  article.title = title;
  article.updatedAt = new Date().toISOString();
  pushActivity(article.id, 'title_renamed', { fromTitle, toTitle: title });
  commit();
  return article;
}

/** Reassign an article's owner. The new owner must be a known contact id. */
export function setArticleOwner(id: string, ownerId: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  const owner = Object.values(contacts).find((c) => c.id === ownerId);
  if (!owner) return article;
  if (article.owner.id === ownerId) return article;
  const fromOwner = article.owner.name;
  article.owner = owner;
  article.updatedAt = new Date().toISOString();
  pushActivity(article.id, 'owner_changed', { fromOwner, toOwner: owner.name });
  commit();
  return article;
}

/** Change an article's visibility. Enforces the invariant: cannot be more
 *  visible than its folder chain (Public is rejected if any ancestor is
 *  Private). Callers' UI should disable Public; this is a defensive guard. */
export function setArticleVisibility(
  id: string,
  visibility: KBArticle['visibility']
): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  if (article.visibility === visibility) return article;
  const folder = getFolder(article.folderId);
  if (folder) {
    const folderEffectiveMax =
      folder.visibility === 'current_unit_only'
        ? 'current_unit_only'
        : getMaxAllowedVisibility(folder.parentFolderId);
    if (
      visibility === 'unit_and_subunits' &&
      folderEffectiveMax === 'current_unit_only'
    ) {
      return article; // No-op: invariant violation.
    }
  }
  article.visibility = visibility;
  article.updatedAt = new Date().toISOString();
  commit();
  return article;
}

/** Update only the article's content body. Status is preserved — content
 *  edits don't change status (per item-8 of the refactor list). Used for
 *  draft articles (never-published); published articles route through
 *  `saveDraft` instead so the live published copy isn't mutated. */
export function setArticleContent(id: string, content: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  if (article.content === content) return article;
  article.content = content;
  article.updatedAt = new Date().toISOString();
  pushActivity(article.id, 'content_updated', {});
  commit();
  return article;
}

/** Persist unpublished changes against a published article. Leaves `content`
 *  (= the live published body) untouched; readers continue to see the
 *  published version until someone hits Publish. */
export function saveDraft(id: string, content: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  // No-op if the draft already matches.
  if (article.draftContent === content) return article;
  // No draft needed if the value matches the published content and there
  // wasn't a draft before.
  if (article.draftContent === null && article.content === content) return article;
  const now = new Date().toISOString();
  article.draftContent = content;
  article.draftUpdatedAt = now;
  article.draftUpdatedBy = currentUser;
  article.updatedAt = now;
  pushActivity(article.id, 'draft_saved', {});
  commit();
  return article;
}

/** Drop the unpublished draft, returning the article to the last published
 *  state. No-op if no draft was pending. */
export function discardDraft(id: string): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  if (article.draftContent === null) return article;
  article.draftContent = null;
  article.draftUpdatedAt = null;
  article.draftUpdatedBy = null;
  article.updatedAt = new Date().toISOString();
  pushActivity(article.id, 'draft_discarded', {});
  commit();
  return article;
}

/** Publish the article. For draft articles this is the initial publish
 *  (v1). For published articles this commits the current draft (or the
 *  passed content) as a new version. The new content snapshot is appended
 *  to `versions[]` and becomes the live `content`. */
export function publishArticle(
  id: string,
  content?: string
): KBArticle | undefined {
  const article = allArticles.find((a) => a.id === id);
  if (!article) return undefined;
  const now = new Date().toISOString();
  const nextBody =
    content !== undefined
      ? content
      : article.draftContent !== null
      ? article.draftContent
      : article.content;
  const prevVersion = article.versions.length;
  const newVersion: ArticleVersion = {
    version: prevVersion + 1,
    content: nextBody,
    publishedAt: now,
    publishedBy: currentUser,
  };
  article.versions.push(newVersion);
  article.content = nextBody;
  article.publishedAt = now;
  article.draftContent = null;
  article.draftUpdatedAt = null;
  article.draftUpdatedBy = null;
  article.updatedAt = now;
  if (article.status !== 'published') {
    article.status = 'published';
  }
  pushActivity(article.id, 'version_published', {
    fromVersion: prevVersion,
    toVersion: newVersion.version,
  });
  commit();
  return article;
}

/** Hard-delete an article. Works regardless of status (draft/published/archived). */
export function deleteArticle(id: string): void {
  const idx = allArticles.findIndex((a) => a.id === id);
  if (idx < 0) return;
  allArticles.splice(idx, 1);
  commit();
}

// ── Reset ──

/** Restore the seed data and clear localStorage. */
export function resetKbState(): void {
  allFolders.length = 0;
  allFolders.push(...JSON.parse(JSON.stringify(defaultFolders)));
  allArticles.length = 0;
  allArticles.push(...JSON.parse(JSON.stringify(defaultArticles)));
  allActivity.length = 0;
  allActivity.push(...JSON.parse(JSON.stringify(defaultActivity)));
  clearKbState();
  notifyFoldersChanged();
}
