import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ArrowLeft, Save, UploadCloud, Edit3, Trash2, Calendar, Plus, ArrowUp, ArrowDown, ImageIcon, ChevronLeft, ChevronRight, MapPin, Users, Clock } from "lucide-react";

// 🚨 IMPORT THE NEW DEDICATED CSS
import "../../styles/admin/AdminEventManager.css";

// --- SMART RESOLVER ---
const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

// --- CROPPER HELPER ---
const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas");
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" })), "image/jpeg");
    });
};

const AdminEventManager = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [view, setView] = useState("list");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Editor Form State
    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [speakers, setSpeakers] = useState("");
    const [desc, setDesc] = useState("");
    const [imageFit, setImageFit] = useState("cover");

    // Image State
    const [coverImgFile, setCoverImgFile] = useState(null);
    const [coverImgPreview, setCoverImgPreview] = useState("");
    const [gallery, setGallery] = useState([]);

    // Cropper State
    const photoInputRef = useRef(null);
    const [rawPhotoUrl, setRawPhotoUrl] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [cropAspect, setCropAspect] = useState(16 / 9);

    // --- 1. FETCH EVENTS ---
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/events");
                setEvents(res.data);
            } catch (err) {
                console.error("Error fetching events", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => { window.scrollTo(0, 0); }, [view]);

    // --- 2. VIEW NAVIGATION ---
    const openCreateForm = () => {
        setEditingId(null);
        setTitle(""); setDate(""); setTime(""); setLocation(""); setSpeakers(""); setDesc("");
        setImageFit("cover");
        setCoverImgFile(null); setCoverImgPreview(""); setGallery([]);
        setView("form");
    };

    const openEditForm = (ev) => {
        setEditingId(ev._id || ev.id);
        setTitle(ev.title || "");
        setDate(ev.date || "");
        setTime(ev.time || "");
        setLocation(ev.location || "");
        setSpeakers(ev.speakers || "");
        setDesc(ev.desc || "");
        setImageFit(ev.imageFit || "cover");
        setCoverImgPreview(resolveUrl(ev.coverImg || ev.img) || "");
        setCoverImgFile(null);
        setGallery(ev.gallery ? ev.gallery.map(resolveUrl) : []);
        setView("form");
    };

    const closeForm = () => setView("list");

    // --- 3. REORDER MAIN LIST ---
    const syncOrder = async (newEvents) => {
        try { await axios.put("http://localhost:5001/api/events", newEvents); }
        catch (error) { console.error("Sync failed", error); }
    };
    const moveUp = (index) => {
        if (index === 0) return;
        const newEvents = [...events];
        [newEvents[index - 1], newEvents[index]] = [newEvents[index], newEvents[index - 1]];
        setEvents(newEvents); syncOrder(newEvents);
    };
    const moveDown = (index) => {
        if (index === events.length - 1) return;
        const newEvents = [...events];
        [newEvents[index + 1], newEvents[index]] = [newEvents[index], newEvents[index + 1]];
        setEvents(newEvents); syncOrder(newEvents);
    };

    // --- 4. CROPPER LOGIC ---
    const handlePhotoSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setRawPhotoUrl(reader.result));
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const onCropComplete = useCallback((_, croppedAreaPixels) => { setCroppedAreaPixels(croppedAreaPixels); }, []);
    const saveCroppedImage = async () => {
        try {
            const croppedFile = await getCroppedImg(rawPhotoUrl, croppedAreaPixels);
            setCoverImgFile(croppedFile);
            setCoverImgPreview(URL.createObjectURL(croppedFile));
            setRawPhotoUrl(null);
            if (photoInputRef.current) photoInputRef.current.value = "";
        } catch (e) { alert("Error cropping image"); }
    };

    // --- 5. GALLERY LOGIC ---
    const handleGalleryUpload = (e) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                const reader = new FileReader();
                reader.onload = (x) => setGallery(prev => [...prev, x.target.result]);
                reader.readAsDataURL(file);
            });
        }
    };
    const moveGalleryImg = (index, direction) => {
        const newGallery = [...gallery];
        if (direction === -1 && index > 0) {
            [newGallery[index - 1], newGallery[index]] = [newGallery[index], newGallery[index - 1]];
        } else if (direction === 1 && index < newGallery.length - 1) {
            [newGallery[index + 1], newGallery[index]] = [newGallery[index], newGallery[index + 1]];
        }
        setGallery(newGallery);
    };
    const removeGalleryImage = (index) => setGallery(gallery.filter((_, i) => i !== index));

    // --- 6. SAVE LOGIC ---
    const handleSubmit = async () => {
        if (!title || !date || !coverImgPreview) { alert("Title, Date, and Cover Image are required."); return; }
        setSaving(true);
        let finalCoverImg = coverImgPreview;
        if (coverImgFile) {
            const reader = new FileReader();
            reader.readAsDataURL(coverImgFile);
            await new Promise(resolve => reader.onload = () => { finalCoverImg = reader.result; resolve(); });
        }
        const payload = { title, date, time, location, speakers, desc, imageFit, coverImg: finalCoverImg, img: finalCoverImg, gallery };
        try {
            if (editingId) {
                const newEventsList = events.map(e => (e._id === editingId || e.id === editingId) ? { ...e, ...payload } : e);
                await axios.put("http://localhost:5001/api/events", newEventsList);
            } else {
                await axios.post("http://localhost:5001/api/events", payload);
            }
            const res = await axios.get("http://localhost:5001/api/events");
            setEvents(res.data);
            setView("list");
        } catch (err) { alert("Error saving event."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Delete this event permanently?`)) {
            try {
                await axios.delete(`http://localhost:5001/api/events/${id}`);
                setEvents(events.filter(e => (e._id !== id && e.id !== id)));
            } catch (err) { alert("Error deleting event."); }
        }
    };

    const isPast = new Date(date) < new Date();

    return (
        <div className="admin-event-root">
            <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoSelect} />

            {/* ================= VIEW 1: GRID DASHBOARD ================= */}
            {view === "list" && (
                <div className="admin-event-container">
                    <div className="admin-event-header">
                        <div className="header-title-group">
                            <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
                                <ArrowLeft size={16} /> Hub
                            </button>
                            <Calendar size={32} className="header-icon" />
                            <h1 className="header-title">Event Manager</h1>
                        </div>
                        <button className="admin-submit-btn" onClick={openCreateForm}>
                            <Plus size={20} /> Create New Event
                        </button>
                    </div>

                    {loading ? <div className="admin-empty-state"><h3>Loading Events...</h3></div> : events.length === 0 ? (
                        <div className="admin-empty-state"><Calendar size={48} className="empty-icon" /><h3>No Events Scheduled</h3></div>
                    ) : (
                        <div className="event-grid">
                            {events.map((ev, index) => (
                                <div key={ev._id || ev.id} className="event-card">
                                    <div className="event-card-img-wrapper">
                                        <img src={resolveUrl(ev.coverImg || ev.img) || "/placeholder.jpg"} alt="Cover" onError={(e) => { e.target.onerror = null; e.target.src = "/placeholder.jpg"; }} />

                                        <div className="event-card-controls">
                                            <button className="reorder-btn" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp size={14} /></button>
                                            <button className="reorder-btn" onClick={() => moveDown(index)} disabled={index === events.length - 1}><ArrowDown size={14} /></button>
                                        </div>

                                        <div className={`event-status-badge ${new Date(ev.date) < new Date() ? 'past' : 'upcoming'}`}>
                                            {new Date(ev.date) < new Date() ? 'PAST' : 'UPCOMING'}
                                        </div>
                                    </div>

                                    <div className="event-card-body">
                                        <h3 className="event-card-title">{ev.title}</h3>
                                        <p className="event-card-meta">{ev.date} | {ev.time}</p>
                                    </div>

                                    <div className="event-card-actions">
                                        <button className="action-btn edit-btn" onClick={() => openEditForm(ev)}><Edit3 size={16} /> Edit</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDelete(ev._id || ev.id)}><Trash2 size={16} /> Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ================= VIEW 2: SPLIT-SCREEN EDITOR ================= */}
            {view === "form" && (
                <div className="editor-layout">
                    {/* Top Bar */}
                    <div className="editor-top-bar">
                        <div className="top-bar-left">
                            <button className="admin-back-btn" onClick={closeForm}><ArrowLeft size={16} /> Cancel</button>
                            <h2>{editingId ? "Edit Event" : "New Event"}</h2>
                        </div>
                        <button className="admin-submit-btn" onClick={handleSubmit} disabled={saving}>
                            <Save size={18} /> {saving ? "Saving..." : "Publish Event"}
                        </button>
                    </div>

                    <div className="editor-panels-wrapper">

                        {/* LEFT PANEL: Form */}
                        <div className="editor-left-panel">
                            <div className="form-group">
                                <label>Event Title *</label>
                                <input type="text" className="huge-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Shaping the Future of Law..." />
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group"><label>Date *</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
                                <div className="form-group"><label>Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
                                <div className="form-group"><label>Location / Link</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., VIT-AP Campus" /></div>
                                <div className="form-group"><label>Key Speakers</label><input type="text" value={speakers} onChange={(e) => setSpeakers(e.target.value)} placeholder="e.g., Dr. Sattaru Rajani" /></div>
                            </div>

                            <div className="admin-upload-card compact">
                                <h3>Cover Image & Display Style *</h3>
                                <div className="fit-toggle-group">
                                    <button onClick={(e) => { e.preventDefault(); setImageFit('cover'); }} className={`fit-btn ${imageFit === 'cover' ? 'active' : ''}`}>Fill Container (Crop)</button>
                                    <button onClick={(e) => { e.preventDefault(); setImageFit('contain'); }} className={`fit-btn ${imageFit === 'contain' ? 'active' : ''}`}>Show Full Flyer (Fit)</button>
                                </div>
                                <div className="asset-upload-area">
                                    {coverImgPreview && (
                                        <div className="cover-preview-box">
                                            {imageFit === 'contain' && <img src={coverImgPreview} alt="bg-blur" className="blur-bg" />}
                                            <img src={coverImgPreview} alt="Preview" className="main-preview" style={{ objectFit: imageFit }} />
                                        </div>
                                    )}
                                    <button className="secondary-outline-btn full-width" onClick={(e) => { e.preventDefault(); photoInputRef.current.click(); }}>
                                        <ImageIcon size={16} /> {coverImgPreview ? "Replace Cover Image" : "Upload Cover Image"}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Event Description</label>
                                <textarea rows="6" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Write details about the event..." />
                            </div>

                            <div className="admin-upload-card compact">
                                <h3>Event Gallery Photos</h3>
                                <label className="secondary-outline-btn full-width" style={{ display: 'flex', justifyContent: 'center' }}>
                                    <UploadCloud size={16} /> Add Photos
                                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} hidden />
                                </label>
                                <div className="gallery-grid">
                                    {gallery.map((img, index) => (
                                        <div key={index} className="gallery-item">
                                            <img src={img} alt="gal" />
                                            <div className="gallery-controls">
                                                <button onClick={(e) => { e.preventDefault(); moveGalleryImg(index, -1); }}><ChevronLeft size={20} /></button>
                                                <button onClick={(e) => { e.preventDefault(); removeGalleryImage(index); }} className="danger"><Trash2 size={16} /></button>
                                                <button onClick={(e) => { e.preventDefault(); moveGalleryImg(index, 1); }}><ChevronRight size={20} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT PANEL: Live Preview */}
                        <div className="editor-right-panel preview-panel">
                            <div className="live-badge">LIVE 1:1 PREVIEW</div>
                            <div className="preview-canvas">
                                <div className="preview-hero">
                                    {coverImgPreview && (
                                        <>
                                            {imageFit === 'contain' && <img src={coverImgPreview} alt="blur-bg" className="blur-bg" />}
                                            <img src={coverImgPreview} alt="Hero" className="main-img" style={{ objectFit: imageFit }} />
                                        </>
                                    )}
                                    <div className="preview-overlay"></div>
                                    <div className="preview-hero-content">
                                        <div className="preview-status">{isPast ? 'Past Event' : 'Upcoming Event'}</div>
                                        <h1>{title || "Your Event Title Here"}</h1>
                                        <div className="preview-meta">
                                            <span><Calendar size={16} /> {date || "YYYY-MM-DD"}</span>
                                            <span><Clock size={16} /> {time || "00:00"}</span>
                                            {location && <span><MapPin size={16} /> {location}</span>}
                                            {speakers && <span><Users size={16} /> {speakers}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="preview-body">
                                    <h2>About This Event</h2>
                                    <p>{desc || "Your event description will appear here..."}</p>

                                    <h3>Event Gallery</h3>
                                    {gallery.length > 0 ? (
                                        <div className="preview-gallery-grid">
                                            {gallery.map((img, i) => (
                                                <div key={i} className="preview-gallery-item"><img src={img} alt={`Preview ${i}`} /></div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="empty-gallery">No photos uploaded to the gallery yet.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* ================= DYNAMIC CROPPER MODAL ================= */}
            {rawPhotoUrl && (
                <div className="cropper-modal-overlay">
                    <div className="cropper-modal-box">
                        <div className="crop-area-container">
                            <Cropper image={rawPhotoUrl} crop={crop} zoom={zoom} aspect={cropAspect} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                        </div>
                        <div className="cropper-controls-bar">
                            <div className="aspect-ratio-toggles">
                                <button onClick={() => setCropAspect(16 / 9)} className={cropAspect === 16 / 9 ? 'active' : ''}>16:9 Cover</button>
                                <button onClick={() => setCropAspect(1 / 1)} className={cropAspect === 1 / 1 ? 'active' : ''}>1:1 Square</button>
                                <button onClick={() => setCropAspect(null)} className={cropAspect === null ? 'active' : ''}>Free Crop</button>
                            </div>
                            <label className="zoom-label">Zoom: <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} /></label>
                            <div className="cropper-buttons">
                                <button className="cropper-cancel-btn" onClick={() => { setRawPhotoUrl(null); if (photoInputRef.current) photoInputRef.current.value = ""; }}>Cancel</button>
                                <button className="cropper-save-btn" onClick={saveCroppedImage}>Crop & Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEventManager;