const cron = require("node-cron");
const { updateEnvironmentalData } = require("../services/environmentalService");

cron.schedule("0 * * * *", async () => {
  try {
    console.log("🌱 Running hourly environmental data update...");

    await updateEnvironmentalData("Delhi");

    console.log("✅ Environmental data updated successfully");
  } catch (error) {
    console.error("❌ Environmental data update failed:", error.message);
  }
});

console.log("⏰ Environmental data scheduler started");
