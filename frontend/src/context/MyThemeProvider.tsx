import React, { createContext, useState, useContext } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

const ThemeToggleContext = createContext(() => { });

export const useThemeToggle = () => useContext(ThemeToggleContext);

const MyThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeToggleContext.Provider value={toggleTheme}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeToggleContext.Provider>
    );
};

export default MyThemeProvider;
