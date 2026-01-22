"use client";

import { Constants } from "@/constants";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";

import {
  Globe,
  Zap,
  Shield,
  Users,
  Mail,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import Link from "next/link";
import Image from "next/image";
import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { GithubIcon } from "@/components/icons/GithubIcon";

export default function AboutPage() {
  return (
    <div className="space-y-12 pb-4 px-4 animate-in fade-in transition-all duration-500">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-8 md:p-16 border border-primary/10">
        <div className="relative z-10 max-w-2xl space-y-6">
          <Chip
            color="primary"
            variant="flat"
            size="sm"
            className="px-3 py-1 font-semibold uppercase tracking-wider"
          >
            Empowering Your Voice
          </Chip>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
            SteemPro
          </h1>
          <p className="text-lg md:text-xl text-muted leading-relaxed">
            Experience a social network empowered by the Steem blockchain.
            Explore trending discussions and share your unique perspective on a
            truly decentralized platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              as={Link}
              href="/"
              color="primary"
              size="lg"
              endContent={<ArrowRight size={18} />}
            >
              Get Started
            </Button>
            <Button
              as={Link}
              href={Constants.github_link}
              target="_blank"
              variant="bordered"
              size="lg"
              startContent={<GithubIcon size={18} />}
            >
              View Github
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
          <Image
            height={400}
            width={400}
            src={"/steempro-logo.svg"}
            alt="SteemPro"
          />
        </div>
      </section>

      {/* Mission Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <TrendingUp size={32} className="text-primary" />
            Our Mission
          </h2>
          <p className="text-lg text-muted leading-relaxed">
            SteemPro aims to bridge the gap between complex blockchain
            technology and everyday social interaction. We believe in providing
            a seamless, fast, and secure interface for users to interact with
            the Steem ecosystem.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-success/10 border-success/15">
              <CardBody className="p-4 space-y-2">
                <Shield size={24} className="text-success" />
                <h3 className="font-bold">Secure</h3>
                <p className="text-xs text-muted">Blockchain-level security</p>
              </CardBody>
            </Card>
            <Card className="bg-primary/10 border-primary/15">
              <CardBody className="p-4 space-y-2">
                <Zap size={24} className="text-primary" />
                <h3 className="font-bold">Fast</h3>
                <p className="text-xs text-muted">Optimized performance</p>
              </CardBody>
            </Card>
          </div>
        </div>
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-primary/5 border border-primary/10 group">
          <div className="absolute inset-0 bg-linear-to-t from-[#41E296]/50 to-[#00C4EE] z-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black p-6 rounded-full border border-white/20 transform group-hover:scale-110 transition-transform duration-500">
              <Image
                height={120}
                width={120}
                src={"/steempro-logo.svg"}
                alt="SteemPro"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold italic">Powerful Features</h2>
          <p className="text-muted">
            Designed for both newcomers and blockchain enthusiasts.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Globe,
              title: "Global Reach",
              desc: "Connect with users worldwide on a censorship-resistant network.",
              color: "sky",
            },
            {
              icon: Zap,
              title: "SDS Powered",
              desc: "Lightning fast data fetching powered by Steem Data Service.",
              color: "amber",
            },
            {
              icon: Shield,
              title: "Decentralized",
              desc: "You own your account, your keys, and your content.",
              color: "emerald",
            },
            {
              icon: Users,
              title: "Community Driven",
              desc: "Built for the community, by the community.",
              color: "rose",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="hover:translate-y-[-4px] transition-transform duration-300"
            >
              <CardBody className="p-6 space-y-4">
                <div
                  className={`p-3 rounded-2xl w-fit bg-${feature.color}-500/10 text-${feature.color}-500`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-sm text-muted">{feature.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold italic">The Team</h2>
          <p className="text-muted">Meet the minds behind SteemPro.</p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {Constants.team.map((member, i) => (
            <Card
              key={i}
              className="flex flex-col min-w-xs items-center space-y-4"
            >
              <CardBody className="flex flex-col gap-4 items-center">
                <div className="relative group mt-4">
                  <div className="absolute -inset-1.5 bg-linear-to-r from-primary via-green-500 to-primary rounded-full blur-sm opacity-0 group-hover:opacity-100 transition duration-500" />
                  <SAvatar
                    username={member.name}
                    size={120}
                    radius="full"
                    quality="medium"
                    className="relative shadow-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="text-center space-y-2">
                  <SUsername
                    username={`@${member.name}`}
                    className="text-xl font-semibold block"
                  />
                  <p className="text-primary text-sm font-semibold uppercase tracking-widest">
                    {member.role}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer/Contact CTA */}
      <section className="rounded-3xl bg-foreground text-background p-8 md:p-16 text-center space-y-8">
        <h2 className="text-3xl md:text-5xl font-bold">
          Join the Future of Social Media
        </h2>
        <p className="text-background/70 max-w-xl mx-auto text-lg leading-relaxed italic">
          Be part of a decentralized world where your content is yours and your
          voice matters.
        </p>
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          <Button
            as={Link}
            href={Constants.discord_link}
            target="_blank"
            variant="flat"
            size="lg"
            className="bg-background/10 hover:bg-background/20 text-background font-bold"
            startContent={<DiscordIcon size={20} />}
          >
            Discord
          </Button>
          <Button
            as={Link}
            href={`mailto:${Constants.official_email}`}
            variant="flat"
            size="lg"
            className="bg-background/10 hover:bg-background/20 text-background font-bold"
            startContent={<Mail size={20} />}
          >
            Email Us
          </Button>
        </div>
      </section>
    </div>
  );
}
