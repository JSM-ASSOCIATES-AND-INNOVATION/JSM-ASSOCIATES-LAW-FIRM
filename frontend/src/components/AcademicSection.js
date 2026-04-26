import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeContext';

// 🚨 Import the moved CSS file
import '../styles/AcademicSection.css';

// 🚨 SMART RESOLVER
const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

const AcademicSection = () => {
    const [collabs, setCollabs] = useState([]);
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    useEffect(() => {
        fetch("http://localhost:5001/api/academic")
            .then(res => res.json())
            .then(data => setCollabs(data))
            .catch(err => console.error("Could not fetch academic collabs:", err));
    }, []);

    // Don't render the section if there are no collaborations uploaded yet
    if (collabs.length === 0) return null;

    // Duplicate the array 3 times so the infinite scroll animation is perfectly seamless
    const scrollItems = [...collabs, ...collabs, ...collabs];

    return (
        <section className={`academic-section ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>

            <div className="academic-header">
                <h2 className="academic-title">Academic Collaborations</h2>
                <div className="academic-divider"></div>
                <p className="academic-subtitle">
                    JSM Associates proudly partners with leading institutions to empower the next generation of legal professionals.
                </p>
            </div>

            <div className="academic-marquee-container">
                {/* Gradient fade edges */}
                <div className="marquee-fade-left"></div>
                <div className="marquee-fade-right"></div>

                {/* The infinitely scrolling track */}
                <div className="academic-track">
                    {scrollItems.map((c, i) => (
                        <div key={i} className="collab-item" onClick={() => navigate('/events')}>
                            <div className="collab-logo-wrapper">
                                <img
                                    className="collab-logo-img"
                                    src={resolveUrl(c.logo)}
                                    alt={c.name}
                                />
                            </div>
                            <span className="collab-name">
                                {c.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="academic-btn-container">
                <button className="academic-btn" onClick={() => navigate('/events')}>
                    View Joint Events <ArrowRight size={18} />
                </button>
            </div>

        </section>
    );
};

export default AcademicSection;