import React from "react";
import SLink from "../ui/SLink";
import { SignupLink } from "@/constants/AppConstants";

function SignupCard() {
  return (
    <div className="text-start text-small text-default-600">
      Need to create an account?{" "}
      <SLink
        className="hover:text-blue-500 font-semibold"
        href={SignupLink}
        target="_blank"
      >
        Sign up
      </SLink>
    </div>
  );
}

export default SignupCard;
