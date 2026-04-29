import { useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';

interface EntityModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  rightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
  rightPanelLabel?: string;
}

export function EntityModal({ title, onClose, children, rightPanel, rightPanelOpen, onToggleRightPanel, rightPanelLabel = 'About' }: EntityModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(31,36,46,0.1),0px_1px_2px_-1px_rgba(31,36,46,0.1)] flex flex-col w-[90vw] h-[85vh] max-w-[1200px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pl-6 pr-3 py-2.5 border-b border-[#edeff3] shrink-0">
          <span className="text-[16px] font-medium text-[#1f242e] leading-[24px]">{title}</span>
          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center p-1.5 rounded-md hover:bg-[#fafbfc] transition-colors">
              <Maximize2 className="w-4 h-4 text-[#525f7a]" />
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center p-1.5 rounded-md hover:bg-[#fafbfc] transition-colors"
            >
              <X className="w-4 h-4 text-[#525f7a]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 min-w-0 overflow-y-auto">
            {children}
          </div>

          {/* Right panel: collapsed tab strip or expanded panel */}
          {rightPanel && (
            <>
              {rightPanelOpen ? (
                <div className="w-[280px] shrink-0 border-l border-[#edeff3] bg-white overflow-y-auto">
                  {rightPanel}
                </div>
              ) : (
                <div className="shrink-0 border-l border-[#edeff3] bg-white flex flex-col items-center pt-3">
                  <button
                    onClick={onToggleRightPanel}
                    className="flex flex-col items-center gap-1 w-[68px] cursor-pointer hover:bg-[#edeff3] rounded-md py-2 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg border border-[#e0e4eb] bg-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#525f7a]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="8" r="6.25" />
                        <line x1="8" y1="5.5" x2="8" y2="5.5" strokeWidth="2" />
                        <line x1="8" y1="7.5" x2="8" y2="11" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium text-[#3d475c] leading-[14px] tracking-[-0.2px]">
                      {rightPanelLabel}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
