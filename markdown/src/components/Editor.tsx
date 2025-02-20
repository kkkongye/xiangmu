import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <div className="editor">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="请输入Markdown文本..."
        style={{
          width: '100%',
          height: '100%',
          padding: '1rem',
          border: 'none',
          resize: 'none',
          outline: 'none',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: '#f5f5f5'
        }}
      />
    </div>
  );
};

export default Editor; 