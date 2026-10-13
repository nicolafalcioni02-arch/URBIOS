import React from 'react';
import { MiniReportChart } from '../../../ui/MiniReportChart';

export const SavedReportsArchive = ({ deleteReport, dietDays, savedReports }) => {
    return (
        savedReports.length > 0 && (
            <div className="saved-reports-section" style={{ marginTop: '50px', paddingBottom: '60px' }}>
                <div style={{ marginBottom: '25px', borderBottom: '2px solid #E5E5EA', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#1D1D1F' }}>Archivio Report Clinici</span>
                </div>
                <div className="reports-grid">
                    {savedReports.map((report) => {
                        const hasComment = report.config.comment && report.config.comment.trim() !== '';
                        return (
                            <div key={report.id} className={`report-card ${hasComment ? 'double' : ''}`}>
                                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div className="report-card-header">
                                        <div>
                                            <h4 className="report-card-title">{report.dayTitle}</h4>
                                            <span className="report-card-subtitle">
                                                Data: {report.date} • {report.config.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <button className="btn-delete-report no-print" onClick={() => deleteReport(report.id)}>
                                            ✕
                                        </button>
                                    </div>
                                    <MiniReportChart report={report} allDays={dietDays} />
                                </div>
                                {hasComment && (
                                    <div className="report-comment-box">
                                        <span
                                            style={{
                                                display: 'block',
                                                fontSize: '10px',
                                                color: '#00C853',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                marginBottom: '8px',
                                                letterSpacing: '0.5px',
                                            }}
                                        >
                                            Note Cliniche
                                        </span>
                                        {report.config.comment}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        )
    );
};
