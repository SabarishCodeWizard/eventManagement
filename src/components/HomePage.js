import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
    return (
        <div className="home-container">
            <div className="left-section">
                <h1>Welcome to the College Event Management System</h1>
                <p>Effortlessly discover and manage all campus events — whether you're organizing or attending.</p>
            </div>

            <div className="right-section">
                <h2>Login</h2>
                <div className="button-container">
                    <Link to="/admin" className="btn admin-btn">Admin Login</Link>
                    <Link to="/student-login" className="btn student-btn">Student Login</Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
