import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import "../styles/Favorites.css";
import { Link } from "react-router-dom";
import {
    FaArrowLeft, FaCalendarAlt, FaClock, FaMapMarkerAlt,
    FaStar, FaTicketAlt, FaUserFriends, FaShareAlt
} from "react-icons/fa";
import { format, parseISO, isAfter, isToday } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShareModal from "./ShareModal";

const Favorites = () => {
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);

    useEffect(() => {
        // Fetch favorite events from localStorage and Firestore
        const fetchFavorites = async () => {
            try {
                // Get favorites array from localStorage
                const savedFavorites = JSON.parse(localStorage.getItem('eventFavorites')) || [];
                const savedRegistered = JSON.parse(localStorage.getItem('registeredEvents')) || [];
                setRegisteredEvents(savedRegistered);
                
                if (savedFavorites.length === 0) {
                    setFavoriteEvents([]);
                    setLoading(false);
                    return;
                }

                // Fetch each favorite event from Firestore
                const events = [];
                for (const favoriteId of savedFavorites) {
                    const eventDoc = await getDoc(doc(db, "events", favoriteId));
                    if (eventDoc.exists()) {
                        const eventData = eventDoc.data();
                        events.push({
                            id: eventDoc.id,
                            ...eventData,
                            formattedDate: format(parseISO(eventData.eventDate), 'MMM dd, yyyy'),
                            isUpcoming: isAfter(parseISO(eventData.eventDate), new Date()) ||
                                isToday(parseISO(eventData.eventDate))
                        });
                    }
                }
                
                // Sort events by date (upcoming first)
                events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
                setFavoriteEvents(events);
            } catch (error) {
                console.error("Error fetching favorites:", error);
                toast.error("Failed to load favorite events");
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    const removeFavorite = (eventId) => {
        try {
            // Update state
            setFavoriteEvents(favoriteEvents.filter(event => event.id !== eventId));
            
            // Update localStorage
            const savedFavorites = JSON.parse(localStorage.getItem('eventFavorites')) || [];
            const updatedFavorites = savedFavorites.filter(id => id !== eventId);
            localStorage.setItem('eventFavorites', JSON.stringify(updatedFavorites));
            
            toast.success("Removed from favorites");
        } catch (error) {
            console.error("Error removing favorite:", error);
            toast.error("Failed to remove from favorites");
        }
    };

    const openShareModal = (event) => {
        setCurrentEvent(event);
        setShowShareModal(true);
    };

    const registerForEvent = (eventId, eventLink) => {
        if (!registeredEvents.includes(eventId)) {
            const updatedRegistered = [...registeredEvents, eventId];
            setRegisteredEvents(updatedRegistered);
            localStorage.setItem('registeredEvents', JSON.stringify(updatedRegistered));
            toast.success("Successfully registered for event!");
        }
        window.open(eventLink, "_blank");
    };

    return (
        <div className="favorites-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <header className="favorites-header">
                <Link to="/student-dashboard" className="back-link">
                    <FaArrowLeft /> Back to Dashboard
                </Link>
                <h1>My Favorite Events</h1>
            </header>

            <div className="favorites-content">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your favorite events...</p>
                    </div>
                ) : favoriteEvents.length > 0 ? (
                    <div className="favorites-grid">
                        {favoriteEvents.map(event => (
                            <div 
                                key={event.id} 
                                className={`favorite-card ${!event.isUpcoming ? 'past-event' : ''}`}
                            >
                                <div className="card-header">
                                    <h3 className="event-title">{event.eventName}</h3>
                                    <div className="event-actions">
                                        <button
                                            className="remove-favorite-btn"
                                            onClick={() => removeFavorite(event.id)}
                                            title="Remove from favorites"
                                        >
                                            <FaStar />
                                        </button>
                                        <button
                                            className="share-btn"
                                            onClick={() => openShareModal(event)}
                                            title="Share event"
                                        >
                                            <FaShareAlt />
                                        </button>
                                    </div>
                                </div>

                                <div className="event-tags">
                                    <span className="event-category">{event.eventCategory}</span>
                                    {event.eventDepartment && event.eventDepartment !== "All Departments" && (
                                        <span className="event-department">{event.eventDepartment}</span>
                                    )}
                                </div>

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
                                        {event.eventDesc.length > 150 
                                            ? `${event.eventDesc.substring(0, 150)}...` 
                                            : event.eventDesc}
                                    </p>
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
                    <div className="no-favorites">
                        <h3>You haven't added any events to your favorites yet</h3>
                        <p>Go to the dashboard and click the star icon on events you're interested in</p>
                        <Link to="/student-dashboard" className="browse-btn">
                            Browse Events
                        </Link>
                    </div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    event={currentEvent}
                    onClose={() => setShowShareModal(false)}
                />
            )}

    
        </div>
    );
};

export default Favorites;