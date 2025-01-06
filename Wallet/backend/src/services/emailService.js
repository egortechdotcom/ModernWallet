const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (otp, to) => {
  const msg = {
    to: to,
    from: "shubham.rajput@oodles.io",
    subject: "OTP Verification",
    template_id: "d-6366004baa204a68ad38de2d09ad5cad",
    personalizations: [
      {
        dynamic_template_data: {
          otp: otp,
        },
        to: [{ email: to }],
      },
    ],
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent ${otp}`);
    return true
  } catch (error) {
    console.error("SendGrid API error:", error.response.body.errors);
  }
};

module.exports = sendEmail;
