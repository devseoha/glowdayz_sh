const express = require('express');
const router = express.Router();
let user = require("../controller/user.ctrl");

// 유저 관련
router.use('/user', user);

module.exports = router;
