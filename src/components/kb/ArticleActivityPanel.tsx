import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { ArticleActivity, ArticleActivityKind } from '@/types';
import { addComment, getActivity } from '@/data/mock-data';
import { useFolderVersion } from '@/state/folder-store';

interface ArticleActivityPanelProps {
  articleId: string;
}

const avatarColors = [
  '#006bd6', '#7c3aed', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#be185d', '#4f46e5', '#0d9488', '#ca8a04',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  const cls = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';
  return (
    <div
      className={`${cls} rounded-lg text-white font-medium flex items-center justify-center shrink-0`}
      style={{ backgroundColor: getAvatarColor(name) }}
    >
      {initials}
    </div>
  );
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function eventSentence(a: ArticleActivity): React.ReactNode {
  const actor = <span className="font-medium text-[#1f242e]">{a.actor.name}</span>;
  switch (a.kind) {
    case 'created':
      return <>{actor} created this article</>;
    case 'status_changed':
      return (
        <>
          {actor} changed status from{' '}
          <span className="font-medium text-[#1f242e]">{a.data.fromStatus}</span> to{' '}
          <span className="font-medium text-[#1f242e]">{a.data.toStatus}</span>
        </>
      );
    case 'owner_changed':
      return (
        <>
          {actor} transferred ownership from{' '}
          <span className="font-medium text-[#1f242e]">{a.data.fromOwner}</span> to{' '}
          <span className="font-medium text-[#1f242e]">{a.data.toOwner}</span>
        </>
      );
    case 'folder_moved':
      return (
        <>
          {actor} moved this article from{' '}
          <span className="font-medium text-[#1f242e]">{a.data.fromFolder}</span> to{' '}
          <span className="font-medium text-[#1f242e]">{a.data.toFolder}</span>
        </>
      );
    case 'title_renamed':
      return (
        <>
          {actor} renamed the article to{' '}
          <span className="font-medium text-[#1f242e]">"{a.data.toTitle}"</span>
        </>
      );
    case 'content_updated':
      return <>{actor} updated the content</>;
    default:
      return <>{actor} did something</>;
  }
}

function isComment(kind: ArticleActivityKind): boolean {
  return kind === 'comment';
}

function ActivityItem({ activity }: { activity: ArticleActivity }) {
  if (isComment(activity.kind)) {
    return (
      <div className="flex items-start gap-2 px-4 py-3">
        <Avatar name={activity.actor.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-medium text-[#1f242e] truncate">
              {activity.actor.name}
            </span>
            <span className="text-[11px] text-[#697a9b]">
              {formatRelative(activity.timestamp)}
            </span>
          </div>
          <div className="text-[13px] text-[#1f242e] leading-[18px] mt-0.5 whitespace-pre-wrap">
            {activity.data.comment}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <Avatar name={activity.actor.name} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-[#525f7a] leading-[16px]">
          {eventSentence(activity)}
        </div>
        <div className="text-[11px] text-[#697a9b] mt-0.5">
          {formatRelative(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}

export function ArticleActivityPanel({ articleId }: ArticleActivityPanelProps) {
  const version = useFolderVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const activities = (() => getActivity(articleId))();
  // Tracking the version dep to re-read the list on mutation.
  void version;

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to bottom when new activity is appended.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activities.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    addComment(articleId, text);
    setDraft('');
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto divide-y divide-[#edeff3]">
        {activities.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[#697a9b]">
            No activity yet.
          </div>
        ) : (
          activities.map((a) => <ActivityItem key={a.id} activity={a} />)
        )}
      </div>
      <div className="border-t border-[#edeff3] p-3 shrink-0 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Add a comment..."
            rows={2}
            className="flex-1 resize-none text-[13px] text-[#1f242e] placeholder:text-[#697a9b] border border-[#e0e4eb] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#006bd6] focus:border-[#006bd6]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim()}
            className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 ${
              draft.trim()
                ? 'bg-[#006bd6] text-white hover:bg-[#0052a3]'
                : 'bg-[#edeff3] text-[#a8b1c2] cursor-not-allowed'
            }`}
            title="Send (⌘+Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
