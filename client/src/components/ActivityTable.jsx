import React from "react";

function ActivityTable({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="activity-section">
        <h2>Recent Activities</h2>
        <p>No activities found.</p>
      </div>
    );
  }

  return (
    <div className="activity-section">
      <h2>Recent Activities</h2>

      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Value</th>
            <th>Unit</th>
          </tr>
        </thead>

        <tbody>
          {activities.map((activity) => (
            <tr key={activity._id}>
              <td>{activity.category}</td>
              <td>{activity.description}</td>
              <td>{activity.value}</td>
              <td>{activity.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
