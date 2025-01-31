import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/types/user.ts";

export const TitleBar: React.FC<{ user: User | null }> = ({ user }) => {
  const [countdown, setCountdown] = useState("");
  const navigate = useNavigate();

  // Countdown timer for session expiration
  useEffect(() => {
	const exp = user?.exp;
    if (exp) {
      const interval = setInterval(() => {
        const currentTime = Math.floor(Date.now() / 1000);
        const remainingTime = exp - currentTime;

        if (remainingTime <= 0) {
          clearInterval(interval);
          navigate("/login");
        } else {
          const hours = Math.floor(remainingTime / 3600);
          const minutes = Math.floor(remainingTime / 60) % 60;
          const seconds = remainingTime % 60;
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <header className="header-bar">
      <span>Cybersecurity Training Platform</span>
      <div className="button-group">
        <div className="tooltip-container">
          <button onClick={() => navigate("/user")}>
            <img src="/icons/profile_icon.svg" className="icon" />
            {user?.name ?? "???"}
          </button>
          <span className="tooltip-text">
            Session expires in: {countdown ?? "???"}
          </span>
        </div>
        <button onClick={handleLogout} className="red-button">
          Logout
        </button>
      </div>
    </header>
  );
};