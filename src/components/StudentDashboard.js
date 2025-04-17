import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import "../styles/StudentDashboard.css";
import { FaSearch, FaBars, FaTimes, FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaFilter, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [upcomingOnly, setUpcomingOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);

    // Get all unique categories from events
    const categories = [...new Set(events.map(event => event.eventCategory))];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const q = query(collection(db, "events"), orderBy("eventDate", "asc"));
                const eventCollection = await getDocs(q);
                const eventsData = eventCollection.docs.map(doc => ({ 
                    id: doc.id, 
                    ...doc.data(),
                    formattedDate: format(new Date(doc.data().eventDate), 'MMM dd, yyyy')
                }));
                setEvents(eventsData);
                
                // Load favorites from localStorage
                const savedFavorites = JSON.parse(localStorage.getItem('eventFavorites')) || [];
                setFavorites(savedFavorites);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Save favorites to localStorage when they change
    useEffect(() => {
        localStorage.setItem('eventFavorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (eventId) => {
        if (favorites.includes(eventId)) {
            setFavorites(favorites.filter(id => id !== eventId));
        } else {
            setFavorites([...favorites, eventId]);
        }
    };

    // Filter events based on search input and selected filters
    const filteredEvents = events.filter(event => {
        // Search filter
        const matchesSearch = 
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventLocation.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category filter
        const matchesCategory = 
            selectedCategories.length === 0 || 
            selectedCategories.includes(event.eventCategory);
        
        // Upcoming filter
        const isUpcoming = !upcomingOnly || 
            new Date(event.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0));
        
        return matchesSearch && matchesCategory && isUpcoming;
    });

    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setUpcomingOnly(false);
        setSearchQuery("");
    };

    return (
        <div className="dashboard-container">
            {/* Navbar */}
            <nav className="navbar">
                <div className="menu-icon" onClick={() => setMenuOpen(true)}>
                    <FaBars className="icon" />
                </div>
                <div className={`sidebar ${menuOpen ? "open" : ""}`}>
                    <div className="sidebar-header">
                        <div className="back-icon" onClick={() => setMenuOpen(false)}>
                            <FaArrowLeft className="icon" />
                        </div>
                        <h3>Menu</h3>
                    </div>
                    <ul>
                        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
                        <li><Link to="/student-dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
                        <li><Link to="/student/feedback" onClick={() => setMenuOpen(false)}>Feedback</Link></li>
                        <li><Link to="/student/favorites" onClick={() => setMenuOpen(false)}>My Favorites</Link></li>
                        <li><Link to="/" onClick={() => setMenuOpen(false)}>Logout</Link></li>
                    </ul>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="content">
                <header className="hero-section">
                    <div className="header-content">
                        <h1 className="hero-title">Welcome to the Student Events Portal</h1>
                        <p className="hero-subtitle">
                            Discover and register for exciting events happening on your campus!
                        </p>
                    </div>

                    <div className="search-filter-container">
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
                        <button 
                            className="filter-toggle"
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <FaFilter /> Filters
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {filterOpen && (
                        <div className="filter-panel">
                            <div className="filter-section">
                                <h4>Categories</h4>
                                <div className="category-filters">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            className={`category-tag ${selectedCategories.includes(category) ? 'active' : ''}`}
                                            onClick={() => toggleCategory(category)}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="filter-section">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={upcomingOnly}
                                        onChange={() => setUpcomingOnly(!upcomingOnly)}
                                    />
                                    Show upcoming events only
                                </label>
                            </div>
                            <button className="clear-filters" onClick={clearFilters}>
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </header>

                {/* Events Section */}
                <div className="events-section">
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    ) : filteredEvents.length > 0 ? (
                        <div className="events-grid">
                            {filteredEvents.map(event => (
                                <div key={event.id} className="event-card">
                                    <div className="card-header">
                                        <h3 className="event-title">{event.eventName}</h3>
                                        <button 
                                            className={`favorite-btn ${favorites.includes(event.id) ? 'active' : ''}`}
                                            onClick={() => toggleFavorite(event.id)}
                                        >
                                            <FaStar />
                                        </button>
                                    </div>
                                    <p className="event-category">{event.eventCategory}</p>
                                    <div className="event-details">
                                        <p><FaCalendarAlt /> {event.formattedDate}</p>
                                        <p><FaClock /> {event.eventTime}</p>
                                        <p><FaMapMarkerAlt /> {event.eventLocation || "Not Specified"}</p>
                                    </div>
                                    <p className="event-description">{event.eventDesc}</p>
                                    <div className="card-footer">
                                        <button
                                            className="register-btn"
                                            onClick={() => window.open(event.eventLink, "_blank")}
                                        >
                                            Register Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-events">
                            <p>No events match your search criteria.</p>
                            <button className="reset-btn" onClick={clearFilters}>
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <footer className="footer">
                <p className="footer-p">&copy; {new Date().getFullYear()} Created by Sabarish R &#128519; & NaveenKumar P &#128522;</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;