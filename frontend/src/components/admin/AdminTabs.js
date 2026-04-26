import React, { useState, useEffect } from "react";
import {
    Edit3, Clock, FileText, User, RefreshCw, Search, Filter
} from "lucide-react";

// 🚨 IMPORT THE NEW DEDICATED CSS
import "../../styles/admin/AdminTabs.css";

const API_BASE_URL = "http://localhost:5001/api";

// ==========================================
// 1. SUBMISSIONS HUB
// ==========================================
export const SubmissionsHub = ({ onEdit }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("All");

    const [journalSettings, setJournalSettings] = useState({ currentVolume: "01", currentIssue: "01" });
    const [showRolloverModal, setShowRolloverModal] = useState(false);
    const [nextIssueOption, setNextIssueOption] = useState("issue");
    const [isRollingOver, setIsRollingOver] = useState(false);
    const [manualVol, setManualVol] = useState("");
    const [manualIss, setManualIss] = useState("");

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [subRes, setRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/submissions`),
                    fetch(`${API_BASE_URL}/settings/journal`)
                ]);
                if (subRes.ok) setSubmissions(await subRes.json());
                if (setRes.ok) {
                    const settings = await setRes.json();
                    setJournalSettings(settings);
                    setManualVol(settings.currentVolume);
                    setManualIss(settings.currentIssue);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const handleStatusChange = async (submissionId, newStatus) => {
        setUpdatingId(submissionId);
        try {
            const res = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setSubmissions(prev => prev.map(sub => sub.id === submissionId ? { ...sub, status: newStatus } : sub));
            }
        } catch (err) {
            alert("❌ Network error.");
        } finally {
            setUpdatingId(null);
        }
    };

    const currentVolInt = parseInt(journalSettings.currentVolume, 10) || 1;
    const currentIssInt = parseInt(journalSettings.currentIssue, 10) || 1;
    const formatNum = (num) => num < 10 ? `0${num}` : `${num}`;

    const optionNextIssue = { vol: formatNum(currentVolInt), iss: formatNum(currentIssInt + 1) };
    const optionNextVolume = { vol: formatNum(currentVolInt + 1), iss: "01" };

    const handleRolloverSubmit = async () => {
        setIsRollingOver(true);

        if (nextIssueOption === "manual") {
            try {
                const res = await fetch(`${API_BASE_URL}/settings/journal`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentVolume: manualVol, currentIssue: manualIss })
                });
                if (res.ok) {
                    alert(`✅ Manual Override Applied! System is now on Vol ${manualVol}, Issue ${manualIss}.`);
                    setJournalSettings({ currentVolume: manualVol, currentIssue: manualIss });
                    setShowRolloverModal(false);
                } else {
                    alert("❌ Backend failed to save new numbers.");
                }
            } catch (err) {
                alert("❌ Network error.");
            }
        } else {
            const target = nextIssueOption === "issue" ? optionNextIssue : optionNextVolume;
            try {
                const res = await fetch(`${API_BASE_URL}/settings/rollover`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newVolume: target.vol, newIssue: target.iss })
                });
                if (res.ok) {
                    alert(`✅ Issue Rolled Over! System is now on Vol ${target.vol}, Issue ${target.iss}.`);
                    window.location.reload();
                } else {
                    alert("❌ Backend failed to complete rollover.");
                }
            } catch (err) {
                alert("❌ Network error.");
            }
        }
        setIsRollingOver(false);
    };

    const filteredSubmissions = submissions.filter(sub => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            (sub.title && sub.title.toLowerCase().includes(searchLower)) ||
            (sub.fullName && sub.fullName.toLowerCase().includes(searchLower)) ||
            (sub.id && sub.id.toLowerCase().includes(searchLower));

        const matchesCat = filterCategory === "All" || sub.publishCategory === filterCategory;

        return matchesSearch && matchesCat;
    });

    if (loading) return <div className="admin-tab-content"><div className="admin-empty-state"><h3>Connecting to database...</h3></div></div>;

    return (
        <div className="admin-tab-content">

            {/* Global Placement Banner */}
            <div className="glass-card placement-banner">
                <div className="placement-info">
                    <h2>Current Global Placement</h2>
                    <p>Volume <strong>{journalSettings.currentVolume}</strong> • Issue <strong>{journalSettings.currentIssue}</strong></p>
                </div>
                <button className="rollover-trigger-btn" onClick={() => setShowRolloverModal(true)}>
                    <RefreshCw size={16} /> Archive & Start New Issue
                </button>
            </div>

            {/* Rollover Modal */}
            {showRolloverModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-box">
                        <h2 className="modal-title">Issue Management</h2>

                        <div className="modal-options-group">
                            <label className={`modal-option ${nextIssueOption === 'issue' ? 'active' : ''}`}>
                                <input type="radio" checked={nextIssueOption === "issue"} onChange={() => setNextIssueOption("issue")} />
                                <div className="option-text">
                                    <strong>Auto: Next Issue in Same Volume</strong>
                                    <span>Archives current papers, moves to Vol {optionNextIssue.vol}, Issue {optionNextIssue.iss}</span>
                                </div>
                            </label>

                            <label className={`modal-option ${nextIssueOption === 'volume' ? 'active' : ''}`}>
                                <input type="radio" checked={nextIssueOption === "volume"} onChange={() => setNextIssueOption("volume")} />
                                <div className="option-text">
                                    <strong>Auto: Start Completely New Volume</strong>
                                    <span>Archives current papers, moves to Vol {optionNextVolume.vol}, Issue {optionNextVolume.iss}</span>
                                </div>
                            </label>

                            <label className={`modal-option ${nextIssueOption === 'manual' ? 'active' : ''}`}>
                                <input type="radio" checked={nextIssueOption === "manual"} onChange={() => setNextIssueOption("manual")} />
                                <div className="option-text">
                                    <strong>Manual Override</strong>
                                    <span>Force global placement numbers without archiving any papers.</span>

                                    {nextIssueOption === "manual" && (
                                        <div className="manual-inputs">
                                            <div className="manual-input-group">
                                                <label>Volume</label>
                                                <input type="text" value={manualVol} onChange={e => setManualVol(e.target.value)} className="admin-input" />
                                            </div>
                                            <div className="manual-input-group">
                                                <label>Issue</label>
                                                <input type="text" value={manualIss} onChange={e => setManualIss(e.target.value)} className="admin-input" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowRolloverModal(false)} className="cancel-btn">Cancel</button>
                            <button onClick={handleRolloverSubmit} disabled={isRollingOver} className="primary-btn">
                                {isRollingOver ? "Processing..." : "Confirm Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dashboard Header */}
            <header className="dash-header">
                <div className="dash-header-titles">
                    <h1>Manuscript Submissions</h1>
                    <p>Live tracking and editorial review management.</p>
                </div>
                <div className="stats-box">
                    <div className="stat"><span>Incoming</span><strong>{submissions.length}</strong></div>
                    <div className="stat"><span>Published</span><strong className="text-amber">{submissions.filter(s => s.status && s.status.includes("Published")).length}</strong></div>
                </div>
            </header>

            {/* Search & Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input type="text" placeholder="Search by ID, Title, or Author..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="admin-input search-input" />
                </div>
                <div className="filter-box">
                    <Filter size={16} className="filter-icon" />
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-select">
                        <option value="All">All Papers</option>
                        <option value="Current">Current Issue Only</option>
                        <option value="Archive">Archived Only (Old Volumes)</option>
                    </select>
                </div>
            </div>

            {/* Submissions Grid */}
            <div className="submissions-grid">
                {filteredSubmissions.length === 0 ? (
                    <div className="admin-empty-state grid-full">
                        <FileText size={48} className="empty-icon" />
                        <p>No papers match your search or filter.</p>
                    </div>
                ) : (
                    filteredSubmissions.map((sub) => (
                        <div key={sub.id} className="submission-card">
                            <div className="sub-card-header">
                                <span className="id-badge">{sub.id}</span>
                                <span className="sub-date"><Clock size={12} /> {new Date(sub.submittedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="sub-card-body">
                                <h3 className="sub-title" title={sub.title}>{sub.title}</h3>
                                <p className="sub-author"><User size={14} /> {sub.fullName}</p>
                                {sub.status === "Published" && (
                                    <span className={`publish-badge ${sub.publishCategory === 'Archive' ? 'archive-badge' : 'current-badge'}`}>
                                        {sub.publishCategory === 'Archive' ? `ARCHIVE (Vol ${sub.volume})` : 'CURRENT ISSUE'}
                                    </span>
                                )}
                            </div>

                            <div className="sub-card-footer">
                                <div className="quick-status-update">
                                    <select value={sub.status || "Screening"} onChange={(e) => handleStatusChange(sub.id, e.target.value)} disabled={updatingId === sub.id} className="inline-status-drop">
                                        <option value="Screening">Screening</option>
                                        <option value="Under Review">Under Review</option>
                                        <option value="Revisions Required">Revisions</option>
                                        <option value="Accepted">Accepted</option>
                                        <option value="Published">Published</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <button onClick={() => onEdit(sub)} className="review-btn"><Edit3 size={16} /> Open</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

        </div>
    );
};