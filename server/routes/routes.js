const express = require("express");
const {
  getCourse,
  getMeetingSections,
  getMeetingSectionsSS
} = require("../controllers/controllers.js");

const router = express.Router();

// GET all info about course
router.get("/:courseId", getCourse);
// GET timetable information
router.get("/:courseId/meetingSections", getMeetingSections);
// GET timetable information -SS
router.get("/:courseId/meetingSectionsSS", getMeetingSectionsSS);

module.exports = {router};
