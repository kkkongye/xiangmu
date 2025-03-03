// ExportDisplay.tsx
import React from 'react';
import { exportHTML, exportPDF } from './exportUtils'; // 导入导出功能
import { useContent } from './ContentContext'; // 引入 context
import '../App.css';

const Exporthtml: React.FC = () => {
  const { content } = useContent(); // 获取 content

  const handleExportHTML = () => {
    exportHTML(content); // 调用导出为 HTML 的函数
  };

  const handleExportPDF = () => {
    exportPDF(content); // 调用导出为 PDF 的函数
  };

  return (
    <div>
      {/* 显示 content */}
      {/* <h3>渲染的内容：</h3>
      <div dangerouslySetInnerHTML={{ __html: content }} /> */}
      
      {/* 导出按钮 */}
      {/* 上下排列的按钮容器 */}
      <div className="export-buttons-container">
        <button className="button" onClick={handleExportHTML}>导出为HTML</button>
        <button className="button" onClick={handleExportPDF}>导出为PDF</button>
      </div>
      <div>
        <h3>快捷键</h3> <br />
        加粗 CTRL+B <br />
        斜体 CTRL+I <br />
        插入链接 CTRL+K <br />
        插入照片 CTRL+G <br />
        有序列表 CTRL+O <br />
        无序列表 CTRL+U <br />
        一级 二级 三级标题 CTRL+1 2 3 <br />
        引用 CTRL+Q <br />
        删除线 SHIFT+~ <br />
      </div>
    </div>
    );
};
export default Exporthtml;