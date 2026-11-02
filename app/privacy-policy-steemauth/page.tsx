"use client";

import { Constants } from "@/constants";
import { Button } from "@heroui/button";
import Link from "@/components/ui/CustomLink";
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

export default function PrivacyPolicySteemAuthPage() {
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
              <p className="text-lg font-bold">No Key Ever Leaves Your Phone</p>
              <p className="text-xs text-muted">
                How signing works with SteemAuth
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm leading-relaxed">
              Signing in with <strong>SteemAuth</strong> is passwordless and
              keyless on this side: your phone signs every request inside
              SteemAuthenticator, and SteemPro only ever receives the finished
              signature — never a key it would have to protect.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-background/50 border border-divider space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  On-Device Signing
                </p>
                <p className="text-xs text-muted italic">
                  Your posting key stays inside SteemAuthenticator and is used
                  there, behind your biometrics or PIN. It is never exported to
                  this site, this browser, or any server.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-background/50 border border-divider space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Nothing Stored Locally
                </p>
                <p className="text-xs text-muted italic">
                  A SteemAuth account keeps no private key, no PIN and no
                  password in this browser — there is no secret here to steal,
                  leak, or hand over.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted">
              Signing in with a key or an extension instead? Those flows are
              covered by our{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline font-bold"
              >
                main Privacy Policy
              </Link>
              .
            </p>
          </CardBody>
        </Card>

        {/* Data Collection */}
        <Card className="border-none bg-default-50 shadow-sm">
          <CardHeader className="flex gap-3 px-6 pt-6">
            <Eye className="text-primary" size={24} />
            <div className="flex flex-col">
              <p className="text-lg font-bold">Nothing We Collect About You</p>
              <p className="text-xs text-muted">
                The SteemAuth flow is deliberately data-free
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <p className="text-sm">
              When you use SteemAuth, we do not collect personal information —
              and we do not run advertising or measurement on top of it:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">No personal information:</span> no
                  email address, no phone number, no real name — only your
                  public Steem account name, which is already public on the
                  blockchain.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">No ads:</span> no advertising
                  networks are involved in the SteemAuth flow in any way.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">
                    No analytics and no tracking:
                  </span>{" "}
                  no analytics scripts, no fingerprints, no behavioural profiles
                  and no third-party trackers are used to follow you around for
                  this sign-in.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">One session reference:</span> to
                  keep you signed in and to let you revoke access, your account
                  stores a single session identifier — no key, no signature and
                  no transaction payload is kept by us.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <div>
                  <span className="font-bold">Public blockchain data:</span>{" "}
                  what you see is public Steem data read from the chain; we
                  never tie it back to you beyond your own public account name.
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
              <p className="text-lg font-bold">Delete It Whenever You Want</p>
              <p className="text-xs text-muted">
                Erase your data from both ends in a few taps
              </p>
            </div>
          </CardHeader>
          <CardBody className="px-6 pb-6 space-y-4">
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                <div>
                  <span className="font-bold">Delete from Settings:</span> open{" "}
                  <span className="font-semibold">Settings → Accounts</span> and
                  remove your SteemAuth account — the account record and its
                  session reference are deleted, and you are signed out
                  everywhere.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                <div>
                  <span className="font-bold">Revoke from your phone:</span>{" "}
                  open SteemAuthenticator&apos;s{" "}
                  <span className="font-semibold">Sessions</span> tab and remove
                  SteemPro — access is cut immediately, and this site is signed
                  out on the next check.
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="mt-1 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                <div>
                  <span className="font-bold">Nothing to opt out of:</span> the
                  SteemAuth flow processes nothing non-essential, so there is no
                  profiling or sharing to switch off in the first place.
                </div>
              </li>
            </ul>
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
                  Your rights to access, rectify and erase personal data apply
                  in full — and since SteemAuth keeps almost nothing, they
                  reduce to one step: delete the account from Settings and the
                  record is gone.
                </p>
              </CardBody>
            </Card>

            <Card className="border-none bg-default-50 shadow-sm">
              <CardBody className="p-6 space-y-3">
                <p className="font-bold border-l-3 border-secondary pl-2">
                  US State Laws (CCPA)
                </p>
                <p className="text-xs leading-relaxed text-muted">
                  We do not sell, share or disclose personal information — there
                  is none to sell. You can still exercise your right to know and
                  to delete by removing your account from Settings.
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
                We comply with COPPA. The SteemAuth flow collects no personal
                information from anyone — children under 13 included — so no
                data is ever gathered from a child in the first place. If you
                are a parent and have concerns, please contact us immediately.
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
                Have questions about SteemAuth or your data? Our team is here to
                help.
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
                <Button
                  as={Link}
                  href="/privacy-policy"
                  variant="light"
                  fullWidth
                  startContent={<Shield size={18} />}
                  className="justify-start text-muted font-medium"
                >
                  Main Privacy Policy
                </Button>
              </div>

              <Divider />

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted uppercase tracking-tighter text-center">
                  Effective Date
                </p>
                <p className="text-sm font-bold text-center">
                  November 2, 2026
                </p>
              </div>
            </CardBody>
          </Card>

          <div className="px-6 text-center space-y-4">
            <FileCheck
              className="mx-auto text-success/40 opacity-50"
              size={48}
            />
            <p className="text-[10px] text-muted italic">
              By using SteemAuth on SteemPro, you acknowledge that you have read
              and understood this SteemAuth Privacy Policy and our{" "}
              <Link href="/privacy-policy" className="underline">
                main Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
