import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/StudentDashboard.css";
import { FaSearch, FaBars, FaTimes, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            const eventCollection = await getDocs(collection(db, "events"));
            setEvents(eventCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchEvents();
    }, []);

    // Filter events based on search input (case insensitive)
    const filteredEvents = events.filter(event => {
        const eventName = event.eventName ? event.eventName.toLowerCase() : "";
        const eventLocation = event.eventLocation ? event.eventLocation.toLowerCase() : "";
        const query = searchQuery.toLowerCase();

        return eventName.includes(query) || eventLocation.includes(query);
    });

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="menu-icon" onClick={() => setMenuOpen(true)}>
                    <FaBars className="icon" />
                </div>
                <div className={`sidebar ${menuOpen ? "open" : ""}`}>
                    {/* Back Button */}
                    <div className="back-icon" onClick={() => setMenuOpen(false)}>
                        <FaArrowLeft className="icon" />
                    </div>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/student-dashboard">Dashboard</Link></li>
                        <li><Link to="/student/feedback">Feedback</Link></li>
                        <li><Link to="/">Logout</Link></li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="content">
                <header className="hero-section">
                    <div className="headeru">
                        <h1 className="hero-title">Welcome to the Student Events Portal</h1>
                        <p className="hero-subtitle">
                            Discover and register for exciting events happening on your campus!
                        </p>
                    </div>


                    <div className="search-bar">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by Event Name or Location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FaSearch className="search-icon" />
                    </div>
                </header>

                {/* Events Section */}
                <div className="events-section">
                    {filteredEvents.length > 0 ? (
                        filteredEvents.map(event => (
                            <div key={event.id} className="event-card">
                                <h3 className="event-title">{event.eventName}</h3>
                                <p className="event-category">{event.eventCategory}</p>
                                <p className="event-details">
                                    📅 {event.eventDate} | ⏰ {event.eventTime}
                                </p>
                                <p className="event-location">📍 {event.eventLocation || "Not Specified"}</p>
                                <p className="event-description">{event.eventDesc}</p>
                                <button
                                    className="register-btn"
                                    onClick={() => window.open(event.eventLink, "_blank")}
                                >
                                    Register Now
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="no-events">No events available.</p>
                    )}
                </div>
            </div>

            <footer className="footer">
                <p className="footer-p">&copy; Created by Shivani &#128519; & Iniyaa &#128522;</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;
