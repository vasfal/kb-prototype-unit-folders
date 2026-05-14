import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import type { Ref } from 'react';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNearestNodeFromDOMNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  type LexicalEditor,
  type TextNode,
} from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import {
  HorizontalRuleNode,
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import { CodeNode, CodeHighlightNode, $createCodeNode } from '@lexical/code';
import {
  TableNode,
  TableCellNode,
  TableRowNode,
  INSERT_TABLE_COMMAND,
  $isTableNode,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
} from '@lexical/table';
import {
  ListNode,
  ListItemNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND, $isLinkNode } from '@lexical/link';
import { $setBlocksType, $patchStyleText } from '@lexical/selection';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { createPortal } from 'react-dom';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AtSign,
  Bold,
  ChevronDown,
  Code2,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  MoreHorizontal,
  Paperclip,
  Plus,
  Quote,
  Redo,
  Rows,
  Smile,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
} from 'lucide-react';
import { ImageNode, $createImageNode } from './ImageNode';
import { FileAttachmentNode, $createFileAttachmentNode } from './FileAttachmentNode';
import { MentionNode, $createMentionNode } from './MentionNode';
import { BLOCK_MENU_ITEMS, BlockMenuList } from './BlockMenu';
import { contacts as allContacts } from '@/data/mock-data';

export interface LexicalArticleEditorApi {
  /** Serialize the current editor state to HTML. */
  getHtml: () => string;
  /** Replace the editor's content with the given HTML. */
  setHtml: (html: string) => void;
}

interface LexicalArticleEditorProps {
  initialHtml: string;
  editable: boolean;
  /** When true, renders the formatting toolbar above the content. */
  showToolbar: boolean;
  /** Tailwind className applied to the toolbar's outer wrapper. Used to make
   *  it stick under a parent sticky header (e.g. `sticky top-[58px] z-10`). */
  toolbarClassName?: string;
}

const editorTheme = {
  paragraph: 'mb-3 last:mb-0',
  heading: {
    h1: 'text-[20px] font-semibold mb-3 mt-4',
    h2: 'text-[16px] font-semibold mt-5 mb-2',
    h3: 'text-[14px] font-semibold mt-4 mb-1.5',
  },
  list: {
    ul: 'list-disc pl-5 mb-3',
    ol: 'list-decimal pl-5 mb-3',
    listitem: 'mb-1',
  },
  link: 'text-[#006bd6] underline',
  quote:
    'border-l-[3px] border-[#d0d5dd] pl-3 my-3 text-[#525f7a] italic',
  code:
    'block bg-[#f5f6f8] border border-[#edeff3] rounded-md px-3 py-2 my-3 font-mono text-[13px] leading-[20px] text-[#1f242e] whitespace-pre-wrap',
  hr: 'my-6 border-0 border-t border-[#e0e4eb]',
  table: 'border-collapse my-3 w-full',
  tableCell:
    'border border-[#e0e4eb] px-2 py-1.5 align-top min-w-[80px] text-[14px]',
  tableCellHeader:
    'border border-[#e0e4eb] px-2 py-1.5 align-top min-w-[80px] text-[14px] bg-[#fafbfc] font-semibold',
  text: {
    bold: 'font-semibold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
};

export const LexicalArticleEditor = forwardRef(function LexicalArticleEditor(
  { initialHtml, editable, showToolbar, toolbarClassName }: LexicalArticleEditorProps,
  ref: Ref<LexicalArticleEditorApi>
) {
  const initialConfig = {
    namespace: 'kb-article',
    theme: editorTheme,
    editable,
    onError: (e: Error) => {
      // Surface in dev but don't crash the modal.
      console.error('[lexical]', e);
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      ListNode,
      ListItemNode,
      LinkNode,
      ImageNode,
      FileAttachmentNode,
      MentionNode,
      HorizontalRuleNode,
      TableNode,
      TableCellNode,
      TableRowNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorMode editable={editable} />
      {showToolbar && (
        <div className={toolbarClassName ?? ''}>
          <Toolbar />
        </div>
      )}
      <DragDropImagePlugin>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="outline-none min-h-[200px] text-[14px] text-[#1f242e] leading-[22px] [&_a]:text-[#006bd6] [&_a]:underline" />
          }
          placeholder={
            <div className="pointer-events-none -mt-[200px] text-[14px] text-[#697a9b] leading-[22px]">
              Start writing your article...
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </DragDropImagePlugin>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <TablePlugin />
      <TableActionsPlugin />
      <MentionsPlugin />
      <SlashCommandsPlugin />
      <BlockHoverPlugin />
      <HrHoverPlugin />
      <InitialHtmlPlugin html={initialHtml} />
      <ApiPlugin apiRef={ref} />
    </LexicalComposer>
  );
});

// ── Plugins ──────────────────────────────────────────────────────────────

/** Wraps the ContentEditable so we can attach native drag/drop handlers for
 *  inserting images via file drop. Lexical's own DROP_COMMAND would also work,
 *  but the wrapper gives us a place to add visual feedback later. */
function DragDropImagePlugin({ children }: { children: React.ReactNode }) {
  const [editor] = useLexicalComposerContext();
  const [isDragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (!editor.isEditable()) return;
    if (!Array.from(e.dataTransfer.items).some((i) => i.kind === 'file')) return;
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = async (e: React.DragEvent) => {
    if (!editor.isEditable()) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    e.preventDefault();
    setDragOver(false);
    for (const file of files) {
      await insertAnyFileIntoEditor(editor, file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative transition-shadow ${
        isDragOver
          ? 'ring-2 ring-[#006bd6] ring-offset-2 rounded-md'
          : ''
      }`}
    >
      {children}
      {isDragOver && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#ebf5ff]/40 rounded-md">
          <span className="px-3 py-1.5 text-[13px] font-medium text-[#0052a3] bg-white border border-[#b3d4f0] rounded-md shadow-sm">
            Drop files to attach
          </span>
        </div>
      )}
    </div>
  );
}

function EditorMode({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

/** Loads the initial HTML once at mount. Subsequent prop changes are ignored
 *  to avoid stomping on the user's in-flight edits; parents that need to
 *  replace content (e.g. on Cancel) call `api.setHtml`. */
function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      if (html) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        // generateNodesFromDOM may return leaf-level nodes (text) which must
        // be wrapped in a block before insertion.
        const blocks = nodes.map((n) => {
          // If the node is already a block (paragraph/heading/list etc.) leave
          // it. Otherwise wrap in a paragraph.
          const maybeInline = n as { isInline?: () => boolean };
          if (typeof maybeInline.isInline !== 'function' || maybeInline.isInline()) {
            const p = $createParagraphNode();
            p.append(n);
            return p;
          }
          return n;
        });
        root.append(...blocks);
      } else {
        root.append($createParagraphNode());
      }
    });
    // Only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function ApiPlugin({ apiRef }: { apiRef: Ref<LexicalArticleEditorApi> }) {
  const [editor] = useLexicalComposerContext();
  useImperativeHandle(
    apiRef,
    () => ({
      getHtml: () => {
        let html = '';
        editor.getEditorState().read(() => {
          html = $generateHtmlFromNodes(editor, null);
        });
        return html;
      },
      setHtml: (html: string) => {
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          if (html) {
            const parser = new DOMParser();
            const dom = parser.parseFromString(html, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const blocks = nodes.map((n) => {
              const maybeInline = n as { isInline?: () => boolean };
              if (typeof maybeInline.isInline !== 'function' || maybeInline.isInline()) {
                const p = $createParagraphNode();
                p.append(n);
                return p;
              }
              return n;
            });
            root.append(...blocks);
          } else {
            root.append($createParagraphNode());
          }
        });
      },
    }),
    [editor]
  );
  return null;
}

// ── Image insertion helpers ───────────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function insertImageIntoEditor(editor: LexicalEditor, url: string): void {
  editor.update(() => {
    const sel = $getSelection();
    const node = $createImageNode(url);
    if ($isRangeSelection(sel)) {
      sel.insertNodes([node]);
    } else {
      const root = $getRoot();
      const p = $createParagraphNode();
      p.append(node);
      root.append(p);
    }
  });
}

function insertFileIntoEditor(
  editor: LexicalEditor,
  url: string,
  file: { name: string; size: number; type: string }
): void {
  editor.update(() => {
    const sel = $getSelection();
    const node = $createFileAttachmentNode(url, file.name, file.size, file.type);
    if ($isRangeSelection(sel)) {
      sel.insertNodes([node]);
    } else {
      const root = $getRoot();
      const p = $createParagraphNode();
      p.append(node);
      root.append(p);
    }
  });
}

/** Route a single dropped/picked file to the right insertion helper. */
async function insertAnyFileIntoEditor(
  editor: LexicalEditor,
  file: File
): Promise<void> {
  const dataUrl = await readFileAsDataUrl(file);
  if (file.type.startsWith('image/')) {
    insertImageIntoEditor(editor, dataUrl);
  } else {
    insertFileIntoEditor(editor, dataUrl, {
      name: file.name,
      size: file.size,
      type: file.type,
    });
  }
}

// ── Mentions plugin ──────────────────────────────────────────────────────

class MentionTypeaheadOption extends MenuOption {
  contactId: string;
  name: string;
  role?: string;
  constructor(contactId: string, name: string, role?: string) {
    super(name);
    this.contactId = contactId;
    this.name = name;
    this.role = role;
  }
}

function MentionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForMentionMatch = useBasicTypeaheadTriggerMatch('@', {
    minLength: 0,
  });

  const options = (() => {
    const q = (queryString ?? '').toLowerCase();
    return Object.values(allContacts)
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .slice(0, 8)
      .map((c) => new MentionTypeaheadOption(c.id, c.name, c.role));
  })();

  const onSelectOption = useCallback(
    (
      selectedOption: MentionTypeaheadOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const mentionNode = $createMentionNode(selectedOption.name);
        nodeToReplace?.replace(mentionNode);
        mentionNode.select();
      });
      closeMenu();
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<MentionTypeaheadOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForMentionMatch}
      options={options}
      menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
        if (!anchorElementRef.current || options.length === 0) return null;
        return createPortal(
          <div className="absolute z-[60] bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[220px] max-h-[260px] overflow-y-auto">
            {options.map((opt, i) => {
              const active = i === selectedIndex;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(i)}
                  onClick={() => selectOptionAndCleanUp(opt)}
                  className={`flex flex-col items-start w-full px-3 py-1.5 text-left text-[13px] ${
                    active
                      ? 'bg-[#ebf5ff] text-[#0052a3]'
                      : 'text-[#1f242e] hover:bg-[#fafbfc]'
                  }`}
                >
                  <span className="truncate w-full">{opt.name}</span>
                  {opt.role && (
                    <span className="text-[11px] text-[#697a9b] truncate w-full">
                      {opt.role}
                    </span>
                  )}
                </button>
              );
            })}
          </div>,
          anchorElementRef.current
        );
      }}
    />
  );
}

// ── Table actions ────────────────────────────────────────────────────────

type NodeLike = { getParent: () => NodeLike | null; getKey?: () => string; remove?: () => void };

/** Walks up from the given node to find the enclosing TableNode. Returns
 *  null when the selection isn't inside a table. */
function findEnclosingTable(node: unknown): { tableNode: NodeLike | null } {
  let n = node as NodeLike | null;
  while (n) {
    if ($isTableNode(n as unknown as never)) return { tableNode: n };
    n = n.getParent();
  }
  return { tableNode: null };
}

type PreviewMode =
  | 'insert-row-above'
  | 'insert-row-below'
  | 'insert-col-left'
  | 'insert-col-right'
  | 'delete-row'
  | 'delete-col'
  | 'delete-table';

/** Find the DOM cell sibling that should be highlighted for a given action.
 *  For row ops returns all cells in the active row; for col ops returns the
 *  whole column; for delete-table the entire table's cells. */
function previewCells(
  table: HTMLTableElement,
  activeCell: HTMLTableCellElement,
  mode: PreviewMode
): HTMLElement[] {
  if (mode === 'delete-table') {
    return Array.from(table.querySelectorAll('th, td')) as HTMLElement[];
  }
  const row = activeCell.closest('tr');
  if (!row) return [];
  if (mode === 'insert-row-above' || mode === 'insert-row-below' || mode === 'delete-row') {
    return Array.from(row.querySelectorAll('th, td')) as HTMLElement[];
  }
  // Column ops: same column position across every row.
  const colIndex = Array.from(row.children).indexOf(activeCell);
  if (colIndex < 0) return [];
  const cells: HTMLElement[] = [];
  table.querySelectorAll('tr').forEach((r) => {
    const c = r.children[colIndex] as HTMLElement | undefined;
    if (c) cells.push(c);
  });
  return cells;
}

/** Side of the cells where the insert marker should appear (a thick blue
 *  border on that edge). Empty string for delete previews. */
function previewEdge(mode: PreviewMode): 'top' | 'bottom' | 'left' | 'right' | '' {
  switch (mode) {
    case 'insert-row-above':
      return 'top';
    case 'insert-row-below':
      return 'bottom';
    case 'insert-col-left':
      return 'left';
    case 'insert-col-right':
      return 'right';
    default:
      return '';
  }
}

function TableActionsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [activeTableKey, setActiveTableKey] = useState<string | null>(null);
  const [activeCellEl, setActiveCellEl] = useState<HTMLTableCellElement | null>(
    null
  );
  const [activeTableEl, setActiveTableEl] = useState<HTMLTableElement | null>(
    null
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previewedRef = useRef<HTMLElement[]>([]);

  const clearPreview = useCallback(() => {
    for (const el of previewedRef.current) {
      el.style.backgroundColor = '';
      el.style.boxShadow = '';
    }
    previewedRef.current = [];
  }, []);

  const showPreview = useCallback(
    (mode: PreviewMode) => {
      clearPreview();
      const table = activeTableEl;
      const cell = activeCellEl;
      if (!table || !cell) return;
      const cells = previewCells(table, cell, mode);
      const isDelete = mode.startsWith('delete');
      const bg = isDelete ? 'rgba(220, 38, 38, 0.08)' : 'rgba(0, 107, 214, 0.10)';
      const edgeColor = isDelete ? '#dc2626' : '#006bd6';
      const edge = previewEdge(mode);
      for (const el of cells) {
        el.style.backgroundColor = bg;
        if (edge) {
          // Inset box-shadow on the relevant side acts as a thick border
          // without shifting layout.
          const shadows = {
            top: `inset 0 3px 0 0 ${edgeColor}`,
            bottom: `inset 0 -3px 0 0 ${edgeColor}`,
            left: `inset 3px 0 0 0 ${edgeColor}`,
            right: `inset -3px 0 0 0 ${edgeColor}`,
          } as const;
          el.style.boxShadow = shadows[edge];
        }
        previewedRef.current.push(el);
      }
    },
    [activeCellEl, activeTableEl, clearPreview]
  );

  // Track the selection and resolve the active table + cell DOM elements.
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) {
          setActiveTableKey(null);
          setActiveCellEl(null);
          setActiveTableEl(null);
          return;
        }
        const { tableNode } = findEnclosingTable(sel.anchor.getNode());
        if (!tableNode) {
          setActiveTableKey(null);
          setActiveCellEl(null);
          setActiveTableEl(null);
          return;
        }
        const key = tableNode.getKey?.() ?? null;
        setActiveTableKey(key);
        const tableEl = key
          ? (editor.getElementByKey(key) as HTMLTableElement | null)
          : null;
        setActiveTableEl(tableEl);
        // Walk up the DOM from the current selection's anchor element to the
        // nearest TH/TD inside this table.
        const domSel = window.getSelection();
        const anchorNode = domSel?.anchorNode as Node | null;
        if (anchorNode && tableEl) {
          let el: HTMLElement | null =
            anchorNode.nodeType === 1
              ? (anchorNode as HTMLElement)
              : anchorNode.parentElement;
          while (el && el !== tableEl) {
            if (el.tagName === 'TD' || el.tagName === 'TH') {
              setActiveCellEl(el as HTMLTableCellElement);
              break;
            }
            el = el.parentElement;
          }
        }
      });
    });
  }, [editor]);

  // Clear preview when menu closes or table loses focus.
  useEffect(() => {
    if (!menuOpen) clearPreview();
  }, [menuOpen, clearPreview]);
  useEffect(() => clearPreview, [clearPreview]);

  // Position the floating button at the table's top-right corner.
  useEffect(() => {
    if (!activeTableKey) {
      setPos(null);
      return;
    }
    const compute = () => {
      const el = editor.getElementByKey(activeTableKey);
      if (!el) {
        setPos(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setPos({ top: rect.top - 8, left: rect.right - 8 });
    };
    compute();
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [editor, activeTableKey]);

  // Close menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  const run = (fn: () => void) => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      fn();
    });
    setMenuOpen(false);
  };

  const insertRowAbove = () => run(() => $insertTableRow__EXPERIMENTAL(false));
  const insertRowBelow = () => run(() => $insertTableRow__EXPERIMENTAL(true));
  const insertColLeft = () => run(() => $insertTableColumn__EXPERIMENTAL(false));
  const insertColRight = () => run(() => $insertTableColumn__EXPERIMENTAL(true));
  const deleteRow = () => run(() => $deleteTableRow__EXPERIMENTAL());
  const deleteCol = () => run(() => $deleteTableColumn__EXPERIMENTAL());
  const deleteTable = () => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      const { tableNode } = findEnclosingTable(sel.anchor.getNode());
      tableNode?.remove?.();
    });
    setMenuOpen(false);
  };

  if (!pos || !activeTableKey) return null;

  return createPortal(
    <div
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 60 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onClick={() => setMenuOpen((p) => !p)}
        className="flex items-center justify-center w-6 h-6 bg-white border border-[#e0e4eb] rounded-md shadow-[0px_1px_3px_rgba(31,36,46,0.08)] hover:bg-[#fafbfc]"
        title="Table actions"
      >
        <MoreHorizontal className="w-3.5 h-3.5 text-[#525f7a]" />
      </button>
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[200px] z-[70]"
          onMouseLeave={clearPreview}
        >
          <TableMenuItem
            icon={Rows}
            label="Insert row above"
            onClick={insertRowAbove}
            onHover={() => showPreview('insert-row-above')}
          />
          <TableMenuItem
            icon={Rows}
            label="Insert row below"
            onClick={insertRowBelow}
            onHover={() => showPreview('insert-row-below')}
          />
          <TableMenuItem
            icon={Columns}
            label="Insert column left"
            onClick={insertColLeft}
            onHover={() => showPreview('insert-col-left')}
          />
          <TableMenuItem
            icon={Columns}
            label="Insert column right"
            onClick={insertColRight}
            onHover={() => showPreview('insert-col-right')}
          />
          <div className="my-1 border-t border-[#edeff3]" />
          <TableMenuItem
            icon={Trash2}
            label="Delete row"
            onClick={deleteRow}
            onHover={() => showPreview('delete-row')}
            danger
          />
          <TableMenuItem
            icon={Trash2}
            label="Delete column"
            onClick={deleteCol}
            onHover={() => showPreview('delete-col')}
            danger
          />
          <TableMenuItem
            icon={Trash2}
            label="Delete table"
            onClick={deleteTable}
            onHover={() => showPreview('delete-table')}
            danger
          />
        </div>
      )}
    </div>,
    document.body
  );
}

function TableMenuItem({
  icon: Icon,
  label,
  onClick,
  onHover,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  onHover?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left ${
        danger
          ? 'text-red-600 hover:bg-[#fafbfc]'
          : 'text-[#1f242e] hover:bg-[#fafbfc]'
      }`}
    >
      <Icon className={`w-3.5 h-3.5 ${danger ? 'text-red-600' : 'text-[#697a9b]'}`} />
      {label}
    </button>
  );
}

// ── Block menus: slash command + hover plus ───────────────────────────────

class SlashOption extends MenuOption {
  item: import('./BlockMenu').BlockMenuItem;
  constructor(item: import('./BlockMenu').BlockMenuItem) {
    super(item.key);
    this.item = item;
  }
}

function SlashCommandsPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch('/', {
    minLength: 0,
  });

  const options = (() => {
    const q = (queryString ?? '').toLowerCase();
    const matched = !q
      ? BLOCK_MENU_ITEMS
      : BLOCK_MENU_ITEMS.filter(
          (it) =>
            it.label.toLowerCase().includes(q) ||
            it.keywords.some((k) => k.includes(q))
        );
    return matched.map((it) => new SlashOption(it));
  })();

  const onSelectOption = useCallback(
    (
      option: SlashOption,
      nodeToReplace: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        if (nodeToReplace) {
          const text = nodeToReplace.getTextContent();
          const slashIdx = text.lastIndexOf('/');
          if (slashIdx === 0) {
            nodeToReplace.remove();
          } else if (slashIdx > 0) {
            nodeToReplace.setTextContent(text.slice(0, slashIdx));
          }
        }
      });
      option.item.apply(editor);
      closeMenu();
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin<SlashOption>
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        if (!anchorElementRef.current || options.length === 0) return null;
        return createPortal(
          <div className="absolute z-[60] bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[260px] max-h-[320px] overflow-y-auto">
            <BlockMenuList
              items={options.map((o) => o.item)}
              activeIndex={selectedIndex ?? 0}
              onPick={(item) => {
                const opt = options.find((o) => o.item.key === item.key);
                if (opt) selectOptionAndCleanUp(opt);
              }}
              onHover={(i) => setHighlightedIndex(i)}
            />
          </div>,
          anchorElementRef.current
        );
      }}
    />
  );
}

function BlockHoverPlugin() {
  const [editor] = useLexicalComposerContext();
  const blockRef = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuActiveIndex, setMenuActiveIndex] = useState(0);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  // 'after' (Click) is default — Option/Alt-click flips to 'before'.
  const insertModeRef = useRef<'before' | 'after'>('after');
  const menuRef = useRef<HTMLDivElement>(null);

  // Document-level mousemove with an extended hover zone covers the gap
  // between the editor's left edge and the "+" button (which sits ~28px
  // outside). The button is vertically centered on the hovered block so it
  // sits *beside* the content; clicking inserts below by default,
  // Option-click inserts above (Notion-style).
  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleMove = (e: MouseEvent) => {
      if (menuOpen) return;
      const rootRect = root.getBoundingClientRect();
      const inZone =
        e.clientX >= rootRect.left - 40 &&
        e.clientX <= rootRect.right &&
        e.clientY >= rootRect.top &&
        e.clientY <= rootRect.bottom;
      if (!inZone) {
        setPos(null);
        blockRef.current = null;
        return;
      }
      const blocks = Array.from(root.children) as HTMLElement[];
      const block = blocks.find((b) => {
        const r = b.getBoundingClientRect();
        return e.clientY >= r.top && e.clientY <= r.bottom;
      });
      if (!block) return; // keep last known position to avoid flicker in gaps
      const r = block.getBoundingClientRect();
      blockRef.current = block;
      setPos({
        // Vertically centered on the block.
        top: r.top + r.height / 2 - 12,
        left: rootRect.left - 28,
      });
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, [editor, menuOpen]);

  // Close menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [menuOpen]);

  /** Pick handler for the "+" menu. The click that opens the menu does NOT
   *  touch the document. Only when the user actually selects a block type do
   *  we create a new empty paragraph at the targeted position and let the
   *  block-menu item transform it. If the user dismisses the menu, nothing
   *  is left behind. The insertion side (before vs. after the hovered block)
   *  is taken from insertModeRef, set at click time. */
  const handlePick = (item: import('./BlockMenu').BlockMenuItem) => {
    setMenuOpen(false);
    const block = blockRef.current;
    if (!block) return;
    const mode = insertModeRef.current;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(block);
      if (!node) return;
      const root = $getRoot();
      let target: unknown = node;
      while (
        (target as { getParent: () => unknown }).getParent &&
        (target as { getParent: () => unknown }).getParent() !== root &&
        (target as { getParent: () => unknown }).getParent() !== null
      ) {
        target = (target as { getParent: () => unknown }).getParent();
      }
      const newPara = $createParagraphNode();
      if (mode === 'after') {
        (target as { insertAfter: (n: unknown) => void }).insertAfter(newPara);
      } else {
        (target as { insertBefore: (n: unknown) => void }).insertBefore(newPara);
      }
      newPara.select();
    });
    // Apply the chosen block transformation in a follow-up update — React
    // batches both into the same render so the user sees a single change.
    item.apply(editor);
  };

  if (!pos || !editor.isEditable()) return null;

  return createPortal(
    <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}>
      <button
        type="button"
        // Keep editor focus by preventing the default mousedown side-effects,
        // then toggle on click. Click is fired after mousedown/mouseup, so
        // by then the close-menu document listener (registered by the
        // open-state effect) is in sync with the latest state.
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          insertModeRef.current = e.altKey ? 'before' : 'after';
          setTooltipOpen(false);
          setMenuOpen((p) => {
            if (!p) setMenuActiveIndex(0);
            return !p;
          });
        }}
        onMouseEnter={() => {
          if (!menuOpen) setTooltipOpen(true);
        }}
        onMouseLeave={() => setTooltipOpen(false)}
        className="flex items-center justify-center w-6 h-6 rounded-md text-[#697a9b] hover:bg-[#edeff3] hover:text-[#1f242e] transition-opacity opacity-60 hover:opacity-100"
      >
        <Plus className="w-4 h-4" />
      </button>
      {tooltipOpen && !menuOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-[65] pointer-events-none px-2.5 py-2 bg-[#1f242e] text-white rounded-md shadow-[0px_4px_12px_rgba(31,36,46,0.2)] whitespace-nowrap">
          <div className="text-[12px] leading-[16px]">
            <span className="font-medium">Click</span>
            <span className="text-[#a8b1c2]"> to add below</span>
          </div>
          <div className="text-[12px] leading-[16px] mt-0.5">
            <span className="font-medium">Option-click</span>
            <span className="text-[#a8b1c2]"> to add above</span>
          </div>
        </div>
      )}
      {menuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-1 z-[70] bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[260px] max-h-[320px] overflow-y-auto"
        >
          <BlockMenuList
            items={BLOCK_MENU_ITEMS}
            activeIndex={menuActiveIndex}
            onHover={setMenuActiveIndex}
            onPick={handlePick}
          />
        </div>
      )}
    </div>,
    document.body
  );
}

const HR_HIT_TOLERANCE_PX = 12;

function HrHoverPlugin() {
  const [editor] = useLexicalComposerContext();
  const [pos, setPos] = useState<
    { top: number; left: number; hrEl: HTMLElement } | null
  >(null);

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;

    const handleMove = (e: MouseEvent) => {
      // Keep showing while hovering the delete button itself.
      const onBtn = (e.target as HTMLElement | null)?.closest(
        '[data-kb-hr-delete]'
      );
      if (onBtn) return;

      // Vertical proximity hit-test — the HR itself is only ~1px tall,
      // so direct DOM hit is fragile. Treat any HR whose center is within
      // HR_HIT_TOLERANCE_PX of the mouse Y (and horizontally inside its
      // rect) as hovered.
      const hrs = Array.from(root.querySelectorAll('hr')) as HTMLElement[];
      const hr = hrs.find((h) => {
        const r = h.getBoundingClientRect();
        const cy = r.top + r.height / 2;
        return (
          Math.abs(e.clientY - cy) <= HR_HIT_TOLERANCE_PX &&
          e.clientX >= r.left &&
          e.clientX <= r.right
        );
      });
      if (hr) {
        const r = hr.getBoundingClientRect();
        setPos({
          top: r.top + r.height / 2 - 12,
          left: r.right - 24,
          hrEl: hr,
        });
        return;
      }
      setPos(null);
    };

    document.addEventListener('mousemove', handleMove);
    return () => document.removeEventListener('mousemove', handleMove);
  }, [editor]);

  const handleDelete = () => {
    const hrEl = pos?.hrEl;
    if (!hrEl) return;
    editor.update(() => {
      const node = $getNearestNodeFromDOMNode(hrEl);
      let n: { remove: () => void; getParent: () => unknown } | null =
        node as unknown as typeof n;
      while (n) {
        if ($isHorizontalRuleNode(n as unknown as never)) {
          n.remove();
          break;
        }
        n = (n as unknown as { getParent: () => typeof n }).getParent();
      }
    });
    setPos(null);
  };

  if (!pos || !editor.isEditable()) return null;
  return createPortal(
    <button
      type="button"
      data-kb-hr-delete
      onClick={handleDelete}
      onMouseDown={(e) => e.preventDefault()}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 50 }}
      className="flex items-center justify-center w-6 h-6 bg-white border border-[#e0e4eb] rounded-md shadow-[0px_1px_3px_rgba(31,36,46,0.08)] text-red-600 hover:bg-[#fef2f2]"
      title="Delete divider"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>,
    document.body
  );
}

// ── Toolbar ──────────────────────────────────────────────────────────────

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    link: false,
    block: 'paragraph' as BlockType,
    align: 'left' as 'left' | 'center' | 'right',
  });
  /** Last-applied colors. Used to show indicator bars under the toolbar
   *  buttons (the "A" / highlighter mini swatches). */
  const [recentTextColor, setRecentTextColor] = useState<string>('#1f242e');
  const [recentBgColor, setRecentBgColor] = useState<string>('#fef08a');

  // Subscribe to selection changes to update active states.
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection();
        if (!$isRangeSelection(sel)) return;
        let isLink = false;
        const node = sel.anchor.getNode();
        let n: ReturnType<typeof sel.anchor.getNode> | null = node;
        let align: 'left' | 'center' | 'right' = 'left';
        while (n) {
          if ($isLinkNode(n)) {
            isLink = true;
          }
          // ElementNodes carry the format. Walk up to the closest one.
          const maybeAlign = (n as unknown as { getFormatType?: () => string }).getFormatType;
          if (!align || align === 'left') {
            if (typeof maybeAlign === 'function') {
              const t = maybeAlign.call(n);
              if (t === 'center' || t === 'right') {
                align = t;
              }
            }
          }
          n = n.getParent();
        }
        setFormats({
          bold: sel.hasFormat('bold'),
          italic: sel.hasFormat('italic'),
          underline: sel.hasFormat('underline'),
          strikethrough: sel.hasFormat('strikethrough'),
          link: isLink,
          block: detectBlockType(sel),
          align,
        });
      });
    });
  }, [editor]);

  const apply = useCallback(
    (fn: () => void) => {
      editor.focus();
      fn();
    },
    [editor]
  );

  const setHeading = (level: 1 | 2 | 3) => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      $setBlocksType(sel, () => $createHeadingNode(`h${level}`));
    });
  };

  const setParagraph = () => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      $setBlocksType(sel, () => $createParagraphNode());
    });
  };

  const toggleHeading = (level: 1 | 2 | 3) => {
    if (formats.block === `h${level}`) setParagraph();
    else setHeading(level);
  };

  const toggleBulletList = () => {
    if (formats.block === 'ul') {
      setParagraph();
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const toggleOrderedList = () => {
    if (formats.block === 'ol') {
      setParagraph();
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const toggleQuote = () => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      if (formats.block === 'quote') {
        $setBlocksType(sel, () => $createParagraphNode());
      } else {
        $setBlocksType(sel, () => $createQuoteNode());
      }
    });
  };

  const toggleCodeBlock = () => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      if (formats.block === 'code') {
        $setBlocksType(sel, () => $createParagraphNode());
      } else {
        $setBlocksType(sel, () => $createCodeNode());
      }
    });
  };

  const insertHorizontalRule = () => {
    editor.update(() => {
      const sel = $getSelection();
      if (!$isRangeSelection(sel)) return;
      const hr = $createHorizontalRuleNode();
      $insertNodeToNearestRoot(hr);
    });
  };

  // Strike & underline are mutually exclusive — turning one on flips the
  // other off so text never carries both decorations at once.
  const toggleUnderline = () => {
    apply(() => {
      if (!formats.underline && formats.strikethrough) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      }
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    });
  };

  const toggleStrikethrough = () => {
    apply(() => {
      if (!formats.strikethrough && formats.underline) {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      }
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
    });
  };

  const toggleLink = () => {
    if (formats.link) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      return;
    }
    const url = window.prompt('URL');
    if (!url) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emojiOpen) return;
    const h = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [emojiOpen]);

  const insertEmoji = (emoji: string) => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        sel.insertText(emoji);
      }
    });
    setEmojiOpen(false);
  };

  /** Programmatically insert "@" at the cursor; the typeahead plugin handles
   *  the rest, opening the mention menu. */
  const triggerMention = () => {
    editor.focus();
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) sel.insertText('@');
    });
  };
  const openImagePicker = () => imageInputRef.current?.click();
  const openFilePicker = () => fileInputRef.current?.click();
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const dataUrl = await readFileAsDataUrl(f);
      insertImageIntoEditor(editor, dataUrl);
    }
    // Reset so picking the same file twice fires `change` again.
    e.target.value = '';
  };
  const handleAnyFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    for (const f of files) {
      await insertAnyFileIntoEditor(editor, f);
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-[#edeff3] bg-white shrink-0 flex-wrap">
      <Btn onClick={() => apply(() => editor.dispatchCommand(UNDO_COMMAND, undefined))} title="Undo">
        <Undo className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => apply(() => editor.dispatchCommand(REDO_COMMAND, undefined))} title="Redo">
        <Redo className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn active={formats.block === 'h1'} onClick={() => toggleHeading(1)} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </Btn>
      <Btn active={formats.block === 'h2'} onClick={() => toggleHeading(2)} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </Btn>
      <Btn active={formats.block === 'h3'} onClick={() => toggleHeading(3)} title="Heading 3">
        <Heading3 className="w-4 h-4" />
      </Btn>

      <Divider />

      <Btn
        active={formats.bold}
        onClick={() => apply(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'))}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Btn>
      <Btn
        active={formats.italic}
        onClick={() => apply(() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'))}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Btn>
      <Btn
        active={formats.underline}
        onClick={toggleUnderline}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </Btn>
      <Btn
        active={formats.strikethrough}
        onClick={toggleStrikethrough}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </Btn>

      <TextColorButton
        currentColor={recentTextColor}
        onPick={(color) => {
          setRecentTextColor(color);
          editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
              $patchStyleText(sel, { color });
            }
          });
        }}
      />
      <HighlightColorButton
        currentColor={recentBgColor}
        onPick={(color) => {
          setRecentBgColor(color);
          editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
              $patchStyleText(sel, { 'background-color': color });
            }
          });
        }}
      />

      <Divider />

      <Btn active={formats.block === 'ul'} onClick={toggleBulletList} title="Bullet list">
        <List className="w-4 h-4" />
      </Btn>
      <Btn active={formats.block === 'ol'} onClick={toggleOrderedList} title="Numbered list">
        <ListOrdered className="w-4 h-4" />
      </Btn>

      <AlignButton
        currentAlign={formats.align}
        onPick={(align) => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, align)}
      />

      <Divider />

      <Btn active={formats.block === 'quote'} onClick={toggleQuote} title="Blockquote">
        <Quote className="w-4 h-4" />
      </Btn>
      <Btn active={formats.block === 'code'} onClick={toggleCodeBlock} title="Code block">
        <Code2 className="w-4 h-4" />
      </Btn>
      <Btn onClick={insertHorizontalRule} title="Horizontal divider">
        <Minus className="w-4 h-4" />
      </Btn>
      <TableSizeButton
        onPick={(rows, columns) =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: String(rows),
            columns: String(columns),
            includeHeaders: true,
          })
        }
      />

      <Divider />

      <Btn active={formats.link} onClick={toggleLink} title="Link">
        <LinkIcon className="w-4 h-4" />
      </Btn>
      <Btn onClick={openImagePicker} title="Insert image (or drag onto the editor)">
        <ImageIcon className="w-4 h-4" />
      </Btn>
      <Btn onClick={openFilePicker} title="Attach file (or drag onto the editor)">
        <Paperclip className="w-4 h-4" />
      </Btn>

      <Divider />

      <div className="relative" ref={emojiRef}>
        <Btn
          onClick={() => setEmojiOpen((p) => !p)}
          active={emojiOpen}
          title="Insert emoji"
        >
          <Smile className="w-4 h-4" />
        </Btn>
        {emojiOpen && <EmojiGrid onPick={insertEmoji} />}
      </div>
      <Btn onClick={triggerMention} title="Mention someone (or type @)">
        <AtSign className="w-4 h-4" />
      </Btn>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageFile}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleAnyFile}
      />
    </div>
  );
}

// ── Emoji grid ────────────────────────────────────────────────────────────

const EMOJIS = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😍','🥰','😘','😜','🤔',
  '😎','😴','🥱','🤯','🥺','😢','😭','😡','🤬','🤝','👍','👎','👌','👏','🙏','💪',
  '👀','🙌','🤘','✌️','🚀','⭐','🔥','✨','💡','💯','⚡','✅','❌','❓','❗','⚠️',
  '📝','📋','📅','📊','📈','📌','📎','💬','📁','📂','🎯','🎉','🎊','☕','🍕','🌟',
];

function EmojiGrid({ onPick }: { onPick: (e: string) => void }) {
  return (
    <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] p-2 w-[280px]">
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onPick(e)}
            className="flex items-center justify-center w-7 h-7 text-[16px] rounded hover:bg-[#fafbfc]"
            title={e}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function Btn({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Tooltip label={title}>
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
          active ? 'bg-[#edeff3] text-[#1f242e]' : 'text-[#525f7a] hover:bg-[#fafbfc]'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-[#edeff3] mx-0.5" />;
}

// ── Tooltip ──────────────────────────────────────────────────────────────

function Tooltip({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  if (!label) return <>{children}</>;

  const onEnter = () => {
    timer.current = window.setTimeout(() => setShow(true), 400);
  };
  const onLeave = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {show && (
        <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-[70] px-2 py-1 bg-[#1f242e] text-white text-[11px] font-medium rounded whitespace-nowrap pointer-events-none shadow-md">
          {label}
        </span>
      )}
    </span>
  );
}

// ── Align dropdown ───────────────────────────────────────────────────────

const ALIGN_OPTIONS: { value: 'left' | 'center' | 'right'; label: string; Icon: typeof AlignLeft }[] = [
  { value: 'left', label: 'Align left', Icon: AlignLeft },
  { value: 'center', label: 'Align center', Icon: AlignCenter },
  { value: 'right', label: 'Align right', Icon: AlignRight },
];

function AlignButton({
  currentAlign,
  onPick,
}: {
  currentAlign: 'left' | 'center' | 'right';
  onPick: (a: 'left' | 'center' | 'right') => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const CurrentIcon =
    ALIGN_OPTIONS.find((o) => o.value === currentAlign)?.Icon ?? AlignLeft;

  return (
    <div className="relative inline-flex" ref={ref}>
      <Tooltip label="Text alignment">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((p) => !p);
          }}
          className={`flex items-center gap-0.5 h-7 px-1 rounded-md transition-colors ${
            open ? 'bg-[#edeff3] text-[#1f242e]' : 'text-[#525f7a] hover:bg-[#fafbfc]'
          }`}
        >
          <CurrentIcon className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] p-1 flex items-center gap-0.5">
          {ALIGN_OPTIONS.map((opt) => {
            const Icon = opt.Icon;
            const active = currentAlign === opt.value;
            return (
              <Tooltip key={opt.value} label={opt.label}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onPick(opt.value);
                    setOpen(false);
                  }}
                  className={`flex items-center justify-center w-7 h-7 rounded-md ${
                    active
                      ? 'bg-[#ebf5ff] text-[#006bd6]'
                      : 'text-[#525f7a] hover:bg-[#fafbfc]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Table size picker ─────────────────────────────────────────────────────

const TABLE_PICKER_MAX = 6;

function TableSizeButton({
  onPick,
}: {
  onPick: (rows: number, columns: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative inline-flex" ref={ref}>
      <Tooltip label="Insert table">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((p) => !p);
            setHover({ r: 0, c: 0 });
          }}
          className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
            open ? 'bg-[#edeff3] text-[#1f242e]' : 'text-[#525f7a] hover:bg-[#fafbfc]'
          }`}
        >
          <TableIcon className="w-4 h-4" />
        </button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] p-2">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${TABLE_PICKER_MAX}, 16px)`,
              gridTemplateRows: `repeat(${TABLE_PICKER_MAX}, 16px)`,
            }}
            onMouseLeave={() => setHover({ r: 0, c: 0 })}
          >
            {Array.from({ length: TABLE_PICKER_MAX * TABLE_PICKER_MAX }).map(
              (_, i) => {
                const r = Math.floor(i / TABLE_PICKER_MAX) + 1;
                const c = (i % TABLE_PICKER_MAX) + 1;
                const active = r <= hover.r && c <= hover.c;
                return (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHover({ r, c })}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPick(r, c);
                      setOpen(false);
                    }}
                    className={`w-4 h-4 rounded-sm border ${
                      active
                        ? 'bg-[#006bd6] border-[#0052a3]'
                        : 'bg-white border-[#e0e4eb] hover:border-[#a8b1c2]'
                    }`}
                  />
                );
              }
            )}
          </div>
          <div className="text-[12px] text-[#525f7a] mt-1.5 text-center">
            {hover.r > 0 ? `${hover.r} × ${hover.c}` : 'Pick size'}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Color & highlight pickers ────────────────────────────────────────────

const TEXT_COLORS = [
  '#1f242e', '#525f7a', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#006bd6', '#8b5cf6', '#ec4899',
];

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fecaca',
  '#fde68a', '#e9d5ff', '#ccfbf1', '#fed7aa', '#e5e7eb',
];

function TextColorButton({
  currentColor,
  onPick,
}: {
  currentColor: string;
  onPick: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative inline-flex" ref={ref}>
      <Tooltip label="Text color">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((p) => !p);
          }}
          className={`flex flex-col items-center justify-center w-7 h-7 rounded-md transition-colors ${
            open ? 'bg-[#edeff3]' : 'hover:bg-[#fafbfc]'
          }`}
        >
          <span className="text-[12px] font-semibold leading-none text-[#525f7a]">A</span>
          <span
            className="block w-3.5 h-[3px] rounded-sm mt-0.5"
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </Tooltip>
      {open && (
        <ColorGrid
          colors={TEXT_COLORS}
          selected={currentColor}
          onPick={(c) => {
            onPick(c);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function HighlightColorButton({
  currentColor,
  onPick,
}: {
  currentColor: string;
  onPick: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative inline-flex" ref={ref}>
      <Tooltip label="Highlight color">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((p) => !p);
          }}
          className={`flex flex-col items-center justify-center w-7 h-7 rounded-md transition-colors ${
            open ? 'bg-[#edeff3]' : 'hover:bg-[#fafbfc]'
          }`}
        >
          <Highlighter className="w-3.5 h-3.5 text-[#525f7a]" />
          <span
            className="block w-3.5 h-[3px] rounded-sm mt-0.5"
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </Tooltip>
      {open && (
        <ColorGrid
          colors={HIGHLIGHT_COLORS}
          selected={currentColor}
          showClear
          onPick={(c) => {
            onPick(c);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ColorGrid({
  colors,
  selected,
  onPick,
  showClear,
}: {
  colors: readonly string[];
  selected: string;
  onPick: (color: string) => void;
  showClear?: boolean;
}) {
  return (
    <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] p-2 w-fit">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: 'repeat(5, 24px)' }}
      >
        {colors.map((c) => {
          const active = c.toLowerCase() === selected.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(c);
              }}
              className="w-6 h-6 rounded-md border border-[#e0e4eb] hover:scale-110 transition-transform"
              style={{
                backgroundColor: c,
                boxShadow: active
                  ? 'inset 0 0 0 1.5px white, inset 0 0 0 3px #006bd6'
                  : undefined,
              }}
              title={c}
            />
          );
        })}
      </div>
      {showClear && (
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            onPick('transparent');
          }}
          className="mt-1.5 w-full px-2 py-1 text-[12px] text-[#525f7a] hover:bg-[#fafbfc] rounded text-left"
        >
          No highlight
        </button>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

type BlockType = 'paragraph' | 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'quote' | 'code';

function detectBlockType(
  selection: ReturnType<typeof $getSelection>
): BlockType {
  if (!$isRangeSelection(selection)) return 'paragraph';
  const anchor = selection.anchor.getNode();
  // Walk up to find the closest block-level node.
  let node: ReturnType<typeof selection.anchor.getNode> | null = anchor;
  while (node) {
    const type = node.getType();
    if (type === 'heading') {
      const tag = (node as unknown as { getTag: () => string }).getTag();
      if (tag === 'h1' || tag === 'h2' || tag === 'h3') return tag;
    }
    if (type === 'list') {
      const lt = (node as unknown as { getListType: () => string }).getListType();
      if (lt === 'bullet') return 'ul';
      if (lt === 'number') return 'ol';
    }
    if (type === 'quote') return 'quote';
    if (type === 'code') return 'code';
    node = node.getParent();
  }
  return 'paragraph';
}

// Re-export so callers don't have to dig into lexical exports.
export type { LexicalEditor };
