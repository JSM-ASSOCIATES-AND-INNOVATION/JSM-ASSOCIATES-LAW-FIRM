import React, { useState, useEffect, Component } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, Mail, Phone, Calendar, Trash2, Eye, Clock, User, Download } from "lucide-react";

// 🚨 IMPORT THE NEW CSS FILE
import "../../styles/admin/AdminApplications.css";

// 🛡️ 1. THE ERROR BOUNDARY (Prevents the Blank Screen)
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="admin-apps-error-screen">
                    <h1>🚨 Component Crashed</h1>
                    <p>Take a screenshot of this red box and show it to me:</p>
                    <div className="error-box">
                        <h3>{this.state.error?.toString()}</h3>
                        <pre>{this.state.errorInfo?.componentStack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// 🛡️ 2. SAFE TEXT HELPER
const safeText = (text, fallback = "N/A") => {
    if (text === null || text === undefined || text === "") return fallback;
    return String(text);
};

// 3. THE MAIN COMPONENT
const AdminApplicationsContent = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    const loadInbox = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/applications");
            if (res.data && Array.isArray(res.data)) {
                const valid = res.data.filter(app => app && typeof app === 'object' && app._id);
                setApplications(valid);
            } else {
                setApplications([]);
            }
        } catch (error) {
            console.error("Error loading apps:", error);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        loadInbox();
    }, []);

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5001/api/applications/${id}/status`, { status: newStatus });
            setApplications(prev => prev.map(app =>
                app._id === id ? { ...app, status: newStatus } : app
            ));
            if (selectedApp && selectedApp._id === id) {
                setSelectedApp(prev => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            alert("Failed to update status.");
        }
    };

    const deleteApp = async (id) => {
        if (!window.confirm("Delete this application permanently?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/applications/${id}`);
            setApplications(prev => prev.filter(app => app._id !== id));
            setSelectedApp(null);
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    // 🛡️ SAFELY OPEN PDF (Handles both new URL system & legacy Base64)
    const viewPDF = (fileData) => {
        if (!fileData || fileData.trim() === "") {
            alert("No document attached to this application.");
            return;
        }

        // NEW SYSTEM: If it's a backend URL, just open it!
        if (fileData.startsWith("http") || fileData.startsWith("/")) {
            window.open(fileData, '_blank');
            return;
        }

        // LEGACY SYSTEM: Handle old Base64 strings
        try {
            const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
            const byteCharacters = atob(base64Data);
            const byteArray = new Uint8Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteArray[i] = byteCharacters.charCodeAt(i);
            }
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (err) {
            alert("The file is corrupted or too large and cannot be opened.");
            console.error(err);
        }
    };

    const newCount = applications.filter(a => a && a.status === 'New').length;
    const totalCount = applications.length;

    return (
        <div className="admin-apps-root">

            {/* VIEW 1: INBOX */}
            {!selectedApp && (
                <div className="admin-apps-container">
                    <div className="admin-apps-header">
                        <div className="header-title-group">
                            <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
                                <ArrowLeft size={16} /> Hub
                            </button>
                            <FileText size={32} className="header-icon" />
                            <h1 className="header-title">Career Inbox</h1>
                        </div>
                        <div className="apps-stats">
                            <span className="stat-badge new-badge">{newCount} New</span>
                            <span className="stat-badge total-badge">{totalCount} Total</span>
                        </div>
                    </div>

                    {loading && (
                        <div className="admin-empty-state">
                            <h3>Loading Inbox...</h3>
                        </div>
                    )}

                    {!loading && applications.length === 0 && (
                        <div className="admin-empty-state">
                            <FileText size={48} className="empty-icon" />
                            <h3>No Applications Yet</h3>
                        </div>
                    )}

                    {!loading && applications.length > 0 && (
                        <div className="apps-grid">
                            {applications.map((app) => (
                                <div key={app._id} className={`app-card ${app.status === 'New' ? 'app-card-new' : ''}`}>

                                    <div className="app-card-date">
                                        <Calendar size={12} /> {safeText(app.date)}
                                    </div>

                                    <div className="app-card-center">
                                        <div className="app-avatar">
                                            <User size={24} />
                                        </div>
                                        <h3 className="app-name">{safeText(app.fullName, "Unknown")}</h3>
                                        <p className="app-role">{safeText(app.disputeType, "General")}</p>
                                        <div className="app-id-badge">ID: {safeText(app.trackingId)}</div>
                                    </div>

                                    <div className="app-status-wrapper">
                                        <select
                                            value={app.status || "New"}
                                            onChange={(e) => updateStatus(app._id, e.target.value)}
                                            className="app-status-select"
                                        >
                                            <option value="New">New</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="In Consideration">In Consideration</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </div>

                                    <div className="app-card-actions">
                                        <button className="app-view-btn" onClick={() => setSelectedApp(app)}>
                                            <Eye size={16} /> View Profile
                                        </button>
                                        <button className="app-delete-btn" onClick={() => deleteApp(app._id)} aria-label="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: PROFILE DETAILS & PDF DOWNLOAD */}
            {selectedApp && (
                <div className="admin-app-details-container">

                    <button className="admin-back-btn details-back" onClick={() => setSelectedApp(null)}>
                        <ArrowLeft size={16} /> Back to Inbox
                    </button>

                    <div className="app-details-card">
                        <div className="details-header">
                            <span className="details-ref-badge">Ref: {safeText(selectedApp.trackingId)}</span>
                            <h2 className="details-name">{safeText(selectedApp.fullName, "Unknown")}</h2>
                            <p className="details-role">{safeText(selectedApp.disputeType)}</p>
                        </div>

                        <div className="details-meta-box">
                            <div className="meta-item">
                                <Mail size={16} className="meta-icon" /> {safeText(selectedApp.email)}
                            </div>
                            <div className="meta-item">
                                <Phone size={16} className="meta-icon" /> {safeText(selectedApp.phoneNumber)}
                            </div>
                            <div className="meta-item">
                                <Clock size={16} className="meta-icon" /> {safeText(selectedApp.date)}
                            </div>
                        </div>

                        <div className="details-cover-letter">
                            <h3>Cover Letter</h3>
                            <p>{safeText(selectedApp.coverLetter, "No cover letter provided.")}</p>
                        </div>

                        <div className="details-actions">
                            <button className="doc-download-btn" onClick={() => viewPDF(selectedApp.cv)}>
                                <Download size={20} /> Open CV in New Tab
                            </button>

                            {selectedApp.researchSample && (
                                <button className="doc-download-btn secondary-doc" onClick={() => viewPDF(selectedApp.researchSample)}>
                                    <Download size={20} /> Research Sample
                                </button>
                            )}

                            <button className="details-delete-btn" onClick={() => deleteApp(selectedApp._id)}>
                                <Trash2 size={16} /> Delete Application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminApplications() {
    return (
        <ErrorBoundary>
            <AdminApplicationsContent />
        </ErrorBoundary>
    );
}