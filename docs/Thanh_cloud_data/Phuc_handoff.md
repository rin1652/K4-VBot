# Bàn giao Phúc — ĐỂ GHÉP BÁO GIÁ

Bản cloud/data cập nhật 16/10/2026, thay phạm vi Thành trong báo giá cũ: ECS Fargate Linux/x86 Singapore; staging 100 GiB; RDS PostgreSQL + pgvector; 2 AZ; 4 private endpoints x2 AZ.

Subtotal đã định giá: 2k **1436.46 USD/tháng**; 4k **2520.57 USD/tháng**. Chưa cộng các dòng PENDING; không dùng làm TOTAL toàn VBot.

Dùng `Thanh_cost_2000.tsv`, `Thanh_cost_4000.tsv`, `Thanh_cloud_data.md`, `Thanh_3_slides.md` và thư mục evidence. Namespace E-code khi ghép: TH-E01...TH-E18; tránh đụng E-code của Model/Tú.

Không cộng lại: app gateway trong Fargate; pgvector trong RDS; cache RAM; S3 audit storage; ALB/WAF/NAT/endpoints/egress dùng chung; KMS workspace/backup; SQS; registry và monitoring đã tính. Không cộng nguyên dòng cũ compute/database/vector/storage/network/load_balancer/cache_queue/backup_dr.

Các dòng KMS/monitoring/ECR/DNS/WAF nằm dưới component Thành quản lý để giữ đúng 9 component; khi chuyển sang `secrets_kms/monitoring/cicd/governance` trong báo giá chung thì trừ khỏi Thành trước.

Tú chốt token vault, auth, sandbox, data-event audit pipeline. Model chốt Bedrock token/embedding/rerank/image, initial indexing và re-embedding. Phúc chốt license hiện hữu, SaaS assessment, nhân sự/support/dự phòng và phạm vi regional DR. RTO/RPO, TTFT, N-1 và 10 phút là gate kiểm thử, chưa có benchmark thực tế.

Không dùng các giá Singapore sai từ G03.md cũ (ví dụ Fargate us-east-1, S3 0.023, ALB nhân 2 vì 2 AZ). Chưa sửa báo giá chung vì các phần thuộc người khác.
