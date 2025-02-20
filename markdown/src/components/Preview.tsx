import React from 'react';
import { Token } from '../utils/MarkdownParser';

interface PreviewProps {
  tokens: Token[];
}

const Preview: React.FC<PreviewProps> = ({ tokens }) => {
  const renderToken = (token: Token, index: number) => {
    switch (token.type) {
      case 'heading': {
        switch (token.level) {
          case 1:
            return <h1 key={index}>{token.content}</h1>;
          case 2:
            return <h2 key={index}>{token.content}</h2>;
          case 3:
            return <h3 key={index}>{token.content}</h3>;
          default:
            return <p key={index}>{token.content}</p>;
        }
      }
      case 'unordered-list':
        return (
          <ul key={index}>
            <li dangerouslySetInnerHTML={{ __html: token.content }} />
          </ul>
        );
      case 'ordered-list':
        return (
          <ol key={index}>
            <li dangerouslySetInnerHTML={{ __html: token.content }} />
          </ol>
        );
      case 'text':
        return <p key={index} dangerouslySetInnerHTML={{ __html: token.content }} />;
      case 'empty':
        return <br key={index} />;
      default:
        return null;
    }
  };

  return (
    <div className="preview" style={{
      padding: '1rem',
      backgroundColor: '#ffffff',
      height: '100%',
      overflow: 'auto'
    }}>
      {tokens.map((token, index) => renderToken(token, index))}
    </div>
  );
};

export default Preview; 