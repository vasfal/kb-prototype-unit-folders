import { useEffect, useState } from 'react';
import { X, Maximize2 } from 'lucide-react';

export interface RightPanel {
  id: string;
  /** Short label shown in the icon strip and as a tab title when open. */
  label: string;
  /** Small icon for the collapsed strip + the open-panel header. */
  icon: React.ReactNode;
  /** Panel body. */
  content: React.ReactNode;
}

interface EntityModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional list of side panels. When provided, a collapsed icon strip is
   *  shown on the right; clicking an icon opens the panel with tab navigation. */
  rightPanels?: RightPanel[];
  /** Controlled active panel id (null = collapsed). If omitted the modal
   *  manages this internally. */
  activeRightPanelId?: string | null;
  onChangeActiveRightPanel?: (id: string | null) => void;
}

export function EntityModal({
  title,
  onClose,
  children,
  rightPanels,
  activeRightPanelId,
  onChangeActiveRightPanel,
}: EntityModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Internal active id when uncontrolled.
  const [internalActive, setInternalActive] = useState<string | null>(null);
  const isControlled = activeRightPanelId !== undefined;
  const activeId = isControlled ? activeRightPanelId : internalActive;
  const setActive = (next: string | null) => {
    if (!isControlled) setInternalActive(next);
    onChangeActiveRightPanel?.(next);
  };

  const panels = rightPanels ?? [];
  const activePanel = panels.find((p) => p.id === activeId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-[0px_1px_3px_0px_rgba(31,36,46,0.1),0px_1px_2px_-1px_rgba(31,36,46,0.1)] flex flex-col w-[88vw] h-[88vh] overflow-hidden">
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
          <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>

          {/* Right panel — open state with tab nav */}
          {panels.length > 0 && activePanel && (
            <div className="w-[320px] shrink-0 border-l border-[#edeff3] bg-white flex flex-col">
              <div className="flex items-center justify-between border-b border-[#edeff3] shrink-0 pr-2">
                <div className="flex">
                  {panels.map((p) => {
                    const isActive = p.id === activePanel.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setActive(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px ${
                          isActive
                            ? 'text-[#0052a3] border-[#006bd6]'
                            : 'text-[#697a9b] border-transparent hover:text-[#1f242e]'
                        }`}
                      >
                        <span className={isActive ? 'text-[#006bd6]' : 'text-[#697a9b]'}>
                          {p.icon}
                        </span>
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="flex items-center justify-center p-1 rounded-md hover:bg-[#fafbfc] transition-colors"
                  title="Close panel"
                >
                  <X className="w-3.5 h-3.5 text-[#525f7a]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">{activePanel.content}</div>
            </div>
          )}

          {/* Right panel — collapsed icon strip */}
          {panels.length > 0 && !activePanel && (
            <div className="shrink-0 border-l border-[#edeff3] bg-white flex flex-col items-center pt-3 gap-1.5 w-[68px]">
              {panels.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(p.id)}
                  className="flex flex-col items-center gap-1 w-full cursor-pointer hover:bg-[#edeff3] rounded-md py-2 transition-colors"
                  title={p.label}
                >
                  <div className="w-9 h-9 rounded-lg border border-[#e0e4eb] bg-white flex items-center justify-center text-[#525f7a]">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-medium text-[#3d475c] leading-[14px] tracking-[-0.2px]">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
