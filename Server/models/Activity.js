import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const emissionFactors = {
  Transport: { factor: 0.21, unit: "km" },
  Electricity: { factor: 0.82, unit: "kWh" },
  Fuel: { factor: 2.31, unit: "litres" },
  Food: { factor: 2.5, unit: "meals" },
  Travel: { factor: 0.18, unit: "km" },
};

const AddActivity = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [value, setValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    if (!category || !value) {
      alert("Please fill all fields.");
      return;
    }

    const factor = emissionFactors[category].factor;
    const unit = emissionFactors[category].unit;

    const emission = Number(value) * factor;

    try {
      await axios.post("http://localhost:5000/api/activities/add", {
        userId: user._id,
        category,
        value: Number(value),
        unit,
        emission,
        date: new Date(),
      });

      alert("Activity Added Successfully");

      navigate("/dashboard");
    } catch (err) {
      console.log(err);
      alert("Failed to add activity");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1448375240586-882707db888b')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(0,0,0,0.75)",
          padding: "40px",
          borderRadius: "20px",
          width: "380px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          color: "white",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Add Activity</h2>

        <label>Category</label>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select Category</option>
          {Object.keys(emissionFactors).map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {category && (
          <>
            <label>Enter {emissionFactors[category].unit}</label>

            <input
              type="number"
              placeholder={`Enter ${emissionFactors[category].unit}`}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />

            <p>
              Estimated Emission:
              <strong>
                {" "}
                {(
                  Number(value || 0) * emissionFactors[category].factor
                ).toFixed(2)}{" "}
                kg CO₂
              </strong>
            </p>
          </>
        )}

        <button type="submit">Save Activity</button>
      </form>
    </div>
  );
};

export default AddActivity;
