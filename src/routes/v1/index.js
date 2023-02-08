const express = require("express");
const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const cartRoute = require("./cart.route");
const productRoute = require("./product.route");

const router = express.Router();

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Reroute all API requests beginning with the `/v1/users` route to Express router in user.route.js

router.use("/users", userRoute);

//const router = express.Router();
router.use("/auth" ,authRoute)

// TODO: CRIO_TASK_MODULE_AUTH - Reroute all API requests beginning with the `/v1/auth` route to Express router in auth.route.js 
router.use("/products", productRoute);

router.use("/cart", cartRoute);


module.exports = router;
