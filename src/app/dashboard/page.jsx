"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import CalendarView from "@/components/CalendarView";
import AIAssistant from "@/components/AIAssistant";
import { Calendar, List, Sparkles } from "lucide-react";
import "@/styles/dashboard.css";
import "@/styles/calendar.css";
import "@/styles/ai-assistant.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("today");
  const [currentListId, setCurrentListId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list', 'month', 'week', 'day', 'agenda'
  const [calendarViewMode, setCalendarViewMode] = useState("month");
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, [currentFilter, currentListId]);

  async function fetchLists() {
    const res = await fetch("/api/lists");
    const data = await res.json();
    setLists(data);
  }

  async function fetchTasks() {
    let url = "/api/tasks?";
    if (currentListId) {
      url += `listId=${currentListId}`;
    } else {
      url += `filter=${currentFilter}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setTasks(data);
  }

  function getFilterTitle() {
    if (currentListId) {
      const list = lists.find((l) => l.id === currentListId);
      return list ? list.name : "List";
    }

    switch (currentFilter) {
      case "today":
        return "Today";
      case "next7days":
        return "Next 7 Days";
      case "inbox":
        return "Inbox";
      case "completed":
        return "Completed";
      default:
        return "Tasks";
    }
  }

  function handleFilterChange(filter) {
    setCurrentFilter(filter);
    setCurrentListId(null);
  }

  function handleListChange(listId) {
    setCurrentListId(listId);
    setCurrentFilter("");
  }

  function handleAddTask() {
    setEditingTask(null);
    setShowModal(true);
  }

  function handleEditTask(task) {
    setEditingTask(task);
    setShowModal(true);
  }

  function handleDateClick(date) {
    setEditingTask({
      due_date: date.toISOString().split("T")[0],
    });
    setShowModal(true);
  }

  return (
    <div className="dashboard">
      <Sidebar
        currentFilter={currentFilter}
        currentListId={currentListId}
        onFilterChange={handleFilterChange}
        onListChange={handleListChange}
        lists={lists}
        onRefreshLists={fetchLists}
      />

      <div className="main-content">
        <div className="content-header">
          <h2 className="filter-title">{getFilterTitle()}</h2>
          <div className="header-actions">
            <div className="view-switcher">
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                className={`view-btn ${
                  viewMode === "calendar" ? "active" : ""
                }`}
                onClick={() => setViewMode("calendar")}
                title="Calendar View"
              >
                <Calendar size={18} />
              </button>
            </div>

            {viewMode === "calendar" && (
              <select
                className="calendar-mode-select"
                value={calendarViewMode}
                onChange={(e) => setCalendarViewMode(e.target.value)}
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
                <option value="agenda">Agenda</option>
              </select>
            )}

            <button className="btn-add-task" onClick={handleAddTask}>
              + Add Task
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <TaskList
            tasks={tasks}
            onRefresh={fetchTasks}
            onEdit={handleEditTask}
          />
        ) : (
          <CalendarView
            tasks={tasks}
            viewMode={calendarViewMode}
            onTaskClick={handleEditTask}
            onDateClick={handleDateClick}
          />
        )}
      </div>

      {showModal && (
        <TaskModal
          task={editingTask}
          lists={lists}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchTasks();
          }}
        />
      )}

      {/* AI Assistant Toggle Button */}
      {!showAI && (
        <button
          className="ai-toggle-btn"
          onClick={() => setShowAI(true)}
          title="AI Assistant"
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* AI Assistant Panel */}
      {showAI && <AIAssistant tasks={tasks} onClose={() => setShowAI(false)} />}
    </div>
  );
}
