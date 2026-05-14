import {
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Table as TableIcon,
} from 'lucide-react';
import type { LexicalEditor } from 'lexical';
import { $getSelection, $isRangeSelection, $createParagraphNode } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $createCodeNode } from '@lexical/code';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { $insertNodeToNearestRoot } from '@lexical/utils';

export interface BlockMenuItem {
  key: string;
  label: string;
  desc: string;
  keywords: string[];
  icon: React.ElementType;
  apply: (editor: LexicalEditor) => void;
}

const setBlockType = (
  editor: LexicalEditor,
  factory: () => ReturnType<typeof $createParagraphNode>
) => {
  editor.update(() => {
    const sel = $getSelection();
    if (!$isRangeSelection(sel)) return;
    $setBlocksType(sel, factory as () => ReturnType<typeof $createParagraphNode>);
  });
};

export const BLOCK_MENU_ITEMS: BlockMenuItem[] = [
  {
    key: 'paragraph',
    label: 'Text',
    desc: 'Plain paragraph',
    keywords: ['text', 'paragraph', 'p'],
    icon: Pilcrow,
    apply: (e) => setBlockType(e, () => $createParagraphNode()),
  },
  {
    key: 'h1',
    label: 'Heading 1',
    desc: 'Big section heading',
    keywords: ['h1', 'heading', 'title'],
    icon: Heading1,
    apply: (e) =>
      setBlockType(e, () =>
        // cast — heading factory is compatible at runtime
        $createHeadingNode('h1') as unknown as ReturnType<typeof $createParagraphNode>
      ),
  },
  {
    key: 'h2',
    label: 'Heading 2',
    desc: 'Medium section heading',
    keywords: ['h2', 'heading', 'subtitle'],
    icon: Heading2,
    apply: (e) =>
      setBlockType(e, () =>
        $createHeadingNode('h2') as unknown as ReturnType<typeof $createParagraphNode>
      ),
  },
  {
    key: 'h3',
    label: 'Heading 3',
    desc: 'Small section heading',
    keywords: ['h3', 'heading'],
    icon: Heading3,
    apply: (e) =>
      setBlockType(e, () =>
        $createHeadingNode('h3') as unknown as ReturnType<typeof $createParagraphNode>
      ),
  },
  {
    key: 'ul',
    label: 'Bullet list',
    desc: 'Unordered list',
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    icon: List,
    apply: (e) => e.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
  },
  {
    key: 'ol',
    label: 'Numbered list',
    desc: 'Ordered list',
    keywords: ['number', 'list', 'ol', 'ordered'],
    icon: ListOrdered,
    apply: (e) => e.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
  },
  {
    key: 'quote',
    label: 'Quote',
    desc: 'Capture a quotation',
    keywords: ['quote', 'blockquote'],
    icon: Quote,
    apply: (e) =>
      setBlockType(e, () =>
        $createQuoteNode() as unknown as ReturnType<typeof $createParagraphNode>
      ),
  },
  {
    key: 'code',
    label: 'Code block',
    desc: 'Monospace block for code',
    keywords: ['code', 'pre', 'mono'],
    icon: Code2,
    apply: (e) =>
      setBlockType(e, () =>
        $createCodeNode() as unknown as ReturnType<typeof $createParagraphNode>
      ),
  },
  {
    key: 'hr',
    label: 'Divider',
    desc: 'Horizontal rule',
    keywords: ['divider', 'hr', 'separator', 'line'],
    icon: Minus,
    apply: (e) =>
      e.update(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;
        $insertNodeToNearestRoot($createHorizontalRuleNode());
      }),
  },
  {
    key: 'table',
    label: 'Table',
    desc: '3 × 3 with header row',
    keywords: ['table', 'grid'],
    icon: TableIcon,
    apply: (e) =>
      e.dispatchCommand(INSERT_TABLE_COMMAND, {
        rows: '3',
        columns: '3',
        includeHeaders: true,
      }),
  },
];

interface BlockMenuListProps {
  items: BlockMenuItem[];
  activeIndex: number;
  onPick: (item: BlockMenuItem) => void;
  onHover?: (index: number) => void;
}

export function BlockMenuList({
  items,
  activeIndex,
  onPick,
  onHover,
}: BlockMenuListProps) {
  if (items.length === 0) {
    return (
      <div className="px-3 py-2 text-[13px] text-[#697a9b] italic">
        No matches
      </div>
    );
  }
  return (
    <>
      {items.map((item, i) => {
        const Icon = item.icon;
        const active = i === activeIndex;
        return (
          <button
            key={item.key}
            type="button"
            onMouseEnter={() => onHover?.(i)}
            onMouseDown={(e) => {
              e.preventDefault();
              onPick(item);
            }}
            className={`flex items-start gap-2.5 w-full px-3 py-1.5 text-left ${
              active ? 'bg-[#ebf5ff]' : 'hover:bg-[#fafbfc]'
            }`}
          >
            <span
              className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 ${
                active
                  ? 'bg-[#dceaf9] text-[#0052a3]'
                  : 'bg-[#fafbfc] text-[#525f7a]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </span>
            <div className="flex flex-col min-w-0">
              <span
                className={`text-[13px] truncate ${
                  active ? 'text-[#0052a3] font-medium' : 'text-[#1f242e]'
                }`}
              >
                {item.label}
              </span>
              <span className="text-[12px] text-[#697a9b] truncate">
                {item.desc}
              </span>
            </div>
          </button>
        );
      })}
    </>
  );
}
