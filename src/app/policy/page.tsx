import MainWrapper from "@/components/wrappers/MainWrapper";
import { AppStrings } from "@/libs/constants/AppStrings";
import { Button } from "@nextui-org/react";
import { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { twMerge } from "tailwind-merge";

export const metadata: Metadata = {
  title: "Privacy Policy",
  keywords: "privacy policy SteemPro, privacy and policy",
};

export default function page() {
  return (
    <div>
      <MainWrapper>
        <header className="shadow p-2">
          <div className="mx-auto">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
        </header>

        <div className="container mt-10 shadow-lg rounded-lg p-2">
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
            <li>Personal identification information (username, email, etc.)</li>
            <li>Usage data (pages visited, time spent on site, etc.)</li>
            <li>Cookies and tracking technologies</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">
            How We Use Your Information
          </h3>
          <div className=" flex flex-col items-start  mb-4">
            <p className="mb-4">
              We collect and process your data on this site to better understand
              how it is used. We always ask you for consent to do that. You can
              change your privacy settings here:
            </p>

            <div id="ppms_cm_privacy_settings">
              <Button
                size="sm"
                variant="solid"
                color="primary"
                id="ppms_cm_privacy_settings_button"
              >
                Manage Privacy Settings
              </Button>
            </div>
          </div>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To provide customer support</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">European Regulations</h3>
          <p className="mb-4">
            At SteemPro, we prioritize the privacy and security of our users'
            data. To comply with the General Data Protection Regulation (GDPR)
            and other relevant European regulations, we ensure that your
            personal information is handled with care and transparency.
          </p>
          <h3 className="text-xl font-semibold mb-2">
            Consent for Data Collection
          </h3>
          <p className="mb-4">
            We collect your consent for data processing activities to serve you
            better and provide personalized experiences, including serving ads.
            This consent ensures that we comply with the GDPR and other European
            regulations.
          </p>
          <p className="mb-4">Types of Data Collected:</p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              Personal Information: We may collect personal information such as
              your name, email address, IP address, and any other data you
              provide through our website.
            </li>
            <li>
              Usage Data: We collect data on how you interact with our website,
              including the pages you visit, the time and date of your visit,
              and other diagnostic data.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">
            Purpose of Data Collection
          </h3>
          <p className="mb-4">
            We collect and use your data for the following purposes:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              To Provide and Maintain Our Service: To deliver and maintain the
              functionality of our website.
            </li>
            <li>
              To Improve Our Services: To understand how you use our website and
              to enhance your user experience.
            </li>

            <li>
              To Serve Personalized Ads: To provide you with personalized
              advertisements based on your interests and interactions with our
              website.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
          <p className="mb-4">
            Under GDPR, you have the following rights regarding your personal
            data:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              Right to Access: You can request access to the personal data we
              hold about you.
            </li>
            <li>
              Right to Rectification: You can request the correction of
              inaccurate or incomplete data.
            </li>
            <li>
              Right to Erasure: You can request the deletion of your personal
              data under certain conditions.
            </li>
            <li>
              Right to Restrict Processing: You can request the restriction of
              the processing of your personal data under certain conditions.
            </li>
            <li>
              Right to Data Portability: You can request the transfer of your
              data to another organization or directly to you under certain
              conditions.
            </li>
            <li>
              Right to Object: You can object to the processing of your personal
              data under certain conditions.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">Security of Your Data</h3>
          <p className="mb-4">
            We implement appropriate technical and organizational measures to
            ensure the security of your personal data and to protect it against
            unauthorized access, loss, destruction, or alteration.
          </p>
          <h3 className="text-xl font-semibold mb-2">
            Cookies and Tracking Technologies
          </h3>

          <p className="mb-4">
            We use cookies and similar tracking technologies to track the
            activity on our website and store certain information. You can
            manage your cookie preferences through your browser settings or
            through our cookie consent tool available on our website.
          </p>

          <h3 className="text-xl font-semibold mb-2">US State Regulations</h3>
          <p className="mb-4">
            We comply with various state-specific privacy laws in the United
            States to protect the personal information of our users. California
            Consumer Privacy Act (CCPA) If you are a resident of California, you
            have specific rights under the CCPA:
          </p>

          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              Right to Know: You have the right to request disclosure of the
              personal information we collect about you and how we use it.
            </li>
            <li>
              Right to Delete: You have the right to request the deletion of
              your personal information, subject to certain exceptions.
            </li>
            <li>
              Right to Opt-Out: You have the right to opt-out of the sale of
              your personal information.
            </li>
          </ul>
          <p className="mb-4">
            To exercise these rights, please visit our [CCPA Privacy
            Notice](link to CCPA notice) or contact us at{" "}
            <a
              className=" hover:underline"
              type="email"
              href={`mailto:${AppStrings.official_email}`}
            >
              {AppStrings.official_email}
            </a>
            .
          </p>

          <h3 className="text-xl font-semibold mb-2">
            Other US State Regulations
          </h3>

          <p className="mb-4">
            We also comply with privacy laws in other US states, including but
            not limited to:
          </p>

          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>Virginia Consumer Data Protection Act (VCDPA)</li>
            <li>Colorado Privacy Act (CPA)</li>
            <li>Connecticut Data Privacy Act (CTDPA)</li>
            <li>Utah Consumer Privacy Act (UCPA)</li>
            <li>
              Residents of these states may have similar rights to those
              provided under the CCPA. To manage your privacy settings or create
              privacy requests, please visit our{" "}
              <Link
                className=" hover:underline"
                target="_blank"
                href={"/policy"}
              >
                policy
              </Link>{" "}
              page or contact us at{" "}
              <a
                className=" hover:underline"
                type="email"
                href={`mailto:${AppStrings.official_email}`}
              >
                {AppStrings.official_email}
              </a>
              .
            </li>
          </ul>
          <h3 className="text-xl font-semibold mb-2">
            Changes to This Privacy Policy
          </h3>

          <p className="mb-4">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the effective date at the top.
          </p>

          <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact
            us:
          </p>
          <ul className="list-disc list-inside mb-4 text-default-500">
            <li>
              By email:{" "}
              <a
                className=" hover:underline"
                type="email"
                href={`mailto:${AppStrings.official_email}`}
              >
                {AppStrings.official_email}
              </a>
            </li>
            <li>
              By visiting this page on our website:{" "}
              <Link
                className=" hover:underline"
                target="_blank"
                href={"/about"}
              >
                www.steempro.com/about
              </Link>
            </li>
          </ul>

          <div
            className={twMerge("", "!bg-transparent border-none")}
            data-editor-centralize="true"
            data-main-container="true"
            data-root="true"
          >
            <div
              className="ppms_cm_privacy_settings_widget_content "
              data-disable-select="true"
            >
              <h1
                className="ppms_cm_privacy_settings_form_link_header"
                id="ppms_cm_privacy_settings_form_link_header_id"
              >
                Privacy settings
              </h1>
              <p
                className="ppms_cm_privacy_settings_form_link_text !text-default-500"
                id="ppms_cm_privacy_settings_form_link_text_id"
              >
                We collect and process your data on this site to better
                understand how it is used. We always ask you for consent to do
                that. You can change your privacy settings here.
              </p>
            </div>
          </div>
        </div>
      </MainWrapper>
      <footer className="bg-gray-800 text-white py-4 mt-10 text-center">
        <p>&copy; 2024 SteemPro. All rights reserved.</p>
      </footer>
    </div>
  );
}
