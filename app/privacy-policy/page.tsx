"use client";

import { Constants } from "@/constants";
import { Button } from "@heroui/button";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Globe,
  AlertCircle,
  Mail,
  Info,
  FileCheck,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";

export default function PrivacyPolicyPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-8 space-y-8">
        {/* Key Management & Security - HIGHLIGHTED */}
        <Card className="border-none bg-primary/5 shadow-sm overflow-hidden ring-1 ring-primary/20">
          <CardHeader className="flex gap-3 px-6 pt-6">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Lock size={20} />
            </div>
            <div className="flex flex-col">
              <p className="text-lg font-bold">Key Management & Security</p>
              <p className="text-xs text-muted">
                How we handle your digital security
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm leading-relaxed">
              SteemPro is a <strong>client-side application</strong>. Your
              security and autonomy are our top priorities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-divider space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Zero Knowledge
                </p>
                <p className="text-xs text-muted italic">
                  Your private keys are never transmitted to our servers or
                  stored in any database under our control.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-divider space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Local Encryption
                </p>
                <p className="text-xs text-muted italic">
                  When you save an account, keys are encrypted locally using
                  AES-256 and secured by your personal PIN/Password.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">
              For maximum security, we recommend using{" "}
              <Link
                href="https://steemkeychain.com"
                target="_blank"
                className="text-primary hover:underline font-bold"
              >
                Steem Keychain
              </Link>
              , which keeps your keys stored in a separate browser extension
              that SteemPro interacts with securely.
            </p>
          </CardBody>
        </Card>

        {/* Data Collection */}
        <Card className="border-none bg-default-50 shadow-sm">
          <CardHeader className="flex gap-3 px-6 pt-6">
            <Eye className="text-primary" size={24} />
            <div className="flex flex-col">
              <p className="text-lg font-bold">Information We Collect</p>
              <p className="text-xs text-muted">
                Transparency regarding data usage
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm">
              We collect limited information to provide and improve our service:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">Public Blockchain Data:</span> As
                  a Steem interface, we display publicly available data from the
                  Steem blockchain.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">Usage Metrics:</span> We collect
                  anonymous usage data (e.g., pages visited) to optimize our
                  platform performance.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">Cookies:</span> We use essential
                  cookies to maintain your session and preferences locally.
                </div>
              </li>
            </ul>
          </CardBody>
        </Card>

        {/* Privacy Controls */}
        <Card className="border-none bg-default-50 shadow-sm">
          <CardHeader className="flex gap-3 px-6 pt-6">
            <Shield className="text-success" size={24} />
            <div className="flex flex-col">
              <p className="text-lg font-bold">Privacy Controls</p>
              <p className="text-xs text-muted">Manage your data preferences</p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm">
              You have full control over your privacy settings. We always
              request your consent for non-essential data processing.
            </p>
            <div id="ppms_cm_privacy_settings">
              <Button
                color="primary"
                variant="flat"
                id="ppms_cm_privacy_settings_button"
                className="font-bold"
              >
                Manage Privacy Settings
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Regulations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Globe size={18} className="text-muted" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted">
              Regional Regulations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none bg-default-50 shadow-sm">
              <CardBody className="p-6 space-y-3">
                <p className="font-bold border-l-3 border-primary pl-2">
                  European (GDPR)
                </p>
                <p className="text-xs leading-relaxed text-muted">
                  Under GDPR, you have the right to access, rectify, or erase
                  your data. We provide clear transparency on how your data is
                  handled in compliance with European standards.
                </p>
              </CardBody>
            </Card>

            <Card className="border-none bg-default-50 shadow-sm">
              <CardBody className="p-6 space-y-3">
                <p className="font-bold border-l-3 border-secondary pl-2">
                  US State Laws (CCPA)
                </p>
                <p className="text-xs leading-relaxed text-muted">
                  California residents have the right to know what personal info
                  is collected and the right to opt-out of data sales. We
                  support these rights across all US jurisdictions.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Child Safety */}
        <Card className="border-none bg-warning/5 border border-warning/20 shadow-sm">
          <CardBody className="p-6 flex flex-row gap-4 items-start">
            <AlertCircle className="text-warning shrink-0" size={24} />
            <div className="space-y-2">
              <p className="font-bold">Child Safety Standards (COPPA)</p>
              <p className="text-sm text-default-600">
                We strictly comply with COPPA. We do not knowingly collect
                personal information from children under 13. If you are a parent
                and believe your child has provided us with data, please contact
                us immediately.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Sidebar / Quick Links */}
      <div className="lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          <Card className="border-none bg-default-50 shadow-sm">
            <CardHeader className="px-6 pt-6">
              <p className="font-bold">Contact Support</p>
            </CardHeader>
            <CardBody className="px-6 pb-6 space-y-6">
              <p className="text-xs text-muted">
                Have questions about your privacy or technical security? Our
                team is here to help.
              </p>

              <div className="space-y-3">
                <Button
                  as="a"
                  href={`mailto:${Constants.official_email}`}
                  variant="flat"
                  fullWidth
                  startContent={<Mail size={18} />}
                  className="justify-start font-semibold"
                >
                  {Constants.official_email}
                </Button>
                <Button
                  as={Link}
                  href="/about"
                  variant="light"
                  fullWidth
                  startContent={<Info size={18} />}
                  className="justify-start text-muted font-medium"
                >
                  About SteemPro
                </Button>
              </div>

              <Divider />

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter text-center">
                  Effective Date
                </p>
                <p className="text-sm font-bold text-center">January 1, 2024</p>
              </div>
            </CardBody>
          </Card>

          <div className="px-6 text-center space-y-4">
            <FileCheck
              className="mx-auto text-success/40 opacity-50"
              size={48}
            />
            <p className="text-[10px] text-muted italic">
              By using SteemPro, you acknowledge that you have read and
              understood this Privacy Policy and our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
