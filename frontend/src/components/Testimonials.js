import React from 'react';
import { useTheme } from './ThemeContext';
import { Star } from 'lucide-react';
import '../styles/Testimonials.css';

// Law Firm adapted mock reviews for JSM Associates
const row1Reviews = [
    {
        id: 1,
        text: "After months of stalled negotiations, the team at JSM Associates secured a highly favorable settlement for our corporate dispute.",
        author: "Priya M.",
        role: "Founder of NextGen Solutions"
    },
    {
        id: 2,
        text: "Their expert legal counsel during our merger was invaluable. Truly a top-tier law firm with exceptional attention to detail.",
        author: "Abhishek T.",
        role: "CEO of FashionVibes India"
    },
    {
        id: 3,
        text: "JSM's swift action in our intellectual property case saved us millions. Their litigators are sharp and deeply dedicated.",
        author: "David H.",
        role: "Tech Innovators Inc."
    },
    {
        id: 4,
        text: "They transformed a complex regulatory compliance issue into a clear, manageable process. Highly recommended!",
        author: "Anjali P.",
        role: "Director at Wanderland"
    }
];

const row2Reviews = [
    {
        id: 5,
        text: "As a startup, JSM gave us bulletproof contracts and legal structuring from day one. We feel completely protected.",
        author: "Sahil K.",
        role: "Founder, Collab Diary"
    },
    {
        id: 6,
        text: "The dedication and sharp legal acumen of their team gave us absolute peace of mind during a very tough trial.",
        author: "Nikhil R.",
        role: "Elegant Interiors"
    },
    {
        id: 7,
        text: "Outstanding real estate legal advisors. They cleared our property title disputes in record time with zero friction.",
        author: "Rajesh V.",
        role: "Urban Developers"
    },
    {
        id: 8,
        text: "Professional, transparent, and incredibly effective. JSM Associates is the only firm we trust with our corporate structuring.",
        author: "Feminaa F.",
        role: "Managing Director"
    }
];

const ReviewCard = ({ review }) => (
    <div className="review-card">
        <div className="review-stars">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill="var(--accent-primary)" color="var(--accent-primary)" />
            ))}
        </div>
        <p className="review-text">{review.text}</p>
        <div className="review-author-box">
            <span className="author-icon">@</span>
            <div className="author-details">
                <span className="author-name">{review.author}</span>
                <span className="author-role">{review.role}</span>
            </div>
        </div>
    </div>
);

const Testimonials = () => {
    const { isDarkTheme } = useTheme();

    return (
        <section className={`testimonials-wrapper ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id="testimonials">
            <div className="testimonials-header">
                <div className="review-badge">
                    <span className="pulse-dot"></span> Verified Clients
                </div>
                <h2 className="testimonials-title">Client Testimonials</h2>
            </div>

            <div className="marquee-container">
                {/* ROW 1 */}
                <div className="marquee-track track-1">
                    {row1Reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                    {/* Duplicated set for seamless infinite scroll */}
                    {row1Reviews.map((review) => (
                        <ReviewCard key={`${review.id}-dup`} review={review} />
                    ))}
                </div>

                {/* ROW 2 */}
                <div className="marquee-track track-2">
                    {row2Reviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                    {/* Duplicated set for seamless infinite scroll */}
                    {row2Reviews.map((review) => (
                        <ReviewCard key={`${review.id}-dup`} review={review} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;