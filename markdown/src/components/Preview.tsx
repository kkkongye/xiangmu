import React, { useMemo } from 'react';
import { Token } from '@your-name/markdown-parser';
import { useContent } from './ContentContext'; // 引入 context

interface PreviewProps {
  tokens: Token[];
}

const Preview: React.FC<PreviewProps> = ({ tokens }) => {
  const { setContent } = useContent(); // 获取 setContent 方法
  const renderedContent = useMemo(() => {
    const result: React.ReactNode[] = [];
    let skipUntil = -1;

    for (let i = 0; i < tokens.length; i++) {
      if (i <= skipUntil) continue;

      const token = tokens[i];
      switch (token.type) {
        case 'heading_open': {
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
            skipUntil = i + 2;
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
          skipUntil = j; // 跳过列表的 close token
          break;
        }
        case 'paragraph_open': {
          const inlineToken = tokens[i + 1];
          if (inlineToken?.type === 'inline') {
            result.push(
              <p key={`p-${i}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
            );
            skipUntil = i + 2;
          }
          break;
        }
        case 'inline': {
          // 处理内联元素（链接和图片）
          if (token.tag === 'a') {
            // 链接
            const href = token.attrs?.find(attr => attr[0] === 'href')?.[1] || '';
            result.push(
              <a key={`link-${i}`} href={href} dangerouslySetInnerHTML={{ __html: token.content }} />
              
            );
            <br />
          } else if (token.tag === 'img') {
            // 图片
            const src = token.attrs?.find(attr => attr[0] === 'src')?.[1] || '';
            const alt = token.attrs?.find(attr => attr[0] === 'alt')?.[1] || '';
            result.push(
              <img key={`img-${i}`} src={src} alt={alt} />
            );
            <br />
          }
          break;
        }
        case 'blockquote_open': {
          const inlineToken = tokens[i + 1];
          if (inlineToken?.type === 'inline') {
            result.push(
              <blockquote key={`blockquote-${i}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
            );
            skipUntil = i + 2;
          }
          break;
        }
        case 'hr': {
          result.push(<hr key={`hr-${i}`} />);
          break;
        }
        case 'table_open': {
          const rows: React.ReactNode[] = [];
          let j = i + 1;

          // 处理 thead（如果有）
          if (tokens[j]?.type === 'thead_open') {
            j++;
            const headerCells: React.ReactNode[] = [];
            while (j < tokens.length && tokens[j].type !== 'thead_close') {
              if (tokens[j].type === 'th_open') {
                const inlineToken = tokens[j + 1];
                if (inlineToken?.type === 'inline') {
                  headerCells.push(
                    <th key={`th-${j}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
                  );
                  while (j < tokens.length && tokens[j].type !== 'th_close') {
                    j++;
                  }
                }
              }
              j++;
            }
            rows.push(<tr key={`thead-${j}`}>{headerCells}</tr>);
            j++; // 跳过 thead_close
          }

          // 处理 tbody
          if (tokens[j]?.type === 'tbody_open') {
            j++;
            while (j < tokens.length && tokens[j].type !== 'tbody_close') {
              if (tokens[j].type === 'tr_open') {
                const cells: React.ReactNode[] = [];
                j++;
                while (j < tokens.length && tokens[j].type !== 'tr_close') {
                  if (tokens[j].type === 'td_open') {
                    const inlineToken = tokens[j + 1];
                    if (inlineToken?.type === 'inline') {
                      cells.push(
                        <td key={`td-${j}`} dangerouslySetInnerHTML={{ __html: inlineToken.content }} />
                      );
                      while (j < tokens.length && tokens[j].type !== 'td_close') {
                        j++;
                      }
                    }
                  }
                  j++;
                }
                rows.push(<tr key={`row-${j}`}>{cells}</tr>);
              } else {
                j++;
              }
            }
            j++; // 跳过 tbody_close
          }

          result.push(
            <table key={`table-${i}`}>
              <thead>{rows.filter((_, index) => index === 0)}</thead>
              <tbody>{rows.filter((_, index) => index !== 0)}</tbody>
            </table>
          );
          skipUntil = j;
          break;
        }
        default: {
          // 处理未识别的 token 类型
          if (token.content) {
            result.push(<p key={`unknown-${i}`}>{token.content}</p>);
          }
          break;
        }
      }
    }
    return result;
    
  }, [tokens]);
  setContent(document.querySelector('.preview')?.innerHTML || '');
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