import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Linkedin, Twitter, Mail } from "lucide-react";
import "../styles/Team.css";
import { useTheme } from "./ThemeContext";

// 🚨 SMART RESOLVER: Ensures backend uploads render correctly
const resolveUrl = (url) => {
    if (!url) return "/placeholder.jpg"; // Fallback if no image
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

// --- FALLBACK DATA (Used if the database is completely empty) ---
const fallbackTeamData = [
    {
        _id: "1",
        name: "JSM Managing Partner",
        designation: "Founder & Head of Corporate",
        category: "Board of Directors",
        bio: "The driving force behind JSM Associates. With over two decades of experience, they have shaped the firm's strategic direction, focusing on corporate governance and international law.",
        image: "/placeholder.jpg",
        linkedin: "#",
        twitter: "",
        email: "contact@jsmassociates.in"
    }
];

// --- STRICT CATEGORY DISPLAY ORDER ---
// This ensures leadership always stays at the top of the page regardless of alphabetical order
const categoryOrder = [
    "Board of Directors",
    "Partners",
    "Associates & Counsel",
    "Administration"
];

const Team = () => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    // --- STATE ---
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState(null);

    // --- ADMIN PORTAL API HOOK ---
    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchTeam = async () => {
            try {
                // Fetching from the established backend
                const response = await fetch('http://localhost:5001/api/team');
                if (response.ok) {
                    const data = await response.json();
                    setTeamMembers(data.length > 0 ? data : fallbackTeamData);
                } else {
                    setTeamMembers(fallbackTeamData);
                }
            } catch (error) {
                console.warn("Backend not connected yet. Using fallback data.");
                setTeamMembers(fallbackTeamData);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    // Prevent background scroll when Sidebar is open
    useEffect(() => {
        if (selectedMember) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedMember]);

    // --- HANDLERS ---
    const openSidebar = (member) => setSelectedMember(member);
    const closeSidebar = () => setSelectedMember(null);

    // --- HELPER: Group Members by Category ---
    const groupedMembers = teamMembers.reduce((acc, member) => {
        const cat = member.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(member);
        return acc;
    }, {});

    // Sort the grouped categories based on our strict hierarchy list
    const sortedCategories = Object.keys(groupedMembers).sort((a, b) => {
        let indexA = categoryOrder.indexOf(a);
        let indexB = categoryOrder.indexOf(b);
        // If a category isn't in the list, push it to the bottom
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
    });

    if (loading) {
        return (
            <div className={`team-page-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: 'var(--accent-primary)', fontFamily: "'Playfair Display', serif" }}>Loading Council...</h2>
            </div>
        );
    }

    return (
        <div className={`team-page-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>

            {/* HERO HEADER */}
            <div className="team-hero-header">
                <span className="team-subheading">The Minds Behind The Mission</span>
                <h1 className="team-main-heading">Our Full Council</h1>
                <div className="team-heading-divider"></div>
            </div>

            {/* DYNAMIC GRID SECTIONS (Sorted by Hierarchy) */}
            {sortedCategories.map((category) => (
                <div key={category} className="team-category-section">
                    <h2 className="category-title">{category}</h2>

                    <div className="team-grid">
                        {groupedMembers[category].map((member) => (
                            <div
                                key={member._id || member.id}
                                className="team-portrait-card"
                                onClick={() => openSidebar(member)}
                            >
                                <div className="portrait-image-wrapper">
                                    {/* Smart image resolver handles backend images or fallback */}
                                    <img src={resolveUrl(member.image)} alt={member.name} onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }} />
                                    <div className="portrait-overlay-gradient"></div>
                                </div>

                                <div className="portrait-content">
                                    <h3 className="member-name">{member.name}</h3>
                                    <p className="member-role">{member.designation}</p>
                                    <div className="hover-line-indicator"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* BACK BUTTON */}
            <div className="team-actions-footer">
                <button className="team-back-btn" onClick={() => navigate("/")}>
                    Return to Chambers
                </button>
            </div>

            {/* ========================================================
          SOLID SIDEBAR DOSSIER
          ======================================================== */}

            {/* 1. Dark Overlay (Clicks close the sidebar) */}
            <div
                className={`sidebar-overlay ${selectedMember ? 'active' : ''}`}
                onClick={closeSidebar}
            ></div>

            {/* 2. The Sliding Sidebar Panel */}
            <div className={`team-sidebar-panel ${selectedMember ? 'open' : ''}`}>

                <button className="sidebar-close-btn" onClick={closeSidebar}>
                    <X size={28} />
                </button>

                {selectedMember && (
                    <div className="sidebar-content-scroll">

                        <div className="sidebar-image-header">
                            <img src={resolveUrl(selectedMember.image)} alt={selectedMember.name} onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }} />
                        </div>

                        <div className="sidebar-info-body">
                            <span className="sidebar-badge">{selectedMember.category}</span>
                            <h2 className="sidebar-name">{selectedMember.name}</h2>
                            <h3 className="sidebar-role">{selectedMember.designation}</h3>

                            <div className="sidebar-divider"></div>

                            {/* Pre-wrap ensures paragraphs from the admin editor stay separated */}
                            <p className="sidebar-bio" style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedMember.bio || "No professional biography provided."}
                            </p>

                            <div className="sidebar-social-links">
                                {selectedMember.linkedin && (
                                    <a href={selectedMember.linkedin} target="_blank" rel="noreferrer" className="social-icon-btn">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {selectedMember.twitter && (
                                    <a href={selectedMember.twitter} target="_blank" rel="noreferrer" className="social-icon-btn">
                                        <Twitter size={20} />
                                    </a>
                                )}
                                {selectedMember.email && (
                                    <a href={`mailto:${selectedMember.email}`} className="social-icon-btn">
                                        <Mail size={20} />
                                    </a>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
};

export default Team;