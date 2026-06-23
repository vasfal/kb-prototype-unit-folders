import { Plus, Folder, ChevronRight, FolderClosed } from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import {
  getFolder,
  getArticlesInFolder,
  getFolderPath,
  getFolderDisplayStyle,
  getUnit,
} from '@/data/mock-data';
import { ArticleRow } from './ArticleCard';
import { EmptyState } from './EmptyState';
import {
  applyArticleFilters,
  isFiltersActive,
  type ArticleFilters,
} from './article-filters';

interface FolderViewProps {
  folderId: string;
  viewingUnitId: string;
  showArchived: boolean;
  filters: ArticleFilters;
  onSelectFolder?: (folderId: string) => void;
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: () => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}

/** Path indicator showing the selected folder's nesting. Each ancestor crumb
 *  is clickable and selects that folder (the leaf is the current folder). */
function FolderBreadcrumb({
  folderId,
  onSelectFolder,
}: {
  folderId: string;
  onSelectFolder?: (id: string) => void;
}) {
  const path = getFolderPath(folderId);
  const color = getFolderDisplayStyle(folderId).color;
  const folder = getFolder(folderId);
  // Always prefix the crumbs with the folder's owning unit for consistency
  // across own / parent-unit / sub-unit / Home folders.
  const unit = folder ? getUnit(folder.unitId) : undefined;
  return (
    <nav className="flex items-center gap-1.5 text-[13px] min-w-0 flex-1">
      {unit && (
        <>
          <FolderClosed
            className="w-4 h-4 text-[#697a9b] shrink-0"
            strokeWidth={1.75}
          />
          <span className="text-[#525f7a] truncate">{unit.name}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#a8b1c2] shrink-0" />
        </>
      )}
      <Folder
        className="w-[18px] h-[18px] shrink-0"
        style={{ color, fill: color }}
        strokeWidth={1.5}
      />
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        return (
          <span key={node.id} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#a8b1c2] shrink-0" />
            )}
            {isLast ? (
              <span className="text-[#1f242e] font-medium truncate">
                {node.name}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onSelectFolder?.(node.id)}
                className="text-[#525f7a] hover:text-[#0052a3] truncate"
              >
                {node.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Articles rendered as a table. */
function ArticleListBlock({
  articles,
  onArticleClick,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: {
  articles: KBArticle[];
  onArticleClick?: (article: KBArticle) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
}) {
  if (articles.length === 0) return null;
  return (
    <table className="w-full min-w-[1000px] table-fixed">
      <thead>
        <tr className="border-b border-[#edeff3] bg-[#fafbfc]">
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pl-4 pr-4 w-[280px]">
            Article
          </th>
          <th className="text-left text-[12px] font-medium text-[#697a9b] py-2 pr-4 w-[200px]">
            Folder
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
            onStatusChange={onArticleStatusChange}
            onMove={onArticleMove}
            onDelete={onArticleDelete}
          />
        ))}
      </tbody>
    </table>
  );
}

export function FolderView({
  folderId,
  viewingUnitId,
  showArchived,
  filters,
  onSelectFolder,
  onArticleClick,
  onCreateArticle,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
}: FolderViewProps) {
  const folder = getFolder(folderId);
  if (!folder) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <EmptyState
          title="Folder not found"
          description="This folder may have been moved or archived."
        />
      </div>
    );
  }

  const isOwn = folder.unitId === viewingUnitId;
  const isArchived = folder.status === 'archived';
  // Articles in this folder only — sub-folders are navigated via the tree.
  const allArticles = getArticlesInFolder(folderId, viewingUnitId, {
    includeArchived: showArchived && isOwn,
  });
  const articles = applyArticleFilters(allArticles, filters);
  const hiddenByFilters =
    isFiltersActive(filters) && allArticles.length > 0 && articles.length === 0;

  const count = articles.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
      {/* Breadcrumb bar — folder nesting + article count */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#edeff3] shrink-0">
        <FolderBreadcrumb
          folderId={folderId}
          onSelectFolder={onSelectFolder}
        />
        <span className="text-[13px] text-[#697a9b] shrink-0">
          {count} {count === 1 ? 'article' : 'articles'}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {allArticles.length === 0 ? (
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
        ) : articles.length > 0 ? (
          <ArticleListBlock
            articles={articles}
            onArticleClick={onArticleClick}
            onArticleStatusChange={onArticleStatusChange}
            onArticleMove={onArticleMove}
            onArticleDelete={onArticleDelete}
          />
        ) : (
          hiddenByFilters && (
            <div className="px-4 py-6 text-[13px] text-[#697a9b] italic text-center">
              No articles match the current filters.
            </div>
          )
        )}
      </div>
    </div>
  );
}
