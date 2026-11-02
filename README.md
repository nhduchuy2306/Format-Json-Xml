# JSON & XML Studio (Format, Compare & Nested Beautifier)

> Ứng dụng Web & Desktop hiện đại chuyên biệt cho việc **Format**, **Validate**, **Minify**, **Compare (So sánh)** JSON & XML với hỗ trợ **Nested Serialization Format** (giải mã chuỗi lồng nhau) và phím tắt **`Ctrl + S`** tự động định dạng. Lấy cảm hứng từ giao diện tối ưu của `json.site` kết hợp sức mạnh Monaco Editor của VS Code.

---

## 🌟 Tính Năng Nổi Bật

1. **Auto Format với tổ hợp phím `Ctrl + S` / `Cmd + S`**:
   - Dán nội dung bất kỳ vào editor và chỉ cần bấm `Ctrl + S`.
   - Hệ thống tự động chặn hộp thoại lưu trang web mặc định của trình duyệt và tiến hành format làm đẹp mã ngay lập tức.
   - Có toast thông báo trạng thái và highlight dòng lỗi chi tiết nếu có lỗi cú pháp.

2. **Hỗ trợ toàn diện cả JSON và XML**:
   - Chuyển đổi linh hoạt giữa JSON và XML.
   - Tự động nhận diện định dạng khi upload file.
   - Tùy chỉnh khoảng cách thụt lề: 2 spaces, 4 spaces hoặc Tab.

3. **Nested Serialization Format (Định dạng chuỗi lồng nhau)**:
   - Giải quyết triệt để vấn đề JSON-in-JSON (ví dụ chuỗi escape: `"meta": "{\"ip\": \"127.0.0.1\", \"retries\": 3}"`).
   - Tự động đệ quy bóc tách các tầng chuỗi serialize để hiển thị dưới dạng Object/Array thật.
   - Hỗ trợ XML có chứa JSON hoặc XML escaped (`&lt;...&gt;`) bên trong các thẻ CDATA hoặc text node.
   - Có nút gạt **`Nested Format`** trên thanh công cụ để chủ động bật/tắt theo nhu cầu.

4. **Multi-Tab System (Hệ thống đa Tab)**:
   - Mở đồng thời nhiều tab làm việc độc lập.
   - Hỗ trợ tab Editor thường và tab Compare chuyên dụng.
   - Thêm tab nhanh chỉ bằng một cú click chuột (`+ JSON`, `+ XML`).

5. **Compare JSON & Compare XML (So sánh Diff trực quan)**:
   - Hai nút chuyên biệt **`Compare JSON`** và **`Compare XML`** ngay trên thanh điều hướng.
   - Sử dụng Monaco Diff Editor mạnh mẽ: hiển thị Bản Gốc (Original) bên trái và Bản Đã Sửa (Modified) bên phải.
   - Tô màu highlight rõ ràng từng ký tự, dòng được thêm, xóa hoặc sửa đổi.
   - Tùy chọn xem song song (Side-by-side) hoặc dòng liên tiếp (Inline Diff), hỗ trợ hoán đổi vị trí 2 văn bản.

6. **Giao diện chuẩn `json.site` & VS Code**:
   - Tối ưu không gian hiển thị, Dark Mode & Light Mode sang trọng.
   - Tích hợp Minimap, Code Folding (thu gọn khối), Bracket Matching, Line Numbers.
   - Tiện ích: Copy 1-click, Clear, Upload file máy tính, Download file về máy.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu môi trường:
- Node.js version 18 trở lên (đã được kiểm thử trên Node 24).

### Khởi chạy chế độ phát triển (Development):
```bash
npm install
npm run dev
```
Trình duyệt sẽ mở tại địa chỉ: `http://localhost:5173`

### Build phiên bản Production:
```bash
npm run build
npm run preview
```

---

## 💻 Sử dụng như một Ứng Dụng Desktop (Standalone App)

Bạn có thể cài đặt và sử dụng ứng dụng này như một phần mềm Desktop độc lập trên Windows/Mac/Linux mà không cần thanh địa chỉ trình duyệt:

1. Mở ứng dụng trên trình duyệt **Google Chrome** hoặc **Microsoft Edge** (`http://localhost:5173`).
2. Trên thanh địa chỉ trình duyệt bên phải, click vào biểu tượng **Cài đặt ứng dụng (App Available / Install)** hoặc chọn menu `⋮` -> **Cài đặt JSON & XML Studio**.
3. Ứng dụng sẽ xuất hiện như một phần mềm Windows độc lập trên Desktop và thanh Taskbar.

---

## ⌨️ Phím Tắt Tiện Dụng

| Phím tắt | Chức năng |
| :--- | :--- |
| `Ctrl + S` / `Cmd + S` | **Auto Format** văn bản hiện tại (JSON hoặc XML) |
| `Ctrl + +` / `Ctrl + =` | **Zoom In** (Phóng to font chữ editor) |
| `Ctrl + -` / `Ctrl + _` | **Zoom Out** (Thu nhỏ font chữ editor) |
| `Ctrl + 0` | **Reset Zoom** về 100% (kích thước mặc định 14px) |
| `Ctrl + Cuộn chuột` | **Zoom In / Zoom Out** trực tiếp bằng con lăn chuột |
| `Ctrl + F` / `Cmd + F` | Tìm kiếm & Thay thế trong Monaco Editor |
| `Alt + Click` | Đặt nhiều con trỏ soạn thảo (Multi-cursor) |
| `Ctrl + Z` / `Ctrl + Y` | Undo / Redo thay đổi |
