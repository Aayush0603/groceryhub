const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const Razorpay = require("razorpay");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

// RAZORPAY INSTANCE
const razorpay = new Razorpay({

  key_id:
    process.env.RAZORPAY_KEY_ID,

  key_secret:
    process.env.RAZORPAY_KEY_SECRET,

});

// CREATE ORDER API
app.post(
  "/create-order",
  async (req, res) => {

    try {

      const { amount } = req.body;

      const options = {

        amount:
          amount * 100,

        currency: "INR",

        receipt:
          `receipt_${Date.now()}`,

      };

      const order =
        await razorpay.orders.create(
          options
        );

      res.status(200).json(order);

    } catch (error) {

      console.log(error);

      res.status(500).json({

        error:
          "Failed to create Razorpay order",

      });

    }

  }
);

// SERVER
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});