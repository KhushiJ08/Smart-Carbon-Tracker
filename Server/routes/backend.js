const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/backend");

router.post("/", getRecommendations);

module.exports = router;
