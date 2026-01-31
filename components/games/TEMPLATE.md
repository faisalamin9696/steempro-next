# How to add your game to SteemPro Gaming Zone

We welcome 3rd party developers to showcase their games on SteemPro. Follow this template to get started.

## Step 1: Prepare your data

Add your game data to the `THIRD_PARTY_GAMES` array in `app/games/page.tsx`.

### Data Template

```typescript
import { Game } from "@/components/games/types";

const myGame: Game = {
  id: "your-game-id",
  title: "Your Game Title",
  description: "A short catchy description of your game.",
  image: "https://your-domain.com/assets/game-thumbnail.png",
  category: "Action", // "Precision", "Prediction", "Knowledge", "Strategy", etc.
  difficulty: "Medium", // "Easy", "Medium", "Hard", "Expert"
  href: "https://your-game-url.com",
  stats: {
    rewards: "External", // Or "Active" if integrated with SteemPro
  },
  usesBlockchain: false, // Set to true if your game uses Steem blockchain
  featured: false, // Set to true for banner spotlight
  developer: {
    name: "SteemPro Studio",
    username: "@steempro.com",
    website: "https://your-studio.com",
  },
};
```

## Step 2: Integration Levels

### Level 1: External Link (Easiest)

Your game is hosted externally. We simply link to it. Set `href` to your game's URL.

### Level 2: SteemPro Hosted

If you want to host your game within the SteemPro codebase (like Steem Heights), create a folder in `components/games/your-game-id` and a page in `app/games/your-game-id/page.tsx`.

## Step 3: Guidelines

- **Responsive**: Your game must be playable on both Desktop and Mobile.
- **Performance**: Ensure your game is optimized for web performance.
- **Fair Play**: If you record scores, ensure they are sent to the blockchain or a verified backend.
- **Aesthetic**: Use high-quality thumbnails (approx 800x1200) for the card.
