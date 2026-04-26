import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { ArrowLeft, Calendar, User, Clock, Mic, Play, Pause, FastForward, Headphones, Share2, BookOpen, Twitter, Linkedin, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import axios from "axios";

// 🚨 FIXED PATH: Pointing exactly to the admin subfolder
import "../styles/admin/AdminBlogManager.css";
import "../styles/BlogPost.css";

// Updated SVG to Orangish Amber (#FFBF00)
const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23111'/%3E%3Cpath d='M100 105c16.5 0 30-13.5 30-30s-13.5-30-30-30-30 13.5-30 30 13.5 30 30 30zm0 15c-22.1 0-65 11.1-65 33.3V170h130v-16.7c0-22.2-42.9-33.3-65-33.3z' fill='%23FFBF00'/%3E%3C/svg%3E";
const defaultHero = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%230a0a0a'/%3E%3C/svg%3E";

const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

// =========================================
// CUSTOM AUDIO PLAYER COMPONENT (Theme Reactive)
// =========================================
const CustomAudioPlayer = ({ audioSrc, isDarkTheme }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState("0:00");
    const [duration, setDuration] = useState("0:00");
    const [playbackRate, setPlaybackRate] = useState(1);

    // Dynamic Theme Colors
    const accentColor = isDarkTheme ? '#FFBF00' : '#CD0000';
    const bgCard = isDarkTheme ? '#111111' : '#f9f9f9';
    const textColor = isDarkTheme ? '#ffffff' : '#111111';
    const textMuted = isDarkTheme ? '#888888' : '#666666';
    const borderColor = isDarkTheme ? '#333333' : '#eaeaea';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
            setCurrentTime(formatTime(audio.currentTime));
        };
        const handleLoadedMetadata = () => setDuration(formatTime(audio.duration));
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener("timeupdate", updateProgress);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", updateProgress);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const togglePlay = () => {
        if (isPlaying) audioRef.current.pause();
        else audioRef.current.play();
        setIsPlaying(!isPlaying);
    };

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
    };

    const changeSpeed = () => {
        const newRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
        audioRef.current.playbackRate = newRate;
        setPlaybackRate(newRate);
    };

    return (
        <div style={{ background: bgCard, border: `1px solid ${borderColor}`, padding: '20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', marginTop: '30px', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <audio ref={audioRef} src={audioSrc} preload="metadata" />
            <button onClick={togglePlay} style={{ width: '50px', height: '50px', borderRadius: '50%', background: accentColor, border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', flexShrink: 0, color: isDarkTheme ? '#000' : '#fff' }}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
            </button>
            <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: textMuted, fontWeight: 'bold', fontFamily: 'monospace' }}>
                    <span>{currentTime}</span><span>{duration}</span>
                </div>
                <div onClick={handleProgressClick} style={{ width: '100%', height: '6px', background: borderColor, borderRadius: '3px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, background: accentColor, borderRadius: '3px', transition: 'width 0.1s linear' }}></div>
                </div>
            </div>
            <button onClick={changeSpeed} style={{ background: 'transparent', border: `1px solid ${borderColor}`, color: textColor, padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FastForward size={14} /> {playbackRate}x
            </button>
        </div>
    );
};

// =========================================
// MAIN BLOG POST COMPONENT
// =========================================
const BlogPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    const accentColor = isDarkTheme ? '#FFBF00' : '#CD0000';

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axios.get("http://localhost:5001/api/blogs");
                const foundBlog = res.data.find(b => b._id === id);
                setBlog(foundBlog);
            } catch (err) {
                console.error("Error fetching blog", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) return (
        <div className={`blog-post-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2 style={{ color: accentColor, fontFamily: "'Playfair Display', serif" }}>Loading Insight...</h2>
        </div>
    );

    if (!blog) return (
        <div className={`blog-post-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
            <h2>Publication Not Found</h2>
            <button onClick={() => navigate('/blogs')} style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: `1px solid ${accentColor}`, color: accentColor, cursor: 'pointer', borderRadius: '4px' }}>Return to Archives</button>
        </div>
    );

    const bgImage = resolveUrl(blog.bgImg) || resolveUrl(blog.coverImg) || defaultHero;
    const authorImage = resolveUrl(blog.authorPhoto) || resolveUrl(blog.authorDetails?.photo) || defaultAvatar;
    const authorName = blog.authorDetails?.name || blog.author?.name || "JSM Legal Expert";
    const authorRole = blog.authorDetails?.role || blog.author?.profession || "Legal Counsel";
    const authorBio = blog.authorDetails?.bio || blog.author?.bio || "Expert insights and corporate legal analysis provided by the team at JSM Associates.";
    const audioTrack = resolveUrl(blog.audioUrl);

    // 🚨 STRIP OUT FORCED BACKGROUND COLORS FROM QUILL SO IT MATCHES THE JSM THEME
    const cleanHTML = blog.content
        ? blog.content.replace(/background-color:\s*rgb\(\d+,\s*\d+,\s*\d+\);?/gi, '')
            .replace(/background-color:\s*#[a-fA-F0-9]+;?/gi, '')
            .replace(/color:\s*rgb\(\d+,\s*\d+,\s*\d+\);?/gi, '')
            .replace(/color:\s*#[a-fA-F0-9]+;?/gi, '')
        : "<p>No content available.</p>";

    return (
        <div className={`blog-post-page ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>

            {/* HERO SECTION */}
            <div className="blog-hero-section" style={{ backgroundImage: `url(${bgImage})` }}>
                <div className="hero-gradient-overlay"></div>
                <div className="hero-content-wrapper">
                    <button className="hero-back-btn" onClick={() => navigate('/blogs')}>
                        <ArrowLeft size={16} /> Back to Publications
                    </button>
                    <div className="hero-meta-data">
                        <span className="hero-meta-item"><Calendar size={14} /> {blog.date}</span>
                        <span className="hero-meta-item"><Clock size={14} /> {Math.ceil(blog.content?.split(' ').length / 200 || 1)} Min Read</span>
                    </div>
                    <h1 className="hero-title">{blog.title}</h1>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="blog-main-grid">

                <div className="blog-article-area">
                    {/* Share Bar */}
                    <div className="article-share-bar">
                        <span className="share-label">Share Insight:</span>
                        <button className="share-icon-btn"><Linkedin size={18} /></button>
                        <button className="share-icon-btn"><Twitter size={18} /></button>
                        <button className="share-icon-btn"><Facebook size={18} /></button>
                        <button className="share-icon-btn"><LinkIcon size={18} /></button>
                    </div>

                    {/* Audio Player */}
                    {audioTrack && (
                        <div className="audio-narrator-section fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '-20px', marginLeft: '10px', color: accentColor }}>
                                <Mic size={16} /> Listen to this Insight
                            </div>
                            <CustomAudioPlayer audioSrc={audioTrack} isDarkTheme={isDarkTheme} />
                        </div>
                    )}

                    {/* Quill Content */}
                    <article className="quill-preview-content" lang="en" dangerouslySetInnerHTML={{ __html: cleanHTML }} />
                </div>

                {/* SIDEBAR: AUTHOR DOSSIER */}
                <aside className="blog-sidebar-area">
                    <div className="author-dossier-card">
                        <div className="author-dossier-photo">
                            <img src={authorImage} alt="Author" onError={(e) => { e.target.onerror = null; e.target.src = defaultAvatar; }} />
                        </div>

                        <div className="author-dossier-info">
                            <h3 className="author-dossier-name">{authorName}</h3>
                            <p className="author-dossier-role">{authorRole}</p>
                            <div className="author-dossier-divider"></div>
                            <p className="author-dossier-bio">{authorBio}</p>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default BlogPost;