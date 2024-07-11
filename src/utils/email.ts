import nodemailer from "nodemailer";

const sendEmail = async (options: any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.emailhost as string,
      port: Number(process.env.emailport),
      auth: {
        user: process.env.emailname as string,
        pass: process.env.emailpassword as string,
      },
    });

    const mailOptions = {
      from: "Experiences",
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error: any) {
    console.error("Error sending email:", error.message);
    throw new Error("Error sending email");
  }
};

export default sendEmail;
