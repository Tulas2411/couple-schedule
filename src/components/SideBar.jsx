import {
  House,
  CalendarDays,
  Inbox,
  Folder,
  Tag,
  Filter,
  CheckSquare,
  Trash2,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="sidebar bg-dark text-light p-3">
      <div className="mb-4">
        <h5 className="fw-bold">T</h5>
      </div>

      <div className="menu-section mb-3">
        <div className="menu-item active">
          <House size={16} /> Today
        </div>
        <div className="menu-item">
          <CalendarDays size={16} /> Next 7 Days
        </div>
        <div className="menu-item">
          <Inbox size={16} /> Inbox
        </div>
      </div>

      <div className="menu-section">
        <p className="text-secondary small mb-2">Lists</p>
        <div className="menu-item">
          <Folder size={16} /> Work
        </div>
        <div className="menu-item">
          <Folder size={16} /> Personal
        </div>
        <div className="menu-item">
          <Folder size={16} /> Learning
        </div>
        <div className="menu-item">
          <Folder size={16} /> Fitness
        </div>
        <div className="menu-item">
          <Folder size={16} /> Wish List
        </div>
      </div>

      <div className="menu-section mt-4">
        <p className="text-secondary small mb-2">Tags</p>
        <div className="menu-item">
          <Tag size={16} /> #Priority
        </div>
        <div className="menu-item">
          <Tag size={16} /> #Important
        </div>
      </div>

      <div className="menu-section mt-4">
        <p className="text-secondary small mb-2">Filters</p>
        <div className="menu-item">
          <Filter size={16} /> Completed
        </div>
        <div className="menu-item">
          <Trash2 size={16} /> Trash
        </div>
      </div>

      <div className="bottom-section mt-auto">
        <div className="menu-item text-secondary small">⚙ Settings</div>
      </div>
    </div>
  );
}
