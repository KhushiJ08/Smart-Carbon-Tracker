export const getPrediction = async (data) => {
  const response = await fetch(
    "https://smart-carbon-tracker-backend.onrender.com/predict",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  return response.json();
};
