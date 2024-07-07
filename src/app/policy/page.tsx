import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  keywords: "privacy policy SteemPro, privacy and policy",
};

export default function page() {
  return (
    <div>
      <MainWrapper>
        <header className="shadow">
          <div className="mx-auto">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
        </header>

        <div className="container mt-10 shadow-lg rounded-lg">
          <p className="mb-4">
            Welcome to SteemPro. We value your privacy and are committed to
            protecting your personal information. This privacy policy explains
            how we collect, use, and safeguard your data.
          </p>

          <h3 className="text-xl font-semibold mb-2">Information We Collect</h3>
          <p className="mb-4">
            We may collect various types of information, including but not
            limited to:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              Personal identification information (Name, email address, phone
              number, etc.)
            </li>
            <li>Usage data (pages visited, time spent on site, etc.)</li>
            <li>Cookies and tracking technologies</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">
            How We Use Your Information
          </h3>
          <p className="mb-4">
            We use the information we collect for various purposes, including:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2">Security of Your Data</h3>
          <p className="mb-4">
            The security of your data is important to us. We strive to use
            commercially acceptable means to protect your Personal Data, but
            remember that no method of transmission over the Internet, or method
            of electronic storage is 100% secure.
          </p>

          <h3 className="text-xl font-semibold mb-2">
            Changes to This Privacy Policy
          </h3>
          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page.
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>

          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              By email:{" "}
              <a type="email" href="mailto:steempro.official@gmail.com">
                steempro.official@gmail.com
              </a>
            </li>
            <li>
              By visiting this page on our website:{" "}
              <Link href={"/about"}>www.steempro.com/about</Link>
            </li>
          </ul>
        </div>
      </MainWrapper>
      <footer className="bg-gray-800 text-white py-4 mt-10 text-center">
        <p>&copy; 2024 SteemPro. All rights reserved.</p>
      </footer>
    </div>
  );
}
