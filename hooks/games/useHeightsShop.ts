"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  PowerUp,
  Skin,
  DAILY_CHALLENGES,
} from "@/components/games/steem-heights/Config";
import { supabase } from "@/libs/supabase/supabase";
import { authenticateWithEmail } from "@/libs/supabase/database";
import { checkActionDuplicate } from "@/libs/supabase/steem-heights";
import { generateHMAC } from "@/utils/encryption";
import { AsyncUtils } from "@/utils/async.utils";

interface UseHeightsShopProps {
  session: any;
  energy: number;
  setEnergy: (energy: number | ((prev: number) => number)) => void;
  purchasedSkins: string[];
  setPurchasedSkins: (skins: string[] | ((prev: string[]) => string[])) => void;
  activePowerUp: PowerUp | null;
  setActivePowerUp: (pu: PowerUp | null) => void;
  dailyProgress: any;
  setDailyProgress: (progress: any | ((prev: any) => any)) => void;
  currentSeason: number;
  gameState: string;
  selectedSkinId: string;
  setSelectedSkinId: (id: string) => void;
}

export const useHeightsShop = ({
  session,
  energy,
  setEnergy,
  purchasedSkins,
  setPurchasedSkins,
  activePowerUp,
  setActivePowerUp,
  dailyProgress,
  setDailyProgress,
  currentSeason,
  gameState,
  selectedSkinId,
  setSelectedSkinId,
}: UseHeightsShopProps) => {
  const [syncingChallengeId, setSyncingChallengeId] = useState<string | null>(
    null,
  );
  const [syncingPowerUpId, setSyncingPowerUpId] = useState<string | null>(null);
  const [syncingSkinId, setSyncingSkinId] = useState<string | null>(null);

  const syncShopState = useCallback(
    async (
      action: string = "",
      season: number = 1,
      currentEnergy: number,
      skins: string[],
      powerup: PowerUp | null,
      equipedSkin: string,
    ) => {
      if (!session?.user?.name) return;

      const username = session.user.name;

      try {
        // 0. Ensure Supabase Auth session
        const {
          data: { session: sbSession },
        } = await supabase.auth.getSession();
        if (!sbSession) {
          await authenticateWithEmail(username + "@steempro.com", username);
        }

        // 1. Generate Secure Session for shop action
        const sessionResponse = await fetch("/api/game/start", {
          method: "POST",
        });
        const sessionData = await sessionResponse.json();

        if (!sessionData.success) {
          throw new Error("Failed to initialize secure shop session");
        }

        const { gameId, challenge } = sessionData;

        // 2. Generate HMAC Signature
        // Message: player:gameId:challenge:energy:action
        const signature = generateHMAC(
          `${username}:${gameId}:${challenge}:${currentEnergy}:${action}`,
          challenge,
        );

        const payload = {
          player: username,
          game: "steem-heights",
          season,
          energy: currentEnergy,
          skins,
          powerup: powerup
            ? { name: powerup.name, updated_at: new Date().toISOString() }
            : { name: "", updated_at: null },
          equiped: equipedSkin,
          action,
          timestamp: new Date().toISOString(),
          gameId,
          signature,
        };

        // 3. Broadcast to Blockchain + DB via API
        const response = await fetch("/api/game/steem-heights/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            equiped: equipedSkin,
            player: session.user.name,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to broadcast shop update");
        }
      } catch (error: any) {
        console.error("Failed to sync shop state:", error);
        toast.error(error.message || "Failed to sync shop state");
        throw error;
      }
    },
    [session?.user?.name],
  );

  const claimChallenge = useCallback(
    async (challengeId: string) => {
      const challenge = DAILY_CHALLENGES.find((c) => c.id === challengeId);
      if (!challenge) return;

      const currentProgress =
        challenge.type === "ascent"
          ? dailyProgress.ascent
          : challenge.type === "combos"
            ? dailyProgress.combos
            : dailyProgress.plays;

      if (
        currentProgress >= challenge.target &&
        !dailyProgress.claimed.includes(challengeId)
      ) {
        if (session?.user?.name) {
          try {
            setSyncingChallengeId(challengeId);

            // Double check duplicate in DB before proceeding (for multi-device/tab protection)
            const isDuplicate = await checkActionDuplicate(
              session.user.name,
              `Claimed challenge: ${challenge.title}`,
              currentSeason,
            );

            if (isDuplicate) {
              toast.error("Already claimed on another device/tab");
              // Refresh state to sync UI
              return;
            }

            const newEnergy = energy + challenge.reward;

            await syncShopState(
              `Claimed challenge: ${challenge.title}`,
              currentSeason,
              newEnergy,
              purchasedSkins,
              activePowerUp,
              selectedSkinId,
            );

            await AsyncUtils.sleep(3);

            // Update local state only after successful sync
            setEnergy(newEnergy);
            toast.success(
              `Challenge Claimed! +${challenge.reward} Energy earned.`,
            );
          } catch (error) {
            // Error already handled
          } finally {
            setSyncingChallengeId(null);
          }
        }
      }
    },
    [
      dailyProgress,
      session?.user?.name,
      currentSeason,
      syncShopState,
      energy,
      purchasedSkins,
      activePowerUp,
      setEnergy,
      selectedSkinId,
    ],
  );

  const purchasePowerUp = useCallback(
    async (powerUp: PowerUp) => {
      if (gameState === "playing") {
        toast.error("Finish your current climb first!");
        return;
      }
      if (energy >= powerUp.cost) {
        try {
          const newEnergy = energy - powerUp.cost;

          setSyncingPowerUpId(powerUp.id);
          if (session?.user?.name) {
            await syncShopState(
              `Purchased power-up: ${powerUp.name}`,
              currentSeason,
              newEnergy,
              purchasedSkins,
              powerUp,
              selectedSkinId,
            );
          }

          // Update local state only after successful sync
          setEnergy(newEnergy);
          setActivePowerUp(powerUp);
          toast.success(`${powerUp.name} activated for your next game!`);
        } catch (error) {
          // Error already handled
        } finally {
          setSyncingPowerUpId(null);
        }
      } else {
        toast.error("Not enough energy!");
      }
    },
    [
      energy,
      session?.user?.name,
      purchasedSkins,
      currentSeason,
      syncShopState,
      setEnergy,
      setActivePowerUp,
      gameState,
      selectedSkinId,
    ],
  );

  const purchaseSkin = useCallback(
    async (skin: Skin) => {
      if (gameState === "playing") {
        toast.error("Finish your current climb first!");
        return;
      }
      if (activePowerUp?.conflicts?.includes(skin.id)) {
        toast.error(
          `Cannot purchase ${skin.name}: It conflicts with your active ${activePowerUp.name} power-up.`,
        );
        return;
      }
      if (purchasedSkins.includes(skin.id)) {
        setSelectedSkinId(skin.id);
        return;
      }
      if (energy >= skin.price) {
        try {
          setSyncingSkinId(skin.id);
          const newEnergy = energy - skin.price;
          const newSkins = Array.from(new Set([...purchasedSkins, skin.id]));

          if (session?.user?.name) {
            await syncShopState(
              `Purchased skin: ${skin.name}`,
              currentSeason,
              newEnergy,
              newSkins,
              activePowerUp,
              skin.id,
            );
          }

          // Update local state only after successful sync
          setEnergy(newEnergy);
          setPurchasedSkins(newSkins);
          setSelectedSkinId(skin.id);
          toast.success(`${skin.name} unlocked and equipped!`);
        } catch (error) {
          // Error already handled
        } finally {
          setSyncingSkinId(null);
        }
      } else {
        toast.error("Not enough energy!");
      }
    },
    [
      energy,
      purchasedSkins,
      session?.user?.name,
      activePowerUp,
      currentSeason,
      syncShopState,
      setEnergy,
      setPurchasedSkins,
      gameState,
      setSelectedSkinId,
    ],
  );

  const equipSkin = useCallback(
    async (skinId: string) => {
      if (gameState === "playing") {
        toast.error("Finish your current climb first!");
        return;
      }
      if (!purchasedSkins.includes(skinId) && skinId !== "default") {
        toast.error("Skin not purchased!");
        return;
      }

      if (activePowerUp?.conflicts?.includes(skinId)) {
        toast.error(
          `Cannot equip skin: It conflicts with your active ${activePowerUp.name} power-up.`,
        );
        return;
      }

      if (session?.user?.name) {
        try {
          setSyncingSkinId(skinId);
          await syncShopState(
            `Equipped skin: ${skinId}`,
            currentSeason,
            energy,
            purchasedSkins,
            activePowerUp,
            skinId,
          );
          setSelectedSkinId(skinId);
          toast.success("Skin equipped!");
        } catch (error) {
          // Error already handled
        } finally {
          setSyncingSkinId(null);
        }
      } else {
        setSelectedSkinId(skinId);
      }
    },
    [
      gameState,
      purchasedSkins,
      setSelectedSkinId,
      session?.user?.name,
      syncShopState,
      currentSeason,
      energy,
      activePowerUp,
    ],
  );

  return {
    claimChallenge,
    purchasePowerUp,
    purchaseSkin,
    equipSkin,
    syncShopState,
    syncingChallengeId,
    syncingPowerUpId,
    syncingSkinId,
  };
};
