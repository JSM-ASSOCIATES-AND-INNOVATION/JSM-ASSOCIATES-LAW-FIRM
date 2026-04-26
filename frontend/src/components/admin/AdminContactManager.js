import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Trash2, Mail, Calendar, User, Phone, Briefcase, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/admin/AdminContactManager.css";

export default function AdminContactManager() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/forms");
            setMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this message permanently?")) return;
        try {
            await axios.delete(`http://localhost:5001/api/forms/${id}`);
            fetchMessages();
        } catch (err) {
            alert("Failed to delete message.");
        }
    };

    return (
        <div className="admin-contact-root">
            <div className="admin-contact-container">

                {/* Header */}
                <div className="admin-contact-header">
                    <button className="admin-contact-back-btn" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft size={16} /> Hub
                    </button>
                    <Mail size={32} color="#FFBF00" />
                    <h1 className="admin-contact-title">Contact Inbox</h1>
                </div>

                {loading ? (
                    <div className="admin-contact-status">Loading messages...</div>
                ) : messages.length === 0 ? (
                    <div className="admin-contact-empty">
                        <Mail size={56} color="#333" style={{ marginBottom: '20px' }} />
                        <h3>No messages yet.</h3>
                        <p>When clients fill out the contact form, they will appear here.</p>
                    </div>
                ) : (
                    <div className="admin-contact-list">
                        {messages.map((msg) => (
                            <div key={msg._id} className="admin-contact-card">

                                <button className="admin-contact-delete-btn" onClick={() => handleDelete(msg._id)}>
                                    <Trash2 size={16} /> Delete
                                </button>

                                {/* Meta Data */}
                                <div className="admin-contact-meta">
                                    <span className="admin-contact-meta-item admin-contact-name">
                                        <User size={18} /> {msg.name || "Unknown Sender"}
                                    </span>

                                    <span className="admin-contact-meta-item">
                                        <Mail size={16} color="#666" />
                                        <a href={`mailto:${msg.email}`}>{msg.email || "No Email"}</a>
                                    </span>

                                    {msg.phone && (
                                        <span className="admin-contact-meta-item">
                                            <Phone size={16} color="#666" />
                                            <a href={`tel:${msg.phone}`}>{msg.phone}</a>
                                        </span>
                                    )}

                                    {msg.dispute && (
                                        <span className="admin-contact-meta-item">
                                            <Briefcase size={16} color="#666" /> {msg.dispute}
                                        </span>
                                    )}

                                    {msg.freetime && (
                                        <span className="admin-contact-meta-item">
                                            <Clock size={16} color="#666" /> {msg.freetime}
                                        </span>
                                    )}

                                    <span className="admin-contact-meta-item" style={{ marginLeft: 'auto' }}>
                                        <Calendar size={16} color="#666" />
                                        {msg.date || new Date().toLocaleDateString()}
                                    </span>
                                </div>

                                {/* Message Body */}
                                <div className="admin-contact-body">
                                    {msg.query || msg.message || "No query provided."}
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}