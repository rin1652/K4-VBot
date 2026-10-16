# VBot Workplace — G03

Bộ hồ sơ kiến trúc, sizing và báo giá cho VBot Workplace: trợ lý AI văn phòng trên AWS `ap-southeast-1`, 2 AZ, quy mô 2.000 DAU.

## Tệp chính

- `sizing.py`: phân biệt request/model call, tính token billable theo từng model call, RPS, sandbox, ảnh và storage từ baseline.
- `build_xlsx.py`: gọi artifact-tool để dựng `G03_baogia.xlsx`.
- `build_xlsx.mjs`: builder workbook gồm sheet `BaoGia` và `BangChung`.
- `build_deck.mjs`: builder deck 12 slide.
- `architecture.mmd`: sơ đồ kiến trúc Mermaid.
- `G03.md`: prompt nền, bảng TSV, bằng chứng, nội dung slide và câu trả lời hội đồng.
- `G03_baogia.xlsx`: báo giá có công thức `TOTAL = SUM(...)`.
- `G03_slide.pptx` / `G03_slide.pdf`: deck trình bày.

## Hồ sơ Thành — Data, hạ tầng lõi và DR

- **Bản bàn giao hiện tại:** [Thanh_cloud_data.md](docs/Thanh_cloud_data/Thanh_cloud_data.md) — ECS Fargate, PostgreSQL Multi-AZ/pgvector, S3, connectors, mạng, cache/queue và HA/backup/DR; staging workspace 100 GiB.
- Subtotal phần đã định giá: **1.436,46 USD/tháng ở 2.000 DAU**, **2.520,57 USD/tháng ở 4.000 DAU**, chưa VAT; còn 2 dòng PENDING được thu hẹp. Đây không phải TOTAL của nhóm.
- [TSV 2.000 DAU](docs/Thanh_cloud_data/Thanh_cost_2000.tsv), [TSV 4.000 DAU](docs/Thanh_cloud_data/Thanh_cost_4000.tsv), [3 slide nội dung](docs/Thanh_cloud_data/Thanh_3_slides.md), [sơ đồ Mermaid](docs/Thanh_cloud_data/Thanh_cloud_data_architecture.mmd).
- [Hướng dẫn ghép cho Phúc](docs/Thanh_cloud_data/Phuc_handoff.md) và [kết quả rà PENDING trong repo](docs/Thanh_cloud_data/Repo_pending_review.md): không cộng trùng monitoring/ECR/S3 audit/mạng; token vault của Tú đã có giá 8,80 USD/tháng, monitoring cơ bản 17,96 USD/tháng.
- Có 34 ảnh bằng chứng thực tế, catalog AWS gốc, SKU/rateCode và SHA-256 trong `docs/Thanh_cloud_data/`. Chạy `python docs/Thanh_cloud_data/recalculate.py` để tính lại độc lập bằng Python chuẩn.
- [Nhiệm vụ 2 cũ](docs/VBot_Nhiem_vu_2_Thanh.md) giữ làm lịch sử tham khảo; không cộng gộp với bản mới. `G03.md`/XLSX/slide chung chưa thay bằng subtotal mới, Phúc cần ghép trước khi nộp.

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
- Tổng working estimate: 16.774,36 USD/tháng, chưa VAT; image generation và một số availability/benchmark gate còn blocker.
- Bedrock dùng APAC Geo Cross-Region từ Singapore qua PrivateLink; prompt/output có thể tới destination Region trong APAC.
- Nova Canvas không dùng vì EOL 2026-09-30; 90.000 ảnh vẫn là blocker, chưa cộng model ảnh thay thế chưa xác minh.
