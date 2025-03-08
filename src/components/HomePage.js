import React from "react";
import { Link } from "react-router-dom";
import "../styles/HomePage.css";

const HomePage = () => {
    return (
        <div className="home-container">
            <div className="overlay">
                <h1>Welcome to the College Event Management System</h1>
                <p>Discover, register, and manage events with ease.</p>

                <div className="button-container">
                    <Link to="/admin" className="btn admin-btn">Admin Login</Link>
                    <Link to="/student-login" className="btn student-btn">Student Login</Link>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
