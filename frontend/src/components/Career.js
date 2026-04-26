import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search } from "lucide-react";
import "../styles/Careers.css";
import { useTheme } from "./ThemeContext";

/* =================================================================
   HELPER COMPONENT: File Input
   ================================================================= */
const FileInput = ({ label, onChange, fileName, required = false, error, scrollRef }) => (
    <div className="file-upload-group" ref={scrollRef}>
        <label className="file-label-text">
            {label} {required && <span className="error-asterisk">*</span>}
        </label>
        <div className="custom-file-input">
            <label className={`file-btn ${error ? "input-error" : ""}`}>
                Choose File
                <input type="file" accept=".pdf,.doc,.docx" onChange={onChange} />
            </label>
            <span className="file-name-display">{fileName}</span>
        </div>
    </div>
);

/* =================================================================
   MAIN COMPONENT: Careers
   ================================================================= */
const Careers = () => {
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    // Refs for scrolling to errors
    const positionRef = useRef(null);
    const modeRef = useRef(null);
    const cvRef = useRef(null);
    const researchRef = useRef(null);
    const marksRef = useRef(null);
    const draftRef = useRef(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        fullName: "", email: "", phoneNumber: "", residentialAddress: "",
        college: "", course: "", yearOfStudy: "", coverLetter: "",
        disputeType: "", cgpa: "", preferredMode: "",
    });

    const [cvFile, setCvFile] = useState(null);
    const [researchSample, setResearchSample] = useState(null);
    const [marksSheet, setMarksSheet] = useState(null);
    const [draftSample, setDraftSample] = useState(null);

    const [fileNames, setFileNames] = useState({
        cv: "No file chosen", research: "No file chosen", marks: "No file chosen", draft: "No file chosen",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    // --- TRACKING STATE ---
    const [showTracker, setShowTracker] = useState(false);
    const [trackId, setTrackId] = useState("");
    const [trackResult, setTrackResult] = useState(null);
    const [trackError, setTrackError] = useState("");

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: false });
    };

    const handleFileChange = (e, type, setFileState) => {
        const file = e.target.files;
        if (file) {
            setFileState(file);
            setFileNames((prev) => ({ ...prev, [type]: file.name }));
            setErrors(prev => ({ ...prev, [type]: false }));
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let firstErrorRef = null;

        if (!formData.disputeType) { newErrors.disputeType = true; if (!firstErrorRef) firstErrorRef = positionRef; }
        if (!formData.preferredMode) { newErrors.preferredMode = true; if (!firstErrorRef) firstErrorRef = modeRef; }

        if (formData.disputeType === "Assessment Internship" && !researchSample) {
            newErrors.research = true; if (!firstErrorRef) firstErrorRef = researchRef;
        }

        if (formData.disputeType === "Associate openings") {
            if (!marksSheet) { newErrors.marks = true; if (!firstErrorRef) firstErrorRef = marksRef; }
            if (!draftSample) { newErrors.draft = true; if (!firstErrorRef) firstErrorRef = draftRef; }
            if (!researchSample) { newErrors.research = true; if (!firstErrorRef) firstErrorRef = researchRef; }
        }

        if (!cvFile) { newErrors.cv = true; if (!firstErrorRef) firstErrorRef = cvRef; }

        setErrors(newErrors);

        if (firstErrorRef && firstErrorRef.current) {
            firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setMessage("Please fill in the highlighted fields.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!validateForm()) return;

        setLoading(true);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));
        data.append("cv", cvFile);
        if (researchSample) data.append("researchSample", researchSample);
        if (marksSheet) data.append("marksSheet", marksSheet);
        if (draftSample) data.append("draftSample", draftSample);

        try {
            const res = await axios.post(`${API_URL}/api/applications`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMessage(`Application submitted! Your Tracking ID is: ${res.data.trackingId}. An email has been sent.`);
            setFormData({
                fullName: "", email: "", phoneNumber: "", residentialAddress: "",
                college: "", course: "", yearOfStudy: "", coverLetter: "",
                disputeType: "", cgpa: "", preferredMode: "",
            });
            setCvFile(null); setResearchSample(null); setMarksSheet(null); setDraftSample(null);
            setFileNames({ cv: "No file chosen", research: "No file chosen", marks: "No file chosen", draft: "No file chosen" });
            setErrors({});
        } catch (err) {
            setMessage("Error submitting application. Please ensure the backend is connected and try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTrackApplication = async () => {
        setTrackError("");
        setTrackResult(null);
        if (!trackId) return;

        try {
            const res = await axios.get(`${API_URL}/api/applications/track/${trackId}`);
            setTrackResult(res.data);
        } catch (err) {
            setTrackError("Tracking ID not found. Please check your email and try again.");
        }
    };

    return (
        <div className={`career-royale-container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            <div className="career-content-wrapper">
                <header className="career-header">
                    <h1 className="royale-title">Careers at JSM</h1>
                    <div className="title-divider"></div>
                    <p className="royale-subtitle">We invite exceptional legal minds to shape the future of corporate law with us.</p>
                </header>

                <form onSubmit={handleSubmit} className="royale-form" noValidate>

                    {/* Section 1: Personal Info */}
                    <div className="form-section fade-in-up">
                        <h2 className="section-heading">Personal Details</h2>
                        <div className="grid-row">
                            <div className="input-group">
                                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder=" " />
                                <label>Full Name</label>
                            </div>
                            <div className="input-group">
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder=" " />
                                <label>Email Address</label>
                            </div>
                        </div>
                        <div className="grid-row">
                            <div className="input-group">
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required placeholder=" " />
                                <label>Phone Number</label>
                            </div>
                            <div className="input-group">
                                <input type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} required placeholder=" " />
                                <label>Residential Address</label>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Education */}
                    <div className="form-section fade-in-up delay-1">
                        <h2 className="section-heading">Academic Profile</h2>
                        <div className="grid-row">
                            <div className="input-group">
                                <input type="text" name="college" value={formData.college} onChange={handleChange} required placeholder=" " />
                                <label>University / College</label>
                            </div>
                            <div className="input-group">
                                <input type="text" name="course" value={formData.course} onChange={handleChange} required placeholder=" " />
                                <label>Course / Major</label>
                            </div>
                        </div>
                        <div className="grid-row single-col-mobile">
                            <div className="input-group">
                                <input type="text" name="yearOfStudy" value={formData.yearOfStudy} onChange={handleChange} required placeholder=" " />
                                <label>Year of Study</label>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Nature of Application */}
                    <div className="form-section fade-in-up delay-2">
                        <h2 className="section-heading">Position Details</h2>
                        <div className="grid-row">

                            <div className="input-group" ref={positionRef}>
                                <select name="disputeType" value={formData.disputeType} onChange={handleChange} required className={errors.disputeType ? "input-error" : ""} >
                                    <option value="" disabled hidden></option>
                                    <option value="Internship-short">Short Internship</option>
                                    <option value="Internship-long">Long Internship</option>
                                    <option value="Research-Internship">Research Internship</option>
                                    <option value="Assessment Internship">Assessment Internship</option>
                                    <option value="Associate openings">Associate Openings</option>
                                </select>
                                <label className={formData.disputeType ? "active" : ""}>Applying For *</label>
                                {/* SVG Chevron built-in via CSS */}
                                <div className="custom-select-icon"></div>
                            </div>

                            <div className="input-group" ref={modeRef}>
                                <select name="preferredMode" value={formData.preferredMode} onChange={handleChange} required className={errors.preferredMode ? "input-error" : ""} >
                                    <option value="" disabled hidden></option>
                                    <option value="Offline Mode">Offline Mode</option>
                                    <option value="Online Mode">Online Mode</option>
                                    <option value="Hybrid Mode">Hybrid Mode</option>
                                </select>
                                <label className={formData.preferredMode ? "active" : ""}>Preferred Mode *</label>
                                <div className="custom-select-icon"></div>
                            </div>

                        </div>

                        {formData.disputeType === "Assessment Internship" && (
                            <div className="conditional-block fade-in">
                                <p className="warning-text">Note: Only applicable to final year students.</p>
                                <div className="grid-row">
                                    <div className="input-group">
                                        <input type="text" name="cgpa" value={formData.cgpa} onChange={handleChange} required placeholder=" " />
                                        <label>CGPA</label>
                                    </div>
                                </div>
                                <FileInput label="Research Sample" fileName={fileNames.research} onChange={(e) => handleFileChange(e, 'research', setResearchSample)} required error={errors.research} scrollRef={researchRef} />
                            </div>
                        )}

                        {formData.disputeType === "Associate openings" && (
                            <div className="conditional-block fade-in">
                                <div className="file-grid">
                                    <FileInput label="Marks Sheet" fileName={fileNames.marks} onChange={(e) => handleFileChange(e, 'marks', setMarksSheet)} required error={errors.marks} scrollRef={marksRef} />
                                    <FileInput label="Draft Sample" fileName={fileNames.draft} onChange={(e) => handleFileChange(e, 'draft', setDraftSample)} required error={errors.draft} scrollRef={draftRef} />
                                    <FileInput label="Research Sample" fileName={fileNames.research} onChange={(e) => handleFileChange(e, 'research', setResearchSample)} required error={errors.research} scrollRef={researchRef} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Documents */}
                    <div className="form-section fade-in-up delay-3">
                        <h2 className="section-heading">Documentation</h2>
                        <FileInput label="Curriculum Vitae (CV)" fileName={fileNames.cv} onChange={(e) => handleFileChange(e, 'cv', setCvFile)} required error={errors.cv} scrollRef={cvRef} />
                        <div className="input-group full-width textarea-group">
                            <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} placeholder=" " rows="5" />
                            <label>Cover Letter</label>
                        </div>
                    </div>

                    {/* Messages & Actions */}
                    {message && (
                        <div className={`status-message ${message.includes("success") || message.includes("submitted") ? "success" : "error"}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-actions" style={{ flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' }}>
                            <button type="button" className="btn-royale-secondary" onClick={() => navigate("/")}>
                                <span>Back to Home</span>
                            </button>
                            <button type="submit" className="btn-royale-primary" disabled={loading}>
                                <span>{loading ? "Transmitting..." : "Submit Application"}</span>
                            </button>
                        </div>

                        {/* TRACKING BUTTON */}
                        <button
                            type="button"
                            onClick={() => setShowTracker(!showTracker)}
                            className="track-trigger-btn"
                        >
                            Already applied? Track your application status here.
                        </button>
                    </div>

                    {/* TRACKING UI MODAL / EXPAND */}
                    {showTracker && (
                        <div className="tracker-box fade-in">
                            <h3>Track Application</h3>
                            <div className="tracker-input-row">
                                <input
                                    type="text"
                                    placeholder="Enter Tracking ID (e.g. JSM-1234)"
                                    value={trackId}
                                    onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                                />
                                <button type="button" onClick={handleTrackApplication}>
                                    <Search size={18} /> Track
                                </button>
                            </div>

                            {trackError && <p className="tracker-error">{trackError}</p>}

                            {trackResult && (
                                <div className="tracker-result">
                                    <p>Applicant: <strong>{trackResult.name}</strong></p>
                                    <p>Role: {trackResult.role}</p>
                                    <p className="tracker-status">Status: {trackResult.status}</p>
                                </div>
                            )}
                        </div>
                    )}

                </form>
            </div>
        </div>
    );
};

export default Careers;