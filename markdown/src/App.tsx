import { useState, useMemo } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { MarkdownParser } from '@your-name/markdown-parser'
import './App.css'

const parser = new MarkdownParser();

function App() {
  const [markdown, setMarkdown] = useState('');

  const tokens = useMemo(() => {
    parser.setText(markdown);
    return parser.parse();
  }, [markdown]);

  return (
    <div className="app">
      <div className="container">
        <div className="editor-container">
          <Editor value={markdown} onChange={setMarkdown} />
        </div>
        <div className="preview-container">
          <Preview tokens={tokens} />
        </div>
      </div>
    </div>
  )
}

export default App
