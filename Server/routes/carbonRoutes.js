const express = require("express");
const { calculateCarbon } = require("../controllers/carbonController");

const router = express.Router();

router.post("/calculate", calculateCarbon);

module.exports = router;
