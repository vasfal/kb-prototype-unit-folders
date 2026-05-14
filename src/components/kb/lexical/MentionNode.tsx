import { TextNode } from 'lexical';
import type {
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
} from 'lexical';

export interface SerializedMentionNode
  extends Spread<{ mention: string }, SerializedTextNode> {}

/** Inline @mention token. Lives inside a paragraph like a regular text node
 *  but renders as a styled chip and is treated as a single editable unit
 *  (no inserting text inside it). */
export class MentionNode extends TextNode {
  __mention: string;

  static getType(): string {
    return 'mention';
  }

  static clone(node: MentionNode): MentionNode {
    return new MentionNode(node.__mention, node.__text, node.__key);
  }

  constructor(mentionName: string, text?: string, key?: NodeKey) {
    super(text ?? `@${mentionName}`, key);
    this.__mention = mentionName;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.className =
      'inline-flex items-center px-1 py-px text-[#0052a3] bg-[#ebf5ff] rounded font-medium';
    return dom;
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: (el: HTMLElement) => {
        if (!el.hasAttribute('data-mention')) return null;
        return {
          conversion: (n: HTMLElement) => {
            const mention = n.getAttribute('data-mention') ?? n.textContent ?? '';
            return {
              node: new MentionNode(mention, n.textContent ?? `@${mention}`),
            };
          },
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const el = document.createElement('span');
    el.setAttribute('data-mention', this.__mention);
    el.textContent = this.__text;
    return { element: el };
  }

  static importJSON(json: SerializedMentionNode): MentionNode {
    return new MentionNode(json.mention, json.text);
  }

  exportJSON(): SerializedMentionNode {
    return {
      ...super.exportJSON(),
      type: 'mention',
      version: 1,
      mention: this.__mention,
    };
  }

  isTextEntity(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return true;
  }
}

export function $createMentionNode(mentionName: string): MentionNode {
  const node = new MentionNode(mentionName);
  node.setMode('token');
  return node;
}

export function $isMentionNode(
  node: LexicalNode | null | undefined
): node is MentionNode {
  return node instanceof MentionNode;
}
