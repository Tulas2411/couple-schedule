export default function TaskList({ tasks, refresh }) {
  async function deleteTask(id) {
    if (!confirm("Xóa công việc này?")) return;
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  return (
    <div>
      {tasks.map((task) => (
        <div
          key={task.id}
          className="task-item d-flex justify-content-between align-items-center"
        >
          <div>
            <span
              className="color-dot"
              style={{ backgroundColor: "#f9844a" }}
            ></span>
            <strong>{task.title}</strong>{" "}
            {task.due_date && (
              <small className="text-secondary">({task.due_date})</small>
            )}
          </div>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => deleteTask(task.id)}
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
