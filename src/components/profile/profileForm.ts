export type ProfileForm = {
  fullName: string;
  email: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  postal: string;
};

export const initialProfileForm: ProfileForm = {
  fullName: "Ayesha Rahman",
  email: "ayesha.rahman@gmail.com",
  phone: "+92 301 4457 220",
  house: "25-B",
  street: "Main Boulevard",
  area: "DHA Phase 6",
  city: "Lahore",
  postal: "54792",
};

export function getPhoneError(phone: string) {
  return phone.length > 0 && phone.replace(/\D/g, "").length < 10
    ? "Enter a valid phone number so the rider can reach you"
    : "";
}

export function getPostalError(postal: string) {
  return postal.length > 0 && !/^\d{5}$/.test(postal) ? "Postal code must be 5 digits" : "";
}

export function getCompletion(form: ProfileForm) {
  const entries: [string, string][] = [
    ["Name added", form.fullName],
    ["Email verified", form.email],
    ["Phone number", form.phone],
    ["Delivery address", form.street && form.area ? "y" : ""],
    ["Postal code", form.postal],
  ];
  const done = entries.filter(([, v]) => v.trim().length > 0).map(([k]) => k);
  const remaining = entries.filter(([, v]) => v.trim().length === 0).map(([k]) => k);
  return { percent: Math.round((done.length / entries.length) * 100), done, remaining };
}

export function getAddressLines(form: ProfileForm) {
  return [
    form.house && `House ${form.house}`,
    form.street,
    form.area,
    [form.city, form.postal].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];
}
