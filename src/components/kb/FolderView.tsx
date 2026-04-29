import { useState, useEffect, useRef } from 'react';
import {
  FolderClosed,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Archive,
  RotateCcw,
} from 'lucide-react';
import type { KBArticle, KBFolder } from '@/types';
import {
  getFolder,
  getChildFolders,
  getArticlesInFolder,
  getArticleCount,
  getFolderPath,
  getUnit,
} from '@/data/mock-data';
import { ArticleRow, ArticleCard } from './ArticleCard';
import { VisibilityBadge } from './VisibilityBadge';
import { EmptyState } from './EmptyState';
import { buildFolderActions, type FolderAction } from './FolderTree';

interface FolderViewProps {
  folderId: string;
  viewingUnitId: string;
  viewMode: 'grid' | 'list';
  showArchived: boolean;
  onSelectFolder: (folderId: string) => void;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

function FolderHeaderMenu({
  folder,
  onAction,
  onClose,
}: {
  folder: KBFolder;
  onAction: (action: FolderAction, folder: KBFolder) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const items = buildFolderActions(folder);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 bg-white border border-[#e0e4eb] rounded-lg shadow-[0px_4px_12px_rgba(31,36,46,0.12)] z-20 py-1 min-w-[180px]"
    >
      {items.map((item) => (
        <button
          key={item.action}
          type="button"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            onAction(item.action, folder);
            onClose();
          }}
          className={`flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-left ${
            item.disabled
              ? 'text-[#a8b1c2] cursor-not-allowed'
              : item.danger
              ? 'text-[#d97706] hover:bg-[#fafbfc]'
              : 'text-[#1f242e] hover:bg-[#fafbfc]'
          }`}
        >
          <span
            className={
              item.disabled
                ? 'text-[#a8b1c2]'
                : item.danger
                ? 'text-[#d97706]'
                : 'text-[#697a9b]'
            }
          >
            {item.icon}
          </span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SubFolderCard({
  folder,
  viewingUnitId,
  onClick,
}: {
  folder: KBFolder;
  viewingUnitId: string;
  onClick: () => void;
}) {
  const count = getArticleCount(folder.id, viewingUnitId);
  const childCount = getChildFolders(folder.id).length;
  const isArchived = folder.status === 'archived';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2.5 bg-white border rounded-lg transition-colors text-left ${
        isArchived
          ? 'border-dashed border-[#e0e4eb] hover:border-[#c1c7d0] opacity-70'
          : 'border-[#edeff3] hover:border-[#d0d5dd]'
      }`}
    >
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
          isArchived ? 'opacity-60' : ''
        }`}
        style={{ backgroundColor: folder.color }}
      >
        <FolderClosed className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[13px] font-medium truncate leading-[18px] ${
            isArchived ? 'text-[#697a9b] line-through' : 'text-[#1f242e]'
          }`}
        >
          {folder.name}
        </div>
        <div className="text-[12px] text-[#697a9b] leading-[16px]">
          {isArchived
            ? 'Archived'
            : `${count} ${count === 1 ? 'article' : 'articles'}${
                childCount > 0
                  ? ` · ${childCount} sub-folder${childCount === 1 ? '' : 's'}`
                  : ''
              }`}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#697a9b] shrink-0" />
    </button>
  );
}

export function FolderView({
  folderId,
  viewingUnitId,
  viewMode,
  showArchived,
  onSelectFolder,
  onArticleClick,
  onCreateArticle,
  onFolderAction,
}: FolderViewProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const folder = getFolder(folderId);
  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState title="Folder not found" description="This folder may have been moved or archived." />
      </div>
    );
  }

  const isOwn = folder.unitId === viewingUnitId;
  const isArchived = folder.status === 'archived';
  const sourceUnit = getUnit(folder.unitId);
  const path = getFolderPath(folderId);
  const subFolders = getChildFolders(folderId, { includeArchived: showArchived && isOwn });
  const articles = getArticlesInFolder(folderId, viewingUnitId, {
    includeArchived: showArchived && isOwn,
  });

  const liveArticleCount = articles.filter((a) => a.status !== 'archived').length;
  const liveSubFolderCount = subFolders.filter((f) => f.status !== 'archived').length;
  const isEmpty = subFolders.length === 0 && articles.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Folder breadcrumb + header */}
      <div className="px-4 py-4 border-b border-[#edeff3] shrink-0">
        {path.length > 1 && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#697a9b] mb-2">
            {path.map((p, idx) => (
              <span key={p.id} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3 h-3" />}
                {idx === path.length - 1 ? (
                  <span className="text-[#1f242e]">{p.name}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectFolder(p.id)}
                    className="hover:text-[#1f242e]"
                  >
                    {p.name}
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isArchived ? 'opacity-60' : ''
            }`}
            style={{ backgroundColor: folder.color }}
          >
            <FolderClosed className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className={`text-[20px] font-semibold leading-[28px] ${
                  isArchived ? 'text-[#697a9b] line-through' : 'text-[#1f242e]'
                }`}
              >
                {folder.name}
              </h1>
              <VisibilityBadge visibility={folder.visibility} />
              {isArchived && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-[#525f7a] bg-[#fafbfc] border border-[#e0e4eb] rounded">
                  <Archive className="w-3 h-3" />
                  Archived
                </span>
              )}
              {!isOwn && sourceUnit && (
                <span className="inline-flex items-center px-1.5 py-0.5 text-[11px] font-medium text-[#525f7a] bg-[#fafbfc] border border-[#e0e4eb] rounded">
                  Shared from {sourceUnit.name}
                </span>
              )}
            </div>
            <div className="text-[12px] text-[#697a9b] mt-0.5">
              {liveArticleCount} article{liveArticleCount === 1 ? '' : 's'}
              {liveSubFolderCount > 0 &&
                ` · ${liveSubFolderCount} sub-folder${liveSubFolderCount === 1 ? '' : 's'}`}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOwn && !isArchived && (
              <button
                type="button"
                onClick={onCreateArticle}
                className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
              >
                <Plus className="w-4 h-4" />
                Create article
              </button>
            )}
            {isOwn && isArchived && onFolderAction && (
              <button
                type="button"
                onClick={() => onFolderAction('restore', folder)}
                className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#525f7a]" />
                Restore folder
              </button>
            )}
            {isOwn && !isArchived && onFolderAction && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((p) => !p)}
                  className="flex items-center justify-center w-7 h-7 border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]"
                >
                  <MoreHorizontal className="w-4 h-4 text-[#525f7a]" />
                </button>
                {menuOpen && (
                  <FolderHeaderMenu
                    folder={folder}
                    onAction={onFolderAction}
                    onClose={() => setMenuOpen(false)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          <EmptyState
            title={
              isArchived
                ? 'This archived folder is empty'
                : isOwn
                ? 'This folder is empty'
                : 'Nothing to show here'
            }
            description={
              isArchived
                ? 'Restore this folder to start adding articles again.'
                : isOwn
                ? 'Create an article to add content to this folder.'
                : 'No published articles are visible to your unit yet.'
            }
            action={
              !isArchived && isOwn ? (
                <button
                  type="button"
                  onClick={onCreateArticle}
                  className="flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium text-white bg-[#006bd6] rounded-lg hover:bg-[#0052a3]"
                >
                  <Plus className="w-4 h-4" />
                  Create article
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            {subFolders.length > 0 && (
              <section className="px-4 py-4 border-b border-[#edeff3]">
                <div className="grid grid-cols-2 gap-2">
                  {subFolders.map((sf) => (
                    <SubFolderCard
                      key={sf.id}
                      folder={sf}
                      viewingUnitId={viewingUnitId}
                      onClick={() => onSelectFolder(sf.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {articles.length > 0 && (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-3 px-4 pt-4 pb-6">
                  {articles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onClick={() => onArticleClick?.(article)}
                    />
                  ))}
                </div>
              ) : (
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-y border-[#edeff3] bg-[#fafbfc]">
                      <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pl-4 pr-4">
                        Article
                      </th>
                      <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[140px]">
                        Unit
                      </th>
                      <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[100px]">
                        Status
                      </th>
                      <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[100px]">
                        Updated
                      </th>
                      <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[180px]">
                        Owner
                      </th>
                      <th className="w-[44px] py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <ArticleRow
                        key={article.id}
                        article={article}
                        onClick={() => onArticleClick?.(article)}
                      />
                    ))}
                  </tbody>
                </table>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
