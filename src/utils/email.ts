import nodemailer from "nodemailer";

class Email {
  private to: string;
  private firstName: string;
  private url: string;
  private from: string;

  constructor(user: { email: string; name: string }, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Experiences salutes You! from: <${process.env.emailfrom}>`;
  }

  private createTransport() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST as string,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USERNAME as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });
  }

  private async send(template: string, subject: string) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: `Hello ${this.firstName},\n\n${template}\n\nBest regards,\nExperiences Team`,
    };

    const transporter = this.createTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      `Welcome to our service! We are thrilled to have you onboard. Please visit this link to activate your account: ${this.url}`,
      "Welcome to Experiences!"
    );
  }

  async sendPasswordReset() {
    await this.send(
      `We received a request to reset your password. Please visit this link to reset your password: ${this.url}`,
      "Your password reset token (valid for 10 minutes)"
    );
  }
}

export default Email;
