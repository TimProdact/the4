export function formatPrice(n: number, currency = "UZS") {
  return `${n.toLocaleString("ru-RU")} ${currency}`;
}

/** +998 XX XXX XX XX */
export function formatPhoneUz(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  let d = digits;
  if (d.startsWith("998")) d = d.slice(3);
  else if (d.startsWith("8")) d = d.slice(1);

  const parts = [
    d.slice(0, 2),
    d.slice(2, 5),
    d.slice(5, 7),
    d.slice(7, 9),
  ].filter(Boolean);

  if (!parts.length) return "+998 ";
  let out = "+998";
  if (parts[0]) out += ` ${parts[0]}`;
  if (parts[1]) out += ` ${parts[1]}`;
  if (parts[2]) out += ` ${parts[2]}`;
  if (parts[3]) out += ` ${parts[3]}`;
  return out;
}

export function phoneDigits(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.startsWith("998")) return d;
  if (d.length === 9) return `998${d}`;
  return d;
}

export function isValidPhoneUz(value: string) {
  return phoneDigits(value).length === 12;
}
