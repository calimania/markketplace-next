// ENUM from the database with a variety of colors we hardcoded
export const TagColors = [
  "Tangerine",
  "Royal Blue",
  "Magenta",
  "Sunset Orange",
  "Amber",
  "Sky Blue",
  "Fuchsia",
  "Burnt Sienna",
  "Gold",
  "Ocean Blue",
  "Hot Pink",
  "Teal",
  "Coral",
  "Purple",
  "Spring Green",
  "Goldenrod",
  "Indigo",
  "Pink",
  "Blue Violet",
  "Firebrick",
]

// HEX values that map by index
export const TagColorCodes = [
  "#FF9500", // Tangerine
  "#0051BA", // Royal Blue
  "#E4007C", // Magenta
  "#FF6347", // Sunset Orange
  "#FFBF00", // Amber
  "#87CEEB", // Sky Blue
  "#FF00FF", // Fuchsia
  "#E97451", // Burnt Sienna
  "#FFD700", // Gold
  "#1E90FF", // Ocean Blue
  "#FF69B4", // Hot Pink
  "#008080", // Teal
  "#FF7F50", // Coral
  "#8A2BE2", // Purple
  "#00FF7F", // Spring Green
  "#DAA520", // Goldenrod
  "#4B0082", // Indigo
  "#FFC0CB", // Pink
  "#8A2BE2", // Blue Violet
  "#B22222", // Firebrick
]

export const getTagColorHex = (colorName: string): string => {

  const index = TagColors.findIndex(color => color === colorName);
  return index >= 0 ? TagColorCodes[index] : "#0051BA";
}

export const getTagColorName = (hex: string): string => {
  const index = TagColorCodes.findIndex(color => color.toLowerCase() === hex.toLowerCase());
  return index >= 0 ? TagColors[index] : "Royal Blue";
}
