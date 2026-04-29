import { Users, UserCog, Megaphone, Briefcase, BookOpen, RotateCcw } from 'lucide-react';
import type { AppTab } from '@/types';
import { resetKbState } from '@/data/mock-data';

const tabs: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'team', label: 'Team', icon: Users },
  { id: 'people', label: 'People management', icon: UserCog },
  { id: 'recruitment', label: 'Recruitment', icon: Megaphone },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'kb', label: 'Knowledge base', icon: BookOpen },
];

interface TabBarProps {
  activeTab: AppTab;
}

export function TabBar({ activeTab }: TabBarProps) {
  return (
    <div className="bg-white border-b border-[#edeff3] px-4 flex items-end gap-3 shrink-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
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

      <div className="ml-auto pb-1">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset KB to demo defaults? Local changes will be lost.')) {
              resetKbState();
            }
          }}
          className="flex items-center gap-1.5 h-7 px-2 text-[12px] text-[#697a9b] rounded-lg hover:bg-[#fafbfc] hover:text-[#1f242e]"
          title="Reset to defaults (clears localStorage)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset demo
        </button>
      </div>
    </div>
  );
}
