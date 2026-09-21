import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SubmitIdea from "./pages/SubmitIdea";
import Feedback from "./pages/Feedback";
import ProgressTracking from "./pages/ProgressTracking";
import AssignTask from "./pages/AssignTask";
import Help from "./pages/Help";
import DiagramEditor from "./pages/DiagramEditor";

function App() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [leaderName, setLeaderName] = useState("");
  const [members, setMembers] = useState([]);

  const handleAddTask = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === "Completed" ? "Pending" : "Completed",
            }
          : t
      )
    );
  };

  const handleAddMember = (name) => {
    if (name && !members.includes(name)) {
      setMembers((prev) => [...prev, name]);
    }
  };

  const handleRemoveMember = (name) => {
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "submit":
        return <SubmitIdea />;
      case "feedback":
        return <Feedback />;
      case "progress":
        return (
          <ProgressTracking
            tasks={tasks}
            leaderName={leaderName}
            setLeaderName={setLeaderName}
            members={members}
            addMember={handleAddMember}
            removeMember={handleRemoveMember}
            onToggleTask={handleToggleTask}
          />
        );
      case "assign-task":
        return (
          <AssignTask
            onAddTask={handleAddTask}
            leaderName={leaderName}
            members={members}
          />
        );
      case "help":
        return <Help />;
      case "diagram-editor":
        return <DiagramEditor />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Simple back button that doesn't interfere with existing layout */}
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        left: '10px', 
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '8px',
        padding: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back</span>
        </button>
      </div>

      <div className="app-root">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="app-main">
          {/* Mobile Header */}
          <header className="app-mobile-header">
            <div className="app-brand">
              <span className="material-symbols-outlined app-brand-icon">
                school
              </span>
              <span className="app-brand-text">StudentHub</span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="app-mobile-menu-btn"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </header>

          {/* Scrollable Content Area */}
          <div className="app-content">
            {renderContent()}
            <div className="app-content-spacer" />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
