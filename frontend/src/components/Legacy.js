import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import '../styles/Legacy.css';

const Legacy = () => {
    const { isDarkTheme } = useTheme();
    const [activeNode, setActiveNode] = useState(0);

    const timelineData = [
        {
            title: "Foundation",
            sub: "Est. 1998",
            desc: "Established with a core commitment to unwavering justice, integrity, and the aggressive protection of our clients' fundamental rights."
        },
        {
            title: "Expansion",
            sub: "2010",
            desc: "Expanded our elite practice areas to encompass global corporate structuring, real estate, and high-stakes commercial litigation."
        },
        {
            title: "Innovation",
            sub: "2020",
            desc: "Integrated cutting-edge legal technology and predictive analytics to provide unparalleled, forward-thinking client service."
        },
        {
            title: "The Future",
            sub: "Present",
            desc: "Continuing our legacy of landmark victories and legal excellence, guided always by the sanctity of law and strategic mastery."
        }
    ];

    return (
        <div className={`legacy-wrapper ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            <div className="legacy-container">

                {/* --- WATERMARK BACKGROUND --- */}
                <div className="watermark-text">
                    <h1>OUR LEGACY</h1>
                </div>

                <div className="legacy-content-inner">

                    {/* --- TOP HEADER SECTION --- */}
                    <div className="top-section">
                        <div className="legacy-header-compact">
                            <div className="theme-line"></div>
                            <span className="header-text">JUSTICE • STRATEGY • MASTERY</span>
                            <div className="theme-line"></div>
                        </div>
                    </div>

                    {/* --- INTERACTIVE DIAGRAM (TIMELINE) --- */}
                    <div className="diagram-wrapper">
                        <div className="connecting-line"></div>
                        <div className="nodes-container">
                            {timelineData.map((node, index) => (
                                <div
                                    key={index}
                                    className={`node-item ${activeNode === index ? 'active' : ''}`}
                                    onMouseEnter={() => setActiveNode(index)}
                                    onClick={() => setActiveNode(index)}
                                >
                                    <div className="diamond-shape">
                                        <div className="inner-diamond"></div>
                                    </div>
                                    <h3 className="node-title">{node.title}</h3>
                                    <span className="node-sub">{node.sub}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- DIAGRAM DESCRIPTION STAGE --- */}
                    <div className="description-stage">
                        <p className="fade-in-text" key={activeNode}>
                            {timelineData[activeNode].desc}
                        </p>
                    </div>

                    {/* --- EDITORIAL GRID (STATS TABLE) --- */}
                    <div className="legacy-grid">

                        {/* Left Box: Big Stat & Description */}
                        <div className="grid-item big-stat-box">
                            <div className="grid-label">Our Impact</div>
                            <div className="big-number">25+</div>
                            <p className="grid-desc">
                                For over a quarter of a century, JSM Associates has set the benchmark for legal excellence. We have navigated the most complex landscapes to protect our clients' interests, secure their assets, and forge a legacy of absolute trust.
                            </p>
                        </div>

                        {/* Right Box: Stacked Stat Rows */}
                        <div className="grid-item stats-group">
                            <div className="stat-row border-bottom">
                                <div className="stat-num-wrapper">
                                    <span className="stat-num"><span>$</span>10B<span>+</span></span>
                                </div>
                                <span className="stat-name">Assets<br />Protected</span>
                            </div>

                            <div className="stat-row border-bottom">
                                <div className="stat-num-wrapper">
                                    <span className="stat-num">98<span>%</span></span>
                                </div>
                                <span className="stat-name">Client<br />Success</span>
                            </div>

                            <div className="stat-row">
                                <div className="stat-num-wrapper">
                                    <span className="stat-num">50<span>+</span></span>
                                </div>
                                <span className="stat-name">Senior<br />Partners</span>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Legacy;