import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import SubmitIdea from "./pages/SubmitIdea";
import Feedback from "./pages/Feedback";
import ProgressTracking from "./pages/ProgressTracking";
import AssignTask from "./pages/AssignTask";
import Help from "./pages/Help";
import DiagramEditor from "./pages/DiagramEditor";
import { saveTeam, getTeamByGroupId, createTask, getTasksByGroupId, toggleTaskStatus, getUserGroupId, getRoles } from "./api/studentPanelApi";
import "./styles/app.css";
import "./styles/dashboard.css";
import "./styles/submit-idea.css";
import "./styles/feedback.css";
import "./styles/progress-tracking.css";
import "./styles/assign-task.css";
import "./styles/help.css";
import "./styles/diagram-editor-main.css";
import "./styles/FileViewer.css";

function App({ userName, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [studentPermissions, setStudentPermissions] = useState([]);

  const [tasks, setTasks] = useState([]);
  const [leaderName, setLeaderName] = useState("");
  const [members, setMembers] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [groupId, setGroupId] = useState("");
  const [isGroupProfileSaved, setIsGroupProfileSaved] = useState(false);
  const [leaderPassword, setLeaderPassword] = useState("");

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await getRoles();
        if (response.roles && response.roles.length > 0) {
          const roles = response.roles.map((role) => ({
            ...role,
            id: role.roleId || role._id || role.id,
          }));
          const student = roles.find(r => r.id === '3');
          if (student) {
            setStudentPermissions(student.permissions);
            // Cache in localStorage as fallback
            localStorage.setItem('roles', JSON.stringify(roles));
          }
        }
      } catch (error) {
        console.error('Failed to load permissions from backend, falling back to localStorage:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('roles');
        if (saved) {
          const roles = JSON.parse(saved);
          const student = roles.find(r => r.id === '3');
          if (student) {
            setStudentPermissions(student.permissions);
          }
        }
      }
    };

    loadPermissions();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(loadPermissions, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const canViewProgress = studentPermissions.includes('progress.track');
  const canCreateDiagram = studentPermissions.includes('diagram.create');
  const canSubmitIdea = studentPermissions.includes('idea.submit');
  const canViewHelp = studentPermissions.includes('help.view');

  const isActive = (path) => {
    const currentPath = location.pathname;
    return currentPath === `/students${path}` || currentPath === path;
  };

  const saveProjectName = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProjectName(trimmed);
    setLeaderName("");
    setMembers([]);
    setGroupId("");
    setLeaderPassword("");
    setIsGroupProfileSaved(false);

    const sharedGroupData = localStorage.getItem(`studentGroupData_${trimmed}`);
    if (sharedGroupData) {
      try {
        const parsed = JSON.parse(sharedGroupData);
        if (parsed.leaderName) setLeaderName(parsed.leaderName);
        if (Array.isArray(parsed.members)) setMembers(parsed.members);
        if (parsed.groupId) setGroupId(parsed.groupId);
        if (parsed.leaderPassword) setLeaderPassword(parsed.leaderPassword);
        setIsGroupProfileSaved(Boolean(parsed.leaderName && parsed.leaderPassword));
      } catch (error) {
        console.error('Error loading shared group data:', error);
      }
    }

    const progressData = { projectName: trimmed };
    localStorage.setItem(`studentProgressData_${userName}`, JSON.stringify(progressData));
    localStorage.setItem(`studentGroupData_${trimmed}`, JSON.stringify(progressData));
  };

  const saveGroupTeam = async (leader, memberList, password, projectNameParam) => {
    // Get the user's groupId first
    const userGroupIdData = await getUserGroupId(userName);
    const userGroupId = userGroupIdData?.groupId || '';

    const result = await saveTeam({
      groupId: userGroupId,
      projectName: projectNameParam || projectName,
      leaderName: leader.trim(),
      leaderPassword: password,
      members: memberList
    });

    if (result.success) {
      setLeaderName(leader.trim());
      setMembers(memberList);
      setGroupId(userGroupId);
      setLeaderPassword(password);
      setIsGroupProfileSaved(true);
      const groupData = {
        groupId: userGroupId,
        projectName,
        leaderName: leader.trim(),
        members: memberList,
        leaderPassword: password
      };
      localStorage.setItem(`studentProgressData_${userName}`, JSON.stringify(groupData));
      localStorage.setItem(`studentGroupData_${projectName}`, JSON.stringify(groupData));
    } else {
      alert(result.message || 'Error saving team');
    }
  };

  const handleAddTask = async (newTask) => {
    const result = await createTask({
      name: newTask.name,
      assignedTo: newTask.assignedTo,
      deadline: newTask.deadline,
      projectName: projectName,
      leaderName: leaderName,
      groupId: groupId
    });
    
    if (result.success) {
      setTasks((prev) => [...prev, result.task]);
    } else {
      alert(result.message || 'Error creating task');
    }
  };

  const handleToggleTask = async (taskId) => {
    const result = await toggleTaskStatus(taskId);
    
    if (result.success) {
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
    } else {
      alert(result.message || 'Error toggling task status');
    }
  };

  // Load team data from API on mount
  useEffect(() => {
    const loadTeamData = async () => {
      // Get user's groupId first
      const userGroupIdData = await getUserGroupId(userName);
      const userGroupId = userGroupIdData?.groupId || '';
      
      if (userGroupId) {
        setGroupId(userGroupId);

        // Load team data from API using groupId
        const teamResult = await getTeamByGroupId(userGroupId);
        if (teamResult.success && teamResult.team) {
          setLeaderName(teamResult.team.leaderName);
          setMembers(teamResult.team.members || []);
          setGroupId(userGroupId);
          setLeaderPassword(teamResult.team.leaderPassword);
          setIsGroupProfileSaved(true);
          // Only set projectName if it exists in the team data
          if (teamResult.team.projectName) {
            setProjectName(teamResult.team.projectName);
          }
        }

        // Load tasks from API using groupId
        const tasksResult = await getTasksByGroupId(userGroupId);
        if (tasksResult.success && tasksResult.tasks) {
          setTasks(tasksResult.tasks);
        }
      }
    };

    loadTeamData();
  }, [userName]);

  const dashboardProps = {
    userName,
    projectName,
    leaderName,
  };

  const progressProps = {
    tasks,
    leaderName,
    members,
    onToggleTask: handleToggleTask,
    projectName,
    groupId,
    onSaveProject: saveProjectName,
    onSaveTeam: saveGroupTeam,
    isGroupProfileSaved,
    currentUser: userName,
  };

  const assignTaskProps = {
    onAddTask: handleAddTask,
    leaderName,
    members,
    leaderPassword,
    groupId,
  };

  const submitIdeaProps = {
    userName,
  };

  const feedbackProps = {
    projectName,
    leaderName,
    userName,
  };

  return (
    <>
      <div className="app-root">
        <Sidebar
          isActive={isActive}
          onNavigate={(path) => navigate(`/students${path}`)}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          canViewProgress={canViewProgress}
          canCreateDiagram={canCreateDiagram}
          canSubmitIdea={canSubmitIdea}
          canViewHelp={canViewHelp}
          userName={userName}
          onLogout={onLogout}
        />

        <main className="app-main">
          {/* Mobile Header */}
          <header className="app-mobile-header">
            <div className="app-brand">
              <span className="app-brand-text">Student Panel</span>
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
            <Routes>
              <Route path="/dashboard" element={<Dashboard {...dashboardProps} />} />
              <Route path="/submit" element={canSubmitIdea ? <SubmitIdea {...submitIdeaProps} /> : <Dashboard {...dashboardProps} />} />
              <Route path="/feedback" element={<Feedback {...feedbackProps} />} />
              <Route path="/progress" element={canViewProgress ? <ProgressTracking {...progressProps} /> : <Dashboard {...dashboardProps} />} />
              <Route path="/assign-task" element={<AssignTask {...assignTaskProps} />} />
              <Route path="/help" element={canViewHelp ? <Help userName={userName} projectName={projectName} /> : <Dashboard {...dashboardProps} />} />
              <Route path="/diagram-editor" element={canCreateDiagram ? <DiagramEditor userName={userName} /> : <Dashboard {...dashboardProps} />} />
              <Route path="*" element={<Dashboard {...dashboardProps} />} />
            </Routes>
            <div className="app-content-spacer" />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
