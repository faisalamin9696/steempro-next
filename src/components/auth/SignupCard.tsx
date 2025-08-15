import React from "react";
import SLink from "../ui/SLink";
import { SignupLink } from "@/constants/AppConstants";
import { useLanguage } from "@/contexts/LanguageContext";
function SignupCard() {
  const { t } = useLanguage();
  return (
    <div className="text-start text-small text-default-600">
      {t("auth.need_to_create_account")}{" "}
      <SLink
        className="hover:text-blue-500 font-semibold"
        href={SignupLink}
        target="_blank"
      >
        {t("auth.signup")}
      </SLink>
    </div>
  );
}

export default SignupCard;
