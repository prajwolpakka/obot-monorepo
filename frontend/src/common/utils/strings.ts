export const properCase = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

export const getInitials = (str: string) => {
  return str
    .split(" ")
    .map((name) => name.charAt(0))
    .join("");
};

export const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};
