import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import "../styles/StudentDashboard.css";
import {
    FaSearch, FaBars, FaTimes, FaArrowLeft, FaCalendarAlt,
    FaClock, FaMapMarkerAlt, FaFilter, FaStar, FaRegStar,
    FaUserFriends, FaTicketAlt, FaInfoCircle, FaShareAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isToday } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShareModal from "./ShareModal";

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [upcomingOnly, setUpcomingOnly] = useState(false);
    const [freeOnly, setFreeOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [showEventDetails, setShowEventDetails] = useState(null);

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
                    formattedDate: format(parseISO(doc.data().eventDate), 'MMM dd, yyyy'),
                    isUpcoming: isAfter(parseISO(doc.data().eventDate), new Date()) ||
                        isToday(parseISO(doc.data().eventDate))
                }));
                setEvents(eventsData);

                // Load favorites from localStorage
                const savedFavorites = JSON.parse(localStorage.getItem('eventFavorites')) || [];
                setFavorites(savedFavorites);

                // Load registered events from localStorage
                const savedRegistered = JSON.parse(localStorage.getItem('registeredEvents')) || [];
                setRegisteredEvents(savedRegistered);
            } catch (error) {
                console.error("Error fetching events:", error);
                toast.error("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Save favorites and registered events to localStorage when they change
    useEffect(() => {
        localStorage.setItem('eventFavorites', JSON.stringify(favorites));
        localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
    }, [favorites, registeredEvents]);

    const toggleFavorite = (eventId) => {
        if (favorites.includes(eventId)) {
            setFavorites(favorites.filter(id => id !== eventId));
            toast.info("Removed from favorites");
        } else {
            setFavorites([...favorites, eventId]);
            toast.success("Added to favorites");
        }
    };

    const registerForEvent = (eventId, eventLink) => {
        if (!registeredEvents.includes(eventId)) {
            setRegisteredEvents([...registeredEvents, eventId]);
            toast.success("Successfully registered for event!");
        }
        window.open(eventLink, "_blank");
    };

    const openShareModal = (event) => {
        setCurrentEvent(event);
        setShowShareModal(true);
    };

    const closeShareModal = () => {
        setShowShareModal(false);
    };

    // Filter events based on search input and selected filters
    const filteredEvents = events.filter(event => {
        // Search filter
        const matchesSearch =
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventDesc.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filter
        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(event.eventCategory);

        // Upcoming filter
        const matchesUpcoming = !upcomingOnly || event.isUpcoming;

        // Free events filter
        const matchesFree = !freeOnly || (event.eventFee === "0" || !event.eventFee);

        return matchesSearch && matchesCategory && matchesUpcoming && matchesFree;
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
        setFreeOnly(false);
        setSearchQuery("");
        toast.info("Filters cleared");
    };

    const toggleEventDetails = (eventId) => {
        setShowEventDetails(showEventDetails === eventId ? null : eventId);
    };

    return (
        <div className="dashboard-container">
            <ToastContainer position="top-right" autoClose={3000} />

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
                        <li><Link to="/student/registered" onClick={() => setMenuOpen(false)}>My Events</Link></li>
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
                                placeholder="Search by Event Name, Location or Description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <FaSearch className="search-icon" />
                        </div>
                        <button
                            className="filter-toggle"
                            onClick={() => setFilterOpen(!filterOpen)}
                        >
                            <FaFilter /> {filterOpen ? 'Hide Filters' : 'Show Filters'}
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
                            <div className="filter-section">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={freeOnly}
                                        onChange={() => setFreeOnly(!freeOnly)}
                                    />
                                    Show free events only
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
                                <div key={event.id} className={`event-card ${!event.isUpcoming ? 'past-event' : ''}`}>
                                    <div className="card-header">
                                        <h3 className="event-title">{event.eventName}</h3>
                                        <div className="event-actions">
                                            <button
                                                className={`favorite-btn ${favorites.includes(event.id) ? 'active' : ''}`}
                                                onClick={() => toggleFavorite(event.id)}
                                                aria-label={favorites.includes(event.id) ? "Remove from favorites" : "Add to favorites"}
                                            >
                                                {favorites.includes(event.id) ? <FaStar /> : <FaRegStar />}
                                            </button>
                                            <button
                                                className="share-btn"
                                                onClick={() => openShareModal(event)}
                                                aria-label="Share event"
                                            >
                                                <FaShareAlt />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="event-category">{event.eventCategory}</p>
                                    <div className="event-details">
                                        <p><FaCalendarAlt /> {event.formattedDate}</p>
                                        <p><FaClock /> {event.eventTime}</p>
                                        <p><FaMapMarkerAlt /> {event.eventLocation || "Not Specified"}</p>
                                        {event.eventCapacity && (
                                            <p><FaUserFriends /> {event.eventCapacity} spots available</p>
                                        )}
                                        {event.eventFee ? (
                                            <p><FaTicketAlt /> ${event.eventFee}</p>
                                        ) : (
                                            <p><FaTicketAlt /> Free</p>
                                        )}
                                    </div>
                                    <div className="event-description-container">
                                        <p className="event-description">
                                            {showEventDetails === event.id ?
                                                event.eventDesc :
                                                `${event.eventDesc.substring(0, 100)}...`}
                                        </p>
                                        {event.eventDesc.length > 100 && (
                                            <button
                                                className="read-more-btn"
                                                onClick={() => toggleEventDetails(event.id)}
                                            >
                                                {showEventDetails === event.id ? 'Show less' : 'Read more'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="card-footer">
                                        <button
                                            className={`register-btn ${registeredEvents.includes(event.id) ? 'registered' : ''}`}
                                            onClick={() => registerForEvent(event.id, event.eventLink)}
                                            disabled={!event.isUpcoming}
                                        >
                                            {registeredEvents.includes(event.id) ?
                                                'Registered' :
                                                'Register Now'}
                                        </button>
                                        {!event.isUpcoming && (
                                            <span className="event-ended-badge">Event Ended</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-events">
                            <FaInfoCircle className="no-events-icon" />
                            <p>No events match your search criteria.</p>
                            <button className="reset-btn" onClick={clearFilters}>
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    event={currentEvent}
                    onClose={closeShareModal}
                />
            )}

            <footer className="footer">
                <p className="footer-p">&copy; {new Date().getFullYear()} Created by Sabarish R &#128519; & NaveenKumar P &#128522;</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;