"use client";

import { useEffect, useState } from "react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/events")
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>
      <pre>{JSON.stringify(events, null, 2)}</pre>
    </div>
  );
}