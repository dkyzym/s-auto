export const humanDelay = async (min = 300, max = 700) =>
    new Promise(r => setTimeout(r, min + Math.random() * (max - min)));
  