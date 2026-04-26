import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { useTheme } from './ThemeContext';

const Admin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { isDarkTheme } = useTheme();

    // If you already have the JSM token, skip the login screen!
    useEffect(() => {
        if (localStorage.getItem('jsm_admin_token')) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();

        // 🚨 YOUR SECURE JSM ADMIN PASSWORD 🚨
        if (password === 'Sw@roop@1234') {
            // This is the EXACT token the Team Manager is looking for!
            localStorage.setItem('jsm_admin_token', 'true');
            navigate('/admin/dashboard');
        } else {
            setError('Invalid credentials. Access denied.');
            setPassword('');
        }
    };

    // Dynamic Theme Colors
    const bg = isDarkTheme ? '#0a0a0a' : '#fdfdfd';
    const cardBg = isDarkTheme ? '#111111' : '#ffffff';
    const text = isDarkTheme ? '#ffffff' : '#111111';
    const accent = isDarkTheme ? '#FFBF00' : '#CD0000';
    const border = isDarkTheme ? '#222222' : '#eaeaea';

    return (
        <div style={{ height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: bg, color: text, fontFamily: "'Inter', sans-serif" }}>

            <div className="fade-in-up" style={{ background: cardBg, padding: '40px', borderRadius: '12px', border: `1px solid ${border}`, width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}>

                <Shield size={48} color={accent} style={{ marginBottom: '20px' }} />

                <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '10px' }}>
                    JSM Command Center
                </h2>

                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                    Authorized Personnel Only
                </p>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color="#888" style={{ position: 'absolute', top: '50%', left: '15px', transform: 'translateY(-50%)' }} />
                        <input
                            type="password"
                            placeholder="Enter Admin Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px 12px 45px',
                                background: isDarkTheme ? '#000' : '#f9f9f9',
                                border: `1px solid ${border}`,
                                color: text,
                                borderRadius: '6px',
                                outline: 'none',
                                fontSize: '1rem',
                                transition: 'border-color 0.3s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = accent}
                            onBlur={(e) => e.target.style.borderColor = border}
                        />
                    </div>

                    {error && <p style={{ color: '#ff4444', fontSize: '0.85rem', margin: '0', fontWeight: 'bold' }}>{error}</p>}

                    <button
                        type="submit"
                        style={{
                            background: accent,
                            color: isDarkTheme ? '#000' : '#fff',
                            border: 'none',
                            padding: '12px',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'opacity 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        Access Portal <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Admin;