import React from 'react';
import { MiniReportChart } from '../../../ui/MiniReportChart';

export const SavedReportsArchive = ({ deleteReport, dietDays, savedReports }) => {
    return (
        savedReports.length > 0 && (
            <div className="saved-reports-section" style={{ marginTop: '50px', paddingBottom: '60px' }}>
                <div style={{ marginBottom: '25px', borderBottom: '2px solid #E6E4DE', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 800, color: '#121317' }}>Archivio Report Clinici</span>
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
                                                color: '#1F8A5B',
                                                fontWeight: 800,
                                                textTransform: '',
                                                marginBottom: '8px',
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
