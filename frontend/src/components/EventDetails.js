import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import "../styles/EventDetails.css";

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // --- SCROLL TO TOP ---
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        console.log("Fetching event for ID:", id); // Debug log
        setLoading(true);

        // FIXED: Pointing to the correct backend port (5001)
        fetch('http://localhost:5001/api/events')
            .then(res => res.json())
            .then(data => {
                // ROBUST ID CHECK: Convert both to string to be safe
                const found = data.find(e => {
                    const eventId = e._id || e.id;
                    return eventId && eventId.toString() === id.toString();
                });

                if (found) {
                    console.log("Event Found:", found.title);
                    setEvent(found);
                } else {
                    console.error("Event NOT found in database.");
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                setLoading(false);
            });
    }, [id]);

    // Carousel Logic
    useEffect(() => {
        if (!event || !isAutoPlaying) return;
        const allImages = [event.coverImg || event.img, ...(event.gallery || [])].filter(Boolean);
        if (allImages.length <= 1) return;

        const timer = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % allImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [event, isAutoPlaying]);

    // --- SAFETY LOADING STATE ---
    if (loading) return (
        <div style={{ width: '100vw', height: '100vh', background: '#050505', color: '#d4af37', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif" }}>Loading Event Details...</h2>
        </div>
    );

    // --- SAFETY NOT FOUND STATE ---
    if (!event) return (
        <div style={{ width: '100vw', height: '100vh', background: '#050505', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <h2 style={{ color: 'red', fontFamily: "'Playfair Display', serif", fontSize: '3rem' }}>Event Not Found</h2>
            <p style={{ color: '#888' }}>ID: {id}</p>
            <button onClick={() => navigate("/events")} style={{ padding: '10px 20px', marginTop: '20px', background: '#d4af37', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
                Back to Events
            </button>
        </div>
    );

    const allImages = [event.coverImg || event.img, ...(event.gallery || [])].filter(Boolean);

    return (
        <div className="detail-page-container">

            {/* LEFT: GALLERY */}
            <div className="detail-gallery-side">
                <button className="back-btn-overlay" onClick={() => navigate("/events")}>
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="main-stage-image">
                    {allImages.length > 0 ? (
                        <img
                            src={allImages[activeImageIndex]}
                            alt="Main Stage"
                            className="fade-in-image"
                            key={activeImageIndex}
                            // Using the imageFit preference from the admin panel
                            style={{ objectFit: event.imageFit || 'cover' }}
                        />
                    ) : (
                        <div style={{ color: 'white', display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>No Images</div>
                    )}
                </div>

                {/* Circular Thumbnails */}
                {allImages.length > 1 && (
                    <div
                        className="circular-carousel-strip"
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className={`circle-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                                onClick={() => setActiveImageIndex(idx)}
                            >
                                <img src={img} alt="thumb" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT: INFO */}
            <div className="detail-info-side">
                <div className="info-content-wrapper">
                    <span className="detail-badge">{new Date(event.date) < new Date() ? 'PAST EVENT' : 'EVENT BRIEF'}</span>
                    <h1 className="detail-title">{event.title}</h1>

                    <div className="detail-meta-row">
                        <div className="meta-box">
                            <Calendar size={18} className="gold-icon" />
                            <span>{event.date}</span>
                        </div>
                        {event.time && (
                            <div className="meta-box">
                                <Clock size={18} className="gold-icon" />
                                <span>{event.time}</span>
                            </div>
                        )}
                    </div>

                    <div className="detail-divider"></div>

                    <div className="detail-description-scroll">
                        <p style={{ whiteSpace: 'pre-wrap' }}>{event.desc}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;