export interface Token {
  type: string;
  content: string;
  level?: number;
}

export class MarkdownParser {
  private text: string;

  constructor(text: string = '') {
    this.text = text;
  }

  parse(): Token[] {
    const lines = this.text.split('\n');
    const tokens: Token[] = [];

    for (const line of lines) {
      // 解析标题
      const headingMatch = line.match(/^(#{1,3})\s(.+)/);
      if (headingMatch) {
        tokens.push({
          type: 'heading',
          content: headingMatch[2],
          level: headingMatch[1].length
        });
        continue;
      }

      // 解析无序列表
      const unorderedListMatch = line.match(/^[-*]\s(.+)/);
      if (unorderedListMatch) {
        tokens.push({
          type: 'unordered-list',
          content: unorderedListMatch[1]
        });
        continue;
      }

      // 解析有序列表
      const orderedListMatch = line.match(/^\d+\.\s(.+)/);
      if (orderedListMatch) {
        tokens.push({
          type: 'ordered-list',
          content: orderedListMatch[1]
        });
        continue;
      }

      // 解析普通文本，包括加粗、斜体和删除线
      if (line.trim()) {
        let content = line;
        // 解析加粗
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 解析斜体
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // 解析删除线
        content = content.replace(/~~(.*?)~~/g, '<del>$1</del>');

        tokens.push({
          type: 'text',
          content: content
        });
      } else {
        tokens.push({
          type: 'empty',
          content: ''
        });
      }
    }

    return tokens;
  }

  setText(text: string) {
    this.text = text;
  }
} 