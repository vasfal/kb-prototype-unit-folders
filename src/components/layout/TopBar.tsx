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
      <button className="flex items-center gap-2 px-3 py-2.5 text-[14px] font-medium text-[#3d475c] border border-[#e0e4eb] rounded-lg hover:bg-gray-50">
        <Settings className="w-4 h-4" />
        Unit settings
      </button>
    </div>
  );
}
