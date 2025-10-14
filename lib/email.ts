// import nodemailer from "nodemailer";

// export async function sendEmail(
//   to: string,
//   subject: string,
//   text: string,
//   html?: string
// ) {
//   try {
//     const transporter = nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT),
//       secure: process.env.EMAIL_PORT === "465",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     // Define email options
//     const mailOptions = {
//       from: `"Nine Kiwi" <${process.env.EMAIL_USER}>`, // Sender address
//       to, // Recipient
//       subject, // Subject line
//       text, // Plain text body
//       html, // HTML body (optional)
//     };

//     // Send the email
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent:", info.messageId);
//     return info;
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw error; // Let the caller handle the error
//   }
// }

import nodemailer from "nodemailer";

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  try {
    // Use 'service: gmail' preset to match your working code
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define email options
    const mailOptions = {
      from: `"Nine Kiwi" <${process.env.EMAIL_USER as string}>`, // Sender address as string
      to, // Recipient
      subject, // Subject line
      text, // Plain text body
      html, // HTML body (optional)
    };

    // Send the email and await the result
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Let the caller handle the error
  }
}
