import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Events.css";
import { useTheme } from "./ThemeContext";
import { ArrowRight, Calendar, Clock, History, X } from "lucide-react";

const Events = () => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showPastEvents, setShowPastEvents] = useState(false);

    // --- REFS ---
    const wheelRef = useRef(null);
    const stageRef = useRef(null);
    const autoPlayRef = useRef(null);

    // Drag / Scroll Refs
    const isDragging = useRef(false);
    const startX = useRef(0);
    const startRotation = useRef(0);

    // THROTTLE REF (The fix for the scroll glitch)
    const isScrollingRef = useRef(false);

    // --- 0. SCROLL FIX ---
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // --- 1. FETCH EVENTS ---
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/events');
                if (response.ok) {
                    const data = await response.json();
                    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setEvents(sorted);
                }
            } catch (error) {
                console.error("Error connecting to server:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // --- CALCULATIONS ---
    const isSingleEvent = events.length <= 1;
    const sliceDeg = isSingleEvent ? 0 : 360 / events.length;
    const wheelRadius = isSingleEvent ? 0 : (events.length < 3 ? 250 : 500);

    // --- 2. ROTATION LOGIC ---
    const rotateTo = (deg) => {
        if (isSingleEvent) return;
        setRotation(deg);
        const normalizedDeg = -deg % 360;
        const positiveDeg = normalizedDeg < 0 ? normalizedDeg + 360 : normalizedDeg;
        const index = Math.round(positiveDeg / sliceDeg) % events.length;
        setActiveIndex(index);
    };

    useEffect(() => {
        if (isPaused || isDragging.current || events.length <= 1 || showPastEvents) return;
        autoPlayRef.current = setInterval(() => {
            rotateTo(rotation - sliceDeg);
        }, 4000);
        return () => clearInterval(autoPlayRef.current);
    }, [rotation, isPaused, events.length, sliceDeg, showPastEvents]);

    // --- 3. INTERACTION HANDLERS ---
    const handlePointerDown = (e) => {
        if (isSingleEvent) return;
        isDragging.current = true;
        setIsPaused(true);
        startX.current = e.clientX;
        startRotation.current = rotation;
        if (stageRef.current) stageRef.current.style.cursor = "grabbing";
    };

    const handlePointerMove = (e) => {
        if (!isDragging.current || isSingleEvent) return;
        const deltaX = e.clientX - startX.current;
        setRotation(startRotation.current + (deltaX * 0.5));
    };

    const handlePointerUp = () => {
        if (isSingleEvent) return;
        isDragging.current = false;
        setIsPaused(false);
        if (stageRef.current) stageRef.current.style.cursor = "grab";
        const nearestIndex = Math.round(-rotation / sliceDeg);
        rotateTo(-(nearestIndex * sliceDeg));
    };

    // --- THROTTLED WHEEL HANDLER ---
    const handleWheel = (e) => {
        if (isSingleEvent) return;

        // Prevent default scrolling behaviour while over the carousel
        e.preventDefault();

        // If we are currently in a cooldown, ignore the scroll completely
        if (isScrollingRef.current) return;

        setIsPaused(true);
        isScrollingRef.current = true; // Lock further scrolling

        // Determine direction (1 for down/right, -1 for up/left)
        const direction = e.deltaY > 0 ? 1 : -1;

        // Snap perfectly to the next slide
        const nearestIndex = Math.round(-rotation / sliceDeg);
        const nextRotation = -((nearestIndex + direction) * sliceDeg);

        rotateTo(nextRotation);

        // Set a cooldown matching your CSS transition time (0.8s) before allowing another scroll
        setTimeout(() => {
            isScrollingRef.current = false;
            setIsPaused(false);
        }, 800);
    };

    const handleNavigate = (eventItem) => {
        const targetId = eventItem._id || eventItem.id;
        if (targetId) navigate(`/event/${targetId}`);
    };

    // --- RENDERS ---
    if (loading) return (
        <div className={`events-page ${isDarkTheme ? "dark" : "light"} center-state`}>
            <h2 className="luxury-text">Loading Events...</h2>
        </div>
    );

    if (events.length === 0) return (
        <div className={`events-page ${isDarkTheme ? "dark" : "light"} center-state`}>
            <div className="empty-state-content">
                <h1 className="luxury-text">Coming Soon</h1>
                <p>No events scheduled at the moment.</p>
            </div>
        </div>
    );

    const activeEvent = events[activeIndex] || events[0];
    const isPast = new Date(activeEvent.date) < new Date();
    const pastEventsList = events.filter(e => new Date(e.date) < new Date());

    return (
        <div className={`events-page ${isDarkTheme ? "dark" : "light"}`}>

            {/* BACKGROUND */}
            <div className="events-bg">
                <div className="bg-overlay"></div>
                <img src={activeEvent.coverImg || activeEvent.img} alt="bg" className="bg-image key-anim" key={activeEvent._id} />
            </div>

            {/* TEXT CONTENT */}
            <div className="events-content fade-in-up" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
                <div className="status-row">
                    <span className={`event-status ${isPast ? 'status-past' : 'status-upcoming'}`}>
                        {isPast ? "Past Event" : "Upcoming Event"}
                    </span>
                </div>

                <h1 className="event-title">{activeEvent.title}</h1>
                <div className="event-divider"></div>

                <div className="event-meta">
                    <span className="meta-item"><Calendar size={16} /> {activeEvent.date}</span>
                    {activeEvent.time && <span className="meta-item"><Clock size={16} /> {activeEvent.time}</span>}
                </div>

                <p className="event-desc">{activeEvent.desc}</p>

                <div className="button-group">
                    <button className="view-event-btn" onClick={() => handleNavigate(activeEvent)}>
                        {isPast ? "View Highlights" : "View Details"} <ArrowRight size={18} />
                    </button>
                    <button className="past-events-btn" onClick={() => setShowPastEvents(true)}>
                        <History size={18} /> Past Events
                    </button>
                </div>
            </div>

            {/* 3D WHEEL */}
            <div className={`carousel-stage ${isSingleEvent ? 'single-item' : ''}`} ref={stageRef} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp} onWheel={handleWheel} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
                <div className="carousel-wheel" ref={wheelRef} style={{ transform: `rotateY(${rotation}deg)` }}>
                    {events.map((event, i) => {
                        const isEventPast = new Date(event.date) < new Date();
                        return (
                            <div key={event._id || event.id} className={`carousel-card ${i === activeIndex ? "active" : ""} ${isEventPast ? "card-past" : ""}`} style={{ "--i": i, "--total": events.length, "--radius": `${wheelRadius}px`, background: '#000' }} onClick={() => rotateTo(-(i * sliceDeg))}>
                                <img
                                    src={event.coverImg || event.img}
                                    alt={event.title}
                                    style={{ objectFit: event.imageFit || 'cover' }}
                                />
                                <div className="card-shine"></div>
                                {isEventPast && <div className="card-past-overlay">PAST</div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* PAST EVENTS MODAL */}
            {showPastEvents && (
                <div className="past-events-overlay">
                    <button className="close-overlay-btn" onClick={() => setShowPastEvents(false)}><X size={32} /></button>
                    <div className="past-events-container">
                        <h2 className="overlay-title">Event Archive</h2>
                        <div className="overlay-divider"></div>
                        <div className="past-events-grid">
                            {pastEventsList.length > 0 ? (
                                pastEventsList.map(event => (
                                    <div key={event._id || event.id} className="past-event-tile" onClick={() => { setShowPastEvents(false); handleNavigate(event); }}>
                                        <div className="tile-image-wrapper" style={{ background: '#000' }}>
                                            <img
                                                src={event.coverImg || event.img}
                                                alt={event.title}
                                                style={{ objectFit: event.imageFit || 'cover' }}
                                            />
                                            <div className="tile-overlay"><span>View Highlights</span></div>
                                        </div>
                                        <div className="tile-info">
                                            <h3>{event.title}</h3>
                                            <span className="tile-date">{event.date}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (<p className="no-events-msg">No past events found.</p>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;