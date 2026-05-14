import {
  Home,
  Mail,
  Search,
  Building2,
  Calendar,
  Box,
  Users,
  Plus,
} from 'lucide-react';

type NavKey = 'home' | 'inbox' | 'search' | 'units' | 'calendar' | 'assets' | 'contacts';

const sidebarNavItems: { key: NavKey; icon: React.ElementType; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'inbox', icon: Mail, label: 'Inbox' },
  { key: 'search', icon: Search, label: 'Search' },
  { key: 'units', icon: Building2, label: 'Units' },
  { key: 'calendar', icon: Calendar, label: 'Calendar' },
  { key: 'assets', icon: Box, label: 'Assets' },
  { key: 'contacts', icon: Users, label: 'Contacts' },
];

interface HomeSidebarProps {
  onSelectUnits: () => void;
}

/** Compact icon-only sidebar shown in Home scope. The Units icon flips back to
 *  the regular unit-tree sidebar; other entries are decorative placeholders. */
export function HomeSidebar({ onSelectUnits }: HomeSidebarProps) {
  return (
    <div className="flex flex-col h-full shrink-0 w-16 bg-[#fafbfc] border-r border-[#edeff3]">
      {/* Space avatar header */}
      <div className="flex items-center justify-center h-14 bg-white border-b border-[#edeff3] shrink-0">
        <div className="w-7 h-7 rounded bg-[#006bd6] flex items-center justify-center text-white font-bold text-[12px]">
          D
        </div>
      </div>

      {/* Icon strip */}
      <div className="flex-1 flex flex-col items-center pt-3 gap-1 overflow-y-auto">
        {sidebarNavItems.map((item) => {
          const isActive = item.key === 'home';
          const handleClick =
            item.key === 'units' ? onSelectUnits : undefined;
          return (
            <button
              key={item.key}
              type="button"
              onClick={handleClick}
              className={`flex flex-col items-center justify-center w-14 py-1.5 rounded-md cursor-pointer ${
                isActive
                  ? 'text-[#006bd6]'
                  : 'text-[#697a9b] hover:text-[#525f7a] hover:bg-[#f5f6f8]'
              }`}
              title={item.label}
            >
              <item.icon className="w-4 h-4" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] mt-1 leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom create button */}
      <div className="p-3 border-t border-[#edeff3] flex justify-center shrink-0">
        <button className="w-7 h-7 rounded-full bg-[#006bd6] flex items-center justify-center text-white">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
