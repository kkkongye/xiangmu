import React, { useMemo } from 'react';
import { Token } from '@your-name/markdown-parser';

interface PreviewProps {
  tokens: Token[];
}

const Preview: React.FC<PreviewProps> = ({ tokens }) => {
  const renderedContent = useMemo(() => {
    const result: React.ReactNode[] = [];
    let skipUntil = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (i <= skipUntil) continue;

      const token = tokens[i];
      switch (token.type) {
        case 'heading_open': {
          // 查找对应的inline和close token
          const inlineToken = tokens[i + 1];
          if (inlineToken?.type === 'inline') {
            const level = parseInt(token.tag.charAt(1));
            switch (level) {
              case 1:
                result.push(<h1 key={`heading-${i}`}>{inlineToken.content}</h1>);
                break;
              case 2:
                result.push(<h2 key={`heading-${i}`}>{inlineToken.content}</h2>);
                break;
              case 3:
                result.push(<h3 key={`heading-${i}`}>{inlineToken.content}</h3>);
                break;
              default:
                result.push(<p key={`heading-${i}`}>{inlineToken.content}</p>);
            }
            skipUntil = i + 2; // 跳过inline和close token
          }
          break;
        }
        case 'bullet_list_open':
        case 'ordered_list_open': {
          const listItems: React.ReactNode[] = [];
          let j = i + 1;
          
          while (j < tokens.length && 
                 tokens[j].type !== 'bullet_list_close' && 
                 tokens[j].type !== 'ordered_list_close') {
            if (tokens[j].type === 'list_item_open') {
              const inlineToken = tokens[j + 1];
              if (inlineToken?.type === 'inline') {
                listItems.push(
                  <li key={`item-${j}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
                );
                // 跳过到list_item_close
                while (j < tokens.length && tokens[j].type !== 'list_item_close') {
                  j++;
                }
              }
            }
            j++;
          }
          
          result.push(
            token.type === 'bullet_list_open' 
              ? <ul key={`list-${i}`}>{listItems}</ul>
              : <ol key={`list-${i}`}>{listItems}</ol>
          );
          skipUntil = j;
          break;
        }
        case 'paragraph_open': {
          const inlineToken = tokens[i + 1];
          if (inlineToken?.type === 'inline') {
            result.push(
              <p key={`p-${i}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
            );
            skipUntil = i + 2; // 跳过inline和close token
          }
          break;
        }
      }
    }
    return result;
  }, [tokens]);

  return (
    <div className="preview" style={{
      padding: '1rem',
      backgroundColor: '#ffffff',
      height: '100%',
      overflow: 'auto'
    }}>
      {renderedContent}
    </div>
  );
};

export default Preview; 