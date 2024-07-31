import * as Model from "../../models/index.js";
import { successRes, errorRes } from "../../utils/response.js";
import stripePackage from "stripe";
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const publishKey = process.env.PUBLISHABLE_KEY;
import moment from 'moment';
import "dotenv/config";
import shortid from "shortid";
const changeNotificationStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = await Model.User.findOne({ _id: userId });
    if (userData?.push_notification) {
      userData.push_notification = 0;
      await userData.save();
      return successRes(res, 200, "Notification Off Successfully", userData);
    } else if (userData?.push_notification == 0) {
      userData.push_notification = 1;
      await userData.save();
      return successRes(res, 200, "Notification On Successfully", userData);
    }
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const createProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, is_profile_created, address, landmark } = req.body;
    let profile_image;
    if (req.files && req.files.profile_image) {
      profile_image = `/public/${req.files.profile_image[0].filename}`;
    }
    const updateUser = await Model.User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          full_name: name,
          profile_image: profile_image,
          is_profile_created: is_profile_created,
          address: address,
          landmark: landmark,
        },
      },
      { new: true }
    );
    if (!updateUser) {
      return errorRes(res, 404, "User Not Found");
    }
    let location = updateUser?.location;
    const newAddress = await Model.Address.create({
      userId: userId,
      location: location,
      address: address,
      landmark: landmark,
      save_as: 0,
    });
    let response = {
      updateUser,
      newAddress,
    };
    return successRes(res, 200, "Profile Created Successfully", response);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const editProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, is_profile_created } = req.body;
    let profile_image;
    if (req.files && req.files.profile_image) {
      profile_image = `/public/${req.files.profile_image[0].filename}`;
    }
    const updateUser = await Model.User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          full_name: name,
          profile_image: profile_image,
          is_profile_created: is_profile_created,
        },
      },
      { new: true }
    );
    if (!updateUser) {
      return errorRes(res, 404, "User Not Found");
    }
    await Model.Activity.create({
      user_id: req.user._id,
      title: `${updateUser?.full_name} made updates to Profile details.`,
    });
    return successRes(res, 200, "Profile Updated Successfully", updateUser);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address, landmark, long, lat, save_as } = req.body;
    let location;
    if (req.body?.lat && req.body?.long) {
      location = {
        type: "Point",
        coordinates: [long, lat],
      };
    }
    const newAddress = await Model.Address.create({
      userId: userId,
      location: location,
      address: address,
      landmark: landmark,
      save_as: save_as,
    });
    return successRes(res, 200, "Address Added Successfully", newAddress);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const Addresses = await Model.Address.find({ userId: userId }).sort({
      createdAt: -1,
    });
    return successRes(res, 200, "All Addresses", Addresses);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.query;
    if (!addressId) {
      return errorRes(res, 400, "Please Provide Address Id");
    }
    const delAddress = await Model.Address.findOneAndDelete({ _id: addressId });
    if (!delAddress) {
      return errorRes(res, 404, "Address Not Found");
    }
    return successRes(res, 200, "Address Deleted Successfully");
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const editAddress = async (req, res) => {
  try {
    const { addressId } = req.body;
    const { address, landmark, long, lat, save_as } = req.body;
    let location;
    if (req.body?.lat && req.body?.long) {
      location = {
        type: "Point",
        coordinates: [long, lat],
      };
    }
    const updatedAddress = await Model.Address.findOneAndUpdate(
      { _id: addressId },
      {
        $set: {
          address: address,
          landmark: landmark,
          location: location,
          save_as: save_as,
        },
      },
      { new: true }
    );
    if (!updatedAddress) {
      return errorRes(res, 404, "Address Not Found");
    }
    return successRes(res, 200, "Address Updated Successfully", updatedAddress);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getProducts = async (req, res) => {
  try {
    const productData = await Model.Product.find({ is_deleted: 0 }).sort({
      createdAt: -1,
    });
    return successRes(res, 200, "Product list", productData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let data;
    const isProductExist = await Model.Cart.findOne({
      userId: userId,
      productId: req.body.productId,
    });
    if (isProductExist) {
      isProductExist.quantity += 1;
      data = await isProductExist.save();
    } else {
      data = await Model.Cart.create({ userId: userId, ...req.body });
    }
    console.log(data, "data");
    return successRes(res, 200, "Product Added Successfully", data);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { productId, quantity } = req.body;
//     let newCart;

//     const existingCart = await Model.Cart.findOne({ userId: userId });
//     if (existingCart) {
//       // Check if the product is already in the cart
//       const existingProductIndex = existingCart.products.findIndex(
//         (product) => {
//           return product.productId.toString() === productId.toString();
//         }
//       );
//       if (existingProductIndex !== -1) {
//         // Product is already in the cart, update the quantity
//         existingCart.products[existingProductIndex].quantity += quantity;
//         await existingCart.save();
//         return successRes(
//           res,
//           200,
//           "Quantity Added Successfully",
//           existingCart
//         );
//       } else {
//         // Product is not in the cart, add it
//         existingCart.products.push({
//           productId: productId,
//           quantity: quantity,
//         });
//         await existingCart.save();
//         return successRes(res, 200, "product added to the cart", existingCart);
//       }
//     } else {
//       // Customer doesn't have a cart, create a new cart
//       newCart = await Model.Cart.create({
//         userId: userId,
//         products: [
//           {
//             productId: productId,
//             quantity: quantity,
//           },
//         ],
//       });
//     }
//     return successRes(res, 200, "Product added to cart successfully", newCart);
//   } catch (err) {
//     return errorRes(res, 500, err.message);
//   }
// };
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId, "userId");
    const cartProducts = await Model.Cart.find({ userId: userId })
      .sort({
        createdAt: -1,
      })
      .populate("productId");
    console.log(cartProducts, "cart");

    return successRes(res, 200, "Cart Products", cartProducts);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const removeFromCart = async (req, res) => {
  try {
    const { cartId } = req.query;
    if (!cartId) {
      return errorRes(res, 400, "Cart Id is required");
    }
    const product_data = await Model.Cart.findOneAndDelete({ _id: cartId });
    if (!product_data) {
      return errorRes(res, 404, "Cart Product Not Found");
    }

    return successRes(res, 200, "Product Removed Successfully", product_data);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const addRemoveQuantity = async (req, res) => {
  try {
    const { cartId, type } = req.body;
    const productDetail = await Model.Cart.findOne({ _id: cartId });
    if (!productDetail) {
      return errorRes(res, 404, "Product Not found");
    }
    let quantity = productDetail?.quantity;
    if (type == 1) {
      const updateCart = await Model.Cart.findOneAndUpdate(
        { _id: cartId },
        { $set: { quantity: quantity + 1 } },
        { new: true }
      );
      return successRes(res, 200, "Quantity Added Successfully", updateCart);
    } else if (type == 0) {
      if (quantity > 1) {
        const updateCart = await Model.Cart.findOneAndUpdate(
          { _id: cartId },
          { $set: { quantity: quantity - 1 } },
          { new: true }
        );
        return successRes(
          res,
          200,
          "Quantity Removed Successfully",
          updateCart
        );
      } else {
        const delProduct = await Model.Product.findOneAndDelete({
          _id: cartId,
        });
        return successRes(res, 200, "Product Removed Successfully", delProduct);
      }
    }
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getOrderProductById = async (req, res) => {
  try {
    const { orderId } = req.query;
    const cartProductDetails = await Model.Order.findOne({
      _id: orderId,
    }).populate("userId productId addressId");
    if (!cartProductDetails) {
      return errorRes(res, 404, "Product not found");
    }
    return successRes(res, 200, "Product Data", cartProductDetails);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const placeOrder = async (req, res) => {
  try {
    const { addressId, date, time, instructions } = req.body;
    const userId = req.user._id;
    let formattedDate;
    console.log(userId, "user");
    if(date){
      const dateString = date;
      const parsedDate = moment(dateString, 'DD MMM YYYY')
       formattedDate = parsedDate.format('YYYY-MM-DD');
       console.log(formattedDate,"date")
    }
    const cartData = await Model.Cart.find({ userId: userId }).populate(
      "productId"
    );
    // console.log(cartData, "cart");
    for (let cart of cartData) {
      // const orderData = await Model.Order.create({
      //   userId: userId,
      //   orderId: shortid.generate(),
      //   productId: cartData?.productId,
      //   addressId: addressId,
      //   date: date,
      //   time: time,
      //   price: cart?.price,
      //   order_quantity: cart?.quantity,
      //   instructions: instructions,
      // });
      // await Model.Cart.findOneAndDelete({ _id: cart?._id });
      const updateCart = await Model.Cart.findOneAndUpdate(
        { _id: cart?._id },
        {
          $set: {
            addressId: addressId,
            date: formattedDate,
            time: time,
            instructions: instructions,
          },
        },
        { new: true }
      );
    }

    return successRes(res, 200, "Order Placed Successfully");
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const filter = req.query.filter || 0;
    const startDate = calculateStartDate(filter);
    const queryCompletedOrders = {
      userId: userId,
      order_status: 4,
    };
    const queryInProgressOrders = {
      userId: userId,
      order_status: { $nin: [4, 5] },
    };
    if (startDate) {
      queryCompletedOrders.createdAt = { $gte: startDate };
      queryInProgressOrders.createdAt = { $gte: startDate };
    }
    const completedOrders = await Model.Order.find(queryCompletedOrders)
      .sort({ createdAt: -1 })
      .populate("productId");
    const inProgressOrders = await Model.Order.find(queryInProgressOrders)
      .sort({ createdAt: -1 })
      .populate("productId");
    let response = {
      completedOrders,
      inProgressOrders,
    };
    return successRes(res, 200, "Order List", response);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const calculateStartDate = (filter) => {
  const now = new Date();
  switch (filter) {
    case "0":
      return new Date(now.setDate(now.getDate() - 3));
    case "1":
      return new Date(now.setDate(now.getDate() - 7));
    case "2":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "4":
      return new Date(now.setMonth(now.getMonth() - 6));
    default:
      return null;
  }
};
const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return errorRes(res, 400, "Please Provide Order ID");
    }
    const orderDetail = await Model.Order.findOne({ _id: orderId }).populate(
      "productId"
    );
    if (!orderDetail) {
      return errorRes(res, 404, "Order Detail Not found");
    }
    return successRes(res, 200, "Order Details", orderDetail);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const createPaymentIntent = async (req, res) => {
  try {
    const user_id = req.user._id;
    let price = 0;
    let total_amount;
    const cartData = await Model.Cart.find({ userId: user_id }).populate(
      "productId"
    );
    console.log(cartData, "cart");
    for (let product of cartData) {
      let quantity = product.quantity;
      let priceOfOneItem = product?.productId?.price;
      let actualPrice = priceOfOneItem * quantity;
      price += actualPrice;
    }
    let adminCharge = (price / 100) * 3.0;
    total_amount = price + adminCharge;
    console.log(total_amount, "here");
    console.log("here", process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
      description: user_id.toString(),
    });

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total_amount * 100),
      currency: "usd",
      automatic_payment_methods: {
        enabled: "true",
      },
    });
    console.log(paymentIntent, "paymentIntentpaymentIntentpaymentIntent");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Appointment Payment", // Update with your product name
            },
            unit_amount: Math.round(total_amount * 100), // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://just-in.bosselt.com/orders-placed",
      cancel_url: "https://mindrepublic.bosselt.com/cancel-Payment",
      customer: customer.id,
    });
    console.log(session, "sess");
    const payment_data = {
      ephemeralKey: ephemeralKey.secret,
      id: paymentIntent.id,
      session_id: session.id,
      session_url: session.url,
      amount: paymentIntent.amount,
      customer: customer.id,
      currency: paymentIntent.currency,
      charges: paymentIntent.charges,
      clientSecret: paymentIntent.client_secret,
      publishKey: publishKey,
      total_amount,
    };
    return successRes(res, 200, "PaymentIntent", payment_data);
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return errorRes(res, 500, error.message);
  }
};
const paymentDoneforAppointment = async (req, res) => {
  try {
    const { payment_intent } = req.body;
    const cartData = await Model.Cart.find({ userId: req.user._id }).populate(
      "productId"
    );

    console.log(cartData, "cart");
    let price = 0,
      total_amount;
    for (let product of cartData) {
      let quantity = product.quantity;
      let priceOfOneItem = product?.productId?.price;
      let actualPrice = priceOfOneItem * quantity;
      price += actualPrice;
    }

    console.log(price, "price");
    let adminCharge = (price / 100) * 3.0;
    total_amount = price + adminCharge;
    // Generate the unique ID using the incremented count
    const uniqueId = `RE-${new Date().getFullYear()}-${shortid.generate()}`;

    // Create StripeTransaction with the generated unique ID
    const stripeTransaction = await Model.StripeTransaction.create({
      transaction_id: uniqueId,
      user_id: req.user._id,
      payment_intent: payment_intent,
      amount: total_amount,
    });
    for (let cart of cartData) {
      const orderData = await Model.Order.create({
        userId: req.user._id,
        orderId: generateOrderId(),
        productId: cart?.productId,
        addressId: cart?.addressId,
        date: cart?.date,
        time: cart?.time,
        price: cart?.price,
        order_quantity: cart?.quantity,
        instructions: cart?.instructions,
      });
      await Model.Cart.findOneAndDelete({ _id: cart?._id });
    }
    return successRes(res, 200, "Payment recorded successfully");
  } catch (error) {
    console.log(error.message);
    return errorRes(res, 500, error.message);
  }
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Model.StripeTransaction.find({
      user_id: req.user._id,
    });

    return successRes(res, 200, "Transactions List", transactions);
  } catch (error) {
    return errorRes(res, 500, error.message);
  }
};
function generateOrderId() {
  var characters = '0123456789';
  let orderId = '';
  for (let i = 0; i < 6; i++) {
    orderId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return orderId;
}


export {
  changeNotificationStatus,
  createProfile,
  addAddress,
  deleteAddress,
  editAddress,
  getAddresses,
  getProducts,
  getCart,
  removeFromCart,
  addToCart,
  addRemoveQuantity,
  getOrderProductById,
  getMyOrders,
  getOrderDetail,
  placeOrder,
  editProfile,
  getTransactions,
  paymentDoneforAppointment,
  createPaymentIntent,
};
