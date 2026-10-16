# VBot Workplace — G03

Bộ hồ sơ kiến trúc, sizing và báo giá cho VBot Workplace: trợ lý AI văn phòng trên AWS `ap-southeast-1`, 2 AZ, quy mô 2.000 DAU.

## Tệp chính

- `sizing.py`: phân biệt request/model call, tính token billable theo từng model call, RPS, sandbox, ảnh và storage từ baseline.
- `build_xlsx.py`: gọi artifact-tool để dựng `G03_baogia.xlsx`.
- `build_xlsx.mjs`: builder workbook gồm sheet `BaoGia` và `BangChung`.
- `build_deck.mjs`: builder deck 2 slide.
- `architecture.mmd`: sơ đồ kiến trúc Mermaid.
- `G03.md`: prompt nền, bảng TSV, bằng chứng, nội dung slide và câu trả lời hội đồng.
- `G03_baogia.xlsx`: báo giá có công thức `TOTAL = SUM(...)`.
- `G03_slide.pptx` / `G03_slide.pdf`: deck trình bày.

## Hồ sơ Thành — Data, hạ tầng lõi và DR

- [Nhiệm vụ 2: Thành](docs/VBot_Nhiem_vu_2_Thanh.md): phương án connectors/ACL, pgvector/workspace, ECS, database, queue/cache, mạng, HA/backup/DR và kịch bản 4.000 DAU.
- Gồm 45 dòng báo giá TSV, 14 mã bằng chứng với 31 ảnh nhúng, nội dung 2 slide, 3 dòng workspace gửi Tú và 3 đáp án hội đồng.
- Dự toán riêng phần Thành: **1.425,77 USD/tháng ở 2.000 DAU**, **2.577,29 USD/tháng ở 4.000 DAU**, chưa VAT. Khi ghép nhóm cần đối chiếu các khoản S3/audit/network dùng chung để tránh cộng trùng.
- File Markdown có ảnh nhúng nên dung lượng khoảng 11 MB; tải file nếu GitHub không hiển thị đầy đủ bản xem trước.

## Chạy sizing

```bash
python3 sizing.py
```

## Dựng workbook

`build_xlsx.py` dùng Node.js và artifact-tool runtime đã có trong môi trường Codex.

```bash
python3 build_xlsx.py
```

Workbook ghi ra `G03_baogia.xlsx`. Các mã `E01`–`E23` trong sheet `BangChung` trỏ tới trang giá/model công khai; ảnh chụp raster chưa nhúng nên các đơn giá cần được đánh dấu và đối chiếu lại trước khi nộp.

## Dựng slide

```bash
node build_deck.mjs
```

Lệnh này ghi `G03_slide.pptx` và tạo ảnh preview tạm trong `.deck-build/`.

Để xuất PDF bằng LibreOffice headless:

```bash
soffice --headless --convert-to pdf --outdir . G03_slide.pptx
```

## Kết quả baseline

- 1.760.000 request/tháng.
- 2,376 triệu model calls/tháng; 9,636 tỷ input token và 1,452 tỷ output token/tháng.
- RPS trung bình giờ hành chính: 2,22; đỉnh 3x: 6,67 req/s.
- 400.000 lượt sandbox/tháng × 30 giây workload; Fargate billing minimum 60 giây = 6.667 billable task-hours.
- 90.000 ảnh/tháng.
- 6.000 GB production + 100 GB staging = 6.100 GB total.
- Tổng working estimate: 12.814,26 USD/tháng, chưa VAT; LLM và sandbox còn `PENDING_VERIFICATION`.
- Bedrock dùng APAC Geo Cross-Region từ Singapore qua PrivateLink; prompt/output có thể tới destination Region trong APAC.
- Titan Image Generator G1 v2 không dùng vì model legacy/EOL; 90.000 ảnh dùng Nova sinh SVG/HTML và render trong sandbox.
