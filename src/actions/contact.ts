
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

    // 2. Send email notification
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false, // true for 465, false for other ports (like 587 with STARTTLS)
      auth: {
        user: process.env.EMAIL_USER, // Your Microsoft 365 email address
        pass: process.env.EMAIL_PASS, // Your Microsoft 365 password or App Password
      },
      tls: {
        ciphers:'SSLv3' // Necessary for Office365
      }
    });

    const mailOptions = {
      from: `"Chez Shiobara B&B Contact <${process.env.EMAIL_USER}>"`,
      to: process.env.EMAIL_USER, // Send to your configured email address
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
