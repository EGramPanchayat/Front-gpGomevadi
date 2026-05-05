import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axioesInstance from "../utils/axioesInstance";
import Spinner from "./Spinner";

export default function RequireAuth({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    axioesInstance.get("/admin/check")
      .then(res => setAllowed(res.data.ok))
      .catch(() => setAllowed(false));
  }, []);

  if (allowed === null) return <Spinner />;
  return allowed ? children : <Navigate to="/login" replace />;
}

