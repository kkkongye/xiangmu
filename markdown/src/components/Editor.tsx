import React, { useRef, useEffect } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  useEffect(() => {
    if (!textareaRef.current) return;

    const handleKeyDown = (event: KeyboardEvent) => {
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
        wrapSelection('_', '_');
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
        const numberedLines = lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
        wrapSelection(numberedLines, '');
      } else if (isCtrlOrCmd && event.key === 'u') {
        event.preventDefault();
        const lines = selectedText.split('\n');
        const bulletLines = lines.map((line) => `- ${line}`).join('\n');
        wrapSelection(bulletLines, '');
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
      textarea.selectionStart = textarea.selectionEnd = start + prefix.length + selectedText.length + suffix.length;
      textarea.focus();
      onChange(textarea.value);
    };

    const textarea = textareaRef.current;
    textarea.addEventListener('keydown', handleKeyDown);

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown);
    };
  }, [onChange]);

  return (
    <textarea
      ref={textareaRef}
      rows={10}
      cols={50}
      value={value}
      onChange={handleChange}
    />
  );
};

export default Editor; 