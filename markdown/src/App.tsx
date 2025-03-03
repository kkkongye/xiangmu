import { useState, useMemo, useRef, useEffect } from 'react';
import Preview from './components/Preview';
import { MarkdownParser } from '@your-name/markdown-parser';
import { ContentProvider } from './components/ContentContext';
import './App.css';
import Exporthtml from './components/Exporthtml';

const parser = new MarkdownParser();

function App() {
  const [markdown, setMarkdown] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const tokens = useMemo(() => {
    parser.setText(markdown);
    return parser.parse();
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;

    if (isCtrlOrCmd && event.key === 'b') {
      event.preventDefault();
      wrapSelection('**', '**');
    } else if (isCtrlOrCmd && event.key === 'i') {
      event.preventDefault();
      wrapSelection('*', '*');
    } else if (isCtrlOrCmd && event.key === 'k') {
      event.preventDefault();
      const url = prompt('请输入链接地址:', 'http://');
      if (url) {
        const linkText = selectedText ? `[${selectedText}](${url})` : `[链接](${url})`;
        wrapSelection(linkText, '');
      }
    } else if (isCtrlOrCmd && event.key === 'o') {
      event.preventDefault();
      const lines = selectedText.split('\n');
      const numberedLines = lines.map((line, index) => {
        const match = line.match(/^(\d+)\. /);
        const number = match ? parseInt(match[1], 10) : index + 1;
        return `${number}. ${line.replace(/^\d+\. /, '')}`;
      }).join('\n');
      wrapSelection(numberedLines, '');
    } else if (isCtrlOrCmd && event.key === 'u') {
      event.preventDefault();
      const lines = selectedText.split('\n');
      const bulletLines = lines.map((line) => `- ${line}`).join('\n');
      wrapSelection(bulletLines, '');
    } else if (isCtrlOrCmd && event.key === '1') {
      event.preventDefault();
      wrapSelection('# ', '');
    } else if (isCtrlOrCmd && event.key === '2') {
      event.preventDefault();
      wrapSelection('## ', '');
    } else if (isCtrlOrCmd && event.key === '3') {
      event.preventDefault();
      wrapSelection('### ', '');
    } else if (isCtrlOrCmd && event.key === '4') {
      event.preventDefault();
      wrapSelection('#### ', '');
    } else if (isCtrlOrCmd && event.key === 'q') {
      event.preventDefault();
      wrapSelection('> ', '');
    } else if (isCtrlOrCmd && event.key === 'g') {
      event.preventDefault();
      const imageUrl = prompt('请输入图片地址:', 'http://');
      if (imageUrl) {
        const imageMarkdown = `![图片描述](${imageUrl})`;
        wrapSelection(imageMarkdown, '');
      }
    } else if (event.shiftKey && event.key === '~') {
      event.preventDefault();
      wrapSelection('~~', '~~');
    }
  };

  const wrapSelection = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentValue = textarea.value;

    textarea.value = currentValue.slice(0, start) + prefix + selectedText + suffix + currentValue.slice(end);
    const newStart = start + prefix.length;
    const newEnd = newStart + selectedText.length;
    textarea.setSelectionRange(newStart, newEnd);
    textarea.focus();
    setMarkdown(textarea.value);
  };

  return (
    <ContentProvider>
    <div className="app">
      <div className="container">
        <div className="editor-container">
          <textarea
            ref={textareaRef}
            className="full-height"
            value={markdown}
            onChange={handleChange}
            rows={10}
            cols={50}
            onKeyDown={handleKeyDown}
            disabled={false}
            readOnly={false}
          />
        </div>
        <div className="preview-container">
          <Preview tokens={tokens} />
        </div>
        <div>
          <Exporthtml />
        </div>
      </div>
    </div>
    </ContentProvider>
  );
}

export default App;