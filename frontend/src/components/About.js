import React from 'react';
import { Scale, Shield, Target } from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/About.css';

const About = () => {
    const { isDarkTheme } = useTheme();

    return (
        <section className={`about-section ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id="about">
            <div className="about-container">

                {/* Left Side: Text Content */}
                <div className="about-content">
                    <h4 className="about-subtitle">THE JSM ADVANTAGE</h4>
                    <h2 className="about-title">JSM Associates</h2>
                    <p className="about-description">
                        At JSM Associates, we believe that exceptional legal representation requires a masterful blend of traditional expertise and modern innovation. Built on a foundation of unwavering integrity and relentless advocacy, our firm is dedicated to navigating the most complex legal landscapes.
                    </p>
                    <p className="about-description">
                        Whether representing global enterprises, emerging commercial entities, or individual clients, our commitment remains singular: to provide strategic, forward-thinking legal solutions that protect your interests, drive growth, and secure your future.
                    </p>

                    <div className="about-stats">
                        <div className="stat-item">
                            <span className="stat-number">Expert</span>
                            <span className="stat-label">Legal Counsel</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">100%</span>
                            <span className="stat-label">Client Commitment</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Feature Cards */}
                <div className="about-features">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Scale size={28} className="feature-icon" />
                        </div>
                        <h3>Unwavering Justice</h3>
                        <p>Driven by the spirit of fairness, sharp acumen, and a profound understanding of the law.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Shield size={28} className="feature-icon" />
                        </div>
                        <h3>Fierce Protection</h3>
                        <p>Safeguarding our clients' assets, corporate standing, and reputation at every turn.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Target size={28} className="feature-icon" />
                        </div>
                        <h3>Strategic Innovation</h3>
                        <p>Leveraging dynamic strategies and corporate foresight to achieve landmark victories.</p>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default About;