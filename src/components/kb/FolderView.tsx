import { Plus } from 'lucide-react';
import type { KBArticle, ArticleStatus } from '@/types';
import {
  getFolder,
  getArticlesInFolder,
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
  onArticleClick?: (article: KBArticle) => void;
  onCreateArticle?: () => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
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
    <table className="w-full table-fixed">
      <thead>
        <tr className="border-b border-[#edeff3] bg-[#fafbfc]">
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

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-white">
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
