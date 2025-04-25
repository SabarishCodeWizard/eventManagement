import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import "../styles/AdminDashboard.css";
import { FiCalendar, FiClock, FiMapPin, FiLink, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    eventDate: "",
    eventTime: "",
    eventDesc: "",
    eventLink: "",
    eventCategory: "Workshop",
    eventLocation: "",
    eventDepartment: "All Departments" // Added department field
  });
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDepartment, setFilterDepartment] = useState("All"); // Added department filter
  const navigate = useNavigate();

  // List of departments
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

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const q = query(collection(db, "events"), orderBy("eventDate", "asc"));
        const eventCollection = await getDocs(q);
        setEvents(eventCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { eventName, eventDate, eventTime, eventDesc, eventLink, eventLocation, eventDepartment } = formData;
    
    if (!eventName || !eventDate || !eventTime || !eventDesc || !eventLink || !eventLocation || !eventDepartment) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingEvent) {
        await updateDoc(doc(db, "events", editingEvent.id), formData);
        setEditingEvent(null);
        alert("Event updated successfully!");
      } else {
        await addDoc(collection(db, "events"), formData);
        alert("Event added successfully!");
      }
      
      // Refresh events
      const eventCollection = await getDocs(collection(db, "events"));
      setEvents(eventCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Reset form
      setFormData({
        eventName: "",
        eventDate: "",
        eventTime: "",
        eventDesc: "",
        eventLink: "",
        eventCategory: "Workshop",
        eventLocation: "",
        eventDepartment: "All Departments"
      });
    } catch (error) {
      console.error("Error saving event:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await deleteDoc(doc(db, "events", id));
              setEvents(events.filter(event => event.id !== id));
              alert("Event deleted successfully!");
            } catch (error) {
              console.error("Error deleting event:", error);
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      eventDesc: event.eventDesc,
      eventLink: event.eventLink,
      eventCategory: event.eventCategory,
      eventLocation: event.eventLocation,
      eventDepartment: event.eventDepartment || "All Departments" // Handle older events without department
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         event.eventDesc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || event.eventCategory === filterCategory;
    const matchesDepartment = filterDepartment === "All" || 
                             (event.eventDepartment && event.eventDepartment === filterDepartment) || 
                             (!event.eventDepartment && filterDepartment === "All Departments");
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="admin-dashboard">
      <div className="content">
        {/* Header Section */}
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="header-controls">
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search events..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="event-count">
              <span>Total Events: {events.length}</span>
              <span>Showing: {filteredEvents.length}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="admin-main">
          <div className="admin-content">
            {/* Add/Edit Event Form */}
            <div className="form-card">
              <h3>{editingEvent ? "Edit Event" : "Add New Event"}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Event Name *</label>
                  <input 
                    type="text" 
                    name="eventName"
                    placeholder="Enter event name"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <div className="input-with-icon">
                      <input 
                        type="date" 
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <div className="input-with-icon">
                      <input 
                        type="time" 
                        name="eventTime"
                        value={formData.eventTime}
                        onChange={handleInputChange}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      name="eventLocation"
                      placeholder="Enter event location"
                      value={formData.eventLocation}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select 
                      name="eventCategory"
                      value={formData.eventCategory}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Conference">Conference</option>
                      <option value="Sports">Sports</option>
                      <option value="Social">Social</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Department *</label>
                    <select 
                      name="eventDepartment"
                      value={formData.eventDepartment}
                      onChange={handleInputChange}
                      required
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea 
                    name="eventDesc"
                    placeholder="Enter event description"
                    value={formData.eventDesc}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Registration Link *</label>
                  <div className="input-with-icon">
                    <input 
                      type="url" 
                      name="eventLink"
                      placeholder="https://example.com/register"
                      value={formData.eventLink}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="form-actions">
                  {editingEvent && (
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => {
                        setEditingEvent(null);
                        setFormData({
                          eventName: "",
                          eventDate: "",
                          eventTime: "",
                          eventDesc: "",
                          eventLink: "",
                          eventCategory: "Workshop",
                          eventLocation: "",
                          eventDepartment: "All Departments"
                        });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="submit-btn">
                    {editingEvent ? "Update Event" : "Add Event"}
                  </button>
                </div>
              </form>
            </div>

            {/* Event List */}
            <div className="event-list-card">
              <div className="event-list-header">
                <h3>Event Management</h3>
                <div className="event-filters">
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Conference">Conference</option>
                    <option value="Sports">Sports</option>
                    <option value="Social">Social</option>
                    <option value="Other">Other</option>
                  </select>
                  
                  <select 
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    {departments.slice(1).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="loading-spinner">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="no-events">No events found matching your criteria</div>
              ) : (
                <div className="responsive-table">
                  <table className="event-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Department</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((event) => (
                        <tr key={event.id}>
                          <td>
                            <div className="event-name">{event.eventName}</div>
                            <div className="event-desc">{event.eventDesc.substring(0, 60)}...</div>
                          </td>
                          <td>
                            <span className={`category-badge ${event.eventCategory.toLowerCase()}`}>
                              {event.eventCategory}
                            </span>
                          </td>
                          <td>
                            <span className="department-badge">
                              {event.eventDepartment || "All Departments"}
                            </span>
                          </td>
                          <td>
                            <div>{formatDate(event.eventDate)}</div>
                            <div className="event-time">{event.eventTime}</div>
                          </td>
                          <td>{event.eventLocation}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="edit-btn"
                                onClick={() => handleEdit(event)}
                              >
                                <FiEdit2 /> Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(event.id)} 
                                className="delete-btn"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <p className="footer-p">
          &copy; {new Date().getFullYear()} Event Management System | 
          Created by Sabarish R &#128519; & NaveenKumar P &#128522;
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;