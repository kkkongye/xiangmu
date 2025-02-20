export interface Position {
  start: number;
  end: number;
}

export type TokenAttrs = Array<[string, string]> | null;

export interface Token {
  type: string;
  tag: string;
  attrs: TokenAttrs;
  map: [number, number] | null;
  nesting: number;
  level: number;
  children: Token[] | null;
  content: string;
  markup: string;
  info: string;
  meta: unknown;
  block: boolean;
  hidden: boolean;
}

export interface InlineToken extends Token {
  children: Token[];
} 