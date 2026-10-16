### Giới hạn kiểm chứng thực tế

- **Cloud:** AWS Asia Pacific (Singapore) — `ap-southeast-1`, 2 Availability Zones.
- **LLM:** Amazon Bedrock API với Nova Micro, Nova Lite và Nova Pro.
- **Báo giá:** Sử dụng đơn giá niêm yết công khai tại Singapore, có ảnh chụp và nguồn AWS.
- **Giới hạn:** Tài khoản AWS thực hành hiện bị giới hạn tại Sydney (`ap-southeast-2`), chưa thể kiểm thử trực tiếp tại Singapore.
- **H6 — Độ trễ:** Thiết kế hướng tới TTFT p95 ≤ 3 giây, chưa có kết quả benchmark thực tế.
- **H8 — Chất lượng:** Đề xuất phương pháp đánh giá từng cấp so với model tham chiếu, mục tiêu ≥ 95%, chưa có kết quả kiểm chứng.

**Kết luận:** Đây là phương án kiến trúc production được đề xuất và dự toán chi phí, chưa phải hệ thống đã triển khai và nghiệm thu.
