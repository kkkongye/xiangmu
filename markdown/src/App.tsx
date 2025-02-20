import { useState } from 'react'
import Editor from './components/Editor'
import Preview from './components/Preview'
import { MarkdownParser } from './utils/MarkdownParser'
import './App.css'

const parser = new MarkdownParser();

function App() {
  const [markdown, setMarkdown] = useState('');

  const handleChange = (value: string) => {
    setMarkdown(value);
    parser.setText(value);
  };

  return (
    <div className="app">
      <div className="container">
        <div className="editor-container">
          <Editor value={markdown} onChange={handleChange} />
        </div>
        <div className="preview-container">
          <Preview tokens={parser.parse()} />
        </div>
      </div>
    </div>
  )
}

export default App
