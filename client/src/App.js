import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserSignup from "./pages/UserSignup";
import UserLogin from './pages/UserLogin';
import InvestorSignup from './pages/InvestorSignup';
import InvestorLogin from './pages/InvestorLogin';
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProjects from "./pages/OwnerProjects"; // Add this import
import AddProject from './pages/AddProject';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import InvestorDashboard from './pages/InvestorDashboard';
import ContactPage from "./pages/contactPage";
import InvestorProfile from './pages/InvestorProfile';
import InvestmentForm from './pages/investmentForm';
import MyInvestments from './pages/MyInvestments';
import AdminInvestments from './pages/AdminInvestments';
import OwnerInvestments from './pages/OwnerInvestments';
import ProjectProgress from './pages/ProjectProgress';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/user-signup" element={<UserSignup />} />
        <Route path="/investor-login" element={<InvestorLogin />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/projects" element={<OwnerProjects />} /> {/* Add this route */}
        <Route path="/owner/add-project" element={<AddProject />} />
        <Route path="/investor-signup" element={<InvestorSignup />} />
        <Route path="/investor/dashboard" element={<InvestorDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/owner/contactPage" element={<ContactPage />} />
        <Route path="/investor/profile" element={<InvestorProfile />} />
        <Route path="/investor/invest/:projectId" element={<InvestmentForm />} />
        <Route path="/investor/my-investments" element={<MyInvestments />} />
        <Route path="/admin/investments" element={<AdminInvestments />} /> 
        <Route path="/owner/investments" element={<OwnerInvestments />} />
        <Route path="/investor/project-progress/:projectId" element={<ProjectProgress />} /> 
      </Routes>
    </Router>
  );
}

export default App;