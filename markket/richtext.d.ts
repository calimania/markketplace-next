export type RichTextMarkType = 'bold' | 'italic' | 'underline' | 'code' | 'strike';

export interface RichTextMark {
  type: RichTextMarkType;
}

export interface RichTextTextNode {
  type: 'text';
  text: string;
  marks?: RichTextMark[];
}

export interface RichTextLinkNode {
  type: 'link';
  attrs?: {
    href?: string;
    target?: string;
    rel?: string;
  };
  content?: RichTextTextNode[];
}

export interface RichTextParagraphNode {
  type: 'paragraph';
  content?: Array<RichTextTextNode | RichTextLinkNode>;
}

export interface RichTextHeadingNode {
  type: 'heading';
  attrs?: {
    level?: number;
  };
  content?: Array<RichTextTextNode | RichTextLinkNode>;
}

export interface RichTextListItemNode {
  type: 'listItem';
  content?: RichTextParagraphNode[];
}

export interface RichTextBulletListNode {
  type: 'bulletList';
  content?: RichTextListItemNode[];
}

export interface RichTextOrderedListNode {
  type: 'orderedList';
  content?: RichTextListItemNode[];
}

export interface RichTextBlockquoteNode {
  type: 'blockquote';
  content?: RichTextParagraphNode[];
}

export interface RichTextCodeBlockNode {
  type: 'codeBlock';
  attrs?: {
    language?: string;
  };
  content?: RichTextTextNode[];
}

export interface RichTextImageNode {
  type: 'image';
  attrs?: {
    src?: string;
    alt?: string;
    title?: string;
  };
}

export type TiptapNode =
  | RichTextParagraphNode
  | RichTextHeadingNode
  | RichTextBulletListNode
  | RichTextOrderedListNode
  | RichTextBlockquoteNode
  | RichTextCodeBlockNode
  | RichTextImageNode;

export interface TiptapDoc {
  type: 'doc';
  content: TiptapNode[];
}

export interface StrapiBlockTextChild {
  type: 'text';
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface StrapiBlockLinkChild {
  type: 'link';
  url: string;
  children: StrapiBlockTextChild[];
}

export type RichTextBlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'list-item'
  | 'image'
  | 'link'
  | 'quote'
  | 'blockquote'
  | 'code'
  | 'codeBlock'
  | 'bullet-list'
  | 'ordered-list';

export interface StrapiBlock {
  type: RichTextBlockType;
  level?: number;
  format?: 'ordered' | 'unordered';
  url?: string;
  image?: {
    url?: string;
    alternativeText?: string;
    width?: number;
    height?: number;
    name?: string;
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    provider?: string;
    createdAt?: string;
    updatedAt?: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  };
  children?: Array<StrapiBlockTextChild | StrapiBlockLinkChild>;
  [key: string]: unknown;
}

export type RichTextValue = string | TiptapDoc | StrapiBlock[];

export type StoredRichText = string | null | undefined;
