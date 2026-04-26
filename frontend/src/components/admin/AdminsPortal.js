import React, { useState, useEffect } from "react";
import { FileText, Users, BookOpen, Settings, LogOut, ShieldCheck } from "lucide-react";

// 1. Import our split React components
import AdminLogin from "./admin/AdminLogin";
import ArticleEditor from "./admin/ArticleEditor";
import { SubmissionsHub, IssueManager, BoardManager, AnnouncementsManager } from "./admin/AdminTabs";

// 2. Import Layout CSS (Ensure this path is correct based on your file tree)
import "../styles/admin/AdminPortal.css";

// 3. Connect to the Live Backend
const API_BASE_URL = "http://127.0.0.1:5001/api";

export default function AdminPortal() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState("submissions");

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    // --- CRITICAL FIX: Session Persistence (Updated to JSM) ---
    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem("jsm_admin_token");
        if (token) setIsAuthenticated(true);
    }, []);

    const handleLogin = (token) => {
        localStorage.setItem("jsm_admin_token", token || "authenticated");
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("jsm_admin_token");
        setIsAuthenticated(false);
        setActiveTab("submissions");
        setIsEditing(false);
    };

    // --- REAL BACKEND SAVE FUNCTION ---
    const handleSaveManuscript = async (id, updatedData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/submissions/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });

            const result = await response.json();

            if (result.success) {
                alert("✅ Manuscript saved and status updated!");
                setIsEditing(false);
                setSelectedSubmission(null);
            } else {
                alert("❌ Failed to save: " + result.error);
            }
        } catch (err) {
            console.error("Save Error:", err);
            alert("❌ Server connection lost. Ensure your backend is running on Port 5001.");
        }
    };

    // ==========================================
    // VIEW 1: LOGIN SCREEN
    // ==========================================
    if (!isAuthenticated) {
        return <AdminLogin onLogin={handleLogin} />;
    }

    // ==========================================
    // VIEW 2: FULL-SCREEN ARTICLE EDITOR
    // ==========================================
    if (isEditing && selectedSubmission) {
        return (
            <ArticleEditor
                submission={selectedSubmission}
                onBack={() => {
                    setIsEditing(false);
                    setSelectedSubmission(null);
                }}
                onSave={handleSaveManuscript}
            />
        );
    }

    // ==========================================
    // VIEW 3: MAIN ADMIN DASHBOARD
    // ==========================================
    const tabTitles = {
        submissions: "Manuscript Submissions",
        issues: "Issues & Archives Manager",
        board: "Editorial Board Manager",
        settings: "Site Content & Announcements"
    };

    return (
        <div className="admin-portal-container">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-branding">
                    <ShieldCheck size={32} className="admin-brand-icon" color="#FFBF00" style={{ marginBottom: '12px' }} />
                    <h2>JSM Law Journal</h2>
                    <span>Editorial Portal</span>
                </div>

                <nav className="admin-nav">
                    <button className={`admin-nav-item ${activeTab === "submissions" ? "active" : ""}`} onClick={() => setActiveTab("submissions")}>
                        <FileText size={18} /> Manuscripts
                    </button>
                    <button className={`admin-nav-item ${activeTab === "issues" ? "active" : ""}`} onClick={() => setActiveTab("issues")}>
                        <BookOpen size={18} /> Issues & Archive
                    </button>
                    <button className={`admin-nav-item ${activeTab === "board" ? "active" : ""}`} onClick={() => setActiveTab("board")}>
                        <Users size={18} /> Editorial Board
                    </button>
                    <button className={`admin-nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
                        <Settings size={18} /> Site Content
                    </button>
                </nav>

                <div className="admin-sidebar-footer" style={{ marginTop: 'auto', padding: '20px 35px' }}>
                    <button className="admin-nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={18} /> Secure Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="admin-content">
                {/* Top Header Bar for UI Polish */}
                <header className="dash-header">
                    <div className="dash-header-titles">
                        <h1>{tabTitles[activeTab]}</h1>
                        <p>Command Center & Operations</p>
                    </div>
                    <div className="stats-box">
                        <div className="admin-profile" style={{ textAlign: 'right' }}>
                            <span style={{ color: '#FFBF00', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '700' }}>Editor-in-Chief</span>
                            <div style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '5px', fontFamily: "'Playfair Display', serif" }}>JSM Admin</div>
                        </div>
                    </div>
                </header>

                {/* Dynamic Tab Content */}
                <div className="admin-tab-content">
                    {activeTab === "submissions" && (
                        <SubmissionsHub onEdit={(sub) => {
                            setSelectedSubmission(sub);
                            setIsEditing(true);
                        }} />
                    )}
                    {activeTab === "issues" && <IssueManager />}
                    {activeTab === "board" && <BoardManager />}
                    {activeTab === "settings" && <AnnouncementsManager />}
                </div>
            </main>
        </div>
    );
}