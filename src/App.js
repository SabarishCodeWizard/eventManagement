import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import StudentLogin from "./pages/StudentLogin";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import EditEvent from "./components/EditEvent";
import FeedbackPage from "./pages/FeedbackPage";
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/admin/edit/:id" element={<EditEvent />} />
        <Route path="/student/feedback" element={<FeedbackPage />} /> 
      </Routes>
    </Router>
  );
};

export default App;
