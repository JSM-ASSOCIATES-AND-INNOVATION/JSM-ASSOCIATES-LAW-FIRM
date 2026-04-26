import React from 'react';
import { BookOpen, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import '../styles/Publications.css';

const Publications = () => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    return (
        <section className={`publications-section ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id="publications">
            <div className="publications-container">

                {/* Animated Icon Group */}
                <div className="construction-icon-wrapper">
                    <BookOpen size={56} className="main-icon" />
                    <div className="badge-wrapper">
                        <Clock size={24} className="badge-icon" />
                    </div>
                </div>

                <h4 className="publications-subtitle">JSM Knowledge Vault</h4>
                <h2 className="publications-title">Publications</h2>

                <div className="construction-divider"></div>

                <p className="publications-description">
                    The strategic minds at JSM Associates are currently curating an exclusive archive of corporate legal analyses, definitive whitepapers, and landmark case studies.
                </p>

                <p className="publications-notice">
                    This repository is undergoing final review. Please check back soon for unparalleled legal insights.
                </p>

                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={18} className="arrow-icon" /> Return
                </button>

            </div>
        </section>
    );
};

export default Publications;