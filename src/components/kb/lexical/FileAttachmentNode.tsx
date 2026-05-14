import { DecoratorNode } from 'lexical';
import { File, ExternalLink } from 'lucide-react';
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

export interface SerializedFileAttachmentNode
  extends Spread<
    { src: string; fileName: string; fileSize: number; fileType: string },
    SerializedLexicalNode
  > {}

/** Non-image file attachment. Stored as a `data:` URL for the prototype.
 *  Serializes to/from an `<a data-file-attachment>` so the HTML round-trip
 *  preserves the metadata. */
export class FileAttachmentNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __fileName: string;
  __fileSize: number;
  __fileType: string;

  static getType(): string {
    return 'file-attachment';
  }

  static clone(node: FileAttachmentNode): FileAttachmentNode {
    return new FileAttachmentNode(
      node.__src,
      node.__fileName,
      node.__fileSize,
      node.__fileType,
      node.__key
    );
  }

  constructor(
    src: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__fileName = fileName;
    this.__fileSize = fileSize;
    this.__fileType = fileType;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    void _config;
    const div = document.createElement('div');
    div.className = 'my-2';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactNode {
    return (
      <FileAttachmentChip
        src={this.__src}
        fileName={this.__fileName}
        fileSize={this.__fileSize}
        fileType={this.__fileType}
      />
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (el: HTMLElement) => {
        if (!el.hasAttribute('data-file-attachment')) return null;
        return {
          conversion: (n: HTMLElement) => {
            const a = n as HTMLAnchorElement;
            const src = a.getAttribute('href') ?? '';
            const fileName =
              a.getAttribute('data-file-name') ?? a.textContent ?? 'file';
            const fileSize = parseInt(
              a.getAttribute('data-file-size') ?? '0',
              10
            );
            const fileType = a.getAttribute('data-file-type') ?? '';
            return {
              node: new FileAttachmentNode(src, fileName, fileSize, fileType),
            };
          },
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const a = document.createElement('a');
    a.setAttribute('href', this.__src);
    a.setAttribute('download', this.__fileName);
    a.setAttribute('data-file-attachment', 'true');
    a.setAttribute('data-file-name', this.__fileName);
    a.setAttribute('data-file-size', String(this.__fileSize));
    a.setAttribute('data-file-type', this.__fileType);
    a.textContent = this.__fileName;
    return { element: a };
  }

  static importJSON(json: SerializedFileAttachmentNode): FileAttachmentNode {
    return new FileAttachmentNode(
      json.src,
      json.fileName,
      json.fileSize,
      json.fileType
    );
  }

  exportJSON(): SerializedFileAttachmentNode {
    return {
      type: 'file-attachment',
      version: 1,
      src: this.__src,
      fileName: this.__fileName,
      fileSize: this.__fileSize,
      fileType: this.__fileType,
    };
  }
}

export function $createFileAttachmentNode(
  src: string,
  fileName: string,
  fileSize: number,
  fileType: string
): FileAttachmentNode {
  return new FileAttachmentNode(src, fileName, fileSize, fileType);
}

export function $isFileAttachmentNode(
  node: LexicalNode | null | undefined
): node is FileAttachmentNode {
  return node instanceof FileAttachmentNode;
}

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileAttachmentChip({
  src,
  fileName,
  fileSize,
  fileType,
}: {
  src: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}) {
  const ext = fileType.split('/').pop()?.toUpperCase() ?? '';

  /** Open the file in a new tab via the browser's built-in viewer.
   *  Chromium blocks top-level navigation to `data:` URLs as a security
   *  measure (see crbug.com/805551). To work around it we convert the
   *  data URL into a `blob:` URL on click and open that instead. The blob
   *  URL is revoked when the viewer tab closes (via the page lifecycle). */
  const handleOpen = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      // Revoke after a delay so the new tab has time to load the URL.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      if (!win) {
        // Pop-up was blocked — fall back to a normal link click.
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
      }
    } catch (err) {
      console.error('[file-attachment] open failed', err);
    }
  };

  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleOpen}
      className="inline-flex items-center gap-2.5 max-w-full px-3 py-2 bg-[#fafbfc] border border-[#e0e4eb] rounded-lg hover:bg-[#f5f7fa] text-left no-underline cursor-pointer"
      title={`Open ${fileName} in a new tab`}
    >
      <span className="flex items-center justify-center w-9 h-9 rounded-md bg-[#ebf5ff] shrink-0">
        <File className="w-5 h-5 text-[#006bd6]" />
      </span>
      <span className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-[#1f242e] truncate">
          {fileName}
        </span>
        <span className="text-[11px] text-[#697a9b]">
          {ext ? `${ext} · ` : ''}
          {formatBytes(fileSize)}
        </span>
      </span>
      <ExternalLink className="w-3.5 h-3.5 text-[#697a9b] shrink-0" />
    </a>
  );
}
