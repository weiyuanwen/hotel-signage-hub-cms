import { R2_PUBLIC } from "@/lib/r2Public";
import type { WelcomeTemplateKey } from "@/lib/welcomeTemplates";

export const photos = {
  lobby: `${R2_PUBLIC}/landing/lobby.jpg`,
  lounge: `${R2_PUBLIC}/landing/lounge.jpg`,
  bar: `${R2_PUBLIC}/landing/bar.jpg`,
  room: `${R2_PUBLIC}/landing/room.jpg`,
};

export const templateScenes: Record<WelcomeTemplateKey, string> = {
  dusk: photos.room,
  linen: photos.lounge,
  harbor: photos.bar,
  garden: photos.lobby,
  stone: photos.room,
  vista: `${R2_PUBLIC}/landing/vista.jpg`,
};

export const TV_OVERLAY: Record<string, string> = {
  dusk: "rgb(18 10 4 / 0.32)",
  linen: "rgb(8 10 14 / 0.42)",
  harbor: "rgb(4 12 22 / 0.34)",
  garden: "rgb(6 14 10 / 0.4)",
  stone: "rgb(16 12 8 / 0.3)",
  vista: "rgb(22 18 14 / 0.12)",
};

export const faqs = [
  {
    q: "SignageHub khác màn hình quảng cáo thế nào?",
    a: "Đây là lời chào theo phòng, theo khách. Lễ tân nhận phòng trên CMS, TV trong phòng đổi tên và mẫu ngay, không xếp lịch slide.",
  },
  {
    q: "Một phòng nhiều TV thì sao?",
    a: "Mọi TV ghép cùng phòng chiếu chung một nội dung: tên khách, Wi-Fi, thời tiết, nền. Đổi phòng trên CMS là đủ.",
  },
  {
    q: "Nền ảnh và video chỉnh ở đâu?",
    a: "Mặc định lấy từ trang Khách sạn. Từng phòng có thể đặt nền riêng, gồm ảnh, file MP4/WebM, hoặc link YouTube/Vimeo.",
  },
  {
    q: "Mẫu chào có những gì?",
    a: "Sáu preset: Đêm vàng, Sáng nhẹ, Cảng đêm, Vườn trà, Đá ấm, Tầm nhìn. Quản lý bật/tắt và đặt mặc định. Lễ tân chọn lúc nhận phòng.",
  },
  {
    q: "Ghép TV mất bao lâu?",
    a: "Gói miễn phí và gói 3 TV dùng mã PIN hiển thị trên TV. Gói không giới hạn hỗ trợ cả mã PIN và link ghép thiết bị.",
  },
  {
    q: "Các gói có giá bao nhiêu?",
    a: "Một TV miễn phí. Gói tối đa 3 TV giá 15.000đ/tháng; gói không giới hạn giá 50.000đ/tháng.",
  },
  {
    q: "Ai được đăng nhập?",
    a: "Form mở quầy gửi tài khoản quản lý tới email vừa nhập. Lễ tân do quản lý thêm sau. Super-admin vẫn tạo khách sạn nội bộ.",
  },
];
