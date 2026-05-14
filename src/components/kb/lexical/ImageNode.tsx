import { useEffect, useRef, useState } from 'react';
import { DecoratorNode, $getNodeByKey } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';

export interface SerializedImageNode
  extends Spread<
    { src: string; alt: string; width: number | null },
    SerializedLexicalNode
  > {}

/** Inline image node. Round-trips through HTML via importDOM/exportDOM, stores
 *  an optional explicit `width` (in pixels) set by the in-document resize
 *  handle. Rendered via React's decorator API. */
export class ImageNode extends DecoratorNode<React.ReactNode> {
  __src: string;
  __alt: string;
  __width: number | null;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__width, node.__key);
  }

  constructor(src: string, alt = '', width: number | null = null, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
  }

  setWidth(width: number | null): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  // The Lexical-managed wrapper element — content lives in the decorator below.
  createDOM(_config: EditorConfig): HTMLElement {
    void _config;
    const span = document.createElement('span');
    span.className = 'inline-block max-w-full my-2';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactNode {
    return (
      <LexicalImageComponent
        nodeKey={this.__key}
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
      />
    );
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (el: HTMLElement) => {
          const img = el as HTMLImageElement;
          const src = img.getAttribute('src') ?? '';
          const alt = img.getAttribute('alt') ?? '';
          // Width might be inline style or width attribute.
          let width: number | null = null;
          const widthAttr = img.getAttribute('width');
          if (widthAttr) {
            const n = parseInt(widthAttr, 10);
            if (!Number.isNaN(n)) width = n;
          }
          const inlineWidth = img.style?.width;
          if (!width && inlineWidth) {
            const n = parseInt(inlineWidth, 10);
            if (!Number.isNaN(n)) width = n;
          }
          return { node: new ImageNode(src, alt, width) };
        },
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('img');
    el.setAttribute('src', this.__src);
    if (this.__alt) el.setAttribute('alt', this.__alt);
    if (this.__width) el.setAttribute('width', String(this.__width));
    return { element: el };
  }

  static importJSON(json: SerializedImageNode): ImageNode {
    return new ImageNode(json.src, json.alt, json.width);
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
    };
  }
}

export function $createImageNode(src: string, alt = ''): ImageNode {
  return new ImageNode(src, alt, null);
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}

// ── Decorator React component ────────────────────────────────────────────

function LexicalImageComponent({
  nodeKey,
  src,
  alt,
  width,
}: {
  nodeKey: NodeKey;
  src: string;
  alt: string;
  width: number | null;
}) {
  const [editor] = useLexicalComposerContext();
  const [editable, setEditable] = useState(editor.isEditable());
  const imgRef = useRef<HTMLImageElement>(null);
  const [localWidth, setLocalWidth] = useState<number | null>(width);

  useEffect(() => {
    return editor.registerEditableListener((e) => setEditable(e));
  }, [editor]);

  // If the node's width changes externally (undo/redo), refresh local mirror.
  useEffect(() => {
    setLocalWidth(width);
  }, [width]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const startX = e.clientX;
    const startWidth = img.offsetWidth;

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      // Clamp between 60px and the natural image / container max.
      const next = Math.max(60, startWidth + delta);
      setLocalWidth(next);
    };

    const onUp = (ev: MouseEvent) => {
      const delta = ev.clientX - startX;
      const next = Math.max(60, startWidth + delta);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // Persist the width onto the node.
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          node.setWidth(next);
        }
      });
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const style = localWidth ? { width: `${localWidth}px` } : undefined;

  return (
    <span className="relative inline-block max-w-full align-middle">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        style={style}
        className="max-w-full h-auto rounded-md block"
        loading="lazy"
        draggable={false}
      />
      {editable && (
        <span
          role="presentation"
          onMouseDown={handleResizeStart}
          className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#006bd6] border-2 border-white rounded-sm cursor-se-resize shadow-[0_0_0_1px_rgba(0,0,0,0.1)]"
          title="Drag to resize"
        />
      )}
    </span>
  );
}
