import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Trash2, GraduationCap, Plus, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🚨 IMPORT THE NEW CSS FILE
import "../../styles/admin/AdminAcademicManager.css";

// 🚨 SMART RESOLVER
const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

export default function AdminAcademicManager() {
    const navigate = useNavigate();
    const [collabs, setCollabs] = useState([]);
    const [name, setName] = useState("");
    const [logo, setLogo] = useState(null);
    const [preview, setPreview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchCollabs();
    }, []);

    const fetchCollabs = async () => {
        try {
            const res = await axios.get("http://localhost:5001/api/academic");
            setCollabs(res.data);
        } catch (err) {
            console.error("Failed to fetch collaborations");
        }
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!name || !logo) return alert("Please provide both an institution name and a logo.");
        setLoading(true);
        const formData = new FormData();
        formData.append("name", name);
        formData.append("logo", logo);

        try {
            await axios.post("http://localhost:5001/api/academic", formData);
            setName("");
            setLogo(null);
            setPreview("");
            fetchCollabs();
        } catch (err) {
            alert("Failed to save collaboration.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Remove this collaboration?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/academic/${id}`);
            fetchCollabs();
        } catch (err) {
            alert("Failed to delete.");
        }
    };

    return (
        <div className="admin-academic-root">
            <div className="admin-academic-container">

                {/* Header */}
                <div className="admin-academic-header">
                    <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft size={16} /> Hub
                    </button>
                    <GraduationCap size={32} className="header-icon" />
                    <h1 className="header-title">Academic Collaborations</h1>
                </div>

                {/* Upload Form */}
                <div className="admin-upload-card">
                    <h3>Add New Institution</h3>

                    <div className="form-group">
                        <label>Institution Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. VIT-AP School of Law"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Institution Logo (Transparent PNG preferred) *</label>
                        <div className="file-upload-wrapper">
                            <div className="image-preview-box">
                                {preview ? <img src={preview} alt="Preview" /> : <ImageIcon size={24} className="placeholder-icon" />}
                            </div>
                            <input type="file" accept="image/*" onChange={handleFile} />
                        </div>
                    </div>

                    <button className="admin-submit-btn" onClick={handleSubmit} disabled={loading}>
                        <Plus size={18} /> {loading ? "Saving..." : "Add Collaboration"}
                    </button>
                </div>

                {/* Grid of Existing Collabs */}
                <h3 className="section-divider-title">Active Collaborations</h3>

                {collabs.length === 0 ? (
                    <p className="empty-state-text">No collaborations added yet.</p>
                ) : (
                    <div className="collabs-grid">
                        {collabs.map(c => (
                            <div key={c._id} className="collab-card">
                                <button className="delete-collab-btn" onClick={() => handleDelete(c._id)} aria-label="Delete">
                                    <Trash2 size={16} />
                                </button>

                                <div className="collab-logo-container">
                                    <img src={resolveUrl(c.logo)} alt={c.name} />
                                </div>
                                <p className="collab-name">{c.name}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}