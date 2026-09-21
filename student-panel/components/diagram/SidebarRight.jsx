import React from 'react';
import { getEffectiveLineStyle } from '../../constants';
import '../../styles/diagram-editor-main.css';

export const SidebarRight = ({ selectedShape, onUpdateShape, onDelete, onDuplicate }) => {
  if (!selectedShape) {
    return (
      <aside className="sidebar-right">
          <div className="sidebar-header">
            <div className="sidebar-tabs">
                <button className="sidebar-tab active">Properties</button>
            </div>
          </div>
          <div className="sidebar-right-empty">
             <span className="material-symbols-outlined sidebar-right-empty-icon">touch_app</span>
             <p className="sidebar-right-empty-text">Select a shape to edit properties</p>
          </div>
      </aside>
    );
  }

  const toHexColorOr = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const v = value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v) || /^#[0-9a-fA-F]{3}$/.test(v)) return v;
    return fallback;
  };

  const handleChange = (key, value) => {
    let parsedValue = value;
    if (key === 'width' || key === 'height' || key === 'x' || key === 'y' || key === 'strokeWidth' || key === 'fontSize') {
        parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) parsedValue = 0;
    }
    
    // Handle connector scaling for height/width changes
    if (isConnector && (key === 'height' || key === 'width') && selectedShape.routePoints) {
      // Keep connectors visually fixed while resizing from sidebar:
      // anchor + normalize using the routePoints bounding box (not center, not current width/height).
      const xs0 = selectedShape.routePoints.map((p) => p.x);
      const ys0 = selectedShape.routePoints.map((p) => p.y);
      const minX0 = Math.min(...xs0);
      const maxX0 = Math.max(...xs0);
      const minY0 = Math.min(...ys0);
      const maxY0 = Math.max(...ys0);

      const bboxW0 = Math.max(1, maxX0 - minX0);
      const bboxH0 = Math.max(1, maxY0 - minY0);

      const nextW = key === 'width' ? Math.max(20, parsedValue) : Math.max(20, selectedShape.width);
      const nextH = key === 'height' ? Math.max(20, parsedValue) : Math.max(20, selectedShape.height);

      const scaleX = key === 'width' ? nextW / bboxW0 : 1;
      const scaleY = key === 'height' ? nextH / bboxH0 : 1;

      const scaledRoutePoints = selectedShape.routePoints.map((p) => ({
        x: minX0 + (p.x - minX0) * scaleX,
        y: minY0 + (p.y - minY0) * scaleY,
      }));

      onUpdateShape({
        // Ensure ShapeRenderer normalization stays stable (prevents the perceived "shift").
        x: minX0,
        y: minY0,
        width: nextW,
        height: nextH,
        routePoints: scaledRoutePoints,
        strokeWidth: selectedShape.strokeWidth || 2, // Maintain constant stroke width
      });
    } else {
      onUpdateShape({ [key]: parsedValue });
    }
  };

  const isConnector =
    selectedShape.type.startsWith('arrow') ||
    [
      'association',
      'aggregation',
      'composition',
      'inheritance',
      'dependency',
      'dotted-arrow',
      'erd-one-to-one',
      'erd-one-to-many',
      'erd-one-and-only-one',
      'erd-one-or-more',
      'erd-zero-or-one',
      'erd-zero-or-many',
    ].includes(selectedShape.type);

  return (
    <aside className="sidebar-right">
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button className="sidebar-tab active">Properties</button>
        </div>
      </div>

      <div className="sidebar-right-content">
        <div className="sidebar-properties">
          
          {/* FILL */}
          <div className="property-section">
            <h4 className="property-title">Fill</h4>
            <div className="property-group">
              <input 
                type="color" 
                value={toHexColorOr(selectedShape.fill, '#ffffff')} 
                onChange={(e) => handleChange('fill', e.target.value)}
                className="property-color-input"
              />
              <div className="property-color-info">
                <p className="property-color-label">Color</p>
                <p className="property-color-value">{selectedShape.fill}</p>
              </div>
            </div>
          </div>

          {/* STROKE */}
          <div className="property-section">
            <h4 className="property-title">Stroke</h4>
            <div className="property-group">
               <input 
                type="color" 
                value={toHexColorOr(selectedShape.stroke, '#000000')} 
                onChange={(e) => handleChange('stroke', e.target.value)}
                className="property-color-input"
              />
              <div className="property-color-info">
                <p className="property-color-label">Color</p>
                <p className="property-color-value">{selectedShape.stroke}</p>
              </div>
            </div>
          </div>

          {/* LINE END SYMBOL (for connectors) */}
          {isConnector && (
            <div className="property-section">
              <h4 className="property-title">Line</h4>
              <select
                className="property-select"
                value={getEffectiveLineStyle(selectedShape)}
                onChange={(e) => handleChange('lineStyle', e.target.value)}
              >
                <option value="solid">Solid</option>
                <option value="fine-dashed">Fine dashed</option>
                <option value="medium-dashed">Medium dashed</option>
                <option value="long-dashed">Long dashed</option>
                <option value="double-dashed">Double dashed</option>
                <option value="dash-dot">Dash–dot</option>
                <option value="dense-dotted">Dense dotted</option>
                <option value="double-dotted">Double dotted</option>
                <option value="square-dotted">Square dotted</option>
                <option value="spaced-dotted">Spaced dotted</option>
              </select>
              <p className="property-description">Stroke pattern for arrows and ERD connectors.</p>

              <h4 className="property-title">Left Hand Symbol</h4>
              <select
                className="property-select"
                value={selectedShape.startMarker ?? 'default'}
                onChange={(e) => handleChange('startMarker', e.target.value)}
              >
                <option value="default">Default (by line type)</option>
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="open-arrow">Open Arrow</option>
                <option value="triangle">Triangle</option>
                <option value="open-triangle">Open Triangle</option>
                <option value="diamond">Diamond (Hollow)</option>
                <option value="filled-diamond">Diamond (Filled)</option>
                <option value="circle">Circle</option>
                <option value="bar">Bar</option>
                <option value="double-bar">Double Bar</option>
                <option value="crowfoot">Crowfoot</option>
                <option value="circle-crowfoot">Circle + Crowfoot</option>
                <option value="x">X</option>
                <option value="dot">Dot</option>
              </select>
              <p className="property-description">Applies symbol to left-side endpoint of selected line.</p>

              <h4 className="property-title">Right End Symbol</h4>
              <select
                className="property-select"
                value={selectedShape.endMarker ?? 'default'}
                onChange={(e) => handleChange('endMarker', e.target.value)}
              >
                <option value="default">Default (by line type)</option>
                <option value="none">None</option>
                <option value="arrow">Arrow</option>
                <option value="open-arrow">Open Arrow</option>
                <option value="triangle">Triangle</option>
                <option value="open-triangle">Open Triangle</option>
                <option value="diamond">Diamond (Hollow)</option>
                <option value="filled-diamond">Diamond (Filled)</option>
                <option value="circle">Circle</option>
                <option value="bar">Bar</option>
                <option value="double-bar">Double Bar</option>
                <option value="crowfoot">Crowfoot</option>
                <option value="circle-crowfoot">Circle + Crowfoot</option>
                <option value="x">X</option>
                <option value="dot">Dot</option>
              </select>
              <p className="property-description">Applies symbol to right-side endpoint of selected line.</p>
            </div>
          )}

          {/* TEXT */}
          <div className="property-section">
            <h4 className="property-title">Text</h4>
            {selectedShape.type === 'uml-class' ? (
              <div className="uml-class-section">
                <div>
                  <label className="property-label uml-class-field">Class Name</label>
                  <input 
                    className="property-input" 
                    type="text"
                    value={selectedShape.text.split('\n')[0] || ''}
                    onChange={(e) => {
                      const lines = selectedShape.text.split('\n');
                      lines[0] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="ClassName"
                  />
                </div>
                <div>
                  <label className="property-label uml-class-field">Attributes</label>
                  <textarea 
                    className="property-textarea"
                    rows={3}
                    value={selectedShape.text.split('\n')[1] || ''}
                    onChange={(e) => {
                      const lines = selectedShape.text.split('\n');
                      lines[1] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="+attribute: type&#10;-privateAttr: type&#10;#protectedAttr: type"
                  />
                </div>
                <div>
                  <label className="property-label uml-class-field">Methods</label>
                  <textarea 
                    className="property-textarea"
                    rows={3}
                    value={selectedShape.text.split('\n')[2] || ''}
                    onChange={(e) => {
                      const lines = selectedShape.text.split('\n');
                      lines[2] = e.target.value;
                      handleChange('text', lines.join('\n'));
                    }}
                    placeholder="+method(): type&#10;-privateMethod(): void&#10;#protectedMethod(): string"
                  />
                </div>
              </div>
            ) : (
              <div className="property-section">
                <textarea 
                    className="property-textarea"
                    rows={2}
                    value={selectedShape.text}
                    onChange={(e) => handleChange('text', e.target.value)}
                    placeholder="Enter text..."
                />
            </div>
            )}
            <div className="property-font-grid">
              <div>
                <label className="property-label">Font</label>
                <select 
                    className="property-select"
                    value={selectedShape.fontFamily}
                    onChange={(e) => handleChange('fontFamily', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Arial">Arial</option>
                  <option value="Courier New">Courier</option>
                  <option value="Times New Roman">Times</option>
                </select>
              </div>
              <div>
                <label className="property-label">Size</label>
                 <div className="property-input-wrapper">
                    <input 
                        className="property-input" 
                        type="number" 
                        value={selectedShape.fontSize}
                        onChange={(e) => handleChange('fontSize', e.target.value)}
                    />
                    <span className="property-input-suffix">px</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIMENSIONS */}
          <div className="property-section">
            <h4 className="property-title">Dimensions</h4>
            <div className="transform-grid">
              <div>
                <label className="property-label">Width</label>
                <input 
                    className="property-input" 
                    type="number" 
                    value={selectedShape.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                />
              </div>
              <div>
                <label className="property-label">Height</label>
                <input 
                    className="property-input" 
                    type="number" 
                    value={selectedShape.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="sidebar-right-footer">
        <div className="sidebar-right-actions">
          <button onClick={onDuplicate} className="sidebar-right-action-button">
            <span className="material-symbols-outlined sidebar-right-action-icon">content_copy</span>
            <span className="sidebar-right-action-text">Duplicate</span>
          </button>
          <button onClick={onDelete} className="sidebar-right-action-button delete">
            <span className="material-symbols-outlined sidebar-right-action-icon">delete</span>
            <span className="sidebar-right-action-text">Delete</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
