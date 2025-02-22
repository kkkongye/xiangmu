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
    let inBlockquote = false;

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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        continue;
      }

      // 解析水平线
      if (line.match(/^[-*]{3,}$/)) {
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        this.tokens.push({
          type: 'hr',
          tag: 'hr',
          attrs: null,
          map: [this.currentLine, this.currentLine + 1],
          nesting: 0,
          level: 0,
          children: null,
          content: '',
          markup: line[0],
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
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

      // 解析引用
      if (line.startsWith('>')) {
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        if (!inBlockquote) {
          // 开始引用
          this.tokens.push({
            type: 'blockquote_open',
            tag: 'blockquote',
            attrs: null,
            map: [this.currentLine, this.currentLine + 1],
            nesting: 1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = true;
        }

        const content = line.slice(1).trim();
        this.tokens.push({
          type: 'paragraph_open',
          tag: 'p',
          attrs: null,
          map: [this.currentLine, this.currentLine + 1],
          nesting: 1,
          level: 1,
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
          type: 'paragraph_close',
          tag: 'p',
          attrs: null,
          map: null,
          nesting: -1,
          level: 1,
          children: null,
          content: '',
          markup: '',
          info: '',
          meta: null,
          block: true,
          hidden: false
        });
        continue;
      }

      // 解析链接
      const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        const text = linkMatch[1];
        const url = linkMatch[2];

        this.tokens.push({
          type: 'inline',
          tag: 'a',
          attrs: [['href', url]],
          map: [this.currentLine, this.currentLine + 1],
          nesting: 0,
          level: 0,
          children: [{
            type: 'text',
            tag: '',
            attrs: null,
            map: null,
            nesting: 0,
            level: 0,
            children: null,
            content: text,
            markup: '',
            info: '',
            meta: null,
            block: false,
            hidden: false
          }],
          content: text,
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        } as InlineToken);
        continue;
      }

      // 解析图片
      const imageMatch = line.match(/!\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (imageMatch) {
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        const altText = imageMatch[1];
        const imageUrl = imageMatch[2];

        this.tokens.push({
          type: 'inline',
          tag: 'img',
          attrs: [['src', imageUrl], ['alt', altText]],
          map: [this.currentLine, this.currentLine + 1],
          nesting: 0,
          level: 0,
          children: null,
          content: '',
          markup: '',
          info: '',
          meta: null,
          block: false,
          hidden: false
        });
        continue;
      }

      // 解析表格
      if (line.startsWith('|')) {
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
        if (inBlockquote) {
          // 结束引用
          this.tokens.push({
            type: 'blockquote_close',
            tag: 'blockquote',
            attrs: null,
            map: null,
            nesting: -1,
            level: 0,
            children: null,
            content: '',
            markup: '>',
            info: '',
            meta: null,
            block: true,
            hidden: false
          });
          inBlockquote = false;
        }
        const tableRows = [];
        let j = i;
        while (j < lines.length && lines[j].startsWith('|')) {
          if (lines[j].trim() !== '|') { // 过滤空行
            tableRows.push(lines[j]);
          }
          j++;
        }

        if (tableRows.length >= 2) {
          const headerRow = tableRows[0];
          const separatorRow = tableRows[1];
          const dataRows = tableRows.slice(2);

          // 解析表头
          const headers = headerRow.split('|').map(cell => cell.trim()).filter(cell => cell);
          const separators = separatorRow.split('|').map(cell => cell.trim()).filter(cell => cell);

          if (headers.length === separators.length) {
            // 开始表格
            this.tokens.push({
              type: 'table_open',
              tag: 'table',
              attrs: null,
              map: [this.currentLine, this.currentLine + tableRows.length],
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

            // 表头
            this.tokens.push({
              type: 'thead_open',
              tag: 'thead',
              attrs: null,
              map: [this.currentLine, this.currentLine + 1],
              nesting: 1,
              level: 1,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            this.tokens.push({
              type: 'tr_open',
              tag: 'tr',
              attrs: null,
              map: [this.currentLine, this.currentLine + 1],
              nesting: 1,
              level: 2,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            headers.forEach(header => {
              this.tokens.push({
                type: 'th_open',
                tag: 'th',
                attrs: null,
                map: [this.currentLine, this.currentLine + 1],
                nesting: 1,
                level: 3,
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
                level: 4,
                children: [{
                  type: 'text',
                  tag: '',
                  attrs: null,
                  map: null,
                  nesting: 0,
                  level: 0,
                  children: null,
                  content: header,
                  markup: '',
                  info: '',
                  meta: null,
                  block: false,
                  hidden: false
                }],
                content: header,
                markup: '',
                info: '',
                meta: null,
                block: true,
                hidden: false
              } as InlineToken);

              this.tokens.push({
                type: 'th_close',
                tag: 'th',
                attrs: null,
                map: null,
                nesting: -1,
                level: 3,
                children: null,
                content: '',
                markup: '',
                info: '',
                meta: null,
                block: true,
                hidden: false
              });
            });

            this.tokens.push({
              type: 'tr_close',
              tag: 'tr',
              attrs: null,
              map: null,
              nesting: -1,
              level: 2,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            this.tokens.push({
              type: 'thead_close',
              tag: 'thead',
              attrs: null,
              map: null,
              nesting: -1,
              level: 1,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            // 表体
            this.tokens.push({
              type: 'tbody_open',
              tag: 'tbody',
              attrs: null,
              map: [this.currentLine + 2, this.currentLine + tableRows.length],
              nesting: 1,
              level: 1,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            dataRows.forEach(row => {
              const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);

              this.tokens.push({
                type: 'tr_open',
                tag: 'tr',
                attrs: null,
                map: [this.currentLine, this.currentLine + 1],
                nesting: 1,
                level: 2,
                children: null,
                content: '',
                markup: '',
                info: '',
                meta: null,
                block: true,
                hidden: false
              });

              cells.forEach(cell => {
                this.tokens.push({
                  type: 'td_open',
                  tag: 'td',
                  attrs: null,
                  map: [this.currentLine, this.currentLine + 1],
                  nesting: 1,
                  level: 3,
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
                  level: 4,
                  children: [{
                    type: 'text',
                    tag: '',
                    attrs: null,
                    map: null,
                    nesting: 0,
                    level: 0,
                    children: null,
                    content: cell,
                    markup: '',
                    info: '',
                    meta: null,
                    block: false,
                    hidden: false
                  }],
                  content: cell,
                  markup: '',
                  info: '',
                  meta: null,
                  block: true,
                  hidden: false
                } as InlineToken);

                this.tokens.push({
                  type: 'td_close',
                  tag: 'td',
                  attrs: null,
                  map: null,
                  nesting: -1,
                  level: 3,
                  children: null,
                  content: '',
                  markup: '',
                  info: '',
                  meta: null,
                  block: true,
                  hidden: false
                });
              });

              this.tokens.push({
                type: 'tr_close',
                tag: 'tr',
                attrs: null,
                map: null,
                nesting: -1,
                level: 2,
                children: null,
                content: '',
                markup: '',
                info: '',
                meta: null,
                block: true,
                hidden: false
              });
            });

            this.tokens.push({
              type: 'tbody_close',
              tag: 'tbody',
              attrs: null,
              map: null,
              nesting: -1,
              level: 1,
              children: null,
              content: '',
              markup: '',
              info: '',
              meta: null,
              block: true,
              hidden: false
            });

            // 结束表格
            this.tokens.push({
              type: 'table_close',
              tag: 'table',
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

            i = j - 1; // 跳过已处理的行
            continue;
          }
        }
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

      // 默认解析为段落
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
    if (inBlockquote) {
      // 结束引用
      this.tokens.push({
        type: 'blockquote_close',
        tag: 'blockquote',
        attrs: null,
        map: null,
        nesting: -1,
        level: 0,
        children: null,
        content: '',
        markup: '>',
        info: '',
        meta: null,
        block: true,
        hidden: false
      });
      inBlockquote = false;
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