"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import TaskModal from "@/components/TaskModal";
import "@/styles/dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("today");
  const [currentListId, setCurrentListId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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
          <button className="btn-add-task" onClick={handleAddTask}>
            + Add Task
          </button>
        </div>

        <TaskList
          tasks={tasks}
          onRefresh={fetchTasks}
          onEdit={handleEditTask}
        />
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
    </div>
  );
}
