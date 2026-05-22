const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

const Razorpay = require("razorpay");

// LOAD ENV
dotenv.config();

// APP
const app = express();

// CORS
app.use(
  cors({

    origin: "*",

    methods: [
      "GET",
      "POST",
    ],

  })
);

// JSON
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "Backend Working Successfully",

  });

});

// CHECK ENV VARIABLES
if (
  !process.env.RAZORPAY_KEY_ID ||
  !process.env.RAZORPAY_KEY_SECRET
) {

  console.log(
    "Razorpay keys missing in .env"
  );

}

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

      const { amount } =
        req.body;

      // VALIDATION
      if (!amount) {

        return res
          .status(400)
          .json({

            success: false,

            error:
              "Amount is required",

          });

      }

      // CREATE ORDER
      const options = {

        amount:
          Number(amount) * 100,

        currency: "INR",

        receipt:
          `receipt_${Date.now()}`,

      };

      const order =
        await razorpay.orders.create(
          options
        );

      // RESPONSE
      res.status(200).json({

        success: true,

        order,

      });

    } catch (error) {

      console.log(
        "Razorpay Error:",
        error
      );

      res.status(500).json({

        success: false,

        error:
          "Failed to create Razorpay order",

      });

    }

  }
);

// PORT
const PORT =
  process.env.PORT || 5000;

// START SERVER
app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});

// EXPORT APP
module.exports = app;