const axios = require("axios");

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1";

const getRoute = async ({ origin, destination, transportMode = "car" }) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  if (
    !Array.isArray(origin) ||
    origin.length !== 2 ||
    !Array.isArray(destination) ||
    destination.length !== 2
  ) {
    throw new Error("Origin and destination must be [longitude, latitude]");
  }

  const profile =
    transportMode === "walking"
      ? "foot"
      : transportMode === "bicycle"
        ? "bike"
        : "driving";

  const coordinates = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;

  try {
    const response = await axios.get(
      `${OSRM_BASE_URL}/${profile}/${coordinates}`,
      {
        params: {
          overview: "false",
          steps: false,
        },
        timeout: 10000,
      },
    );

    const data = response.data;

    if (data.code !== "Ok") {
      throw new Error(data.message || "Unable to calculate route");
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error("No route found between the selected locations");
    }

    const route = data.routes[0];

    return {
      distance: Number(route.distance / 1000).toFixed(2),

      duration: Number(route.duration / 60).toFixed(2),

      distanceMeters: route.distance,

      durationSeconds: route.duration,

      route: route,
    };
  } catch (error) {
    console.error("Routing API error:", error.message);

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Route information is temporarily unavailable. Please try again later.",
      );
    }

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to calculate route",
    );
  }
};

module.exports = {
  getRoute,
};
