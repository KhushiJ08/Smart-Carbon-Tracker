import { useEffect, useState } from "react";

function App() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetch("/api/activities/123")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data from backend:", data);
        setActivities(data);
      })
      .catch((err) => console.error("API error:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Smart Carbon Tracker</h1>

      <h2>Activities (Integration Test)</h2>

      {activities.length === 0 ? (
        <p>No activities found</p>
      ) : (
        <ul>
          {activities.map((activity) => (
            <li key={activity._id}>
              {activity.category} – {activity.value} {activity.unit}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
