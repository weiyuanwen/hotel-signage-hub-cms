import type { WelcomeTemplateKey } from "@/lib/welcomeTemplates";

export const photos = {
  lobby:
    "https://images.unsplash.com/photo-1759038086403-c607d67bb245?auto=format&fit=crop&w=1800&q=80",
  lounge:
    "https://images.unsplash.com/photo-1756392740252-7bbb3ef8d521?auto=format&fit=crop&w=1400&q=80",
  bar: "https://images.unsplash.com/photo-1759038085935-b2f14c2c04a7?auto=format&fit=crop&w=1400&q=80",
  room: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1400&q=80",
};

export const templateScenes: Record<WelcomeTemplateKey, string> = {
  dusk: photos.room,
  linen: photos.lounge,
  harbor: photos.bar,
  garden: photos.lobby,
  stone: photos.room,
};

export const TV_OVERLAY: Record<string, string> = {
  dusk: "rgb(18 10 4 / 0.32)",
  linen: "rgb(8 10 14 / 0.42)",
  harbor: "rgb(4 12 22 / 0.34)",
  garden: "rgb(6 14 10 / 0.4)",
  stone: "rgb(16 12 8 / 0.3)",
};

export const faqs = [
  {
    q: "Signage Desk khác màn hình quảng cáo thế nào?",
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
    a: "Năm preset: Đêm vàng, Sáng nhẹ, Cảng đêm, Vườn trà, Đá ấm. Quản lý bật/tắt và đặt mặc định. Lễ tân chọn lúc nhận phòng.",
  },
  {
    q: "Ghép TV mất bao lâu?",
    a: "Gói miễn phí: TV hiện mã PIN, lễ tân nhập vào phòng. Plus và Property: quầy gửi link, TV mở link là ghép, không gõ mã.",
  },
  {
    q: "3 TV miễn phí mãi là sao?",
    a: "Ba màn đầu không hết hạn, không thẻ. Màn thứ tư trở đi tính từ $3 mỗi TV mỗi tháng. Player là trang web, chạy trên Android TV, Chrome, Windows hoặc Raspberry Pi.",
  },
  {
    q: "Ai được đăng nhập?",
    a: "Form mở quầy gửi tài khoản quản lý tới email vừa nhập. Lễ tân do quản lý thêm sau. Super-admin vẫn tạo khách sạn nội bộ.",
  },
];
