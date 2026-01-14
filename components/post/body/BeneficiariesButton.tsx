import { Button, ButtonProps } from "@heroui/button";
import { useState } from "react";
import BeneficiariesModal from "../../submit/BeneficiariesModal";
import { UserCog } from "lucide-react";

interface Props extends ButtonProps {
  beneficiaries: Beneficiary[];
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  iconSize?: number;
}

function BeneficiariesButton(props: Props) {
  const { beneficiaries, setBeneficiaries, iconSize = 20 } = props;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsOpen(true)} {...props}>
        <UserCog size={iconSize} />
        {beneficiaries.length > 0 ? beneficiaries.length : ""}
      </Button>

      {isOpen && (
        <BeneficiariesModal
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          beneficiaries={beneficiaries}
          onChange={setBeneficiaries}
        />
      )}
    </>
  );
}

export default BeneficiariesButton;
