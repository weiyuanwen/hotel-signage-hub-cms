export const HOTEL_CUSTOMERS = [
  { id: "song-han", name: "Sông Hàn House" },
  { id: "an-vien", name: "An Viên" },
  { id: "lantern", name: "The Lantern" },
  { id: "may-hill", name: "Mây Hill" },
  { id: "cat-vang", name: "Cát Vàng" },
  { id: "phu-hai", name: "Phú Hải" },
  { id: "long-bien", name: "Long Biên Suites" },
  { id: "riverside", name: "Riverside Pearl" },
] as const;

export type HotelCustomerId = (typeof HOTEL_CUSTOMERS)[number]["id"];
