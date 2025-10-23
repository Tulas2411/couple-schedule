"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TaskList from "@/components/TaskList";
import CalendarView from "@/components/CalendarView";
import "@/styles/dashboard.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'calendar'

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  async function addTask() {
    const title = prompt("Nhập tiêu đề:");
    if (!title) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        due_date: new Date().toISOString().slice(0, 10),
      }),
    });
    fetchTasks();
  }

  return (
    <div className="dashboard d-flex">
      <Sidebar />
      <div className="main-content flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="text-light">Couple Schedule Manager</h4>
          <div>
            <button
              className="btn btn-sm btn-outline-light me-2"
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <button
              className="btn btn-sm btn-outline-light me-2"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </button>
            <button className="btn btn-sm btn-primary" onClick={addTask}>
              + Add Task
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <TaskList tasks={tasks} refresh={fetchTasks} />
        ) : (
          <CalendarView tasks={tasks} />
        )}
      </div>
    </div>
  );
}
