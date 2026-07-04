import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "./axioesInstance";

const SiteConfigContext = createContext(null);

export const SiteConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/site-config")
      .then((res) => {
        setConfig(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load site config:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return (
    <SiteConfigContext.Provider value={{ config, loading, error }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
};
