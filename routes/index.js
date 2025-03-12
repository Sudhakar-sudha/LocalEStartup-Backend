const express = require("express");
const router = express.Router();
router.use("/categories", require("./categoryRoutes"));
router.use("/product", require("./productRoutes"));
router.use("/getproduct", require("./getproductRoute"));
module.exports = router; 
