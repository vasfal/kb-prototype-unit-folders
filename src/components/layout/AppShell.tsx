import { useState, useCallback } from 'react';
import { UnitSidebar } from './UnitSidebar';
import { HomeSidebar } from './HomeSidebar';
import { HomeShell } from './HomeShell';
import { TopBar } from './TopBar';
import { TabBar } from './TabBar';
import { KBRoot } from '../kb/KBRoot';
import { ArticleView } from '../kb/ArticleView';
import { ArchiveDialog } from '../kb/ArchiveDialog';
import { MoveDialog } from '../kb/MoveDialog';
import { CreateFolderDialog } from '../kb/CreateFolderDialog';
import { DeleteFolderDialog } from '../kb/DeleteFolderDialog';
import { DeleteArticleDialog } from '../kb/DeleteArticleDialog';
import { ChangeVisibilityDialog } from '../kb/ChangeVisibilityDialog';
import { ChangeArticleVisibilityDialog } from '../kb/ChangeArticleVisibilityDialog';
import { CreateArticleDialog } from '../kb/CreateArticleDialog';
import { DEFAULT_FOLDER_COLOR } from '../kb/folder-icons';
import type { FolderAction } from '../kb/FolderTree';
import type { KBArticle, ArticleStatus, KBFolder, Visibility } from '@/types';
import {
  unitTree,
  selectedUnitId as defaultSelectedUnitId,
  getUnitPath,
  contacts,
  addFolder,
  renameFolder,
  deleteFolderTree,
  setFolderVisibility,
  setFolderColor,
  upsertArticle,
  setArticleStatus,
  setArticleContent,
  setArticleTitle,
  setArticleOwner,
  setArticleVisibility,
  saveDraft,
  publishArticle,
  discardDraft,
  moveArticle,
  deleteArticle,
  getEligibleParentFolders,
  getFolder,
  getFolderDepth,
} from '@/data/mock-data';

type ModalState =
  | { type: 'none' }
  | { type: 'view'; article: KBArticle }
  | { type: 'edit'; article: KBArticle };

type DialogState =
  | { type: 'none' }
  | { type: 'archive'; article: KBArticle }
  | { type: 'delete-article'; article: KBArticle }
  | { type: 'move'; article: KBArticle }
  | { type: 'change-article-visibility'; article: KBArticle }
  | { type: 'create-article'; folderId?: string; unitId: string }
  | { type: 'create-folder'; parent: KBFolder | null; isSubFolder: boolean }
  | { type: 'edit-folder'; folder: KBFolder }
  | { type: 'delete-folder'; folder: KBFolder }
  | { type: 'change-folder-visibility'; folder: KBFolder };

type Scope = 'home' | 'unit';

export function AppShell() {
  const [scope, setScope] = useState<Scope>('unit');
  const [selectedUnitId, setSelectedUnitId] = useState(defaultSelectedUnitId);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' });

  const unitPath = getUnitPath(selectedUnitId).map((u) => u.name);

  // Save in edit mode. Routes based on whether the article has ever been
  // published: never-published articles save directly into `content`;
  // published articles save into the draft layer so readers continue to
  // see the published version.
  const handleSaveEdit = useCallback((article: KBArticle, content: string) => {
    const hasHistory = article.versions.length > 0;
    const updated = hasHistory
      ? saveDraft(article.id, content)
      : setArticleContent(article.id, content);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  // Publish in edit mode. Always pushes a new version snapshot, clears
  // the draft layer, and flips status to 'published' if necessary.
  const handlePublishEdit = useCallback(
    (article: KBArticle, content: string) => {
      const updated = publishArticle(article.id, content);
      if (updated) setModal({ type: 'view', article: { ...updated } });
    },
    []
  );

  // Discard pending unpublished changes (from edit-mode button or
  // actions menu). Returns the article to the last published state.
  const handleDiscardDraft = useCallback((article: KBArticle) => {
    const updated = discardDraft(article.id);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  // Stage an older version's content as the active draft and jump
  // straight into edit mode so the user can modify before publishing.
  // Confirmation about overwriting an existing draft is handled in the
  // caller (ArticleView) before this fires.
  const handleRestoreVersion = useCallback(
    (article: KBArticle, content: string) => {
      const updated = saveDraft(article.id, content);
      if (updated) setModal({ type: 'edit', article: { ...updated } });
    },
    []
  );

  const handleStatusChange = useCallback((article: KBArticle, status: ArticleStatus) => {
    if (status === 'archived') {
      setDialog({ type: 'archive', article });
      return;
    }
    const updated = setArticleStatus(article.id, status);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  const handleTitleChange = useCallback((article: KBArticle, title: string) => {
    const updated = setArticleTitle(article.id, title);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  const handleOwnerChange = useCallback((article: KBArticle, ownerId: string) => {
    const updated = setArticleOwner(article.id, ownerId);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  const handleFolderChange = useCallback((article: KBArticle, folderId: string) => {
    const updated = moveArticle(article.id, folderId);
    if (updated) setModal({ type: 'view', article: { ...updated } });
  }, []);

  const handleArticleVisibilityConfirm = useCallback(
    (visibility: KBArticle['visibility']) => {
      if (dialog.type !== 'change-article-visibility') return;
      const updated = setArticleVisibility(dialog.article.id, visibility);
      setDialog({ type: 'none' });
      if (updated) setModal({ type: 'view', article: { ...updated } });
    },
    [dialog]
  );

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
      case 'edit':
        setDialog({ type: 'edit-folder', folder });
        break;
      case 'change-visibility':
        setDialog({ type: 'change-folder-visibility', folder });
        break;
      case 'delete':
        setDialog({ type: 'delete-folder', folder });
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
    (result: {
      name: string;
      parentId: string | null;
      color?: string;
      visibility?: Visibility;
    }) => {
      if (dialog.type !== 'create-folder') return;
      // Pull the latest parent state from the dropdown (not just the dialog's
      // initial parent), so user can switch parent before confirming.
      const parent = result.parentId ? getFolder(result.parentId) ?? null : null;
      const now = new Date().toISOString();
      // Sub-folder inherits color from its parent (which itself inherits from
      // the root, so the chain converges to the root's color).
      const color = parent ? parent.color ?? DEFAULT_FOLDER_COLOR : result.color ?? DEFAULT_FOLDER_COLOR;
      // Visibility from the dialog; default to public for root, or fall back
      // to parent's visibility (which acts as the max allowed).
      const visibility: Visibility =
        result.visibility ?? parent?.visibility ?? 'unit_and_subunits';
      const newFolder: KBFolder = {
        id: `f-new-${Date.now()}`,
        unitId: parent?.unitId ?? selectedUnitId,
        parentFolderId: parent?.id ?? null,
        name: result.name,
        color,
        visibility,
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

  const handleEditFolderConfirm = useCallback(
    (result: { name: string; color?: string }) => {
      if (dialog.type !== 'edit-folder') return;
      const folder = dialog.folder;
      if (result.name && result.name !== folder.name) {
        renameFolder(folder.id, result.name);
      }
      if (result.color && result.color !== folder.color) {
        setFolderColor(folder.id, result.color);
      }
      setDialog({ type: 'none' });
    },
    [dialog]
  );

  const handleDeleteFolderConfirm = useCallback(() => {
    if (dialog.type !== 'delete-folder') return;
    deleteFolderTree(dialog.folder.id);
    setDialog({ type: 'none' });
  }, [dialog]);

  const handleDeleteArticleConfirm = useCallback(() => {
    if (dialog.type !== 'delete-article') return;
    deleteArticle(dialog.article.id);
    setDialog({ type: 'none' });
    setModal({ type: 'none' });
  }, [dialog]);

  const handleVisibilityConfirm = useCallback(
    (visibility: Visibility) => {
      if (dialog.type !== 'change-folder-visibility') return;
      setFolderVisibility(dialog.folder.id, visibility);
      setDialog({ type: 'none' });
    },
    [dialog]
  );

  const handleCreateArticleConfirm = useCallback(
    (data: { title: string; folderId: string; visibility: Visibility }) => {
      if (dialog.type !== 'create-article') return;
      // Article unit follows the chosen folder, not the active unit view —
      // matters in Home scope where the picker may span multiple units.
      const folder = getFolder(data.folderId);
      const articleUnitId = folder?.unitId ?? dialog.unitId;
      const now = new Date().toISOString();
      const newArticle: KBArticle = {
        id: `a-new-${Date.now()}`,
        folderId: data.folderId,
        unitId: articleUnitId,
        title: data.title,
        content: '',
        status: 'draft',
        visibility: data.visibility,
        owner: contacts.oleksii,
        createdBy: contacts.oleksii,
        createdAt: now,
        updatedBy: contacts.oleksii,
        updatedAt: now,
        publishedAt: null,
        draftContent: null,
        draftUpdatedAt: null,
        draftUpdatedBy: null,
        versions: [],
      };
      upsertArticle(newArticle);
      setDialog({ type: 'none' });
      // Jump straight into the editor so the user can write content.
      setModal({ type: 'edit', article: newArticle });
    },
    [dialog]
  );

  const closeModal = useCallback(() => setModal({ type: 'none' }), []);
  const closeDialog = useCallback(() => setDialog({ type: 'none' }), []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafbfc] text-[14px] text-[#1f242e]">
      {scope === 'home' ? (
        <>
          <HomeSidebar onSelectUnits={() => setScope('unit')} />
          <HomeShell
            spaceName={unitTree.name}
            onArticleClick={(article) => setModal({ type: 'view', article })}
            onArticleStatusChange={handleStatusChange}
            onArticleMove={(article) => setDialog({ type: 'move', article })}
            onArticleDelete={(article) => setDialog({ type: 'delete-article', article })}
            onCreateArticle={(folderId, unitId) =>
              setDialog({ type: 'create-article', folderId, unitId })
            }
            onFolderAction={handleFolderAction}
          />
        </>
      ) : (
        <>
          <UnitSidebar
            unitTree={unitTree}
            selectedUnitId={selectedUnitId}
            onSelectUnit={setSelectedUnitId}
            onSelectHome={() => setScope('home')}
          />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
            <TopBar unitPath={unitPath} />
            <TabBar activeTab="kb" />
            <KBRoot
              unitId={selectedUnitId}
              onArticleClick={(article) => setModal({ type: 'view', article })}
              onCreateArticle={(folderId) =>
                setDialog({ type: 'create-article', folderId, unitId: selectedUnitId })
              }
              onCreateFolder={handleCreateRootFolder}
              onCreateSubFolder={handleCreateSubFolder}
              onFolderAction={handleFolderAction}
              onArticleStatusChange={handleStatusChange}
              onArticleMove={(article) => setDialog({ type: 'move', article })}
              onArticleDelete={(article) => setDialog({ type: 'delete-article', article })}
            />
          </div>
        </>
      )}

      {/* Article modals */}
      {(modal.type === 'view' || modal.type === 'edit') && (
        <ArticleView
          article={modal.article}
          mode={modal.type === 'edit' ? 'edit' : 'view'}
          onClose={closeModal}
          onEdit={() => setModal({ type: 'edit', article: modal.article })}
          onEditCancel={() => setModal({ type: 'view', article: modal.article })}
          onSaveEdit={handleSaveEdit}
          onPublishEdit={handlePublishEdit}
          onDiscardDraft={handleDiscardDraft}
          onRestoreVersion={handleRestoreVersion}
          onStatusChange={handleStatusChange}
          onMove={(article) => setDialog({ type: 'move', article })}
          onDelete={(article) => setDialog({ type: 'delete-article', article })}
          onTitleChange={handleTitleChange}
          onOwnerChange={handleOwnerChange}
          onFolderChange={handleFolderChange}
          onChangeVisibility={(article) =>
            setDialog({ type: 'change-article-visibility', article })
          }
        />
      )}
      {/* Article dialogs */}
      {dialog.type === 'create-article' && (
        <CreateArticleDialog
          unitId={dialog.unitId}
          initialFolderId={dialog.folderId}
          onConfirm={handleCreateArticleConfirm}
          onCancel={closeDialog}
        />
      )}
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
        const options = eligibleParents.map((f) => ({
          id: f.id,
          label: f.name,
          depth: getFolderDepth(f.id),
        }));
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
      {dialog.type === 'edit-folder' && (
        <CreateFolderDialog
          mode="edit"
          initialName={dialog.folder.name}
          initialColor={dialog.folder.color}
          showColorPicker={dialog.folder.parentFolderId === null}
          onConfirm={handleEditFolderConfirm}
          onCancel={closeDialog}
        />
      )}
      {dialog.type === 'delete-folder' && (
        <DeleteFolderDialog
          folder={dialog.folder}
          onConfirm={handleDeleteFolderConfirm}
          onCancel={closeDialog}
        />
      )}
      {dialog.type === 'delete-article' && (
        <DeleteArticleDialog
          article={dialog.article}
          onConfirm={handleDeleteArticleConfirm}
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
      {dialog.type === 'change-article-visibility' && (
        <ChangeArticleVisibilityDialog
          article={dialog.article}
          onConfirm={handleArticleVisibilityConfirm}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
