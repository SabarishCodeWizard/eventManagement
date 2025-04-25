import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import "../styles/StudentDashboard.css";
import {
    FaSearch, FaBars, FaTimes, FaArrowLeft, FaCalendarAlt,
    FaClock, FaMapMarkerAlt, FaFilter, FaStar, FaRegStar,
    FaUserFriends, FaTicketAlt, FaInfoCircle, FaShareAlt, FaUser,
    FaSort, FaBell, FaRegBell, FaThumbsUp, FaRegThumbsUp, FaComment,
    FaGraduationCap
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { format, parseISO, isAfter, isToday, addDays } from 'date-fns';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ShareModal from "./ShareModal";
import Profile from "./Profile";
import { auth, getUserProfile, updateUserProfile } from "../firebase";
import { FacebookShareButton, TwitterShareButton, LinkedinShareButton } from "react-share";

const StudentDashboard = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState("All"); // Added department filter
    const [upcomingOnly, setUpcomingOnly] = useState(false);
    const [freeOnly, setFreeOnly] = useState(false);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [showEventDetails, setShowEventDetails] = useState(null);
    const [showProfile, setShowProfile] = useState(false);
    const [sortOption, setSortOption] = useState("date-asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(6);
    const [reminders, setReminders] = useState([]);
    const [ratings, setRatings] = useState({});
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState("");
    const [attendedEvents, setAttendedEvents] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(true);

    // List of departments - matching the AdminDashboard
    const departments = [
        "All Departments",
        "Computer Science",
        "Electrical Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Business Administration",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "Psychology",
        "Economics",
        "Literature",
        "Arts",
        "Medicine",
        "Law",
        "Other"
    ];

    // User state
    const [user, setUser] = useState({
        name: "Guest",
        email: "",
        bio: "",
        major: "",
        graduationYear: "",
        interests: [],
        photoURL: null
    });

    // Get all unique categories from events
    const categories = [...new Set(events.map(event => event.eventCategory))];

    // Load all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load events
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

                // Load user data from localStorage
                const savedFavorites = JSON.parse(localStorage.getItem('eventFavorites')) || [];
                setFavorites(savedFavorites);
                const savedRegistered = JSON.parse(localStorage.getItem('registeredEvents')) || [];
                setRegisteredEvents(savedRegistered);
                const savedReminders = JSON.parse(localStorage.getItem('eventReminders')) || [];
                setReminders(savedReminders);
                const savedRatings = JSON.parse(localStorage.getItem('eventRatings')) || {};
                setRatings(savedRatings);
                const savedComments = JSON.parse(localStorage.getItem('eventComments')) || {};
                setComments(savedComments);
                const savedAttended = JSON.parse(localStorage.getItem('attendedEvents')) || [];
                setAttendedEvents(savedAttended);

                // Load user profile from Firestore
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userProfile = await getUserProfile(currentUser.uid);
                    if (userProfile) {
                        setUser(userProfile);
                    } else {
                        // Create default profile
                        const defaultProfile = {
                            name: currentUser.displayName || "Student User",
                            email: currentUser.email,
                            bio: "",
                            major: "",
                            graduationYear: "",
                            interests: [],
                            photoURL: currentUser.photoURL || null
                        };
                        await updateUserProfile(currentUser.uid, defaultProfile);
                        setUser(defaultProfile);
                    }
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Save data to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('eventFavorites', JSON.stringify(favorites));
        localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
        localStorage.setItem('eventReminders', JSON.stringify(reminders));
        localStorage.setItem('eventRatings', JSON.stringify(ratings));
        localStorage.setItem('eventComments', JSON.stringify(comments));
        localStorage.setItem('attendedEvents', JSON.stringify(attendedEvents));
    }, [favorites, registeredEvents, reminders, ratings, comments, attendedEvents]);

    // Event handlers
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

    const toggleReminder = (eventId) => {
        if (reminders.includes(eventId)) {
            setReminders(reminders.filter(id => id !== eventId));
            toast.info("Reminder removed");
        } else {
            setReminders([...reminders, eventId]);
            toast.success("Reminder set! You'll be notified before the event.");
        }
    };

    const rateEvent = (eventId, rating) => {
        setRatings(prev => ({
            ...prev,
            [eventId]: rating
        }));
        toast.success("Thanks for your rating!");
    };

    const addComment = (eventId) => {
        if (newComment.trim()) {
            setComments(prev => ({
                ...prev,
                [eventId]: [...(prev[eventId] || []), {
                    text: newComment,
                    author: user.name,
                    date: new Date().toISOString()
                }]
            }));
            setNewComment("");
            toast.success("Comment added!");
        }
    };

    const markAsAttended = (eventId) => {
        if (!attendedEvents.includes(eventId)) {
            setAttendedEvents([...attendedEvents, eventId]);
            toast.success("Marked as attended!");
        }
    };

    const openShareModal = (event) => {
        setCurrentEvent(event);
        setShowShareModal(true);
    };

    const handleUpdateProfile = async (updatedProfile) => {
        try {
            const currentUser = auth.currentUser;
            if (currentUser) {
                await updateUserProfile(currentUser.uid, updatedProfile);
                setUser(updatedProfile);
                toast.success("Profile updated successfully!");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile. Please try again.");
        }
    };

    // Filter and sort events
    const filteredEvents = events.filter(event => {
        const matchesSearch =
            event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.eventDesc.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory =
            selectedCategories.length === 0 ||
            selectedCategories.includes(event.eventCategory);

        // Department filter logic
        const matchesDepartment = 
            selectedDepartment === "All" || 
            (event.eventDepartment && event.eventDepartment === selectedDepartment) ||
            (selectedDepartment === "All Departments" && (!event.eventDepartment || event.eventDepartment === "All Departments"));

        const matchesUpcoming = !upcomingOnly || event.isUpcoming;

        const matchesFree = !freeOnly || (event.eventFee === "0" || !event.eventFee);

        return matchesSearch && matchesCategory && matchesUpcoming && matchesFree && matchesDepartment;
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => {
        switch (sortOption) {
            case "date-asc":
                return new Date(a.eventDate) - new Date(b.eventDate);
            case "date-desc":
                return new Date(b.eventDate) - new Date(a.eventDate);
            case "name-asc":
                return a.eventName.localeCompare(b.eventName);
            case "name-desc":
                return b.eventName.localeCompare(a.eventName);
            case "popular":
                return (b.eventLikes || 0) - (a.eventLikes || 0);
            default:
                return 0;
        }
    });

    // Get recommended events based on user interests
    const recommendedEvents = sortedEvents.filter(event => 
        user.interests?.some(interest => 
            event.eventCategory.toLowerCase().includes(interest.toLowerCase()) ||
            event.eventName.toLowerCase().includes(interest.toLowerCase())
        )
    ).slice(0, 3);

    // Pagination logic
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = sortedEvents.slice(indexOfFirstEvent, indexOfLastEvent);
    const totalPages = Math.ceil(sortedEvents.length / eventsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Helper functions
    const toggleCategory = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedDepartment("All"); // Reset department filter
        setUpcomingOnly(false);
        setFreeOnly(false);
        setSearchQuery("");
        setSortOption("date-asc");
        setCurrentPage(1);
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
                        <li><Link to="/student/feedback" onClick={() => setMenuOpen(false)}>Feedback</Link></li>
                        <li><Link to="/student/favorites" onClick={() => setMenuOpen(false)}>My Favorites ({favorites.length})</Link></li>
                        <li><Link to="/student/registered" onClick={() => setMenuOpen(false)}>My Events ({registeredEvents.length})</Link></li>
                        <li>
                            <Link to="#" onClick={() => { setMenuOpen(false); setShowProfile(true); }}>
                                <FaUser style={{ marginRight: '8px' }} /> My Profile
                            </Link>
                        </li>
                        <li><Link to="/" onClick={() => setMenuOpen(false)}>Logout</Link></li>
                    </ul>
                </div>
            </nav>

            {/* Main Content */}
            <div className="content">
                <header className="hero-section">
                    <div className="header-content">
                        <h1 className="hero-title">
                            Welcome back, {user ? user.name.split(' ')[0] : 'Guest'}!
                        </h1>
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
                                <h4>Sort By</h4>
                                <select
                                    className="sort-select"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="date-asc">Date (Earliest First)</option>
                                    <option value="date-desc">Date (Latest First)</option>
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="popular">Most Popular</option>
                                </select>
                            </div>
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
                            {/* Department Filter - New Section */}
                            <div className="filter-section">
                                <h4>Department</h4>
                                <select 
                                    className="department-select"
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                >
                                    <option value="All">All Departments</option>
                                    {departments.slice(1).map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
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

                {/* Recommended Events Section */}
                {showRecommendations && recommendedEvents.length > 0 && (
                    <div className="recommended-section">
                        <h2 className="section-title">
                            Recommended For You
                            <button 
                                className="hide-recommendations" 
                                onClick={() => setShowRecommendations(false)}
                            >
                                Hide
                            </button>
                        </h2>
                        <div className="recommended-grid">
                            {recommendedEvents.map(event => (
                                <div key={`rec-${event.id}`} className="recommended-card">
                                    <h3>{event.eventName}</h3>
                                    <p><FaCalendarAlt /> {event.formattedDate}</p>
                                    <p><FaMapMarkerAlt /> {event.eventLocation}</p>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => {
                                            document.getElementById(event.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Events Section */}
                <div className="events-section">
                    <h2 className="section-title">
                        All Events ({filteredEvents.length})
                        {selectedDepartment !== "All" && (
                            <span className="filter-badge">
                                {selectedDepartment}
                            </span>
                        )}
                    </h2>
                    
                    {loading ? (
                        <div className="loading-spinner">
                            <div className="spinner"></div>
                            <p>Loading events...</p>
                        </div>
                    ) : currentEvents.length > 0 ? (
                        <>
                            <div className="events-grid">
                                {currentEvents.map(event => (
                                    <div 
                                        key={event.id} 
                                        id={event.id}
                                        className={`event-card ${!event.isUpcoming ? 'past-event' : ''}`}
                                    >
                                        <div className="card-header">
                                            <h3 className="event-title">{event.eventName}</h3>
                                            <div className="event-actions">
                                                <button
                                                    className={`favorite-btn ${favorites.includes(event.id) ? 'active' : ''}`}
                                                    onClick={() => toggleFavorite(event.id)}
                                                >
                                                    {favorites.includes(event.id) ? <FaStar /> : <FaRegStar />}
                                                </button>
                                                <button
                                                    className={`reminder-btn ${reminders.includes(event.id) ? 'active' : ''}`}
                                                    onClick={() => toggleReminder(event.id)}
                                                >
                                                    {reminders.includes(event.id) ? <FaBell /> : <FaRegBell />}
                                                </button>
                                                <button
                                                    className="share-btn"
                                                    onClick={() => openShareModal(event)}
                                                >
                                                    <FaShareAlt />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="event-tags">
                                            <span className="event-category">{event.eventCategory}</span>
                                            {event.eventDepartment && event.eventDepartment !== "All Departments" && (
                                                <span className="event-department">
                                                    <FaGraduationCap /> {event.eventDepartment}
                                                </span>
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
                                        
                                        {/* Rating Section */}
                                        {!event.isUpcoming && (
                                            <div className="rating-section">
                                                <p>Rate this event:</p>
                                                <div className="rating-stars">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <FaStar 
                                                            key={star}
                                                            className={`star ${ratings[event.id] >= star ? 'active' : ''}`}
                                                            onClick={() => rateEvent(event.id, star)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Comments Section */}
                                        {showEventDetails === event.id && (
                                            <div className="comments-section">
                                                <h4>Comments ({comments[event.id]?.length || 0})</h4>
                                                {comments[event.id]?.map((comment, index) => (
                                                    <div key={index} className="comment">
                                                        <strong>{comment.author}</strong>
                                                        <p>{comment.text}</p>
                                                        <small>{format(new Date(comment.date), 'MMM dd, yyyy')}</small>
                                                    </div>
                                                ))}
                                                <div className="add-comment">
                                                    <input
                                                        type="text"
                                                        placeholder="Add a comment..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                    />
                                                    <button onClick={() => addComment(event.id)}>Post</button>
                                                </div>
                                            </div>
                                        )}
                                        
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
                                                <>
                                                    <span className="event-ended-badge">Event Ended</span>
                                                    {registeredEvents.includes(event.id) && !attendedEvents.includes(event.id) && (
                                                        <button 
                                                            className="attended-btn"
                                                            onClick={() => markAsAttended(event.id)}
                                                        >
                                                            I Attended
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button 
                                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={currentPage === number ? 'active' : ''}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                    
                                    <button 
                                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
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
                    onClose={() => setShowShareModal(false)}
                />
            )}

            {/* Profile Modal */}
            {showProfile && (
                <Profile
                    user={user}
                    onUpdateProfile={handleUpdateProfile}
                    onClose={() => setShowProfile(false)}
                />
            )}

            <footer className="footer">
                <p className="footer-p">&copy; {new Date().getFullYear()} Created by Sabarish R &#128519; & NaveenKumar P &#128522;</p>
            </footer>
        </div>
    );
};

export default StudentDashboard;