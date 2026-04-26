import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { Calendar, User, ArrowRight, Clock, Mic, Search, BookOpen, Share2 } from "lucide-react";
import "../styles/Block.css";

// 🚨 Unblockable blank fallback for blog cards
const defaultHero = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%230a0a0a'/%3E%3C/svg%3E";

// 🚨 SMART RESOLVER: Automatically routes backend files
const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

const Blogs = () => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    // STATE
    const [blogPosts, setBlogPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- FETCH FROM SERVER ---
    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5001/api/blogs');

            if (!response.ok) throw new Error("Server is running but returned an error.");

            const data = await response.json();
            const validBlogs = Array.isArray(data) ? data.filter(b => b && b._id) : [];
            setBlogPosts(validBlogs);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Could not connect to the Server. Is 'npm start' running in the backend folder?");
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchBlogs();
    }, []);

    // --- SMART HTML STRIPPER & SUMMARY GENERATOR ---
    const generateSummary = (html) => {
        if (!html) return "";
        let text = html.replace(/<[^>]+>/g, ' ');
        text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rsquo;/g, "'").replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&ndash;/g, '-').replace(/&mdash;/g, '-');
        text = text.replace(/\s+/g, ' ').trim();
        text = text.replace(/^(Introduction|Overview|Abstract|Summary|Conclusion)[:\-\s]*/i, '');
        return text.length > 150 ? text.substring(0, 150).trim() + '...' : text;
    };

    // 🚨 ADVANCED STATS CALCULATOR (Word Count & Time)
    const getReadingStats = (html) => {
        if (!html) return { time: "1 min read", words: 0 };
        let text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/gi, ' ');
        const wordsArray = text.split(/\s+/).filter(word => word.trim().length > 0);
        const wordCount = wordsArray.length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200));
        return { time: `${minutes} min read`, words: wordCount };
    };

    // 🚨 SHARE ACTION HANDLER
    const handleShare = async (e, post) => {
        e.stopPropagation(); // Prevents the card from navigating when you click share
        const url = `${window.location.origin}/blog/${post._id}`;
        const title = post.title || 'JSM Associates Legal Insight';

        if (navigator.share) {
            try {
                await navigator.share({ title, text: 'Check out this legal insight from JSM Associates.', url });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Article link copied to clipboard!");
        }
    };

    // --- SEARCH FILTER ---
    const filteredPosts = blogPosts.filter((post) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (post.title && post.title.toLowerCase().includes(searchLower)) ||
            (post.content && post.content.toLowerCase().includes(searchLower)) ||
            (post.authorDetails?.name && post.authorDetails.name.toLowerCase().includes(searchLower))
        );
    });

    if (loading) return (
        <div className={`blogs-container ${isDarkTheme ? "dark-theme" : "light-theme"}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2 style={{ color: 'var(--accent-primary)', fontFamily: "'Playfair Display', serif" }}>Loading Insights...</h2>
        </div>
    );

    if (error) return (
        <div className={`blogs-container ${isDarkTheme ? "dark-theme" : "light-theme"}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <h2 style={{ color: '#ff4444' }}>⚠️ Connection Error</h2>
            <p>{error}</p>
            <button onClick={fetchBlogs} style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: 'var(--accent-primary)', border: 'none', color: 'var(--bg-main)', fontWeight: 'bold', borderRadius: '4px' }}>
                Try Again
            </button>
        </div>
    );

    const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
    const standardPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

    return (
        <div className={`blogs-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}>

            <div className="blogs-header fade-in-up">
                <h1>Legal Insights</h1>
                <div className="title-divider"></div>
                <p>Expert perspectives on the evolving landscape of corporate law and justice.</p>

                {/* SEARCH BAR */}
                <div className="blogs-search-wrapper">
                    <div className="blogs-search-box">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search articles by title, content, or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="blogs-list">

                {/* FEATURED CARD */}
                {featuredPost && (
                    <div className="blog-card featured fade-in-up" onClick={() => navigate(`/blog/${featuredPost._id}`)}>
                        <div className="featured-img-wrapper">
                            <img
                                src={resolveUrl(featuredPost.coverImg) || resolveUrl(featuredPost.bgImg) || defaultHero}
                                alt={featuredPost.title}
                                onError={(e) => { e.target.onerror = null; e.target.src = defaultHero; }}
                            />
                            {featuredPost.audioUrl && (
                                <div className="audio-badge">
                                    <Mic size={14} /> Listen
                                </div>
                            )}
                        </div>

                        <div className="blog-content">
                            <div className="blog-card-meta">
                                {searchTerm === "" && <span className="latest-badge">Latest</span>}
                                <span className="meta-info"><BookOpen size={14} color="var(--accent-primary)" /> {getReadingStats(featuredPost.content).words} Words</span>
                                <span className="meta-info"><Clock size={14} color="var(--accent-primary)" /> {getReadingStats(featuredPost.content).time}</span>
                                <button className="card-share-btn" onClick={(e) => handleShare(e, featuredPost)}>
                                    <Share2 size={12} /> Share
                                </button>
                            </div>

                            <h2 className="featured-title">
                                {featuredPost.title}
                            </h2>

                            <p className="summary-text">
                                {generateSummary(featuredPost.content)}
                            </p>

                            <div className="card-footer">
                                <div className="card-author">
                                    <User size={16} color="var(--accent-primary)" /> {featuredPost.authorDetails?.name || featuredPost.author?.name || "JSM Associates"}
                                </div>
                                <span className="read-more-text">
                                    Read Article <ArrowRight size={16} />
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STANDARD GRID */}
                <div className="standard-grid">
                    {standardPosts.map((post, index) => {
                        const stats = getReadingStats(post.content);
                        return (
                            <div key={post._id} className={`blog-card standard fade-in-up delay-${index % 3}`} onClick={() => navigate(`/blog/${post._id}`)}>
                                <div className="standard-img-wrapper">
                                    <img
                                        src={resolveUrl(post.coverImg) || resolveUrl(post.bgImg) || defaultHero}
                                        alt={post.title}
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultHero; }}
                                    />
                                    {post.audioUrl && (
                                        <div className="audio-badge-mini">
                                            <Mic size={14} />
                                        </div>
                                    )}
                                </div>

                                <div className="standard-card-body">
                                    <div className="blog-card-meta">
                                        <span className="meta-info"><Calendar size={14} color="var(--accent-primary)" /> {post.date}</span>
                                        <span className="meta-info"><Clock size={14} color="var(--accent-primary)" /> {stats.time}</span>
                                        <button className="card-share-btn" onClick={(e) => handleShare(e, post)}>
                                            <Share2 size={12} /> Share
                                        </button>
                                    </div>

                                    <h3 className="standard-title">
                                        {post.title}
                                    </h3>

                                    <p className="summary-text">
                                        {generateSummary(post.content)}
                                    </p>

                                    <div className="card-footer">
                                        <div className="card-author">
                                            <User size={14} color="var(--accent-primary)" /> {post.authorDetails?.name || post.author?.name || "JSM Associates"}
                                        </div>
                                        <ArrowRight size={18} color="var(--accent-primary)" />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* EMPTY STATE FOR SEARCH */}
                {filteredPosts.length === 0 && !loading && !error && (
                    <div className="empty-search-state">
                        <h3>No articles found.</h3>
                        <p>Try adjusting your search terms.</p>
                    </div>
                )}

            </div>

            <div className="back-button-container">
                <button className="back-btn" onClick={() => navigate('/')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Blogs;