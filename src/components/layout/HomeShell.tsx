import { useState } from 'react';
import {
  User,
  Palmtree,
  Megaphone,
  Briefcase,
  BookOpen,
  IdCard,
} from 'lucide-react';
import type { KBArticle, KBFolder, ArticleStatus } from '@/types';
import { HomeKBView } from '../home/HomeKBView';
import type { FolderAction } from '../kb/FolderTree';

type HomeTab = 'profile' | 'leaves' | 'recruitment' | 'jobs' | 'kb' | 'contacts';

const tabs: { id: HomeTab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'leaves', label: 'My Leaves', icon: Palmtree },
  { id: 'recruitment', label: 'My Recruitment', icon: Megaphone },
  { id: 'jobs', label: 'My Jobs', icon: Briefcase },
  { id: 'kb', label: 'My Knowledge base', icon: BookOpen },
  { id: 'contacts', label: 'My Contacts', icon: IdCard },
];

interface HomeShellProps {
  spaceName: string;
  onArticleClick?: (article: KBArticle) => void;
  onArticleStatusChange?: (article: KBArticle, status: ArticleStatus) => void;
  onArticleMove?: (article: KBArticle) => void;
  onArticleDelete?: (article: KBArticle) => void;
  /** Triggers article-create. folderId is omitted when called from the All
   *  articles view; AppShell falls back to the user's positions. */
  onCreateArticle?: (folderId?: string) => void;
  onCreateFolder?: () => void;
  onFolderAction?: (action: FolderAction, folder: KBFolder) => void;
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="text-center max-w-[420px] px-6">
        <p className="text-[15px] font-medium text-[#1f242e] mb-1">{label}</p>
        <p className="text-[13px] text-[#697a9b]">
          This area is a placeholder in the prototype — only{' '}
          <strong className="text-[#1f242e]">My KB</strong> is interactive.
        </p>
      </div>
    </div>
  );
}

export function HomeShell({
  spaceName,
  onArticleClick,
  onArticleStatusChange,
  onArticleMove,
  onArticleDelete,
  onCreateArticle,
  onCreateFolder,
  onFolderAction,
}: HomeShellProps) {
  const [activeTab, setActiveTab] = useState<HomeTab>('kb');

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
      {/* Top bar: space name (replaces unit breadcrumbs) */}
      <div className="h-14 bg-white border-b border-[#edeff3] flex items-center px-4 shrink-0">
        <span className="text-[16px] font-semibold text-[#1f242e]">{spaceName}</span>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-[#edeff3] px-4 flex items-end gap-3 shrink-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-1.5 py-1.5 text-[14px] font-medium border-b transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#0052a3] text-[#0052a3]'
                  : 'border-transparent text-[#697a9b] hover:text-[#525f7a]'
              }`}
            >
              <div className="flex items-center gap-2 h-6 px-1.5 py-0.5 rounded-lg">
                <tab.icon className="w-4 h-4" strokeWidth={1.5} />
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'kb' ? (
        <HomeKBView
          onArticleClick={onArticleClick}
          onArticleStatusChange={onArticleStatusChange}
          onArticleMove={onArticleMove}
          onArticleDelete={onArticleDelete}
          onCreateArticle={onCreateArticle}
          onCreateFolder={onCreateFolder}
          onFolderAction={onFolderAction}
        />
      ) : (
        <PlaceholderTab label={tabs.find((t) => t.id === activeTab)!.label} />
      )}
    </div>
  );
}
