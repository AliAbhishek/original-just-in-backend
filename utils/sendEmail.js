
import registerTemplate from "../constant/htmlTemplates/registerTemplate.js";
import resetTemplate from "../constant/htmlTemplates/resetPassword.js";
import resendOtpTemplate from "../constant/htmlTemplates/resendOtp.js";
import sendGrid from "./sendGrid.js";
  const sendEmail = ({
    email,
    subject,
    project_name,
    otp,
    type,
    user,
    another_type,
  }) => {
    let html;
    switch (type) {
      case "register":
        subject = `Verify Your ${project_name} Account`;
        html = registerTemplate(project_name, otp, user, another_type);
        break;
      case "forgotPassword":
        subject = `Reset Your ${project_name} Account`;
        html = resetTemplate(user, otp, project_name,  another_type);
        break;
        case "resendOTP": 
        subject = `Resend Code to Verify Your ${project_name} Account`;
        html = resendOtpTemplate(user, otp, project_name, another_type);
        break;
        case "verifyOtp":
          subject = `Verify Your ${project_name} Account`;
          html = registerTemplate(project_name, otp, user);
          break;
      default:
        break;
    }
  
    const msg = {
      to: `${email}`,
      from: process.env.SEND_GRID_SENDER,
      subject: subject ? subject : `Verify Your ${project_name} Account`,
      text: "Dont share this Link",
      html,
    };
  
    sendGrid(msg);
  };
  
  export default sendEmail;
  