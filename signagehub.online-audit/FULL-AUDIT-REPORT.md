# SEO audit — signagehub.online

**Ngày audit:** 28-10-2026  
**Phạm vi:** production `https://signagehub.online/` và source trong `hotel-signage-hub-cms`.  
**Chế độ:** chỉ phân tích; không sửa source hay cấu hình production.

## Tóm tắt

SignageHub là SaaS quản lý màn hình TV chào khách cho khách sạn, không phải website phim. Source và production hiện không có route hoặc dữ liệu trang chi tiết phim. Trang gần nhất với yêu cầu đó là gallery gồm sáu mẫu chào khách; các mẫu chưa có URL chi tiết độc lập. Vì vậy không có title/meta/canonical trang phim để audit, và không nên gắn `Movie`/`Film` schema cho nội dung hiện tại.

**Điểm tham khảo: 76/100 cho phần đã đo (technical SEO, on-page và schema).** Đây không phải điểm sức khỏe SEO đầy đủ: chưa có dữ liệu Search Console, CrUX/PageSpeed, backlink, hoặc kiểm tra nội dung/ảnh chuyên sâu. Nội dung chính server-render trong HTML đầu tiên, 14 URL public EN/VI có metadata riêng, canonical tự trỏ và hreflang đúng. Các rủi ro ưu tiên là URL không tồn tại trả 500, CMS shell trả 200 nhưng bị robots chặn mà không có noindex, và khác biệt đáng kể giữa production với source hiện tại.

## Phạm vi và cách kiểm tra

- Đã kiểm tra 14 URL public chính (7 tuyến nội dung × EN/VI), trang đăng nhập và các alias locale; đọc HTML response, title, description, H1, canonical, hreflang, robots, JSON-LD và mã nguồn liên quan.
- Đã tải `robots.txt` và `sitemap.xml`, phân tích XML: sitemap hợp lệ, có 7 `<loc>` và mỗi URL có alternates EN, VI, `x-default`.
- Đã kiểm tra redirect host/protocol, route CMS bị robots chặn, trang lỗi ngẫu nhiên, một số `/.well-known/*`, `llms.txt` và AI catalog.
- Chưa đo CWV bằng CrUX/PageSpeed, chưa truy cập Search Console/GA4, chưa xác nhận Google đã index URL nào, chưa crawl backlink hoặc đo UX trực quan bằng Lighthouse.

## Điểm theo phần đã đo

| Hạng mục | Đánh giá | Điểm | Bằng chứng chính |
|---|---:|---:|---|
| Crawl/index | Cần xử lý | 65/100 | Sitemap và public routes tốt; URL lạ trả 500; CMS shell trả 200 và không có robots meta nhưng bị disallow. |
| On-page + localization | Tốt | 91/100 | 14 URL EN/VI có title, description, H1, canonical tự trỏ và hreflang đối ứng. Login là ngoại lệ nhỏ. |
| Schema | Khá | 72/100 | JSON-LD parse được và kiểu dữ liệu phù hợp; schema giá production thiếu hai plan có trên trang và khác source. |
| Core Web Vitals / performance | Chưa đo | — | Không có CrUX/PageSpeed trong phiên audit. Production trả `Cache-Control: private, no-cache, no-store` trên trang marketing; cần đo thực tế trước khi kết luận tác động. |
| Nội dung, ảnh, backlink, index thực tế | Chưa đo đầy đủ | — | Không có Search Console / analytics / backlink data; không đưa ra kết luận về thứ hạng hay index coverage. |

## Phát hiện theo ưu tiên

### P1 — Cao

#### 1. URL không tồn tại trả HTTP 500 thay vì 404

Production trả `500` cho `/definitely-not-a-route-404`, `/vi/definitely-not-a-route-404` và nhiều đường dẫn `/.well-known/*` không được triển khai. Mẫu lỗi được phục vụ từ Next.js; trong khi source có `src/app/not-found.tsx`. URL sai hoặc liên kết gãy vì vậy bị báo như lỗi máy chủ thay vì trang không tồn tại. Chưa thấy các URL này trong sitemap, nhưng lỗi cần kiểm tra ở release/origin vì ảnh hưởng mọi URL lỗi mà bot phát hiện.

**Khuyến nghị:** tìm nguyên nhân khiến production không đi qua not-found handler; đảm bảo URL không khớp route trả HTTP 404 thực, không phải 500. Với các well-known endpoint, chỉ triển khai endpoint đã chọn; các endpoint còn lại trả 404.

#### 2. CMS shell 200 bị disallow nhưng không có chỉ thị noindex

`/rooms`, `/devices`, `/hotel`, `/templates`, `/staff` trả HTTP 200 với title mặc định của trang chủ, không có H1 và không có meta robots trong HTML đầu tiên. Cùng lúc, `robots.txt` disallow các đường dẫn này. Đây là các route CMS cần đăng nhập trong source. Robots.txt chặn crawl nhưng không đảm bảo URL không xuất hiện trong chỉ mục; khi bị chặn, Google cũng không đọc được một `noindex` gắn trên trang.

**Khuyến nghị:** để nội dung CMS thật sự yêu cầu xác thực ở server (redirect về login hoặc 401/403 trước khi render dữ liệu). Nếu cần cho crawler thấy `noindex`, hãy cho phép crawl route đó và trả `noindex`/`X-Robots-Tag`; không dựa riêng vào disallow để bảo mật hay xóa URL khỏi Search.

#### 3. Source và production đang lệch phiên bản SEO

Có các khác biệt có thể kiểm chứng:

- Production sitemap ghi `lastmod` `2026-09-23T01:10:00Z` cho cả 7 URL. Source working tree đang khai báo ngày `2026-10-28` theo từng route; thay đổi này hiện còn uncommitted.
- Production `SoftwareApplication` chỉ có một Offer không tên (`$3` EN / `15.000 VND` VI), trong khi source working tree mô tả ba mức: miễn phí, 3 TV, không giới hạn.
- Title production `/product` là “16:9 hotel welcome TV software for the front desk · SignageHub”, còn bản dịch trong source hiện tại dùng “Personalized guest greetings on hotel room TVs”.

**Khuyến nghị:** xác nhận commit/build production cần chạy, rồi đối chiếu metadata, sitemap và schema sau khi deploy. Chỉ cập nhật `lastmod` cho trang có thay đổi nội dung đáng kể, không đặt hàng loạt ngày mới để làm mới tín hiệu.

### P2 — Trung bình

#### 4. 307 cho alias locale có vẻ là alias vĩnh viễn

`/vi/gallery` và `/vi/pricing` chuyển đến `/vi/mau-chao` và `/vi/bang-gia` bằng `307`. Canonical cuối đúng và redirect chỉ một hop, nhưng 307 thể hiện chuyển tạm thời. Nếu đây là alias URL lâu dài, nên dùng redirect vĩnh viễn `308` hoặc `301`.

**Khuyến nghị:** thống nhất redirect vĩnh viễn cho path alias, rà soát các link nội bộ để trỏ thẳng URL chuẩn, rồi kiểm tra cả EN/VI và phiên bản www/http.

#### 5. Offer schema production không mô tả đủ giá trên trang

Các trang `/pricing` và `/vi/bang-gia` nêu gói miễn phí, gói 3 TV và gói không giới hạn. JSON-LD production chỉ nêu một giá và không mô tả kỳ tính tiền; source mới hơn có ba Offer. Điều này làm dữ liệu có cấu trúc không khớp nội dung người dùng thấy.

**Khuyến nghị:** đồng bộ schema với bảng giá thực tế ở từng ngôn ngữ, bao gồm tên gói, tiền tệ, giá và kỳ thanh toán; sau đó validate JSON-LD và kiểm tra Search Console Enhancements/URL Inspection.

#### 6. HTML công khai trả `private, no-cache, no-store`

Các trang marketing đã kiểm tra trả header `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`. Điều này có thể bỏ qua cache chia sẻ cho nội dung công khai và làm tăng TTFB, nhưng chưa có số liệu CWV để kết luận tác động thực tế.

**Khuyến nghị:** đo PSI/CrUX trên homepage và pricing cả PHONE/DESKTOP; kiểm tra TTFB và chính sách cache CDN. Chỉ đổi cache policy sau khi đảm bảo không cache dữ liệu riêng tư hoặc phản hồi theo cookie.

#### 7. Sitemap hợp lệ nhưng số URL phản ánh đúng phạm vi hẹp hiện tại

Sitemap hợp lệ và có alternate EN/VI, `x-default`; hiện có 7 URL gốc tương ứng 14 phiên bản ngôn ngữ. Không có URL chi tiết template/phim hay trang phân trang trong sitemap vì chúng không tồn tại trong source.

**Khuyến nghị:** giữ sitemap chỉ gồm URL canonical, indexable và trả 200. Nếu sau này tạo trang chi tiết template hoặc nội dung khác, thêm từng URL chất lượng vào sitemap cùng canonical, hreflang (nếu có bản dịch), và `lastmod` chính xác.

### P3 — Thấp / cơ hội

#### 8. Hreflang trên trang đăng nhập đang noindex

`/login` và `/vi/dang-nhap` có `noindex,nofollow`, không nằm trong sitemap, nhưng vẫn phát hreflang alternates. Đây là tín hiệu locale dư thừa cho trang không muốn index.

**Khuyến nghị:** cân nhắc bỏ hreflang khỏi trang login và giữ noindex nhất quán.

#### 9. Header bảo mật chưa quan sát thấy

Ở response HTML marketing, không thấy các header `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`. HTTPS và redirect HTTP→HTTPS hoạt động; đây chủ yếu là hardening và không phải lỗi index trực tiếp.

**Khuyến nghị:** kiểm tra cấu hình Cloudflare/origin và đặt chính sách phù hợp sau khi đánh giá tương thích CSP. Không bật HSTS preload nếu chưa kiểm tra các subdomain.

#### 10. Agent discovery là tùy chọn, không phải lỗi Google indexing

`/llms.txt` và `/ai-catalog.json` trả 404, không có Markdown negotiation hay policy riêng cho AI crawlers. `robots.txt` wildcard cho crawl và không chặn AI bot cụ thể. Lighthouse Agentic Browsing, Agent-UX và WAF UA matrix chưa đo được. Đây là cơ hội cho chiến lược truy cập AI agent, không phải điều kiện để Google index website.

**Khuyến nghị:** chỉ tạo discovery files hoặc chính sách crawler theo mục tiêu kinh doanh; không ưu tiên trước lỗi 500, indexability của CMS và đồng bộ release.

## Các mục user ưu tiên

1. **Technical SEO/crawl/index:** nền tảng public ổn; xử lý P1 #1–#3 trước.
2. **Title/meta/canonical trang phim:** không áp dụng. Website không có trang phim; 14 URL marketing hiện có title/description riêng và canonical đúng.
3. **Sitemap, robots, phân trang:** sitemap hợp lệ; robots cần xử lý CMS indexing theo P1 #2; không có pagination public cần tối ưu.
4. **Schema:** giữ `Organization`, `WebSite`, `SoftwareApplication`, `BreadcrumbList`, `FAQPage` và `CollectionPage` phù hợp nội dung; đồng bộ Offer production.
5. **URL trùng do crawl nhiều nguồn:** chưa thấy dữ liệu public từ nhiều nguồn hoặc detail URL; 6 mẫu gallery đang là card trong cùng trang, không phải sáu trang trùng. Các locale là bản dịch với canonical/hreflang tương ứng. Alias 307 là điểm cần chuẩn hóa.
6. **Ưu tiên và kiểm chứng:** xem kế hoạch hành động trong `ACTION-PLAN.md`.

## Giới hạn

Không có quyền Search Console/GA4/CrUX/DataForSEO trong phiên này, nên không thể khẳng định trạng thái index thực tế, lượng tìm kiếm, ranking, backlink, CWV field hoặc duplicate cluster mà Google đã chọn. Browser search tool không đọc được domain trực tiếp; kiểm tra production được thực hiện qua HTTP GET từ môi trường này. Audit không gửi yêu cầu xác thực, không thử vượt kiểm soát truy cập và không sửa source.

## Tài liệu tham chiếu

- [Google: Robots.txt không phải cơ chế loại URL khỏi chỉ mục](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: Noindex phải crawl được để bot đọc chỉ thị](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google: Sitemap và độ chính xác của `lastmod`](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: FAQ rich results chỉ còn hiển thị thường xuyên cho site chính phủ/y tế uy tín](https://developers.google.com/search/blog/2023/08/howto-faq-changes)
