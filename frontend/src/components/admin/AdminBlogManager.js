import React, { useState, useEffect, useRef, useCallback, Component } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import axios from "axios";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { ArrowLeft, Save, Edit3, Trash2, FileText, Plus, ArrowUp, ArrowDown, User, Calendar, Mic, X } from "lucide-react";

// 🚨 IMPORT NEW CSS
import "../../styles/admin/AdminBlogManager.css";

// Updated SVG placeholders with Orangish Amber (#FFBF00)
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23111'/%3E%3Cpath d='M100 105c16.5 0 30-13.5 30-30s-13.5-30-30-30-30 13.5-30 30 13.5 30 30 30zm0 15c-22.1 0-65 11.1-65 33.3V170h130v-16.7c0-22.2-42.9-33.3-65-33.3z' fill='%23FFBF00'/%3E%3C/svg%3E";
const defaultHero = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%230a0a0a'/%3E%3C/svg%3E";

const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

class ErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); }
    render() {
        if (this.state.hasError) return (
            <div className="admin-blog-error-screen">
                <h1>🚨 Blog Manager Crashed</h1>
                <div className="error-box">
                    <h3>{this.state.error?.toString()}</h3>
                    <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
            </div>
        );
        return this.props.children;
    }
}

const safeText = (text, fallback = "N/A") => { if (text === null || text === undefined || text === "") return fallback; return String(text); };

// Quill Configuration
const Font = Quill.import("formats/font");
Font.whitelist = ["garamond", "times-new-roman", "arial", "courier-new"];
Quill.register(Font, true);

const Size = Quill.import("attributors/style/size");
Size.whitelist = ["10px", "12px", "14px", "16px", "18px", "24px", "36px"];
Quill.register(Size, true);

const modules = {
    toolbar: [
        [{ font: Font.whitelist }],
        [{ size: Size.whitelist }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ script: "sub" }, { script: "super" }],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        ["blockquote", "link", "image", "video", "code-block"],
        ["clean"],
    ],
    clipboard: { matchVisual: false }
};
const formats = ["font", "size", "header", "bold", "italic", "underline", "strike", "script", "color", "background", "align", "list", "bullet", "indent", "blockquote", "link", "image", "video", "code-block"];

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image(); image.src = imageSrc; await new Promise((resolve) => (image.onload = resolve));
    const canvas = document.createElement("canvas"); canvas.width = pixelCrop.width; canvas.height = pixelCrop.height; const ctx = canvas.getContext("2d");
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise((resolve) => { canvas.toBlob((blob) => { resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" })); }, "image/jpeg"); });
};

const AdminBlogManagerContent = () => {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [view, setView] = useState("list");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [authorRole, setAuthorRole] = useState("");
    const [authorBio, setAuthorBio] = useState("");
    const [publishDate, setPublishDate] = useState("");

    const [audioFile, setAudioFile] = useState(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
    const audioInputRef = useRef(null);

    const [cropTarget, setCropTarget] = useState(null);
    const photoInputRef = useRef(null);
    const [rawPhotoUrl, setRawPhotoUrl] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [authorPhoto, setAuthorPhoto] = useState(null);
    const [authorPhotoPreview, setAuthorPhotoPreview] = useState("");
    const [coverImgFile, setCoverImgFile] = useState(null);
    const [coverImgPreview, setCoverImgPreview] = useState("");
    const [bgImgFile, setBgImgFile] = useState(null);
    const [bgImgPreview, setBgImgPreview] = useState("");

    useEffect(() => { window.scrollTo(0, 0); fetchBlogs(); }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:5001/api/blogs");
            if (Array.isArray(res.data)) {
                let validBlogs = res.data.filter(b => b && b._id);
                validBlogs.sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0));
                setBlogs(validBlogs);
            } else { setBlogs([]); }
        } catch (err) { setBlogs([]); } finally { setLoading(false); }
    };

    const openCreateForm = () => {
        setEditingId(null); setTitle(""); setContent(""); setAuthorName(""); setAuthorRole(""); setAuthorBio("");
        setPublishDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
        setAuthorPhoto(null); setAuthorPhotoPreview(""); setCoverImgFile(null); setCoverImgPreview(""); setBgImgFile(null); setBgImgPreview(""); setAudioFile(null); setAudioPreviewUrl("");
        setView("form");
    };

    const openEditForm = (blog) => {
        setEditingId(blog._id); setTitle(blog.title); setContent(blog.content);
        setAuthorName(blog.authorDetails?.name || blog.author?.name || "");
        setAuthorRole(blog.authorDetails?.role || blog.author?.profession || "");
        setAuthorBio(blog.authorDetails?.bio || blog.author?.bio || "");
        setPublishDate(blog.date || "");

        const foundAuthorPhoto = blog.authorPhoto || blog.authorDetails?.photo || blog.author?.photo;
        setAuthorPhotoPreview(resolveUrl(foundAuthorPhoto) || "");
        setCoverImgPreview(resolveUrl(blog.coverImg) || "");
        setBgImgPreview(resolveUrl(blog.bgImg) || "");
        setAudioPreviewUrl(resolveUrl(blog.audioUrl) || "");

        setAuthorPhoto(null); setCoverImgFile(null); setBgImgFile(null); setAudioFile(null);
        setView("form");
    };

    const syncOrder = async (newBlogs) => { try { await axios.put("http://localhost:5001/api/blogs", newBlogs); } catch (e) { console.error(e); } };
    const moveUp = (index) => { if (index === 0) return; const newBlogs = [...blogs];[newBlogs[index - 1], newBlogs[index]] = [newBlogs[index], newBlogs[index - 1]]; setBlogs(newBlogs); syncOrder(newBlogs); };
    const moveDown = (index) => { if (index === blogs.length - 1) return; const newBlogs = [...blogs];[newBlogs[index + 1], newBlogs[index]] = [newBlogs[index], newBlogs[index + 1]]; setBlogs(newBlogs); syncOrder(newBlogs); };

    const triggerCrop = (target) => { setCropTarget(target); if (photoInputRef.current) photoInputRef.current.click(); };
    const handlePhotoSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader(); reader.onload = () => setRawPhotoUrl(reader.result); reader.readAsDataURL(e.target.files[0]);
        }
    };
    const onCropComplete = useCallback((_, croppedPixels) => setCroppedAreaPixels(croppedPixels), []);

    const saveCroppedImage = async () => {
        try {
            const croppedFile = await getCroppedImg(rawPhotoUrl, croppedAreaPixels);
            const previewUrl = URL.createObjectURL(croppedFile);
            if (cropTarget === 'author') { setAuthorPhoto(croppedFile); setAuthorPhotoPreview(previewUrl); }
            else if (cropTarget === 'cover') { setCoverImgFile(croppedFile); setCoverImgPreview(previewUrl); }
            else if (cropTarget === 'bg') { setBgImgFile(croppedFile); setBgImgPreview(previewUrl); }
            cancelCrop();
        } catch (e) { alert("Crop failed."); }
    };
    const cancelCrop = () => { setRawPhotoUrl(null); setCropTarget(null); if (photoInputRef.current) photoInputRef.current.value = ""; };

    const handleAudioChange = (e) => { const file = e.target.files[0]; if (file) { setAudioFile(file); setAudioPreviewUrl(URL.createObjectURL(file)); } };

    const handleSubmit = async () => {
        if (!title || !content) return alert("Title and Content required.");
        setSaving(true);
        const formData = new FormData();
        formData.append("title", title); formData.append("content", content);
        formData.append("date", publishDate);
        formData.append("authorDetails[name]", authorName); formData.append("authorDetails[role]", authorRole); formData.append("authorDetails[bio]", authorBio);
        if (authorPhoto) formData.append("authorPhoto", authorPhoto);
        if (coverImgFile) formData.append("coverImg", coverImgFile);
        if (bgImgFile) formData.append("bgImg", bgImgFile);
        if (audioFile) formData.append("audio", audioFile);

        try {
            if (editingId) await axios.put(`http://localhost:5001/api/blogs/${editingId}`, formData);
            else await axios.post("http://localhost:5001/api/blogs", formData);
            fetchBlogs(); setView("list");
        } catch (err) { alert("Save failed."); } finally { setSaving(false); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try { await axios.delete(`http://localhost:5001/api/blogs/${id}`); fetchBlogs(); } catch (err) { alert("Delete failed."); }
    };

    return (
        <div className="admin-blog-root">
            <input type="file" accept="image/*" hidden ref={photoInputRef} onChange={handlePhotoSelect} />
            <input type="file" accept="audio/*" hidden ref={audioInputRef} onChange={handleAudioChange} />

            {/* VIEW 1: LIST */}
            {view === "list" && (
                <div className="admin-blog-container">
                    <div className="admin-blog-header">
                        <div className="header-title-group">
                            <button className="admin-back-btn" onClick={() => navigate("/admin/dashboard")}>
                                <ArrowLeft size={16} /> Hub
                            </button>
                            <FileText size={32} className="header-icon" />
                            <h1 className="header-title">Blog Post Manager</h1>
                        </div>
                        <button className="admin-submit-btn" onClick={openCreateForm}>
                            <Plus size={20} /> Create New Blog
                        </button>
                    </div>

                    {loading ? (<div className="admin-empty-state"><h3>Loading Blogs...</h3></div>) : blogs.length === 0 ? (<div className="admin-empty-state"><FileText size={48} className="empty-icon" /><h3>No Blogs Published</h3></div>) : (
                        <div className="blog-grid">
                            {blogs.map((blog, index) => (
                                <div key={blog._id} className="blog-card">
                                    <div className="blog-card-img-wrapper">
                                        <img src={resolveUrl(blog.coverImg) || resolveUrl(blog.bgImg) || defaultHero} alt="Cover" onError={(e) => { e.target.onerror = null; e.target.src = defaultHero; }} />
                                        <div className="blog-card-controls">
                                            <button className="reorder-btn" onClick={() => moveUp(index)} disabled={index === 0}><ArrowUp size={14} /></button>
                                            <button className="reorder-btn" onClick={() => moveDown(index)} disabled={index === blogs.length - 1}><ArrowDown size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="blog-card-body">
                                        <div className="blog-card-meta"><Calendar size={12} /> {safeText(blog.date)}</div>
                                        <h3 className="blog-card-title">{safeText(blog.title, "Untitled")}</h3>
                                        <p className="blog-card-author"><User size={14} /> {safeText(blog.authorDetails?.name || blog.author?.name, "JSM Admin")}</p>
                                    </div>
                                    <div className="blog-card-actions">
                                        <button className="action-btn edit-btn" onClick={() => openEditForm(blog)}><Edit3 size={16} /> Edit</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDelete(blog._id, blog.title)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* VIEW 2: FORM / EDITOR */}
            {view === "form" && (
                <div className="editor-layout">
                    {/* Top Bar */}
                    <div className="editor-top-bar">
                        <div className="top-bar-left">
                            <button className="admin-back-btn" onClick={() => setView("list")}>
                                <ArrowLeft size={16} /> Cancel
                            </button>
                            <h2>{editingId ? "Edit Blog" : "New Blog"}</h2>
                        </div>
                        <button className="admin-submit-btn" onClick={handleSubmit} disabled={saving}>
                            <Save size={18} /> {saving ? "Saving..." : "Publish Blog"}
                        </button>
                    </div>

                    <div className="editor-panels-wrapper">

                        {/* LEFT PANEL (Inputs) */}
                        <div className="editor-left-panel">

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Article Headline *</label>
                                    <input type="text" className="huge-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." />
                                </div>
                                <div className="form-group">
                                    <label>Publish Date</label>
                                    <input type="text" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} placeholder="e.g. Mar 2, 2026" />
                                </div>
                            </div>

                            <div className="admin-upload-card compact">
                                <h3>Imagery & Audio</h3>
                                <div className="asset-upload-grid">
                                    <div className="asset-item">
                                        <label>Cover (16:9)</label>
                                        <div className="asset-preview">
                                            <img src={resolveUrl(coverImgPreview) || defaultHero} alt="Cover" onError={(e) => { e.target.src = defaultHero }} />
                                        </div>
                                        <button className="secondary-outline-btn" onClick={() => triggerCrop('cover')}>Set Image</button>
                                    </div>
                                    <div className="asset-item">
                                        <label>Background (16:9)</label>
                                        <div className="asset-preview">
                                            <img src={resolveUrl(bgImgPreview) || defaultHero} alt="Bg" onError={(e) => { e.target.src = defaultHero }} />
                                        </div>
                                        <button className="secondary-outline-btn" onClick={() => triggerCrop('bg')}>Set Image</button>
                                    </div>
                                    <div className="asset-item border-left">
                                        <label><Mic size={12} /> Narration Audio</label>
                                        <button className="secondary-outline-btn" onClick={() => audioInputRef.current && audioInputRef.current.click()}>Upload File</button>
                                        {audioPreviewUrl && <button className="text-danger-btn" onClick={() => { setAudioFile(null); setAudioPreviewUrl(""); }}>Remove Audio</button>}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-upload-card compact">
                                <h3>Author Profile</h3>
                                <div className="form-grid-2">
                                    <div className="author-photo-row">
                                        <div className="author-avatar-preview">
                                            <img src={resolveUrl(authorPhotoPreview) || defaultAvatar} alt="Author" onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
                                        </div>
                                        <button className="secondary-outline-btn" onClick={() => triggerCrop('author')}>Upload Photo</button>
                                    </div>
                                    <div className="form-group">
                                        <label>Name</label>
                                        <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <input type="text" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)} />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Author Bio</label>
                                        <textarea value={authorBio} onChange={(e) => setAuthorBio(e.target.value)} rows="2" />
                                    </div>
                                </div>
                            </div>

                            <div className="quill-wrapper-box">
                                <label>Article Content *</label>
                                <ReactQuill theme="snow" value={content} onChange={setContent} modules={modules} formats={formats} />
                            </div>
                        </div>

                        {/* RIGHT PANEL (Live Preview) */}
                        <div className="editor-right-panel">
                            <div className="mock-browser">
                                <div className="mock-browser-hero" style={{ backgroundImage: `url(${resolveUrl(bgImgPreview) || resolveUrl(coverImgPreview) || defaultHero})` }}>
                                    <div className="mock-hero-overlay"></div>
                                    <div className="mock-hero-content">
                                        <h1>{title || "Your Title Appears Here..."}</h1>
                                        <div className="mock-hero-meta">
                                            <span><User size={14} /> {authorName || "JSM Admin"}</span>
                                            <span><Calendar size={14} /> {publishDate || "Date"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mock-browser-body">
                                    <div className="mock-content-area">
                                        <article className="quill-preview-content" dangerouslySetInnerHTML={{ __html: content || "<p style='color:#666'>Start typing in the editor on the left to see your content rendered here exactly as it will look on the live website.</p>" }} />
                                    </div>
                                    <div className="mock-sidebar">
                                        <div className="mock-sidebar-card">
                                            <div className="mock-sidebar-avatar">
                                                <img src={resolveUrl(authorPhotoPreview) || defaultAvatar} alt="Author" onError={(e) => { e.target.src = defaultAvatar }} />
                                            </div>
                                            <h3>{authorName || "JSM Author"}</h3>
                                            <h4>{authorRole || "Expert"}</h4>
                                            <div className="mock-sidebar-divider"></div>
                                            <p>{authorBio || "Expert insights and corporate legal analysis provided by the team at JSM Associates."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* CROPPER MODAL */}
            {rawPhotoUrl && (
                <div className="cropper-modal-overlay">
                    <div className="cropper-modal-box">
                        <div className="crop-area-container">
                            <Cropper image={rawPhotoUrl} crop={crop} zoom={zoom} aspect={cropTarget === 'author' ? 1 : 16 / 9} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
                        </div>
                        <div className="cropper-controls-bar">
                            <label>Zoom: <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} /></label>
                            <button className="cropper-cancel-btn" onClick={cancelCrop}>Cancel</button>
                            <button className="cropper-save-btn" onClick={saveCroppedImage}>Save Crop</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function AdminBlogManager() {
    return <ErrorBoundary><AdminBlogManagerContent /></ErrorBoundary>;
}