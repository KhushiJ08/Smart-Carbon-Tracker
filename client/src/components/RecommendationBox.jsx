import React from "react";

function RecommendationBox({ activities }) {
  let transport = 0;
  let electricity = 0;
  let fuel = 0;

  activities.forEach((item) => {
    switch (item.category) {
      case "Transport":
        transport += Number(item.value);
        break;
      case "Electricity":
        electricity += Number(item.value);
        break;
      case "Fuel":
        fuel += Number(item.value);
        break;
      default:
        break;
    }
  });

  let tips = [];

  if (transport > electricity && transport > fuel) {
    tips.push("🚲 Use public transport whenever possible.");
    tips.push("🚶 Walk or cycle for short distances.");
  }

  if (electricity > transport && electricity > fuel) {
    tips.push("💡 Turn off appliances when not in use.");
    tips.push("🔋 Switch to energy-efficient devices.");
  }

  if (fuel > transport && fuel > electricity) {
    tips.push("⛽ Reduce fuel consumption by combining trips.");
    tips.push("🚗 Maintain your vehicle for better efficiency.");
  }

  if (tips.length === 0) {
    tips.push("🌱 Keep tracking your daily activities.");
    tips.push("♻️ Continue following sustainable habits.");
  }

  return (
    <div className="recommend-box">
      <h2>🤖 AI Sustainability Tips</h2>

      <ul>
        {tips.map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}

export default RecommendationBox;
