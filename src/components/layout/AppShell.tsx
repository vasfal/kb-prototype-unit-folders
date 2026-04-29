import { useState, useCallback } from 'react';
import { UnitSidebar } from './UnitSidebar';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { KBRoot } from '../kb/KBRoot';
import { ArticleView } from '../kb/ArticleView';
import { ArticleEditor } from '../kb/ArticleEditor';
import { ArchiveDialog } from '../kb/ArchiveDialog';
import { MoveDialog } from '../kb/MoveDialog';
import { CreateFolderDialog } from '../kb/CreateFolderDialog';
import { ArchiveFolderDialog } from '../kb/ArchiveFolderDialog';
import { ChangeVisibilityDialog } from '../kb/ChangeVisibilityDialog';
import type { FolderAction } from '../kb/FolderTree';
import type { KBArticle, ArticleStatus, KBFolder, Visibility } from '@/types';
import {
  unitTree,
  selectedUnitId as defaultSelectedUnitId,
  getUnitPath,
  contacts,
  addFolder,
  renameFolder,
  archiveFolderTree,
  restoreFolderTree,
  setFolderVisibility,
  upsertArticle,
  setArticleStatus,
  moveArticle,
  getEligibleParentFolders,
  getFolder,
} from '@/data/mock-data';

type ModalState =
  | { type: 'none' }
  | { type: 'view'; article: KBArticle }
  | { type: 'edit'; article: KBArticle }
  | { type: 'create'; folderId?: string };

type DialogState =
  | { type: 'none' }
  | { type: 'archive'; article: KBArticle }
  | { type: 'move'; article: KBArticle }
  | { type: 'create-folder'; parent: KBFolder | null; isSubFolder: boolean }
  | { type: 'rename-folder'; folder: KBFolder }
  | { type: 'archive-folder'; folder: KBFolder }
  | { type: 'change-folder-visibility'; folder: KBFolder };

const folderColors = ['#006bd6', '#16a34a', '#7c3aed', '#ff9124', '#e11d48', '#0891b2', '#d97706'];

function pickFolderColor(parent: KBFolder | null): string {
  if (parent) return parent.color;
  return folderColors[Math.floor(Math.random() * folderColors.length)];
}

export function AppShell() {
  const [selectedUnitId, setSelectedUnitId] = useState(defaultSelectedUnitId);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  const unitPath = getUnitPath(selectedUnitId).map((u) => u.name);

  const handleSaveArticle = useCallback((saved: KBArticle) => {
    upsertArticle(saved);
    setModal({ type: 'view', article: saved });
  }, []);

  const handleStatusChange = useCallback((article: KBArticle, status: ArticleStatus) => {
    if (status === 'archived') {
      setDialog({ type: 'archive', article });
      return;
    }
    const updated = setArticleStatus(article.id, status);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  const handleArchiveConfirm = useCallback(() => {
    if (dialog.type !== 'archive') return;
    setArticleStatus(dialog.article.id, 'archived');
    setDialog({ type: 'none' });
    setModal({ type: 'none' });
  }, [dialog]);

  const handleMoveConfirm = useCallback((folderId: string) => {
    if (dialog.type !== 'move') return;
    const updated = moveArticle(dialog.article.id, folderId);
    setDialog({ type: 'none' });
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, [dialog]);

  // ── Folder lifecycle ──
  const handleFolderAction = useCallback((action: FolderAction, folder: KBFolder) => {
    switch (action) {
      case 'create-sub':
        setDialog({ type: 'create-folder', parent: folder, isSubFolder: true });
        break;
      case 'rename':
        setDialog({ type: 'rename-folder', folder });
        break;
      case 'change-visibility':
        setDialog({ type: 'change-folder-visibility', folder });
        break;
      case 'archive':
        setDialog({ type: 'archive-folder', folder });
        break;
      case 'restore':
        restoreFolderTree(folder.id);
        break;
    }
  }, []);

  const handleCreateRootFolder = useCallback(() => {
    setDialog({ type: 'create-folder', parent: null, isSubFolder: false });
  }, []);

  const handleCreateSubFolder = useCallback((parent: KBFolder | null) => {
    setDialog({ type: 'create-folder', parent, isSubFolder: true });
  }, []);

  const handleCreateFolderConfirm = useCallback(
    (result: { name: string; parentId: string | null }) => {
      if (dialog.type !== 'create-folder') return;
      // Pull the latest parent state from the dropdown (not just the dialog's
      // initial parent), so user can switch parent before confirming.
      const parent = result.parentId ? getFolder(result.parentId) ?? null : null;
      const now = new Date().toISOString();
      const newFolder: KBFolder = {
        id: `f-new-${Date.now()}`,
        unitId: parent?.unitId ?? selectedUnitId,
        parentFolderId: parent?.id ?? null,
        name: result.name,
        color: pickFolderColor(parent),
        visibility: parent?.visibility ?? 'unit_and_subunits',
        status: 'active',
        sortOrder: 999,
        owner: contacts.oleksii,
        createdBy: contacts.oleksii,
        createdAt: now,
        updatedBy: contacts.oleksii,
        updatedAt: now,
      };
      addFolder(newFolder);
      setDialog({ type: 'none' });
    },
    [dialog, selectedUnitId]
  );

  const handleRenameFolderConfirm = useCallback(
    (result: { name: string }) => {
      if (dialog.type !== 'rename-folder') return;
      renameFolder(dialog.folder.id, result.name);
      setDialog({ type: 'none' });
    },
    [dialog]
  );

  const handleArchiveFolderConfirm = useCallback(() => {
    if (dialog.type !== 'archive-folder') return;
    archiveFolderTree(dialog.folder.id);
    setDialog({ type: 'none' });
  }, [dialog]);

  const handleVisibilityConfirm = useCallback(
    (visibility: Visibility) => {
      if (dialog.type !== 'change-folder-visibility') return;
      setFolderVisibility(dialog.folder.id, visibility);
      setDialog({ type: 'none' });
    },
    [dialog]
  );

  const closeModal = useCallback(() => setModal({ type: 'none' }), []);
  const closeDialog = useCallback(() => setDialog({ type: 'none' }), []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafbfc] text-[14px] text-[#1f242e]">
      <UnitSidebar
        unitTree={unitTree}
        selectedUnitId={selectedUnitId}
        onSelectUnit={setSelectedUnitId}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
        <TopBar unitPath={unitPath} />
        <TabBar activeTab="kb" />
        <KBRoot
          unitId={selectedUnitId}
          onArticleClick={(article) => setModal({ type: 'view', article })}
          onCreateArticle={(folderId) => setModal({ type: 'create', folderId })}
          onCreateFolder={handleCreateRootFolder}
          onCreateSubFolder={handleCreateSubFolder}
          onFolderAction={handleFolderAction}
        />
      </div>

      {/* Article modals */}
      {modal.type === 'view' && (
        <ArticleView
          article={modal.article}
          onClose={closeModal}
          onEdit={() => setModal({ type: 'edit', article: modal.article })}
          onStatusChange={handleStatusChange}
          onMove={(article) => setDialog({ type: 'move', article })}
        />
      )}
      {modal.type === 'edit' && (
        <ArticleEditor
          article={modal.article}
          unitId={selectedUnitId}
          onSave={handleSaveArticle}
          onClose={closeModal}
        />
      )}
      {modal.type === 'create' && (
        <ArticleEditor
          unitId={selectedUnitId}
          initialFolderId={modal.folderId}
          onSave={handleSaveArticle}
          onClose={closeModal}
        />
      )}

      {/* Article dialogs */}
      {dialog.type === 'archive' && (
        <ArchiveDialog
          article={dialog.article}
          onConfirm={handleArchiveConfirm}
          onCancel={closeDialog}
        />
      )}
      {dialog.type === 'move' && (
        <MoveDialog
          article={dialog.article}
          onConfirm={handleMoveConfirm}
          onCancel={closeDialog}
        />
      )}

      {/* Folder dialogs */}
      {dialog.type === 'create-folder' && (() => {
        // Root creation: no parent picker.
        if (!dialog.isSubFolder) {
          return (
            <CreateFolderDialog
              mode="create"
              onConfirm={handleCreateFolderConfirm}
              onCancel={closeDialog}
            />
          );
        }
        // Sub-folder creation: always show picker (parent may be null when
        // user clicked "Create sub-folder" from the + menu without a folder
        // selected; the dropdown then defaults to the first eligible folder).
        const ownerUnitId = dialog.parent?.unitId ?? selectedUnitId;
        const eligibleParents = getEligibleParentFolders(ownerUnitId);
        const options = eligibleParents.map((f) => ({ id: f.id, label: f.name }));
        const initialId =
          (dialog.parent && options.find((o) => o.id === dialog.parent!.id)?.id) ??
          options[0]?.id ??
          '';
        return (
          <CreateFolderDialog
            mode="create"
            parentPicker={{ options, initialId }}
            onConfirm={handleCreateFolderConfirm}
            onCancel={closeDialog}
          />
        );
      })()}
      {dialog.type === 'rename-folder' && (
        <CreateFolderDialog
          mode="rename"
          initialName={dialog.folder.name}
          onConfirm={handleRenameFolderConfirm}
          onCancel={closeDialog}
        />
      )}
      {dialog.type === 'archive-folder' && (
        <ArchiveFolderDialog
          folder={dialog.folder}
          onConfirm={handleArchiveFolderConfirm}
          onCancel={closeDialog}
        />
      )}
      {dialog.type === 'change-folder-visibility' && (
        <ChangeVisibilityDialog
          folder={dialog.folder}
          onConfirm={handleVisibilityConfirm}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
