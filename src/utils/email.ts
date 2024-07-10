import nodemailer from "nodemailer";

const sendEmail = async (options: any) => {
  const transporter = nodemailer.createTransport({
    service: "mail.ee",
    auth: {
      user: process.env.email as string,
      pass: process.env.password as string,
    },
  });

  const mailOptions = {
    from: "Experiences",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
