import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

// 🚨 IMPORT THE NEW UNIFIED GLOBAL CSS ENGINE 🚨
import "./styles/global.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PracticeAreas from "./components/PracticeAreas";
import ContactForm from "./components/ContactForm";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";
import Ourpeople from "./components/Ourpeople";
import About from "./components/About";
import Careers from "./components/Career";
import { ThemeProvider } from "./components/ThemeContext";
import Blogs from "./components/Blogs";
import Publications from "./components/Publications";
import Events from "./components/Events";
import Legacy from "./components/Legacy";
import Team from "./components/Team";
import BlogPost from "./components/BlogPost";
import EventDetails from "./components/EventDetails";

import AcademicSection from "./components/AcademicSection";
import Preloader from "./components/Preloader";

// --- ADMIN IMPORTS ---
import Admin from "./components/admin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminBlogManager from "./components/admin/AdminBlogManager";
import AdminEventManager from "./components/admin/AdminEventManager";
import AdminTeamManager from "./components/admin/AdminTeamManager";
import AdminApplications from "./components/admin/AdminApplications";
import AdminAcademicManager from "./components/admin/AdminAcademicManager";
import AdminContactManager from "./components/admin/AdminContactManager";

const ScrollToTop = () => {
    const { pathname, hash } = useLocation();

    React.useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.substring(1));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            } else {
                setTimeout(() => {
                    const retryElement = document.getElementById(hash.substring(1));
                    if (retryElement) {
                        retryElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 500);
            }
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [pathname, hash]);

    return null;
};

// 🚨 Layout Wrapper updated to receive the preloader state and pass it to Navbar
const AppLayout = ({ children, isPreloaderDone }) => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <>
            {/* Pass the state exactly as Navbar.js expects it */}
            {!isAdminRoute && <Navbar isPreloaderDone={isPreloaderDone} />}
            {children}
            {!isAdminRoute && <Footer />}
        </>
    );
};

function App() {
    // 🚨 PRELOADER STATE
    const [showPreloader, setShowPreloader] = useState(true);

    // 🚨 SCROLL LOCK WHILE LOADING (Protects Sticky Sidebars afterwards)
    useEffect(() => {
        if (showPreloader) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
            document.body.style.overflowX = 'visible';
        }
    }, [showPreloader]);

    // Privacy Blur Effect for Corporate Security
    useEffect(() => {
        const handlePrivacy = () => {
            const rootElement = document.getElementById('root');
            if (!rootElement) return;

            if (document.visibilityState === 'hidden' || !document.hasFocus()) {
                rootElement.style.filter = "blur(10px)";
                rootElement.style.opacity = "0.8";
            } else {
                rootElement.style.filter = "none";
                rootElement.style.opacity = "1";
            }
        };

        window.addEventListener("blur", handlePrivacy);
        window.addEventListener("focus", handlePrivacy);
        document.addEventListener("visibilitychange", handlePrivacy);

        return () => {
            window.removeEventListener("blur", handlePrivacy);
            window.removeEventListener("focus", handlePrivacy);
            document.removeEventListener("visibilitychange", handlePrivacy);
        };
    }, []);

    return (
        <ThemeProvider>

            {/* 🚨 THE PRELOADER COMPONENT */}
            {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}

            <Router>
                <ScrollToTop />
                {/* Pass down the inverse of showPreloader (if showPreloader is false, it's done!) */}
                <AppLayout isPreloaderDone={!showPreloader}>
                    <Routes>
                        {/* Main Website Routes */}
                        <Route path="/" element={
                            <>
                                <Hero />
                                <About />
                                <PracticeAreas />
                                <Testimonials />
                                <Ourpeople />
                                <ContactForm />
                            </>
                        }
                        />
                        <Route path="/legacy" element={<Legacy />} />
                        <Route path="/careers" element={<Careers />} />
                        <Route path="/blogs" element={<Blogs />} />
                        <Route path="/publications" element={<Publications />} />
                        <Route path="/team" element={<Team />} />

                        <Route path="/academic-collaborations" element={<AcademicSection />} />

                        {/* BLOGS */}
                        <Route path="/blog/:id" element={<BlogPost />} />

                        {/* EVENTS SYSTEM */}
                        <Route path="/events" element={<Events />} />
                        <Route path="/event/:id" element={<EventDetails />} />

                        {/* --- ADMIN PORTAL ROUTES --- */}
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/blogs" element={<AdminBlogManager />} />
                        <Route path="/admin/events" element={<AdminEventManager />} />
                        <Route path="/admin/team" element={<AdminTeamManager />} />
                        <Route path="/admin/applications" element={<AdminApplications />} />
                        <Route path="/admin/academic" element={<AdminAcademicManager />} />
                        <Route path="/admin/contact" element={<AdminContactManager />} />
                    </Routes>
                </AppLayout>
            </Router>
        </ThemeProvider>
    );
}

export default App;