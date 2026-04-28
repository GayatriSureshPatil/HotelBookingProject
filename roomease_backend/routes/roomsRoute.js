const express = require("express");
const morgan = require("morgan");

// Controller
const roomController = require("../controllers/roomController");

const router = express.Router();

router.route("/").get(roomController.getAllRooms);

router.route("/:roomno").get(roomController.getRoom);

module.exports = router;
