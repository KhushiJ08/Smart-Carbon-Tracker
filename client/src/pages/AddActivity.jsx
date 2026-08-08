import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddActivity = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState("");
  const [emission, setEmission] = useState("");

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
      await axios.post(
        "http://localhost:5000/api/activities/add",
        {
          userId: user._id,
          category,
          emission: Number(emission),
          date: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

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
          boxShadow: "0 0 15px rgba(0,0,0,0.5)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Add Daily Activity</h2>

        <label>Category</label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "12px",
            borderRadius: "8px",
            fontSize: "16px",
            background: "white",
            color: "black",
          }}
          required
        >
          <option value="">Select Category</option>
          <option value="Transport">Transport</option>
          <option value="Electricity">Electricity</option>
          <option value="Food">Food</option>
          <option value="Fuel">Fuel</option>
          <option value="Travel">Travel</option>
        </select>

        <label>Emission (kg CO₂)</label>

        <input
          type="number"
          value={emission}
          onChange={(e) => setEmission(e.target.value)}
          placeholder="Enter emission"
          style={{
            padding: "12px",
            borderRadius: "8px",
            fontSize: "16px",
            background: "white",
            color: "black",
          }}
          required
        />

        <button
          type="submit"
          style={{
            padding: "14px",
            border: "none",
            borderRadius: "8px",
            background: "#9BE67A",
            color: "#111",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Save Activity
        </button>
      </form>
    </div>
  );
};

export default AddActivity;
