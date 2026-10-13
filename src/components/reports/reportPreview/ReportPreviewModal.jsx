import React from 'react';
import ReactDOM from 'react-dom';
import { getInitialContent } from './logic/buildReportHtml';

export const ReportPreviewModal = ({ visitDraft, patient, professionalData, onClose }) => {
    const format = (command) => {
        document.execCommand(command, false, null);
        document.getElementById('editor').focus();
    };

    return ReactDOM.createPortal(
        <div className="report-overlay">
            <div className="report-toolbar">
                <button onClick={() => format('bold')} title="Grassetto">
                    <i className="ph-bold ph-text-b"></i>
                </button>
                <button onClick={() => format('italic')} title="Corsivo">
                    <i className="ph-bold ph-text-italic"></i>
                </button>
                <button onClick={() => format('underline')} title="Sottolineato">
                    <i className="ph-bold ph-text-underline"></i>
                </button>
                <button onClick={() => format('insertUnorderedList')} title="Lista">
                    <i className="ph-bold ph-list-bullets"></i>
                </button>
                <div style={{ width: '1px', background: '#444', height: '20px', margin: '0 10px' }}></div>
                <button className="btn-print" onClick={() => window.print()}>
                    <i className="ph-fill ph-printer"></i> Stampa PDF
                </button>
                <button className="btn-close" onClick={onClose}>
                    Chiudi
                </button>
            </div>
            <div className="report-container">
                <div id="report-content-wrapper">
                    <div
                        id="editor"
                        className="paper-sheet"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        dangerouslySetInnerHTML={{ __html: getInitialContent({ patient, professionalData, visitDraft }) }}
                    ></div>
                </div>
            </div>
        </div>,
        document.body
    );
};
