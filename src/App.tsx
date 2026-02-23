
import { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { PreviewArea } from './components/PreviewArea';
import { useImageProcessor } from './hooks/useImageProcessor';

function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  const {
    state,
    uploadImage,
    setTolerance,
    setThickness,
    setMergeGap,
    pickColor,
    reset,
    downloadImage
  } = useImageProcessor();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/logo.png" alt="StickerGen Logo" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <h1 style={{ margin: 0 }}>StickerGen</h1>
        </div>
        <button 
          onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')}
          style={{ 
            background: 'transparent', border: '1px solid var(--border-color)', 
            borderRadius: '16px', cursor: 'pointer', fontSize: '0.9rem', 
            color: 'var(--text-primary)', padding: '4px 12px', display: 'flex', 
            alignItems: 'center', gap: '6px'
          }}
          title={lang === 'en' ? '切換至繁體中文' : 'Switch to English'}
        >
          🌍 {lang === 'en' ? 'EN' : '繁中'}
        </button>
      </header>
      <div className="app-main" style={{ flex: 1 }}>
        <ControlPanel 
          lang={lang}
          onUpload={uploadImage}
          tolerance={state.tolerance}
          onToleranceChange={setTolerance}
          thickness={state.thickness}
          onThicknessChange={setThickness}
          mergeGap={state.mergeGap}
          onMergeGapChange={setMergeGap}
          onReset={reset}
          onDownload={downloadImage}
          hasImage={!!state.imageFile}
        />
        <PreviewArea 
          processedDataUrl={state.processedDataUrl}
          onColorPick={pickColor}
          isProcessing={state.isProcessing}
        />
      </div>
      <footer style={{ 
        textAlign: 'center', padding: '16px', color: 'var(--text-secondary)', 
        fontSize: '0.8rem', borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        {lang === 'en' ? 'Version v1.0.0 | Disclaimer: Images are processed entirely locally in your browser and are not uploaded to any server.' : '版本 v1.0.0 | 免責聲明：本工具純屬本機安全運行，所有的影像處理皆在您的瀏覽器端完成，絕不會上傳或儲存任何圖片。'}
      </footer>
    </div>
  );
}

export default App;
