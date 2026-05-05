import React from "react";

export default function Spinner() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0fdf4",
    }}>
      <div style={{
        width: "45px",
        height: "45px",
        border: "5px solid #bbf7d0",
        borderTop: "5px solid #16a34a",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />

      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
