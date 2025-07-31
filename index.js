const express= require ("express");
const cors = require('cors');
const app= express();
const dotenv =require("dotenv");
const path=require("path");
const connectDatabase = require('./config/connectDatabase')

dotenv.config({path:path.join(__dirname,'config','config.env')})

connectDatabase();
// Serve images from the 'pictures' folder
app.use(cors());
app.use(express.json());

app.use('/sellerdata',require ('./routes/SellerData'));
app.use("/product", require("./routes/index"));
app.use('/user', require('./routes/UserData'));

app.use("/admin", require('./routes/adminapproveRoutes')); // ✅ Use Admin Routes

// app.use("/api/orders", require('./routes/orderRoutes'));
app.use("/api/reviews", require('./routes/reviewRoutes'));
app.use("/api/cart", require('./routes/cartRoutes'));

// ✅ Ensure this matches the correct route
app.use("/api/orders", require("./routes/orderRoutes"));
// Use Delivery Boy Routes
app.use("/api/deliveryboys", require('./routes/deliveryBoyRoutes'));



app.use("/api/freelancers", require("./routes/freelancerRoutes"));

app.use("/api/trainers", require("./routes/trainerRoutes"));

app.use("/api/feedback", require("./routes/localestartupfeedbackRoutes"));
app.listen(process.env.PORT ,() =>{
console.log(`Server is running   ${process.env.PORT} port  for ${process.env.NODE_ENV}`);
});


