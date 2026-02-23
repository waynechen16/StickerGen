import React, { ChangeEvent } from 'react';

interface ControlPanelProps {
  lang: 'en' | 'zh';
  onUpload: (file: File) => void;
  tolerance: number;
  onToleranceChange: (val: number) => void;
  thickness: number;
  onThicknessChange: (val: number) => void;
  mergeGap: number;
  onMergeGapChange: (val: number) => void;
  onReset: () => void;
  onDownload: () => void;
  hasImage: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  lang,
  onUpload,
  tolerance,
  onToleranceChange,
  thickness,
  onThicknessChange,
  mergeGap,
  onMergeGapChange,
  onReset,
  onDownload,
  hasImage,
}) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <aside className="sidebar">
      <h2>StickerGen</h2>
      <p style={{ marginBottom: '24px' }}>
        {lang === 'en' ? 'Remove background & add white outline.' : '一鍵去背並加上白邊，輕鬆產生貼紙效果。'}
      </p>

      <div className="input-group file-upload-wrapper">
        <label>{lang === 'en' ? 'Upload Image' : '上傳圖片'}</label>
        <button className="upload-button" type="button">
          {lang === 'en' ? 'Click or Drag Image Here' : '點擊或拖曳圖片至此'}
          <br /><small>(JPG, PNG, WebP)</small>
        </button>
        <input 
          type="file" 
          accept="image/jpeg, image/png, image/webp" 
          onChange={handleFileChange} 
        />
      </div>

      <div className="input-group">
        <label>
          {lang === 'en' ? 'Tolerance' : '色彩容差 (Tolerance)'} <span>{tolerance}</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={tolerance} 
          onChange={(e) => onToleranceChange(Number(e.target.value))}
          disabled={!hasImage}
        />
      </div>

      <div className="input-group">
        <label>
          {lang === 'en' ? 'Outline Thickness' : '白邊厚度 (Thickness)'} <span>{thickness}px</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="50" 
          value={thickness} 
          onChange={(e) => onThicknessChange(Number(e.target.value))}
          disabled={!hasImage}
        />
      </div>

      <div className="input-group" style={{ marginBottom: '32px' }}>
        <label>
          {lang === 'en' ? 'Merge Gap (Bridge)' : '填平空隙 (Merge Gap)'} <span>{mergeGap}px</span>
        </label>
        <input 
          type="range" 
          min="0" 
          max="150" 
          value={mergeGap} 
          onChange={(e) => onMergeGapChange(Number(e.target.value))}
          disabled={!hasImage}
          title={lang === 'en' 
            ? "Fills gaps between disconnected sticker pieces without increasing the outer outline thickness."
            : "有效橋接圖形間散落的區塊，不影響外層白邊厚度。"}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', width: '100%' }}>
        <button 
          className="btn-primary" 
          style={{ 
            backgroundColor: 'transparent', 
            borderColor: 'var(--border-color)', 
            color: 'var(--text-primary)' 
          }}
          onClick={onReset}
          disabled={!hasImage}
        >
          {lang === 'en' ? 'Reset' : '回復'}
        </button>
        <button 
          className="btn-primary" 
          style={{ flex: 1 }}
          onClick={onDownload}
          disabled={!hasImage}
        >
          {lang === 'en' ? 'Download Sticker' : '下載 (Download)'}
        </button>
      </div>

      <div className="instruction-panel">
        <strong>{lang === 'en' ? 'How to use:' : '使用方式：'}</strong>
        <ul>
          <li>{lang === 'en' ? 'Upload your image' : '上傳您的原始圖檔'}</li>
          <li>{lang === 'en' ? 'Click the preview to pick the background color to remove' : '點擊右側預覽圖中的背景，選擇要去背的顏色'}</li>
          <li>{lang === 'en' ? 'Adjust tolerance to clean the edges' : '調整「色彩容差」確保邊緣去背乾淨'}</li>
          <li>{lang === 'en' ? 'Adjust thickness for the white outline' : '拉動「白邊厚度」或「填平空隙」微調結果'}</li>
        </ul>
      </div>
    </aside>
  );
};
