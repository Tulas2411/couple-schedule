"use client";
import { useState } from "react";
import { 
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, parseISO, addMonths, subMonths,
  startOfDay, endOfDay, addWeeks, subWeeks
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarView({ tasks, viewMode, onTaskClick, onDateClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextPeriod = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevPeriod}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-title">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
            {viewMode === 'agenda' && 'Agenda'}
          </h2>
          <button className="nav-btn" onClick={nextPeriod}>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className="today-btn" onClick={goToToday}>
          Today
        </button>
      </div>

      {viewMode === 'month' && (
        <MonthView tasks={tasks} currentDate={currentDate} onTaskClick={onTaskClick} onDateClick={onDateClick} />
      )}
      {viewMode === 'week' && (
        <WeekView tasks={tasks} currentDate={currentDate} onTaskClick={onTaskClick} />
      )}
      {viewMode === 'day' && (
        <DayView tasks={tasks} currentDate={currentDate} onTaskClick={onTaskClick} />
      )}
      {viewMode === 'agenda' && (
        <AgendaView tasks={tasks} onTaskClick={onTaskClick} />
      )}
    </div>
  );
}

// Month View
function MonthView({ tasks, currentDate, onTaskClick, onDateClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dayTasks = tasks.filter(task => 
        task.due_date && isSameDay(parseISO(task.due_date), day)
      );
      
      days.push(
        <div
          key={day.toString()}
          className={`calendar-day ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}
          onClick={() => onDateClick && onDateClick(day)}
        >
          <div className="day-number">{format(day, 'd')}</div>
          <div className="day-tasks">
            {dayTasks.slice(0, 3).map(task => (
              <div
                key={task.id}
                className="calendar-task"
                style={{ background: task.lists?.color || '#6b7280' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick && onTaskClick(task);
                }}
              >
                {task.due_time && <span className="task-time">{format(parseISO(`2000-01-01T${task.due_time}`), 'h:mm a')}</span>}
                {task.title}
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="more-tasks">+{dayTasks.length - 3} more</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="calendar-week" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="month-view">
      <div className="weekdays">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>
      <div className="month-grid">{rows}</div>
    </div>
  );
}

// Week View
function WeekView({ tasks, currentDate, onTaskClick }) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-gutter"></div>
        {weekDays.map(day => (
          <div key={day.toString()} className={`week-day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
            <div className="day-name">{format(day, 'EEE')}</div>
            <div className="day-date">{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      <div className="week-grid">
        <div className="time-slots">
          {hours.map(hour => (
            <div key={hour} className="time-slot">
              {format(new Date().setHours(hour, 0), 'h a')}
            </div>
          ))}
        </div>
        <div className="week-columns">
          {weekDays.map(day => {
            const dayTasks = tasks.filter(task => 
              task.due_date && isSameDay(parseISO(task.due_date), day)
            );
            return (
              <div key={day.toString()} className="week-day-column">
                {dayTasks.map(task => {
                  const startHour = task.due_time ? parseInt(task.due_time.split(':')[0]) : 9;
                  return (
                    <div
                      key={task.id}
                      className="week-task"
                      style={{
                        top: `${startHour * 60}px`,
                        background: task.lists?.color || '#6b7280',
                      }}
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      <div className="task-time-label">
                        {task.due_time && format(parseISO(`2000-01-01T${task.due_time}`), 'h:mm a')}
                      </div>
                      <div className="task-title-label">{task.title}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Day View
function DayView({ tasks, currentDate, onTaskClick }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayTasks = tasks.filter(task => 
    task.due_date && isSameDay(parseISO(task.due_date), currentDate)
  );