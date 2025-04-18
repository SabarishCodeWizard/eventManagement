import React, { useState, useEffect } from "react";
import { FaUser, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "../styles/Profile.css"; // Import the CSS file for styling

const Profile = ({ user, onUpdateProfile, onClose }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        major: '',
        graduationYear: '',
        interests: []
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                major: user.major || '',
                graduationYear: user.graduationYear || '',
                interests: user.interests || []
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleInterestChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            if (checked) {
                return {
                    ...prev,
                    interests: [...prev.interests, value]
                };
            } else {
                return {
                    ...prev,
                    interests: prev.interests.filter(item => item !== value)
                };
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateProfile(formData);
        setEditMode(false);
        toast.success("Profile updated successfully!");
    };

    const interestOptions = [
        "Technology", "Sports", "Arts", "Music", "Science",
        "Business", "Social", "Volunteering", "Academic"
    ];

    return (
        <div className="profile-modal">
            <div className="profile-content">
                <div className="profile-header">
                    <h2>User Profile</h2>
                    <div className="profile-actions">
                        {editMode ? (
                            <>
                                <button onClick={handleSubmit} className="icon-btn">
                                    <FaSave /> Save
                                </button>
                                <button onClick={() => setEditMode(false)} className="icon-btn">
                                    <FaTimes /> Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setEditMode(true)} className="icon-btn">
                                    <FaEdit /> Edit
                                </button>
                                <button onClick={onClose} className="icon-btn">
                                    <FaTimes /> Close
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="profile-body">
                    {editMode ? (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Major</label>
                                <input
                                    type="text"
                                    name="major"
                                    value={formData.major}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Graduation Year</label>
                                <input
                                    type="text"
                                    name="graduationYear"
                                    value={formData.graduationYear}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Interests</label>
                                <div className="interests-grid">
                                    {interestOptions.map(interest => (
                                        <label key={interest} className="interest-checkbox">
                                            <input
                                                type="checkbox"
                                                value={interest}
                                                checked={formData.interests.includes(interest)}
                                                onChange={handleInterestChange}
                                            />
                                            {interest}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="profile-avatar">
                                <FaUser className="avatar-icon" />
                            </div>
                            <div className="profile-info">
                                <h3>{formData.name}</h3>
                                <p><strong>Email:</strong> {formData.email}</p>
                                {formData.major && <p><strong>Major:</strong> {formData.major}</p>}
                                {formData.graduationYear && <p><strong>Graduation Year:</strong> {formData.graduationYear}</p>}
                                {formData.bio && (
                                    <div className="bio-section">
                                        <strong>About Me:</strong>
                                        <p>{formData.bio}</p>
                                    </div>
                                )}
                                {formData.interests.length > 0 && (
                                    <div className="interests-section">
                                        <strong>Interests:</strong>
                                        <div className="interest-tags">
                                            {formData.interests.map(interest => (
                                                <span key={interest} className="interest-tag">{interest}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;