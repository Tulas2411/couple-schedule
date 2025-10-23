import { Calendar, Inbox, CheckSquare, Trash2 } from "lucide-react";

export default function Sidebar({
  currentFilter,
  currentListId,
  onFilterChange,
  onListChange,
  lists,
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-avatar">T</div>
      </div>

      <div className="menu-section">
        <div
          className={`menu-item ${currentFilter === "today" ? "active" : ""}`}
          onClick={() => onFilterChange("today")}
        >
          <Calendar size={18} />
          <span>Today</span>
          <span className="count">7</span>
        </div>

        <div
          className={`menu-item ${
            currentFilter === "next7days" ? "active" : ""
          }`}
          onClick={() => onFilterChange("next7days")}
        >
          <Calendar size={18} />
          <span>Next 7 Days</span>
          <span className="count">7</span>
        </div>

        <div
          className={`menu-item ${currentFilter === "inbox" ? "active" : ""}`}
          onClick={() => onFilterChange("inbox")}
        >
          <Inbox size={18} />
          <span>Inbox</span>
          <span className="count">5</span>
        </div>
      </div>

      <div className="menu-section">
        <p className="section-title">Lists</p>
        {lists.map((list) => (
          <div
            key={list.id}
            className={`menu-item ${currentListId === list.id ? "active" : ""}`}
            onClick={() => onListChange(list.id)}
          >
            <span className="list-icon" style={{ color: list.color }}>
              {list.icon}
            </span>
            <span>{list.name}</span>
          </div>
        ))}
      </div>

      <div className="menu-section">
        <p className="section-title">Tags</p>
        <div className="menu-item">
          <span className="tag-dot" style={{ background: "#ef4444" }}></span>
          <span>Urgent</span>
        </div>
        <div className="menu-item">
          <span className="tag-dot" style={{ background: "#f59e0b" }}></span>
          <span>Important</span>
        </div>
      </div>

      <div className="menu-section">
        <p className="section-title">Filters</p>
        <div
          className={`menu-item ${
            currentFilter === "completed" ? "active" : ""
          }`}
          onClick={() => onFilterChange("completed")}
        >
          <CheckSquare size={18} />
          <span>Completed</span>
        </div>
        <div className="menu-item">
          <Trash2 size={18} />
          <span>Trash</span>
        </div>
      </div>
    </div>
  );
}
