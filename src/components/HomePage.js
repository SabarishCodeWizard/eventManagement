import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";  // Create a new CSS file for styling

const HomePage = () => {
    return (
        <div className="home-container">
            <h1>Welcome to the College Event Management System</h1>
            <p>Select your login option:</p>

            <div className="button-container">
                <Link to="/admin" className="btn admin-btn">Admin Login</Link>
                <Link to="/student-login" className="btn student-btn">Student Login</Link>
            </div>
        </div>
    );
};

export default HomePage;
