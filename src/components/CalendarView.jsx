"use client";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { parseISO } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import moment from "moment";

const localizer = momentLocalizer(moment);

export default function CalendarView({ tasks }) {
  const events = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    start: parseISO(t.due_date),
    end: parseISO(t.due_date),
  }));

  return (
    <div style={{ height: "80vh", background: "#1e1e1e", color: "white" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={["month", "week"]}
        style={{ height: "100%", backgroundColor: "#181818", color: "white" }}
      />
    </div>
  );
}
