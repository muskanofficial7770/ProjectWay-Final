import React, { useState, useEffect } from 'react';
import '../styles/FileViewer.css';

const FileViewer = ({ file, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increased timeout to 8 seconds for larger files (up to 10MB)
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return 'picture_as_pdf';
    if (fileType.includes('image')) return 'image';
    if (fileType.includes('doc') || fileType.includes('word')) return 'description';
    return 'insert_drive_file';
  };

  const handleDownloadFile = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileContent = () => {
    if (file.type.includes('image')) {
      return (
        <div className="file-viewer-image">
          <img 
            src={file.data} 
            alt={file.name}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      );
    }

    if (file.type.includes('pdf')) {
      return (
        <div className="file-viewer-pdf">
          <iframe 
            src={file.data}
            title={file.name}
            onLoad={() => setLoading(false)}
            onError={() => setLoading(false)}
          />
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="file-viewer-info">
        <div className="file-info-icon">
          <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
        </div>
        <h3>{file.name}</h3>
        <div className="file-details">
          <p><strong>Size:</strong> {file.size}</p>
          <p><strong>Type:</strong> {file.type}</p>
          <p><strong>Uploaded:</strong> {new Date(file.uploadDate).toLocaleString()}</p>
          {file.announcement && file.announcement !== 'No announcement' && (
            <p><strong>Announcement:</strong> {file.announcement}</p>
          )}
        </div>
        <div className="file-message">
          <p>This file type cannot be previewed. Please download it to view the content.</p>
          <button className="download-btn" onClick={handleDownloadFile}>
            <span className="material-symbols-outlined">download</span>
            Download File
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="file-viewer-overlay">
      <div className="file-viewer-modal">
        <div className="file-viewer-header">
          <div className="file-viewer-title">
            <span className="material-symbols-outlined">{getFileIcon(file.type)}</span>
            <span>{file.name}</span>
          </div>
          <button className="file-viewer-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="file-viewer-content">
          {loading && (
            <div className="file-viewer-loading">
              <div className="loading-spinner"></div>
              <p>Loading file...</p>
            </div>
          )}
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;
