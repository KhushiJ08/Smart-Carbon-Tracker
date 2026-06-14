import React, { useState } from "react";

const AddActivity = () => {
  const [category, setCategory] = useState("");
  const [emission, setEmission] = useState("");

  // Categories
  const categories = ["Transport", "Electricity", "Food", "Fuel", "Travel"];

  // Submit Function
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!category || !emission) {
      alert("Please fill all fields");
      return;
    }

    const newActivity = {
      category,
      emission: Number(emission),
    };

    // Get old activities
    const oldActivities = JSON.parse(localStorage.getItem("activities")) || [];

    // Add new activity
    oldActivities.push(newActivity);

    // Save updated activities
    localStorage.setItem("activities", JSON.stringify(oldActivities));

    alert("Activity Added Successfully");

    // Reset form
    setCategory("");
    setEmission("");
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
        <h2
          style={{
            textAlign: "center",
          }}
        >
          Add Daily Activity
        </h2>

        {/* CATEGORY */}
        <div>
          <label
            style={{
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              borderRadius: "8px",
              fontSize: "16px",
              backgroundColor: "white",
              color: "black",
              border: "1px solid #ccc",
              outline: "none",
            }}
          >
            <option value="">Select Category</option>

            {categories.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* EMISSION */}
        <div>
          <label
            style={{
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            Emission (kg CO₂)
          </label>

          <input
            type="number"
            placeholder="Enter emission"
            value={emission}
            onChange={(e) => setEmission(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginTop: "8px",
              borderRadius: "8px",
              fontSize: "16px",
              backgroundColor: "white",
              color: "black",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#90EE90",
            color: "black",
            border: "none",
            borderRadius: "10px",
            fontSize: "18px",
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
