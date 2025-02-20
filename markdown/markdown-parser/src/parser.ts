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
    let inList = false;
    let listType: 'bullet' | 'ordered' | null = null;

    for (let i = 0; i < lines.length; i++) {
      this.currentLine = i;
      const line = lines[i].trim();
      
      if (!line) {
        if (inList) {
          // 结束当前列表
          this.tokens.push({
            type: `${listType}_list_close`,
            tag: listType === 'bullet' ? 'ul' : 'ol',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: listType === 'bullet' ? '-' : '.',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inList = false;
          listType = null;
        }
        continue;
      }

      // 解析标题
      const headingMatch = line.match(/^(#{1,3})\s(.+)/);
      if (headingMatch) {
        if (inList) {
          // 结束之前的列表
          this.tokens.push({
            type: `${listType}_list_close`,
            tag: listType === 'bullet' ? 'ul' : 'ol',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: listType === 'bullet' ? '-' : '.',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inList = false;
          listType = null;
        }

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
        continue;
      }

      // 解析无序列表
      const unorderedListMatch = line.match(/^[-*]\s(.+)/);
      if (unorderedListMatch) {
        if (!inList || listType !== 'bullet') {
          if (inList) {
            // 结束之前的列表
            this.tokens.push({
              type: `${listType}_list_close`,
              tag: listType === 'bullet' ? 'ul' : 'ol',
              attrs: null,
              map: null,
              nesting: -1,
              level: 0,
              children: null,
              content: '',
              markup: listType === 'bullet' ? '-' : '.',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });
          }
          // 开始新的无序列表
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
          inList = true;
          listType = 'bullet';
        }

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

        let content = unorderedListMatch[1];
        // 处理内联样式
        content = this.processInlineStyles(content);

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
        continue;
      }

      // 解析有序列表
      const orderedListMatch = line.match(/^(\d+)\.\s(.+)/);
      if (orderedListMatch) {
        if (!inList || listType !== 'ordered') {
          if (inList) {
            // 结束之前的列表
            this.tokens.push({
              type: `${listType}_list_close`,
              tag: listType === 'bullet' ? 'ul' : 'ol',
              attrs: null,
              map: null,
              nesting: -1,
              level: 0,
              children: null,
              content: '',
              markup: listType === 'bullet' ? '-' : '.',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });
          }
          // 开始新的有序列表
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
          inList = true;
          listType = 'ordered';
        }

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

        let content = orderedListMatch[2];
        // 处理内联样式
        content = this.processInlineStyles(content);

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
        continue;
      }

      // 解析普通文本
      if (inList) {
        // 结束之前的列表
        this.tokens.push({
          type: `${listType}_list_close`,
          tag: listType === 'bullet' ? 'ul' : 'ol',
          attrs: null,
          map: null,
          nesting: -1,
          level: 0,
          children: null,
          content: '',
          markup: listType === 'bullet' ? '-' : '.',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
        inList = false;
        listType = null;
      }

      let content = line;
      content = this.processInlineStyles(content);

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

    // 如果文档结束时还在列表中，关闭列表
    if (inList) {
      this.tokens.push({
        type: `${listType}_list_close`,
        tag: listType === 'bullet' ? 'ul' : 'ol',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: listType === 'bullet' ? '-' : '.',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
    }

    return this.tokens;
  }

  private processInlineStyles(text: string): string {
    let result = text;
    
    // 处理加粗和斜体的组合
    result = result.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    
    // 处理加粗
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理删除线
    result = result.replace(/~~(.*?)~~/g, '<del>$1</del>');
    
    // 处理斜体（单个星号）
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return result;
  }

  setText(text: string): void {
    this.text = text;
  }
} 