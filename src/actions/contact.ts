
"use server";

import type { ContactFormValues } from "@/schemas/contact";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import nodemailer from "nodemailer";

export async function handleContactSubmission(data: ContactFormValues) {
  console.log("Contact form submission received:", data);

  try {
    // 1. Save to Firestore
    const contactData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "contactMessages"), contactData);
    console.log("Contact message written to Firestore with ID: ", docRef.id);

    // 2. Send email notification via Gmail
    // Ensure EMAIL_USER and EMAIL_PASS are set in your .env file
    // For Gmail, if 2-Step Verification is ON, EMAIL_PASS must be an App Password.
    // If 2-Step Verification is OFF, you might need to enable "Less secure app access" (not recommended).
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // For SSL
      secure: true, // Use true for port 465, false for other ports (like 587 with STARTTLS)
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address (e.g., shawn.shiobara@gmail.com)
        pass: process.env.EMAIL_PASS, // Your Gmail App Password or regular password (see notes above)
      },
    });

    const mailOptions = {
      from: `"Chez Shiobara B&B Contact <${process.env.EMAIL_USER}>"`, // Sender address (your Gmail)
      to: process.env.EMAIL_USER, // Receiver address (your Gmail, to receive notifications)
      subject: `New Contact Form Submission: ${data.subject || "No Subject"}`,
      html: `
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Subject:</strong> ${data.subject || "N/A"}</p>
        <hr>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${data.message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email notification sent successfully to:", process.env.EMAIL_USER);

    return {
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
    };
  } catch (error) {
    console.error("Error in handleContactSubmission: ", error);
    // Determine if the error was Firestore or Email related for more specific feedback if needed
    // For now, a generic error message.
    return {
      success: false,
      message: "We encountered an issue sending your message. Please try again or contact us directly.",
    };
  }
}
