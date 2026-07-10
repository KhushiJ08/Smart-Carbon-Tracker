import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddActivity = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [emission, setEmission] = useState("");

  const categories = [
    "Transport",
    "Electricity",
    "Food",
    "Fuel",
    "Travel",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !emission) {
      alert("Please fill all fields");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/activities/add", {
        userId: user._id,
        category,
        emission: Number(emission),
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
          width: "350px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          color: "white",
          boxShadow: "0px 0px 15px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Add Daily Activity</h2>

        <label>Category</label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select Category</option>

          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        <label>Emission (kg CO₂)</label>

        <input
          type="number"
          value={emission}
          onChange={(e) => setEmission(e.target.value)}
          placeholder="Enter emission"
          required
        />

        <button type="submit">
          Save Activity
        </button>
      </form>
    </div>
  );
};

export default AddActivity;