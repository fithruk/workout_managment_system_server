export const normalizeName = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .split(/\s+/) // разбиваем по пробелам (включая лишние)
    .sort()
    .join(" ");
