export function getEmojiForCategoryLogic(categoria: string): string {
  const emojis: { [key: string]: string } = {
    "Miel de Abeja": "🍯",
    Cake: "🍰",
    Alfajores: "🍬",
    "Manjar de Leche": "🥛",
    Propóleo: "🌿",
    "Cruces de Tagua": "✝️",
    Cerámicas: "🏺",
    "Fundas Ecológicas": "♻️",
    Cactus: "🌵",
    "CD Himno Monástico": "💿",
    "Medallas de San Benito": "🏅",
    "Cirios por la Paz": "🕯️",
    "Cirios Pascuales": "🕯️",
    "Cirios Litúrgicos": "🕯️",
    "Llaveros y Esferos (Bambú)": "🔑",
    "Pulseras (macramé)": "⚜️",
  };

  return emojis[categoria] || "📦";
}