import { createContext, useState, useContext } from "react";

const DarkModeContext = createContext({
  isDarkMode: false, // Default value
  toggleDarkMode: () => {}, // Default function
});

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => setDarkMode(!isDarkMode);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
