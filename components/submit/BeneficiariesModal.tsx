import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import secureLocalStorage from "react-secure-storage";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { Plus, Star, X } from "lucide-react";
import { Card } from "@heroui/card";
import { validateAccountName } from "@/utils/chainValidation";
import { normalizeUsername } from "@/utils/editor";

interface BeneficiariesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaries: Beneficiary[];
  onChange: (beneficiaries: Beneficiary[]) => void;
}

const BeneficiariesModal = ({
  isOpen,
  onOpenChange,
  beneficiaries,
  onChange,
}: BeneficiariesModalProps) => {
  const [localBeneficiaries, setLocalBeneficiaries] =
    useState<Beneficiary[]>(beneficiaries);
  const [newUsername, setNewUsername] = useState("");
  const [favorites, setFavorites] = useState<Beneficiary[]>([]);

  useEffect(() => {
    const storedFavorites = secureLocalStorage.getItem(
      "beneficiary-favorites",
    ) as Beneficiary[];
    if (storedFavorites) {
      setFavorites(storedFavorites);
    }
  }, []);

  const toggleFavorite = (beneficiary: Beneficiary) => {
    const existingIndex = favorites.findIndex(
      (f) => f.account === beneficiary.account,
    );
    let newFavorites: Beneficiary[];

    if (existingIndex >= 0) {
      newFavorites = favorites.filter((f) => f.account !== beneficiary.account);
    } else {
      newFavorites = [
        ...favorites,
        { account: beneficiary.account, weight: beneficiary.weight },
      ];
    }

    setFavorites(newFavorites);
    secureLocalStorage.setItem("beneficiary-favorites", newFavorites);
  };

  const addFromFavorites = (favorite: Beneficiary) => {
    if (localBeneficiaries.some((b) => b.account === favorite.account)) {
      toast.error("Error", {
        description: "This user is already in your beneficiaries list",
      });
      return;
    }

    if (totalPercentage >= 100) {
      toast.error("Error", {
        description: "Total percentage cannot exceed 100%",
      });
      return;
    }

    setLocalBeneficiaries([
      ...localBeneficiaries,
      { account: favorite.account, weight: favorite.weight },
    ]);
  };

  const totalPercentage = localBeneficiaries.reduce(
    (sum, b) => sum + b.weight / 100,
    0,
  );

  const handleAdd = () => {
    const username = normalizeUsername(newUsername);

    const validateUsername = validateAccountName(username);

    if (validateUsername) {
      toast.error("Error", { description: validateUsername });
      return;
    }

    if (localBeneficiaries.some((b) => b.account === username)) {
      toast.error("Error", { description: "This user is already added" });
      return;
    }

    if (totalPercentage >= 100) {
      toast.error("Error", {
        description: "Total percentage cannot exceed 100%",
      });
      return;
    }

    setLocalBeneficiaries([
      ...localBeneficiaries,
      { account: username, weight: 5 * 100 },
    ]);
    setNewUsername("");
  };

  const handleRemove = (index: number) => {
    setLocalBeneficiaries(localBeneficiaries.filter((_, i) => i !== index));
  };

  const handlePercentageChange = (index: number, value: number | number[]) => {
    const newBeneficiaries = [...localBeneficiaries];
    newBeneficiaries[index].weight = value[0] * 100;
    setLocalBeneficiaries(newBeneficiaries);
  };

  const handleSave = () => {
    if (totalPercentage > 100) {
      toast.error("Error", {
        description: "Total percentage cannot exceed 100%",
      });
      return;
    }

    onChange(localBeneficiaries);
    onOpenChange(false);
    toast.success("Updated", {
      description: "Beneficiaries updated successfully",
    });
  };

  const handleCancel = () => {
    setLocalBeneficiaries(beneficiaries);
    setNewUsername("");
    onOpenChange(false);
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={"Manage Beneficiaries"}
      description={
        "Set up reward sharing with other users. Total must not exceed 100%."
      }
      footer={() => {
        return (
          <>
            <Button variant="bordered" onPress={handleCancel}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              Save Changes
            </Button>
          </>
        );
      }}
    >
      {(onClose) => (
        <div className="space-y-4 ">
          {favorites.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm opacity-disabled">Favorite Beneficiaries</p>
              <div className="flex flex-wrap gap-1.5">
                {favorites.map((favorite) => (
                  <Button
                    key={favorite.account}
                    variant="flat"
                    size="sm"
                    onPress={() => addFromFavorites(favorite)}
                    className="h-7 px-2 bg-primary/5 hover:bg-primary/10 border-none"
                  >
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-primary fill-primary" />
                      <span className="text-xs font-bold">
                        {favorite.account}
                      </span>
                      <span className="text-xs text-muted">
                        ({favorite.weight / 100}%)
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Input
              placeholder="Enter username..."
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              variant="flat"
              classNames={{
                inputWrapper: "bg-default-100/50 hover:bg-default-200/50",
              }}
              startContent={<span className="text-default-400">@</span>}
              autoCapitalize="none"
            />
            <Button onPress={handleAdd} isIconOnly color="primary" size="sm">
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto scrollbar-thin">
            {localBeneficiaries.map((beneficiary, index) => (
              <Card
                key={index}
                className="p-4 px-2 shadow-sm border-none bg-default-100/50 hover:bg-default-100/70"
              >
                <div className="flex items-start gap-1.5 flex-1 min-w-0">
                  <Button
                    variant="light"
                    size="sm"
                    onPress={() => toggleFavorite(beneficiary)}
                    isIconOnly
                    color="primary"
                  >
                    {favorites.some(
                      (f) => f.account === beneficiary.account,
                    ) ? (
                      <Star size={16} className="text-primary fill-primary" />
                    ) : (
                      <Star size={16} className="text-default-400" />
                    )}
                  </Button>

                  <div className="flex flex-col items-start w-full gap-2">
                    <div className="flex flex-row items-center gap-1.5 justify-between w-full">
                      <div className="flex flex-row items-center gap-1.5">
                        <SAvatar size={24} username={beneficiary.account} />
                        <div className="flex flex-col min-w-0">
                          <SUsername
                            username={beneficiary.account}
                            className="text-sm font-bold truncate"
                          />
                          <span className="text-xs text-default-700 font-medium">
                            Allocation: {beneficiary.weight / 100}%
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="light"
                        size="sm"
                        className="text-danger"
                        onPress={() => handleRemove(index)}
                        isIconOnly
                        color="danger"
                      >
                        <X size={16} />
                      </Button>
                    </div>

                    <Slider
                      value={[beneficiary.weight / 100]}
                      onChange={(value) => handlePercentageChange(index, value)}
                      minValue={1}
                      maxValue={100}
                      step={1}
                      size="sm"
                      hideValue
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {localBeneficiaries.length > 0 && (
            <div className="flex justify-between items-center px-3 py-2 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-sm font-semibold opacity-80">
                Total Allocation:
              </span>
              <span
                className={`text-sm font-black ${
                  totalPercentage > 100 ? "text-danger" : "text-primary"
                }`}
              >
                {totalPercentage}%
              </span>
            </div>
          )}
        </div>
      )}
    </SModal>
  );
};

export default BeneficiariesModal;
