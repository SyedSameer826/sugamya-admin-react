export const Last20Years = Array.from({ length: 20 }, (_, index) =>
  (new Date().getFullYear() - index).toString(),
);
export const Months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export const rolesOptions = [
  { name: "Tele-Counsellors", label: "Support" },
  { name: "Logistics", label: "Logistics" },
];


export const transactionType = [
  { name: "Order", label: "Order" },
  { name: "Appointment", label: "Appointment" },
];


export const unitedKingdomId = "646b2e0f46865f1f65565388"