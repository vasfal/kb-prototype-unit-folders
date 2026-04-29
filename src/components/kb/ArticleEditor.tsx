import { useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Undo,
  Redo,
  ChevronDown,
  Eye,
  Lock,
  Building2,
} from 'lucide-react';
import type { KBArticle, Visibility } from '@/types';
import { getOwnRootFolders, getChildFolders, contacts } from '@/data/mock-data';
import { EntityModal } from '../shared/EntityModal';

interface ArticleEditorProps {
  article?: KBArticle | null;
  unitId: string;
  initialFolderId?: string;
  onSave: (article: KBArticle) => void;
  onClose: () => void;
}

const visibilityOptions: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: 'unit_and_subunits', label: 'Unit & sub-units', icon: <Building2 className="w-4 h-4" /> },
  { value: 'current_unit_only', label: 'Current unit only', icon: <Lock className="w-4 h-4" /> },
];

function ToolbarButton({ active, onClick, children, title }: { active?: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center justify-center w-7 h-7 rounded-md transition-colors ${
        active ? 'bg-[#edeff3] text-[#1f242e]' : 'text-[#525f7a] hover:bg-[#fafbfc]'
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-[#edeff3] mx-0.5" />;
}

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-[#edeff3] bg-white shrink-0 flex-wrap">
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <Undo className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <Redo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('underline')}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editor.isActive({ textAlign: 'left' })}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'center' })}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: 'right' })}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton
        active={editor.isActive('link')}
        onClick={() => {
          if (editor.isActive('link')) {
            editor.chain().focus().unsetLink().run();
          } else {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        title="Link"
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
}

interface FolderOption {
  id: string;
  label: string;
}

function flattenUnitFolders(unitId: string): FolderOption[] {
  const result: FolderOption[] = [];
  const walk = (id: string, prefix: string) => {
    const children = getChildFolders(id);
    children.forEach((c) => {
      result.push({ id: c.id, label: `${prefix}${c.name}` });
      walk(c.id, `${prefix}${c.name} / `);
    });
  };
  getOwnRootFolders(unitId).forEach((root) => {
    result.push({ id: root.id, label: root.name });
    walk(root.id, `${root.name} / `);
  });
  return result;
}

export function ArticleEditor({ article, unitId, initialFolderId, onSave, onClose }: ArticleEditorProps) {
  const isNew = !article;
  // Folder selector is scoped to the owning unit's tree.
  const owningUnitId = article?.unitId ?? unitId;
  const folderOptions = flattenUnitFolders(owningUnitId);

  const [title, setTitle] = useState(article?.title ?? '');
  const [folderId, setFolderId] = useState(
    article?.folderId ?? initialFolderId ?? folderOptions[0]?.id ?? ''
  );
  const [visibility, setVisibility] = useState<Visibility>(article?.visibility ?? 'unit_and_subunits');
  const [visibilityOpen, setVisibilityOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your article...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: article?.content ?? '',
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[300px] px-6 py-4 text-[14px] text-[#1f242e] leading-[22px] prose prose-sm max-w-none [&_h1]:text-[20px] [&_h1]:font-semibold [&_h1]:mb-3 [&_h2]:text-[16px] [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-1.5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_li]:mb-1 [&_a]:text-[#006bd6] [&_a]:underline [&_.is-editor-empty]:before:text-[#697a9b] [&_.is-editor-empty]:before:content-[attr(data-placeholder)] [&_.is-editor-empty]:before:float-left [&_.is-editor-empty]:before:pointer-events-none [&_.is-editor-empty]:before:h-0',
      },
    },
  });

  const handleSave = useCallback((status: 'draft' | 'published') => {
    const now = new Date().toISOString();
    const saved: KBArticle = {
      id: article?.id ?? `a-new-${Date.now()}`,
      folderId,
      unitId,
      title,
      content: editor?.getHTML() ?? '',
      status,
      visibility,
      owner: article?.owner ?? contacts.oleksii,
      createdBy: article?.createdBy ?? contacts.oleksii,
      createdAt: article?.createdAt ?? now,
      updatedBy: contacts.oleksii,
      updatedAt: now,
      publishedAt: status === 'published' ? now : article?.publishedAt ?? null,
    };
    onSave(saved);
  }, [article, folderId, unitId, title, editor, visibility, onSave]);

  const selectedVisibility = visibilityOptions.find((v) => v.value === visibility)!;

  return (
    <EntityModal title={isNew ? 'New article' : 'Edit article'} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Top bar: category selector + visibility + action buttons */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#edeff3] shrink-0">
          <div className="flex items-center gap-3">
            {/* Folder selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-[#697a9b]">Folder</span>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="h-7 px-2 text-[13px] border border-[#e0e4eb] rounded-lg bg-white text-[#1f242e] focus:outline-none focus:ring-1 focus:ring-[#006bd6]"
              >
                {folderOptions.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Visibility selector */}
            <div className="relative">
              <button
                onClick={() => setVisibilityOpen((p) => !p)}
                className="flex items-center gap-1.5 h-7 px-2 text-[13px] border border-[#e0e4eb] rounded-lg bg-white text-[#1f242e] hover:bg-[#fafbfc]"
              >
                <Eye className="w-3.5 h-3.5 text-[#697a9b]" />
                {selectedVisibility.label}
                <ChevronDown className="w-3.5 h-3.5 text-[#697a9b]" />
              </button>
              {visibilityOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-10 py-1 min-w-[180px]">
                  {visibilityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setVisibility(opt.value); setVisibilityOpen(false); }}
                      className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left hover:bg-[#fafbfc] ${
                        visibility === opt.value ? 'text-[#006bd6]' : 'text-[#1f242e]'
                      }`}
                    >
                      <span className="text-[#697a9b]">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('draft')}
              className="h-7 px-3 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
            >
              Save draft
            </button>
            <button
              onClick={() => handleSave('published')}
              className="h-7 px-3 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
            >
              Publish
            </button>
          </div>
        </div>

        {/* Title field */}
        <div className="px-6 pt-4 shrink-0 max-w-[1000px] mx-auto w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            className="w-full text-[20px] font-semibold text-[#1f242e] leading-[30px] placeholder:text-[#697a9b] outline-none border-none bg-transparent"
          />
        </div>

        {/* Toolbar */}
        <div className="max-w-[1000px] mx-auto w-full">
          <EditorToolbar editor={editor} />
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto w-full">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </EntityModal>
  );
}
