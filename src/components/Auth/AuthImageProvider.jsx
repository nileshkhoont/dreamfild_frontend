import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";

const images = [
  "/background1.JPG",
  "/background2.png",
  "/background3.png",
];

const AuthImageContext = createContext();

export function AuthImageProvider({ children }) {
  const location = useLocation();

  // Keep track of previous index
  const [prevIndex, setPrevIndex] = useState(() => {
    const saved = localStorage.getItem("authImageIndex");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Compute next index instantly when pathname changes
  const currentIndex = useMemo(() => {
    let nextIndex = (prevIndex + 1) % images.length;
    return nextIndex;
  }, [location.pathname]);

  // Save new index for next route change
  useEffect(() => {
    setPrevIndex(currentIndex);
    localStorage.setItem("authImageIndex", currentIndex);
  }, [currentIndex]);

  return (
    <AuthImageContext.Provider value={images[currentIndex]}>
      {children}
    </AuthImageContext.Provider>
  );
}

export function useAuthImage() {
  return useContext(AuthImageContext);
}
