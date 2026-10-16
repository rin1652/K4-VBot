# VBot Workplace — G03

Bộ hồ sơ kiến trúc, sizing và báo giá cho VBot Workplace: trợ lý AI văn phòng trên AWS `ap-southeast-1`, 2 AZ, quy mô 2.000 DAU.

## Tệp chính

- `sizing.py`: tính request, token, RPS đỉnh, sandbox, ảnh và storage từ baseline.
- `build_xlsx.py`: gọi artifact-tool để dựng `G03_baogia.xlsx`.
- `build_xlsx.mjs`: builder workbook gồm sheet `BaoGia` và `BangChung`.
- `build_deck.mjs`: builder deck 2 slide.
- `architecture.mmd`: sơ đồ kiến trúc Mermaid.
- `G03.md`: prompt nền, bảng TSV, bằng chứng, nội dung slide và câu trả lời hội đồng.
- `G03_baogia.xlsx`: báo giá có công thức `TOTAL = SUM(...)`.
- `G03_slide.pptx` / `G03_slide.pdf`: deck trình bày.

## Chạy sizing

```bash
python3 sizing.py
```

## Dựng workbook

`build_xlsx.py` dùng Node.js và artifact-tool runtime đã có trong môi trường Codex.

```bash
python3 build_xlsx.py
```

Workbook ghi ra `G03_baogia.xlsx`. Các mã `E01`–`E16` trong sheet `BangChung` trỏ tới trang giá công khai của AWS, ngày ghi nhận `2026-10-16`.

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
- 6,688 tỷ input token và 0,986 tỷ output token/tháng.
- RPS trung bình giờ hành chính: 2,22; đỉnh 3x: 6,67 req/s.
- 400.000 lượt sandbox/tháng × 30 giây = 3.333 task-hours.
- 90.000 ảnh/tháng.
- 6.000 GB workspace.
- Tổng báo giá: 15.001,24 USD/tháng, chưa VAT.
- Bedrock dùng APAC Geo Cross-Region từ Singapore qua PrivateLink; prompt/output có thể tới destination Region trong APAC.
- Titan Image Generator G1 v2 không dùng vì model legacy/EOL; 90.000 ảnh dùng Nova sinh SVG/HTML và render trong sandbox.
