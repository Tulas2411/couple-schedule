import { Circle, CheckCircle2, Calendar, Flag, Inbox } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TaskList({ tasks, onRefresh, onEdit }) {
  async function toggleComplete(task) {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: task.id,
        completed: !task.completed,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        list_id: task.list_id,
        priority: task.priority,
        tags: task.tags,
      }),
    });
    onRefresh();
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    await fetch("/api/tasks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 4:
        return "#ef4444"; // red
      case 3:
        return "#f59e0b"; // orange
      case 2:
        return "#3b82f6"; // blue
      default:
        return "#6b7280"; // gray
    }
  }

  function formatDueDate(due_date) {
    if (!due_date) return null;
    const date = parseISO(due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
      return "Today";
    } else if (date.getTime() === today.getTime() + 86400000) {
      return "Tomorrow";
    } else if (date < today) {
      return format(date, "MMM d");
    } else {
      return format(date, "MMM d");
    }
  }

  function isOverdue(due_date) {
    if (!due_date) return false;
    const date = parseISO(due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Group tasks by sections
  const overdueTasks = tasks.filter(
    (t) => !t.completed && isOverdue(t.due_date)
  );
  const todayTasks = tasks.filter(
    (t) => !t.completed && !isOverdue(t.due_date)
  );
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="task-list">
      {/* Overdue Section */}
      {overdueTasks.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h3 className="section-title overdue">Overdue</h3>
            <span className="section-count">{overdueTasks.length}</span>
          </div>
          {overdueTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={true}
            />
          ))}
        </div>
      )}

      {/* Today/Main Section */}
      {todayTasks.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h3 className="section-title">Today's Habit</h3>
            <span className="section-count">{todayTasks.length}</span>
          </div>
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={false}
            />
          ))}
        </div>
      )}

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <div className="task-section completed-section">
          <div className="section-header">
            <h3 className="section-title">Completed</h3>
            <span className="section-count">{completedTasks.length}</span>
          </div>
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={false}
            />
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="empty-state">
          <Inbox size={48} className="empty-icon" />
          <p>No tasks here</p>
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  getPriorityColor,
  formatDueDate,
  isOverdue,
}) {
  return (
    <div className={`task-item ${task.completed ? "completed" : ""}`}>
      <div className="task-checkbox" onClick={() => onToggle(task)}>
        {task.completed ? (
          <CheckCircle2 size={20} className="check-icon completed" />
        ) : (
          <Circle
            size={20}
            className="check-icon"
            style={{ color: getPriorityColor(task.priority) }}
          />
        )}
      </div>

      <div className="task-content" onClick={() => onEdit(task)}>
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {task.description && (
            <span className="task-description">{task.description}</span>
          )}
          {task.due_date && (
            <span className={`task-date ${isOverdue ? "overdue" : ""}`}>
              <Calendar size={12} />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.lists && (
            <span className="task-list" style={{ color: task.lists.color }}>
              {task.lists.icon} {task.lists.name}
            </span>
          )}
        </div>
      </div>

      <button
        className="task-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
      >
        ×
      </button>
    </div>
  );
}
