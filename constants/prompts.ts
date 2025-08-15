// Example prompts for user guidance based on background types

export const EXAMPLE_PROMPTS = {
  cartoon: [
    "magical forest with sparkles and fairy lights",
    "outer space with colorful planets and stars",
    "underwater world with bright coral and fish",
    "enchanted castle with rainbow clouds",
    "candy land with lollipops and gumdrops",
    "superhero city with tall buildings",
    "dinosaur jungle with prehistoric plants",
    "winter wonderland with snow and ice crystals",
  ],
  lego: [
    "LEGO castle with knights and dragons",
    "LEGO city with cars and skyscrapers",
    "LEGO pirate ship on the ocean waves",
    "LEGO space station with astronauts",
    "LEGO farm with animals and tractors",
    "LEGO fire station with trucks",
    "LEGO medieval village with houses",
    "LEGO race track with sports cars",
  ],
  photo: [
    "cozy living room with fireplace",
    "beautiful garden with flowers",
    "modern kitchen with marble counters",
    "sunny beach with palm trees",
    "mountain landscape with snow peaks",
    "library with books and reading chair",
    "art studio with paintbrushes and easel",
    "outdoor picnic with blanket and basket",
  ],
} as const;

// Prompt guidelines for users
export const PROMPT_GUIDELINES = {
  maxLength: 200,
  tips: [
    "Be specific about the setting you want",
    "Include details about colors and atmosphere",
    "Mention objects that should appear in the background",
    "Keep it simple and clear",
  ],
  examples: {
    good: [
      "sunny beach with palm trees and blue water",
      "cozy library with wooden shelves and warm lighting",
      "magical forest with glowing mushrooms",
    ],
    avoid: [
      "make it look cool",
      "something awesome",
      "the best background ever",
    ],
  },
} as const;

// Default prompts sent to PhotoRoom API (optimized for toy photography)
export const OPTIMIZED_PROMPTS = {
  cartoon:
    "vibrant cartoon illustration background with bright colors, whimsical design, detailed animated style, colorful and playful atmosphere",
  lego: "authentic LEGO brick environment with plastic textures, geometric LEGO shapes, blocky LEGO structures, realistic LEGO world setting",
  photo:
    "professional photographic studio background with natural lighting, clean composition, realistic photographic style, high quality studio setting",
} as const;
