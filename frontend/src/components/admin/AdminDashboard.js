import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Calendar, Users, ClipboardList, LogOut, GraduationCap, Mail } from "lucide-react";
import "../../styles/admin/AdminDashboard.css";

const AdminDashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <h1>JSM Command Center</h1>
                    <p>Select a module to manage your website content.</p>
                </header>

                <div className="dashboard-grid">
                    {/* BLOGS CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/blogs")}>
                        <div className="card-icon"><BookOpen size={40} /></div>
                        <h2>Blogs & Insights</h2>
                        <p>Publish, edit, or remove legal articles and news.</p>
                        <button className="dashboard-btn">Open Editor</button>
                    </div>

                    {/* EVENTS CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/events")}>
                        <div className="card-icon"><Calendar size={40} /></div>
                        <h2>Events & Seminars</h2>
                        <p>Add upcoming webinars or archive past legal events.</p>
                        <button className="dashboard-btn">Open Manager</button>
                    </div>

                    {/* ACADEMIC COLLABS CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/academic")}>
                        <div className="card-icon"><GraduationCap size={40} /></div>
                        <h2>Academic Collabs</h2>
                        <p>Manage university MOUs, partnerships, and institution logos.</p>
                        <button className="dashboard-btn">Manage Collabs</button>
                    </div>

                    {/* TEAM MANAGER CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/team")}>
                        <div className="card-icon"><Users size={40} /></div>
                        <h2>Our People</h2>
                        <p>Manage profiles for partners, associates, and staff.</p>
                        <button className="dashboard-btn">Manage Team</button>
                    </div>

                    {/* APPLICATIONS MANAGER CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/applications")}>
                        <div className="card-icon"><ClipboardList size={40} /></div>
                        <h2>Career Applications</h2>
                        <p>Review hiring applications and track applicant status.</p>
                        <button className="dashboard-btn">View Applications</button>
                    </div>

                    {/* CONTACT INBOX CARD */}
                    <div className="dashboard-card" onClick={() => navigate("/admin/contact")}>
                        <div className="card-icon"><Mail size={40} /></div>
                        <h2>Contact Inbox</h2>
                        <p>Read and manage client inquiries and contact form submissions.</p>
                        <button className="dashboard-btn">View Messages</button>
                    </div>
                </div>

                <button className="logout-btn" onClick={() => navigate("/")}>
                    <LogOut size={18} /> Exit Admin Portal
                </button>
            </div>
        </div>
    );
};

export default AdminDashboard;