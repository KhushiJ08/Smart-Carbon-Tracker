export const getPrediction = async (data) => {
  const response = await fetch("http://localhost:5001/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
};
