import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const FeedbackPage = () => {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [rating, setRating] = useState("Good");
    const [feedback, setFeedback] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !phone.trim() || !feedback.trim()) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            // Send data to Firebase
            await addDoc(collection(db, "feedback"), { email, phone, rating, feedback });

            // Send data to Formspree
            const formData = new FormData();
            formData.append("email", email);
            formData.append("phone", phone);
            formData.append("rating", rating);
            formData.append("feedback", feedback);

            const response = await fetch("https://formspree.io/f/xdkenlvw", {
                method: "POST",
                body: formData,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                alert("Feedback submitted successfully!");
                setEmail("");
                setPhone("");
                setRating("Good");
                setFeedback("");
                navigate("/student-dashboard"); // Redirect to student dashboard
            } else {
                alert("Error submitting feedback. Please try again.");
            }
        } catch (error) {
            console.error("Error submitting feedback:", error);
            alert("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: "500px", width: "100%" }}>
                <h3 className="text-center mb-4">Submit Your Feedback</h3>
                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            placeholder="Enter your phone number"
                        />
                    </div>

                    {/* Rating Selection */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Rate Us</label>
                        <select className="form-select" value={rating} onChange={(e) => setRating(e.target.value)} required>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Poor">Poor</option>
                        </select>
                    </div>

                    {/* Feedback Description */}
                    <div className="mb-3">
                        <label className="form-label fw-bold">Your Feedback</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                            placeholder="Enter your valuable feedback..."
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn btn-primary w-100">
                        Submit Feedback
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackPage;
