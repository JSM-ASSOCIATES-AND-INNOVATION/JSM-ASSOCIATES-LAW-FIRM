import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, Edit3, Trash2, X, UploadCloud, Users, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";

// 🚨 IMPORT THE NEW DEDICATED CSS
import "../../styles/admin/AdminTeamManager.css";

const AdminTeamManager = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("list");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Form State
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        category: "Board of Directors",
        bio: "",
        linkedin: "",
        twitter: "",
        email: "",
        showOnHome: false
    });

    // Image State
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const fileInputRef = useRef(null);

    // --- 1. SECURITY & FETCH ---
    useEffect(() => {
        // Updated to match your new JSM token from AdminsPortal.js
        if (!localStorage.getItem("jsm_admin_token")) {
            navigate("/admin");
        } else {
            fetchTeam();
        }
    }, [navigate]);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/team");
            setTeam(res.data);
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    // --- 2. VIEW NAVIGATION & REORDERING ---
    const openFormToCreate = () => {
        setEditingId(null);
        setFormData({
            name: "", designation: "", category: "Board of Directors",
            bio: "", linkedin: "", twitter: "", email: "", showOnHome: false
        });
        setImageFile(null);
        setImagePreview("");
        setView("form");
    };

    const openFormToEdit = (member) => {
        setEditingId(member._id || member.id);
        setFormData({
            name: member.name || "",
            designation: member.designation || "",
            category: member.category || "Board of Directors",
            bio: member.bio || "",
            linkedin: member.linkedin || "",
            twitter: member.twitter || "",
            email: member.email || "",
            showOnHome: member.showOnHome || false
        });
        setImageFile(null);
        setImagePreview(member.image || "");
        setView("form");
    };

    const closeForm = () => {
        setView("list");
        window.scrollTo(0, 0);
    };

    const syncOrder = async (newTeam) => {
        try { await axios.put("http://localhost:5001/api/team", newTeam); }
        catch (error) { console.error("Sync failed", error); }
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const newTeam = [...team];
        [newTeam[index - 1], newTeam[index]] = [newTeam[index], newTeam[index - 1]];
        setTeam(newTeam); syncOrder(newTeam);
    };

    const moveDown = (index) => {
        if (index === team.length - 1) return;
        const newTeam = [...team];
        [newTeam[index + 1], newTeam[index]] = [newTeam[index], newTeam[index + 1]];
        setTeam(newTeam); syncOrder(newTeam);
    };

    // --- 3. INPUT HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // --- 4. CRUD OPERATIONS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.designation) { alert("Name and Designation are required."); return; }
        setSaving(true);

        let finalImage = imagePreview;
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            await new Promise(resolve => reader.onload = () => { finalImage = reader.result; resolve(); });
        }

        const payload = { ...formData, image: finalImage };

        try {
            if (editingId) {
                const newTeamList = team.map(member => (member._id === editingId || member.id === editingId) ? { ...member, ...payload } : member);
                await axios.put("http://localhost:5001/api/team", newTeamList);
                showMessage("Team member updated successfully!", "success");
            } else {
                await axios.post("http://localhost:5001/api/team", payload);
                showMessage("New team member added!", "success");
            }
            fetchTeam();
            closeForm();
        } catch (error) {
            showMessage("Error saving member.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to remove ${name}?`)) {
            try {
                await axios.delete(`http://localhost:5001/api/team/${id}`);
                setTeam(team.filter(m => String(m._id) !== String(id) && String(m.id) !== String(id)));
                showMessage("Member removed.", "success");
            } catch (error) {
                showMessage("Error deleting member.", "error");
            }
        }
    };

    return (
        <div className="admin-team-root">

            {/* Toast Message */}
            {message.text && (
                <div className={`toast-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* ================= VIEW 1: GRID DASHBOARD ================= */}
            {view === "list" && (
                <div className="admin-team-container">
                    <div className="admin-header">
                        <div className="header-title-group">
                            <button onClick={() => navigate("/admin/dashboard")} className="admin-back-btn">
                                <ArrowLeft size={16} /> Hub
                            </button>
                            <Users size={32} className="header-icon" />
                            <h1 className="header-title">Team Directory</h1>
                        </div>
                        <button onClick={openFormToCreate} className="admin-submit-btn">
                            <Plus size={20} /> Add New Member
                        </button>
                    </div>

                    {loading ? <div className="admin-empty-state"><h3>Loading Team...</h3></div> : team.length === 0 ? (
                        <div className="admin-empty-state"><Users size={48} className="empty-icon" /><h3>No Team Members Found</h3></div>
                    ) : (
                        <div className="team-grid">
                            {team.map((member, index) => (
                                <div key={member._id || member.id} className="team-card">

                                    <div className="card-image-box">
                                        <img src={member.image || "/placeholder.jpg"} alt={member.name} />

                                        {/* ORDER ARROWS */}
                                        <div className="order-controls">
                                            <button onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp size={14} /></button>
                                            <button onClick={() => moveDown(index)} disabled={index === team.length - 1}><ArrowDown size={14} /></button>
                                        </div>

                                        {/* HOMEPAGE BADGE */}
                                        {member.showOnHome && (
                                            <div className="homepage-badge">⭐ HOMEPAGE</div>
                                        )}

                                        <div className="card-category-badge">{member.category}</div>
                                    </div>

                                    <div className="card-info">
                                        <h3 className="card-name">{member.name}</h3>
                                        <p className="card-role">{member.designation}</p>
                                    </div>

                                    <div className="card-actions">
                                        <button onClick={() => openFormToEdit(member)} className="action-btn edit-btn"><Edit3 size={16} /> Edit</button>
                                        <button onClick={() => handleDelete(member._id || member.id, member.name)} className="action-btn delete-btn"><Trash2 size={16} /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ================= VIEW 2: FORM EDITOR ================= */}
            {view === "form" && (
                <div className="admin-form-container">
                    <div className="form-header">
                        <h2>{editingId ? "Edit Team Member" : "Add New Team Member"}</h2>
                        <button onClick={closeForm} className="close-btn"><X size={28} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-form-view">

                        {/* Top Section Split */}
                        <div className="form-grid-2">

                            {/* Image Uploader */}
                            <div className="input-block image-upload-section">
                                <label>Profile Portrait (Required)</label>
                                <div onClick={() => fileInputRef.current.click()} className="image-dropzone">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" />
                                    ) : (
                                        <div className="dropzone-placeholder">
                                            <UploadCloud size={32} />
                                            <p>Click to upload image</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleImageChange} />
                            </div>

                            {/* Info Inputs */}
                            <div className="form-inputs-col">
                                <div className="input-block">
                                    <label>Full Name *</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="dark-input" required />
                                </div>
                                <div className="input-block">
                                    <label>Designation / Role *</label>
                                    <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} className="dark-input" placeholder="e.g. Managing Partner" required />
                                </div>
                                <div className="input-block">
                                    <label>Directory Category *</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="dark-input">
                                        <option value="Board of Directors">Board of Directors</option>
                                        <option value="Partners">Partners</option>
                                        <option value="Associates & Counsel">Associates & Counsel</option>
                                        <option value="Administration">Administration</option>
                                    </select>
                                </div>

                                {/* HOMEPAGE TOGGLE HIGHLIGHT BOX */}
                                <div className="homepage-toggle-box">
                                    <input
                                        type="checkbox"
                                        name="showOnHome"
                                        checked={formData.showOnHome}
                                        onChange={handleInputChange}
                                        id="homeToggle"
                                    />
                                    <label htmlFor="homeToggle" className="toggle-label-content">
                                        <strong>Feature on Homepage</strong>
                                        <span>Display this member in the "Managing Partners" section on the front page.</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="input-block">
                            <label>Professional Bio</label>
                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="6" className="dark-input" placeholder="Brief background about their practice areas and experience..."></textarea>
                        </div>

                        {/* Social Links */}
                        <div className="social-links-grid">
                            <div className="input-block">
                                <label>LinkedIn URL</label>
                                <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} className="dark-input" placeholder="https://linkedin.com/..." />
                            </div>
                            <div className="input-block">
                                <label>Twitter/X URL</label>
                                <input type="url" name="twitter" value={formData.twitter} onChange={handleInputChange} className="dark-input" placeholder="https://twitter.com/..." />
                            </div>
                            <div className="input-block">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="dark-input" placeholder="lawyer@jsmassociates.in" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="form-actions-bar">
                            <button type="button" onClick={closeForm} className="btn-solid-cancel">Cancel</button>
                            <button type="submit" disabled={saving} className="btn-solid-gold">
                                {saving ? "Saving..." : (editingId ? "Save Changes" : "Publish Member")}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminTeamManager;