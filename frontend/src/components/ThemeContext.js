import React, { createContext, useState, useEffect, useContext } from 'react';

// 1. Create the Context
const ThemeContext = createContext();

// 2. Create the Provider Component
export const ThemeProvider = ({ children }) => {
    // Initialize state with a function to check localStorage first.
    // If no saved preference exists, it defaults to true (Dark Theme for MLS & Co.)
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('mls_theme_preference');
        return savedTheme !== null ? JSON.parse(savedTheme) : true;
    });

    // The toggle function
    const toggleTheme = () => {
        setIsDarkTheme((prevTheme) => !prevTheme);
    };

    // 3. The Magic Effect: Apply the class directly to the <body> tag 
    // and save the preference whenever it changes.
    useEffect(() => {
        if (isDarkTheme) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        // Save to browser memory
        localStorage.setItem('mls_theme_preference', JSON.stringify(isDarkTheme));
    }, [isDarkTheme]);

    return (
        <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// 4. Create a custom hook so other components can easily grab the theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};