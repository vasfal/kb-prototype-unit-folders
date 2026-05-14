import { useEffect, useRef } from 'react';
import {
  Archive,
  Eye,
  EyeOff,
  FolderInput,
  RotateCcw,
  Send,
  Trash2,
} from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';

interface ArticleActionsMenuProps {
  article: KBArticle;
  onClose: () => void;
  onStatusChange?: (status: ArticleStatus) => void;
  onMove?: () => void;
  onDelete?: () => void;
  onChangeVisibility?: () => void;
  /** Tailwind positioning classes for the popover container. Defaults to
   *  right-aligned just below the trigger. */
  positionClassName?: string;
}

/** Dropdown menu of lifecycle actions for an article. Used both from the
 *  article-detail view and from in-row "..." buttons in list views. The
 *  caller controls visibility and renders this inside a `relative` wrapper. */
export function ArticleActionsMenu({
  article,
  onClose,
  onStatusChange,
  onMove,
  onDelete,
  onChangeVisibility,
  positionClassName,
}: ArticleActionsMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const items: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
  }[] = [];

  if (article.status === 'draft') {
    items.push({
      icon: <Send className="w-4 h-4" />,
      label: 'Publish',
      onClick: () => {
        onStatusChange?.('published');
        onClose();
      },
    });
  }
  if (article.status === 'published') {
    items.push({
      icon: <EyeOff className="w-4 h-4" />,
      label: 'Unpublish',
      onClick: () => {
        onStatusChange?.('draft');
        onClose();
      },
    });
  }
  if (article.status !== 'archived') {
    items.push({
      icon: <FolderInput className="w-4 h-4" />,
      label: 'Move',
      onClick: () => {
        onMove?.();
        onClose();
      },
    });
    if (onChangeVisibility) {
      items.push({
        icon: <Eye className="w-4 h-4" />,
        label: 'Change visibility',
        onClick: () => {
          onChangeVisibility();
          onClose();
        },
      });
    }
    items.push({
      icon: <Archive className="w-4 h-4" />,
      label: 'Archive',
      onClick: () => {
        onStatusChange?.('archived');
        onClose();
      },
    });
  }
  if (article.status === 'archived') {
    items.push({
      icon: <RotateCcw className="w-4 h-4" />,
      label: 'Restore',
      onClick: () => {
        onStatusChange?.('draft');
        onClose();
      },
    });
  }
  items.push({
    icon: <Trash2 className="w-4 h-4" />,
    label: 'Delete',
    onClick: () => {
      onDelete?.();
      onClose();
    },
    danger: true,
  });

  return (
    <div
      ref={ref}
      className={`absolute bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] py-1 min-w-[160px] ${
        positionClassName ?? 'right-0 top-full mt-1 z-[56]'
      }`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left hover:bg-[#fafbfc] ${
            item.danger ? 'text-red-600' : 'text-[#1f242e]'
          }`}
        >
          <span className={item.danger ? 'text-red-600' : 'text-[#697a9b]'}>
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}
