import { useState } from 'react';
import {
  Home,
  Mail,
  Search,
  Building2,
  Calendar,
  Box,
  Users,
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  FolderInput,
  Plus,
} from 'lucide-react';
import type { BusinessUnit } from '@/types';

const sidebarNavItems = [
  { icon: Home, label: 'Home', active: false },
  { icon: Mail, label: 'Inbox', active: false },
  { icon: Search, label: 'Search', active: false },
  { icon: Building2, label: 'Units', active: true },
  { icon: Calendar, label: 'Calendar', active: false },
  { icon: Box, label: 'Assets', active: false },
  { icon: Users, label: 'Contacts', active: false },
];

interface UnitSidebarProps {
  unitTree: BusinessUnit;
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
}

function UnitTreeItem({
  unit,
  selectedUnitId,
  onSelectUnit,
  expandedIds,
  onToggleExpand,
  depth = 0,
  isRoot = false,
}: {
  unit: BusinessUnit;
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  expandedIds: Set<string>;
  onToggleExpand: (unitId: string) => void;
  depth?: number;
  isRoot?: boolean;
}) {
  const isSelected = unit.id === selectedUnitId;
  const hasChildren = unit.children && unit.children.length > 0;
  const isExpanded = isRoot || expandedIds.has(unit.id);

  const iconColor = isSelected ? 'text-[#006bd6]' : 'text-[#697a9b]';

  let FolderIcon: React.ElementType;
  if (isRoot) {
    FolderIcon = Building2;
  } else if (hasChildren && isExpanded) {
    FolderIcon = FolderOpen;
  } else if (hasChildren && !isExpanded) {
    FolderIcon = FolderInput;
  } else {
    FolderIcon = FolderClosed;
  }

  return (
    <>
      <div
        className={`flex items-center gap-1.5 py-[5px] pr-2 cursor-pointer text-[13px] leading-tight rounded-md ${
          isSelected
            ? 'bg-[#e6f0fb] text-[#006bd6]'
            : 'text-[#3d475c] hover:bg-[#f5f6f8]'
        }`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => {
          onSelectUnit(unit.id);
          if (!isRoot && hasChildren) onToggleExpand(unit.id);
        }}
      >
        <FolderIcon className={`w-4 h-4 shrink-0 ${iconColor}`} />
        <span className="truncate">{unit.name}</span>
      </div>
      {isExpanded &&
        unit.children?.map((child) => (
          <UnitTreeItem
            key={child.id}
            unit={child}
            selectedUnitId={selectedUnitId}
            onSelectUnit={onSelectUnit}
            expandedIds={expandedIds}
            onToggleExpand={onToggleExpand}
            depth={depth + 1}
          />
        ))}
    </>
  );
}

export function UnitSidebar({ unitTree, selectedUnitId, onSelectUnit }: UnitSidebarProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    const ids = new Set<string>();
    function findAndExpand(unit: BusinessUnit, target: string): boolean {
      if (unit.id === target) return true;
      if (unit.children) {
        for (const child of unit.children) {
          if (findAndExpand(child, target)) {
            ids.add(unit.id);
            return true;
          }
        }
      }
      return false;
    }
    findAndExpand(unitTree, selectedUnitId);
    ids.add(selectedUnitId);
    return ids;
  });

  const onToggleExpand = (unitId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full shrink-0 w-[320px]">
      {/* Shared header */}
      <div className="flex items-center justify-between px-3 h-14 border-b border-r border-[#edeff3] bg-white shrink-0">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 rounded bg-[#006bd6] flex items-center justify-center text-white font-bold text-[10px]">
            D
          </div>
          <span className="text-[14px] font-medium text-[#1f242e]">Develux</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#697a9b]" />
        </div>
        <ChevronRight className="w-4 h-4 text-[#697a9b] cursor-pointer" />
      </div>

      {/* Icon strip + unit tree side by side */}
      <div className="flex flex-1 min-h-0">
        {/* Icon strip */}
        <div className="w-16 bg-[#fafbfc] border-r border-[#edeff3] flex flex-col items-center pt-3 gap-1">
          {sidebarNavItems.map((item) => (
            <div
              key={item.label}
              className={`flex flex-col items-center justify-center w-14 py-1.5 rounded-md cursor-pointer ${
                item.active
                  ? 'text-[#006bd6]'
                  : 'text-[#697a9b] hover:text-[#525f7a] hover:bg-[#f5f6f8]'
              }`}
            >
              <item.icon className="w-4 h-4" strokeWidth={item.active ? 2 : 1.5} />
              <span className="text-[10px] mt-1 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Unit tree panel */}
        <div className="flex-1 bg-[#fafbfc] border-r border-[#edeff3] flex flex-col overflow-hidden">
          {/* Favourites */}
          <div className="px-3 pt-3 pb-1">
            <div className="flex items-center gap-1 text-[13px] text-[#697a9b] font-medium cursor-pointer">
              Favourites
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Company units */}
          <div className="px-3 pt-2 pb-1">
            <div className="flex items-center gap-1 text-[13px] text-[#697a9b] font-medium cursor-pointer">
              Company units
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Unit tree */}
          <div className="flex-1 overflow-y-auto px-1 pb-2 flex flex-col gap-[2px]">
            <UnitTreeItem
              unit={unitTree}
              selectedUnitId={selectedUnitId}
              onSelectUnit={onSelectUnit}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              depth={0}
              isRoot
            />
          </div>

          {/* Bottom actions */}
          <div className="border-t border-[#edeff3] p-3 mt-auto flex flex-col gap-1">
            <button className="w-7 h-7 rounded-full bg-[#006bd6] flex items-center justify-center text-white">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
