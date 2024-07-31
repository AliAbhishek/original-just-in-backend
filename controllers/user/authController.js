import * as Model from "../../models/index.js";
import { successRes, errorRes } from "../../utils/response.js";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import sendEmail from "../../utils/sendEmail.js";
const JWT_SECRET_KEY = process.env.JWT_SECRET;

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      phone_number,
      country_code,
      device_token,
      device_type,
      device_model,
    } = req.body;

    if (email) {
      const isEmailExist = await Model.User.findOne({ email });
      if (isEmailExist) {
        if (!isEmailExist.email_verified) {
          const otp = Math.floor(1000 + Math.random() * 9000);
          isEmailExist.email_otp = otp;
          await isEmailExist.save();
          sendEmail({
            otp,
            email: isEmailExist.email,
            project_name: process.env.PROJECT_NAME,
            type: "verifyOtp",
            user: isEmailExist,
          });
          return successRes(
            res,
            200,
            "Please Verify your Account",
            isEmailExist
          );
        } else {
          return errorRes(res, 400, "Email already exists");
        }
      }
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const email_otp = Math.floor(1000 + Math.random() * 9000);

    // Create new user
    const newUser = new Model.User({
      email,
      password: hashPassword,
      email_otp,
      phone_number,
      country_code: country_code,
      device_token,
      device_type,
      device_model,
    });

    const userData = await newUser.save();

    sendEmail({
      otp: userData.email_otp,
      email: userData.email,
      project_name: process.env.PROJECT_NAME,
      type: "register",
      user: userData,
    });

    return successRes(res, 200, "OTP has been sent to your provided email", userData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password, device_token, device_type, device_model } =
      req.body;

    const user = await Model.User.findOne({ email });
    if (!user) {
      return errorRes(res, 404, "User doesn't exists");
    }
    console.log(user.is_active,"hi")
    if (!user.is_active) {
      return errorRes(res, 400, "Admin has suspended Your Account");
    }
    if (user.is_admin_deleted) {
      return errorRes(res, 400, "Your Account has been Deleted By Admin");
    }
    if (user.is_deleted) {
      return errorRes(res, 400, "User Not Found");
    }
    // Check if the user is verified and active
    if (!user.email_verified) {
      const otp = Math.floor(1000 + Math.random() * 9000);

      user.email_otp = otp;
      await user.save();
      sendEmail({
        otp: otp,
        email: user.email,
        project_name: process.env.PROJECT_NAME,
        type: "verifyOtp",
        user: user,
      });
      return errorRes(res, 400, "Please Verify Your Account", user);
    }

    // Check the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorRes(res, 400, "Invalid Password");
    }

    // Ensure JWT_SECRET_KEY is defined
    if (!JWT_SECRET_KEY) {
      return errorRes(res, 400, "JWT_SECRET_KEY is not defined");
    }

    // Generate JWT token
    const token = JWT.sign({ userId: user._id }, JWT_SECRET_KEY, {
      expiresIn: "365d",
    });

    // Update device information
    user.device_token = device_token;
    user.device_model = device_model;
    user.device_type = device_type;
    await user.save();
    const responseObj = user.toObject();
    const response = {
      ...responseObj,
      token,
    };
    // Send response with user ID and token
    return successRes(res, 200, "User successfully login", response);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const forgotpassword = async (req, res) => {
  try {
    //find the user exists in the database or not
    const { email } = req.body;
    const user = await Model.User.findOne({ email: email });
    if (!user) {
      return errorRes(res, 404, "User Not Found");
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    user.email_otp = otp;
    const updateData = await user.save();
    sendEmail({
      otp: user.email_otp,
      email: user.email,
      project_name: process.env.PROJECT_NAME,
      type: "forgotPassword",
      user: user,
    });
    return successRes(res, 200, "OTP has been sent to your provided email", updateData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!password) {
      return errorRes(res, 400, "Please Enter the Password");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await Model.User.findByIdAndUpdate(
      userId,
      {
        $set: {
          password: hashedPassword,
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return errorRes(res, 400, "User Not Found");
    }
    return successRes(res, 200, "Password Updated Successfully", updatedUser);
  } catch (err) {
    // Handle errors
    return errorRes(res, 500, err.message);
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = await Model.User.findOneAndDelete( {_id: userId} );
    
    if (!userData) {
      return errorRes(res, 404, "User Not Found");
    }
    await Model.Address.deleteMany({ userId: userId });
    await Model.Cart.deleteMany({userId: userId });
    await Model.Order.deleteMany({userId: userId});
    await Model.StripeTransaction.deleteMany({user_id: userId});
    await Model.SupportChat.deleteMany({sender_id: userId});
    return successRes(res, 200, "User deleted successfully");
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await Model.User.findByIdAndUpdate(
      userId,
      { $set: { device_token: null } },
      { new: true }
    );
    if (!updatedUser) {
      return errorRes(res, 404, "User Not Found");
    }
    return successRes(res, 200, "Logout Successfully");
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await Model.User.findOne({ _id: userId });
    if (!user) {
      return errorRes(res, 404, "User Not Found");
    }
    const otp = Math.floor(1000 + Math.random() * 9000);
    const updateData = await Model.User.findByIdAndUpdate(
      userId,
      { $set: { email_otp: otp } },
      { new: true }
    );
    sendEmail({
      otp: otp,
      email: user.email,
      project_name: process.env.PROJECT_NAME,
      type: "resendOTP",
      user: user,
    });
    return successRes(res, 200, "OTP has been resent to your provided email", updateData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await Model.User.findOne({ _id: userId });
    if (!user) {
      return errorRes(res, 404, "User Not Found");
    }
    if (otp == user.email_otp) {
      user.email_verified = 1;
      const token = JWT.sign({ userId: user._id }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
      const responseObj = user.toObject();
      const response = {
        ...responseObj,
        token,
      };
      await user.save();
      return successRes(res, 200, "Email verified successfully.", response);
    } else {
      return errorRes(res, 400, "Please Enter Correct OTP");
    }
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const socialLogin = async (req, res) => {
  try {
    const {
      social_id,
      login_type,
      full_name,
      device_token,
      device_type,
      device_model,
    } = req.body;
    const email = req.body?.email?.toLowerCase();
    let user = await Model.User.findOne({
      $or: [
        { email: email, email_verified: 1 },
        { social_id: social_id, is_active: 1 },
      ],
    });

    if (!user) {
      const socialUser = new Model.User({
        full_name: full_name,
        social_id: social_id,
        login_type: login_type,
        device_token: device_token,
        device_type: device_type,
        device_model: device_model,
        email: email,
        email_verified: 1,
      });

      await socialUser.save();

      const token = JWT.sign({ userId: socialUser._id }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
      let data = socialUser.toObject();
      data.token = token;

      return successRes(res, 200, "Logged in Successfully", data);
    } else {
      if (!user.is_active) {
        return errorRes(res, 400, "Your Account has been De-activated By Admin");
      }
      if (user.is_admin_deleted) {
        return errorRes(res, 400, "Your Account has been Deleted By Admin");
      }
      if (user.is_deleted) {
        return errorRes(res, 400, "User Not Found");
      }
      user.social_id = social_id;
      user.login_type = login_type;
      user.device_token = device_token;
      user.device_type = device_type;
      user.device_model = device_model;
      user.email_verified = 1;
      await user.save();
      const token = JWT.sign({ userId: user._id }, JWT_SECRET_KEY, {
        expiresIn: "30d",
      });
      let data = user.toObject();
      data.token = token;

      return successRes(res, 200, "Logged in Successfully", data);
    }
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await Model.User.findById(userId);
    if (!user) {
      return errorRes(res, 404, "User Not Found");
    }

    // Check if the current password is correct
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return errorRes(res, 400, "Incorrect Password");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and invalidate the authToken
    const updatedUser = await Model.User.findByIdAndUpdate(
      userId,
      { $set: { password: hashedPassword } },
      { new: true }
    );

    return successRes(res, 200, "Password Changed Successfully", updatedUser);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

const allowLocation = async (req, res) => {
  try {
    let location;
    if (req.body?.lat && req.body?.long) {
      location = {
        type: "Point",
        coordinates: [req.body?.long, req.body?.lat],
      };
    }
    const updateLocation = await Model.User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          location,
        },
      },
      { new: true }
    );
    if (!updateLocation) {
      return errorRes(res, 404, "User Not Found");
    }
    return successRes(res, 200, "Location Added Successfully", updateLocation);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const userData = await Model.User.findOne({ _id: userId });
    if (!userData) {
      return errorRes(res, 404, "User not found");
    }
    return successRes(res, 200, "Profile Data", userData);
  } catch (err) {
    return errorRes(res, 500, err.message);
  }
};

export {
  register,
  login,
  forgotpassword,
  resetPassword,
  deleteAccount,
  logout,
  resendOTP,
  verifyOTP,
  socialLogin,
  changePassword,
  allowLocation,
  getProfile
};
