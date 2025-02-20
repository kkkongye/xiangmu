import { Token, InlineToken } from './types';

export class MarkdownParser {
  private text: string;
  private tokens: Token[];
  private currentLine: number;

  constructor(text: string = '') {
    this.text = text;
    this.tokens = [];
    this.currentLine = 0;
  }

  parse(): Token[] {
    this.tokens = [];
    const lines = this.text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      this.currentLine = i;
      const line = lines[i];
      this.parseLine(line);
    }

    return this.tokens;
  }

  private parseLine(line: string): void {
    // 解析标题
    const headingMatch = line.match(/^(#{1,3})\s(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const content = headingMatch[2];
      
      this.tokens.push({
        type: 'heading_open',
        tag: `h${level}`,
        attrs: [
          ['class', 'line'],
          ['data-line', this.currentLine.toString()]
        ],
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 0,
        children: null,
        content: '',
        markup: '#'.repeat(level),
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'inline',
        tag: '',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 0,
        level: 1,
        children: [{
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content,
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        }],
        content,
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      } as InlineToken);

      this.tokens.push({
        type: 'heading_close',
        tag: `h${level}`,
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '#'.repeat(level),
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
      return;
    }

    // 解析无序列表
    const unorderedListMatch = line.match(/^[-*]\s(.+)/);
    if (unorderedListMatch) {
      this.tokens.push({
        type: 'bullet_list_open',
        tag: 'ul',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 0,
        children: null,
        content: '',
        markup: '-',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'list_item_open',
        tag: 'li',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 1,
        children: null,
        content: '',
        markup: '-',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'inline',
        tag: '',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 0,
        level: 2,
        children: [{
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content: unorderedListMatch[1],
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        }],
        content: unorderedListMatch[1],
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      } as InlineToken);

      this.tokens.push({
        type: 'list_item_close',
        tag: 'li',
        attrs: null,
        map: null,
        nesting: -1,
        level: 1,
        children: null,
        content: '',
        markup: '-',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'bullet_list_close',
        tag: 'ul',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '-',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
      return;
    }

    // 解析有序列表
    const orderedListMatch = line.match(/^(\d+)\.\s(.+)/);
    if (orderedListMatch) {
      this.tokens.push({
        type: 'ordered_list_open',
        tag: 'ol',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 0,
        children: null,
        content: '',
        markup: '.',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'list_item_open',
        tag: 'li',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 1,
        children: null,
        content: '',
        markup: '.',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'inline',
        tag: '',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 0,
        level: 2,
        children: [{
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content: orderedListMatch[2],
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        }],
        content: orderedListMatch[2],
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      } as InlineToken);

      this.tokens.push({
        type: 'list_item_close',
        tag: 'li',
        attrs: null,
        map: null,
        nesting: -1,
        level: 1,
        children: null,
        content: '',
        markup: '.',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'ordered_list_close',
        tag: 'ol',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '.',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
      return;
    }

    // 解析普通文本
    if (line.trim()) {
      let content = line;
      
      // 处理加粗和斜体的组合
      content = content.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
      
      // 处理加粗
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // 处理删除线
      content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');
      
      // 处理斜体（单个星号）
      content = content.replace(/(?<!\*)\*(?!\*)([^*]+)\*/g, '<em>$1</em>');

      this.tokens.push({
        type: 'paragraph_open',
        tag: 'p',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 1,
        level: 0,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });

      this.tokens.push({
        type: 'inline',
        tag: '',
        attrs: null,
        map: [this.currentLine, this.currentLine + 1],
        nesting: 0,
        level: 1,
        children: [{
          type: 'text',
          tag: '',
          attrs: null,
          map: null,
          nesting: 0,
          level: 0,
          children: null,
          content,
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        }],
        content,
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      } as InlineToken);

      this.tokens.push({
        type: 'paragraph_close',
        tag: 'p',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
    }
  }

  setText(text: string): void {
    this.text = text;
  }
} 