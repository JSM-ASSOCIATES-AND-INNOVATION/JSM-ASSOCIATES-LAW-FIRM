import React, { useState } from 'react';
import { Building2, Scale, Shield, FileText, Landmark, Users, Globe, Briefcase, X } from 'lucide-react';
import { useTheme } from './ThemeContext';
import '../styles/PracticeAreas.css';

const practiceAreasData = [
    {
        id: 1,
        title: "Corporate & Commercial",
        icon: Building2,
        desc: "Comprehensive legal strategies for businesses, from emerging enterprises to multinational corporations. We ensure your corporate governance and transactions are airtight.",
        points: [
            "Mergers & Acquisitions (M&A)",
            "Corporate Governance & Compliance",
            "Joint Ventures & Structuring",
            "Commercial Contracts & Agreements"
        ]
    },
    {
        id: 2,
        title: "Dispute Resolution",
        icon: Scale,
        desc: "Fierce advocacy and strategic litigation across all judicial forums, including the High Court and Supreme Court, as well as alternative dispute resolution.",
        points: [
            "Commercial Litigation",
            "Domestic & International Arbitration",
            "Mediation & Conciliation",
            "White Collar Defense"
        ]
    },
    {
        id: 3,
        title: "Intellectual Property",
        icon: Shield,
        desc: "Protecting your most valuable intangible assets. We offer complete lifecycle management for your brand's intellectual property and corporate identity.",
        points: [
            "Trademark Registration & Enforcement",
            "Patent Filing & Strategy",
            "Copyright Infringement",
            "Trade Secret Protection"
        ]
    },
    {
        id: 4,
        title: "Real Estate & Property",
        icon: Landmark,
        desc: "Navigating complex property laws, development regulations, and high-value real estate transactions for developers, investors, and corporations.",
        points: [
            "Commercial Leasing & Transactions",
            "Land Acquisition & Title Due Diligence",
            "Construction Contracts",
            "Property Dispute Litigation"
        ]
    },
    {
        id: 5,
        title: "Employment & Labour",
        icon: Users,
        desc: "Guiding organizations through the complexities of human resources law, ensuring compliance while protecting corporate interests in workforce disputes.",
        points: [
            "Employment Contracts & Policies",
            "Workplace Investigations",
            "Labour Dispute Resolution",
            "Executive Compensation"
        ]
    },
    {
        id: 6,
        title: "Banking & Finance",
        icon: Briefcase,
        desc: "Strategic counsel for financial institutions, lenders, and borrowers in complex financial transactions and regulatory compliance.",
        points: [
            "Debt Restructuring & Insolvency",
            "Project Finance",
            "Regulatory Compliance",
            "Asset Management"
        ]
    },
    {
        id: 7,
        title: "Tax & Customs",
        icon: FileText,
        desc: "Sophisticated tax planning and aggressive representation in tax disputes to optimize your corporate financial strategy.",
        points: [
            "Direct & Indirect Taxation",
            "Customs & Trade Disputes",
            "Cross-Border Tax Structuring",
            "Tax Litigation"
        ]
    },
    {
        id: 8,
        title: "Constitutional Law",
        icon: Globe,
        desc: "Defending fundamental rights and challenging arbitrary administrative actions through writ petitions in High Courts and the Supreme Court.",
        points: [
            "Writ Petitions",
            "Public Interest Litigation (PIL)",
            "Administrative Tribunal Appeals",
            "Government Policy Challenges"
        ]
    }
];

const PracticeAreas = () => {
    const { isDarkTheme } = useTheme();
    const [selectedArea, setSelectedArea] = useState(null);

    // Prevent scrolling when modal is open
    React.useEffect(() => {
        if (selectedArea) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [selectedArea]);

    return (
        <section className={`practice-areas ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id="practice-areas">
            <div className="practice-areas-container">

                <div className="practice-areas-header">
                    <h2 className="practice-areas-title">Areas of Expertise</h2>
                    <p className="practice-areas-subtitle">
                        Delivering mastery and strategic innovation across a comprehensive spectrum of legal disciplines.
                    </p>
                </div>

                <div className="practice-areas-grid">
                    {practiceAreasData.map((area) => {
                        const IconComponent = area.icon;
                        return (
                            <div
                                key={area.id}
                                className="practice-card"
                                onClick={() => setSelectedArea(area)}
                            >
                                <div className="practice-card-icon">
                                    <IconComponent />
                                </div>
                                <h3 className="practice-card-title">{area.title}</h3>
                                <span className="hover-text">Explore Details &rarr;</span>
                            </div>
                        );
                    })}
                </div>

            </div>

            {/* MODAL */}
            {selectedArea && (
                <div className="practice-modal-overlay" onClick={() => setSelectedArea(null)}>
                    <div className="practice-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedArea(null)}>
                            <X size={32} />
                        </button>

                        <h2>
                            <selectedArea.icon size={36} color="var(--accent-primary)" />
                            {selectedArea.title}
                        </h2>

                        <p className="modal-desc">{selectedArea.desc}</p>

                        <ul className="modal-points">
                            {selectedArea.points.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PracticeAreas;