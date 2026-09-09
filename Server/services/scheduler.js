const cron = require("node-cron");
const { updateEnvironmentalData } = require("./environmentalService");

// Run every hour
const startScheduler = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("⏰ Running scheduled environmental update...");

      await updateEnvironmentalData("Delhi");

      console.log("✅ Environmental data updated automatically");
    } catch (error) {
      console.error("❌ Scheduled update failed:", error.message);
    }
  });

  console.log("🕐 Environmental data scheduler started");
};

module.exports = { startScheduler };
