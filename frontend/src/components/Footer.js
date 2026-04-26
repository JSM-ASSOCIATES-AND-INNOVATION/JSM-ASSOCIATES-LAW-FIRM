import React from "react";
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import "../styles/Footer.css";
import { useTheme } from "./ThemeContext";

const Footer = () => {
    const { isDarkTheme } = useTheme();

    return (
        <footer className={`footer ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            {/* --- BACKGROUND WAVES (Theme Reactive) --- */}
            <div className="background">
                <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    height="100%"
                    viewBox="0 0 1600 900"
                    preserveAspectRatio="none"
                    className="wave-svg"
                >
                    <defs>
                        <path
                            id="wave"
                            fill="currentColor"
                            d="M-363.852,502.589c0,0,236.988-41.997,505.475,0 s371.981,38.998,575.971,0s293.985-39.278,505.474,5.859s493.475,48.368,716.963-4.995v560.106H-363.852V502.589z"
                        />
                    </defs>
                    <g>
                        <use xlinkHref="#wave" opacity="1">
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                dur="10s"
                                calcMode="spline"
                                values="270 230; -334 180; 270 230"
                                keyTimes="0; .5; 1"
                                keySplines="0.42, 0, 0.58, 1.0; 0.42, 0, 0.58, 1.0"
                                repeatCount="indefinite"
                            />
                        </use>
                        <use xlinkHref="#wave" opacity="0.7">
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                dur="7s"
                                calcMode="spline"
                                values="-270 230; 243 220; -270 230"
                                keyTimes="0; .6; 1"
                                keySplines="0.42, 0, 0.58, 1.0; 0.42, 0, 0.58, 1.0"
                                repeatCount="indefinite"
                            />
                        </use>
                        <use xlinkHref="#wave" opacity="0.4">
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                dur="5s"
                                calcMode="spline"
                                values="0 230; -140 200; 0 230"
                                keyTimes="0; .4; 1"
                                keySplines="0.42, 0, 0.58, 1.0; 0.42, 0, 0.58, 1.0"
                                repeatCount="indefinite"
                            />
                        </use>
                    </g>
                </svg>
            </div>

            <div className="footer-inner">
                {/* --- TOP ROW: BRAND + J S M COLUMNS --- */}
                <div className="footer-grid-top">
                    {/* COLUMN 1: Brand */}
                    <div className="footer-col">
                        <div className="logo-group">
                            <h3>JSM Associates</h3>
                            <span className="law-firm">Law Firm</span>
                        </div>

                        <p className="tagline">
                            Delivering strategic legal solutions with mastery, integrity,
                            and a steadfast commitment to securing your corporate future.
                        </p>

                        <div className="socials">
                            <a href="#" aria-label="Facebook">
                                <Facebook size={18} strokeWidth={2} />
                            </a>
                            <a href="#" aria-label="Instagram">
                                <Instagram size={18} strokeWidth={2} />
                            </a>
                            <a href="#" aria-label="LinkedIn">
                                <Linkedin size={18} strokeWidth={2} />
                            </a>
                        </div>
                    </div>

                    {/* COLUMN 2: Justice */}
                    <div className="footer-col">
                        <div className="abbr-wrapper">
                            <span className="giant-letter">J</span>
                            <span className="abbr-text">ustice</span>
                        </div>
                        <ul className="footer-links">
                            <li><a href="#about">Our Firm</a></li>
                            <li><a href="#practice">Practice Areas</a></li>
                            <li><Link to="/legacy">Our Legacy</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: Strategy */}
                    <div className="footer-col">
                        <div className="abbr-wrapper">
                            <span className="giant-letter">S</span>
                            <span className="abbr-text">trategy</span>
                        </div>
                        <ul className="footer-links">
                            <li><a href="#people">Our People</a></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><a href="#testimonials">Testimonials</a></li>
                        </ul>
                    </div>

                    {/* COLUMN 4: Mastery */}
                    <div className="footer-col">
                        <div className="abbr-wrapper">
                            <span className="giant-letter">M</span>
                            <span className="abbr-text">astery</span>
                        </div>
                        <ul className="footer-links">
                            <li><Link to="/blogs">Insights & Blogs</Link></li>
                            <li><Link to="/publications">Publications</Link></li>
                            <li><Link to="/events">Events & Seminars</Link></li>
                        </ul>
                    </div>
                </div>

                {/* --- BOTTOM ROW: CONTACT & MAP --- */}
                <div className="footer-grid-bottom">
                    <div className="contact-info">
                        <h4>Contact Chambers</h4>

                        <div className="contact-item">
                            <MapPin className="contact-icon" />
                            <span>
                                Suite 405, Mangalagiri Business Center,<br />
                                Grand Trunk Road, Mangalagiri,<br />
                                Andhra Pradesh 522503
                            </span>
                        </div>

                        <div className="contact-item">
                            <Phone className="contact-icon" />
                            <span>+91 79898 79735</span>
                        </div>

                        <div className="contact-item">
                            <Mail className="contact-icon" />
                            <span>contact@jsmassociates.in</span>
                        </div>
                    </div>

                    <div className="footer-map">
                        <a
                            href="https://goo.gl/maps/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="JSM Associates Location Map"
                            />
                        </a>
                    </div>
                </div>

                {/* --- OFFICIAL COPYRIGHT BAR --- */}
                <div className="footer-copyright">
                    <p>&copy; {new Date().getFullYear()} JSM Associates. A sub-branch of JSM ASSOCIATES AND INNOVATION. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;