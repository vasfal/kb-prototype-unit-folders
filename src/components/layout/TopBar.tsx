import { ChevronRight, Settings, Building2 } from 'lucide-react';

interface TopBarProps {
  unitPath: string[];
}

export function TopBar({ unitPath }: TopBarProps) {
  return (
    <div className="h-14 bg-white border-b border-[#edeff3] flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-0.5 text-[14px]">
        {unitPath.map((segment, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i === 0 && (
              <div className="p-1">
                <Building2 className="w-4 h-4 text-[#697a9b]" />
              </div>
            )}
            {i > 0 && (
              <ChevronRight className="w-3 h-3 text-[#697a9b]" />
            )}
            <span
              className={`px-1 py-0.5 rounded font-medium ${
                i === unitPath.length - 1
                  ? 'text-[#3d475c]'
                  : 'text-[#697a9b]'
              }`}
            >
              {segment}
            </span>
          </div>
        ))}
      </div>
      <button className="flex items-center gap-1.5 h-7 px-2 text-[13px] font-medium text-[#1f242e] border border-[#e0e4eb] rounded-lg hover:bg-[#fafbfc]">
        <Settings className="w-3.5 h-3.5 text-[#525f7a]" />
        Unit settings
      </button>
    </div>
  );
}
