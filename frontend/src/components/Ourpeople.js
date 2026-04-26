import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "../styles/Ourpeople.css";
import { useTheme } from "./ThemeContext";

// 🚨 SMART RESOLVER: Ensures backend uploads render correctly
const resolveUrl = (url) => {
    if (!url) return "/placeholder.jpg"; // Fallback if no image
    if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;
    return `http://localhost:5001/${cleanPath}`;
};

// 🚨 SMART FALLBACK: If the database is empty, show these so the layout never breaks
const fallbackLeadership = [
    {
        _id: "mock1",
        name: "JSM Managing Partner",
        designation: "Founder & Head of Corporate",
        image: "/placeholder.jpg"
    },
    {
        _id: "mock2",
        name: "JSM Senior Partner",
        designation: "Head of Dispute Resolution",
        image: "/placeholder.jpg"
    }
];

const OurPeople = () => {
    const { isDarkTheme } = useTheme();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomepageTeam = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/team');
                if (!response.ok) throw new Error("Backend not responding");

                const data = await response.json();

                // 1. Find members explicitly marked with the "Feature on Homepage" toggle
                let homepageMembers = data.filter(member => member.showOnHome === true);

                // 2. Fallback: If no one is marked yet, grab the top "Board of Directors" automatically
                if (homepageMembers.length === 0) {
                    homepageMembers = data.filter(member => member.category === "Board of Directors");
                }

                // 3. If there is STILL no data, trigger the mock fallback
                if (homepageMembers.length === 0) {
                    setPartners(fallbackLeadership);
                } else {
                    // Slice to ensure we only ever show exactly 2 cards
                    setPartners(homepageMembers.slice(0, 2));
                }
            } catch (error) {
                console.error("Database connection failed, using fallback UI.");
                setPartners(fallbackLeadership);
            } finally {
                setLoading(false);
            }
        };

        fetchHomepageTeam();
    }, []);

    return (
        <section className={`our-people ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id="people">
            <div className="our-people-container">

                {/* Header Section */}
                <div className="header-wrapper">
                    <p className="subtitle">JSM Leadership</p>
                    <h2 className="our-people-heading">The Managing Partners</h2>
                    <div className="theme-divider"></div>
                </div>

                {/* The Monolith Grid */}
                <div className="partners-grid">
                    {loading ? (
                        <div className="loading-text">
                            Loading Leadership...
                        </div>
                    ) : (
                        partners.map((partner, index) => (
                            <div key={partner._id || index} className="partner-card">
                                <div className="image-frame">
                                    <img
                                        src={resolveUrl(partner.image)}
                                        alt={partner.name}
                                        className="partner-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            // Fallback image source if the link breaks
                                            e.target.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                                        }}
                                    />
                                    <div className="overlay-gradient"></div>
                                </div>

                                <div className="partner-info">
                                    <p className="partner-designation">{partner.designation}</p>
                                    <h3 className="partner-name">{partner.name}</h3>
                                    <div className="hover-line"></div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Link */}
                <div className="our-people-link">
                    <Link to="/team" className="view-team-btn">
                        <span>Meet The Full Council</span>
                        <ArrowRight size={20} />
                    </Link>
                </div>

            </div>
        </section>
    );
};

export default OurPeople;