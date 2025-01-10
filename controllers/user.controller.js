const userModel = require("../models/user.model");
const Blacklist = require("../models/blacklist.model");
const productsModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const paymentModel = require("../models/payment.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.signup = async (req, res, next) => {
  try {
    const { email, password, username, role } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }

    const userExist = await userModel.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        message: "User Exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      email,
      password: hashedPassword,
      username,
      role,
    });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "user created successfully",
      user,
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All feilds are required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "invalid email or password",
      });
    }

    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      return res.status(400).json({
        message: "invalid password",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({
      message: "user signed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
      });
    }

    const isTokenBlackList = await BlacklistModel.findOne({ token });
    if (isTokenBlackList) {
      return res.status(400).json({
        message: "Token blacklist already",
      });
    }

    await Blacklist.create({ token });
  } catch (error) {
    next(error);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getProducts = async (req, res, next) => {
  try {
    const products = await productsModel.find({});
    res.status(200).json({
      products
    })
  } catch (error) {
    next(error)
  }
}

module.exports.getProductId = async (req, res, next) => {
  try {
    const product = await productsModel.findById(req.params.id);
    res.status(200).json({
      product
    })
  } catch (error) {
    next(error)
  }
}

module.exports.createOrder = async (req, res, next) => {
  try {

    const product = await productsModel.findById(req.params.id)
    const options = {
      amount: product.amount * 100, // amount in smallest currency unit
      currency: "INR",
      receipt: product._id,
    };

    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({
        message: "Error creating order"
      });
    }

    res.status(200).json({
      message: "Order created successfully",
      order
    });

    const payment = await paymentModel.create({
      order_id: order.id,
      amount: product.amount,
      currency: "INR",
      status: "pending"
    })

  } catch (error) {
    next(error);
  }
};
module.exports.verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, orderId, signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;

    var { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils');
    const isValid = validatePaymentVerification({order_id: orderId, payment_id: paymentId }, signature, secret);

    if(isValid){
      const payment = await paymentModel.findOne({
        orderId: orderId
      })

      payment.paymentId = paymentId;
      payment.signature = signature;
      payment.status = "success";

      await payment.save();

      res.status(200).json({
        message: "Payment verified successfully"
      })
    }else{
      const payment = await paymentModel.findOne({
        orderId: orderId
      })

      payment.status = "failed";

      await payment.save();

      res.status(200).json({
        message: "Payment verified failed"
      })
    }

  } catch (error) {
    next(error);
  }
};
