import React, { useState } from 'react';
import axios from "axios";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import '../styles/ContactForm.css';
import { useTheme } from './ThemeContext';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        disputeType: '',
        flexibleHours: '',
        query: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);
    const { isDarkTheme } = useTheme();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (notification) setNotification(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setNotification(null);

        const postData = {
            name: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            query: formData.query,
            dispute: formData.disputeType,
            freetime: formData.flexibleHours
        };

        try {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
            await axios.post(`${API_URL}/form`, postData);

            setNotification({
                type: 'success',
                message: 'Your inquiry has been securely submitted. A JSM representative will contact you shortly.'
            });

            setFormData({
                fullName: '',
                email: '',
                phone: '',
                disputeType: '',
                flexibleHours: '',
                query: ''
            });

            setTimeout(() => setNotification(null), 5000);

        } catch (err) {
            console.error(err);
            setNotification({
                type: 'error',
                message: 'Failed to send request. Please ensure you have a stable connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={`contact-form ${isDarkTheme ? 'dark-theme' : 'light-theme'}`} id='contact'>
            <div className="contact-form-container">
                <h2 className="contact-form-title">Confidential Inquiry</h2>

                <form className="contact-form-grid" onSubmit={handleSubmit}>

                    <div className="form-field">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Your Name"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="phone">Direct Phone</label>
                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 00000 00000"
                            required
                        />
                    </div>

                    <div className="form-field full">
                        <label htmlFor="email">Email Address (Optional)</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="name@corporation.com"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="disputeType">Area of Law</label>
                        <select
                            id="disputeType"
                            name="disputeType"
                            value={formData.disputeType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select jurisdiction...</option>
                            <option value="corporate">Corporate & Commercial</option>
                            <option value="intellectual-property">Intellectual Property</option>
                            <option value="civil">Civil Litigation</option>
                            <option value="criminal">White Collar / Criminal</option>
                            <option value="family">Family Law</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="flexibleHours">Preferred Contact Window</label>
                        <input
                            id="flexibleHours"
                            name="flexibleHours"
                            type="text"
                            value={formData.flexibleHours}
                            onChange={handleChange}
                            placeholder="e.g., 10am - 2pm, weekdays"
                        />
                    </div>

                    <div className="form-field full">
                        <label htmlFor="query">Legal Matter Summary</label>
                        <textarea
                            id="query"
                            name="query"
                            rows="4"
                            value={formData.query}
                            onChange={handleChange}
                            placeholder="Please provide a brief, confidential overview of your matter..."
                            required
                        />
                    </div>

                    {notification && (
                        <div className={`form-notification ${notification.type}`}>
                            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{notification.message}</span>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            <span>{isSubmitting ? 'Transmitting...' : 'Submit Inquiry'}</span>
                            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>

                </form>
            </div>
        </section>
    );
};

export default ContactForm;