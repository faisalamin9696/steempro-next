"use client";

import React from "react";
import { AboutItem } from "../../components/AboutCard";
import { Card } from "@heroui/card";
import "./style.scss";

export default function AboutPage() {
  
  return (
    <div className="flex flex-col gap-10 justify-between">
      <div>
        <Card className="dark:bg-white/20 items-center p-6 sm:p-10 rounded-lg flex flex-col gap-2">
          <h1 className="text-lg font-bold font-serif">About Us</h1>
          <p className=" text-center">
            SteemPro is a decentralized mobile and web application designed for
            the Steem blockchain, providing users with a secure platform for
            executing broadcast operations. Additionally, the application
            includes useful tools for evaluating author activities within the
            platform.
          </p>
        </Card>

        <h2 className="text-2xl font-bold text-center mt-4">Our Team</h2>
        <div className="flex flex-row max-sm:flex-col gap-6 justify-center p-4">
          <AboutItem
            username={"faisalamin"}
            firstHeading={"Founder & Developer"}
            secondHeading={"steempro.official@gmail.com"}
          />

          <AboutItem
            username={"steempro.com"}
            firstHeading={"Official Account"}
            href="mailto:steempro.official@gmail.com"
            secondHeading={"steempro.official@gmail.com"}
          />
        </div>
      </div>

      {/* <div className=" justify-center flex items-center gap-4 max-sm:flex-col">
        <div className="flex justify-end max-sm:justify-center  w-[217px]">
          <Image
            height={80}
            width={100}
            className="rounded-lg"
            alt="qr-code"
            src={"/qr-code.png"}
          />
        </div>

        <Divider orientation="vertical" className="block max-sm:hidden" />

        <div className="flex justify-start max-sm:justify-center w-[217px]">
          <SLink href={MobileAppLink} target="_blank" className="p-0 max-w-fit">
            <Image
              height={40}
              width={150}
              src="/google-play.png"
              alt={"google-play-store"}
            />
          </SLink>
        </div>
      </div> */}
    </div>
  );
}
