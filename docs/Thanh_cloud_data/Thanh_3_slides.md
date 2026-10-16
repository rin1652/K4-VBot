## 11. Nội dung 3 slide

### Slide 1 — Connectors & phân quyền

**Thông điệp:** Index tăng tốc tìm kiếm; quyền gốc quyết định dữ liệu được gửi AI.

- Gmail/Calendar đọc live; Drive/SharePoint/Notion/Jira/Confluence đồng bộ delta vào pgvector; Teams chỉ endpoint delegated đã kiểm.
- OAuth theo user, scope tối thiểu; không tài khoản admin toàn tenant. Webhook/poll→SQS→ingest; mục tiêu freshness5 phút có last-sync.
- SQL/RLS lọc tenant/user/group; kiểm lại quyền+version tại nguồn trước prompt/reranker; lỗi kiểm quyền thì deny.
- Thu hồi ACL/xóa→tombstone, tăng ACL epoch, xóa vector/cache; Notion không chứng minh được user-level quyền thì không bật cho user đó.
- Adapter nằm compute; license/premium API/security assessment PENDING; Gmail polling tránh bỏ sót Pub/Sub ngoài AWS.

**Lời nói (~35s):** Mỗi người kết nối nguồn bằng quyền của mình. Chúng ta index để tìm nhanh nhưng không tin ACL cũ trong index: tài liệu ứng viên phải qua kiểm quyền nguồn trước khi vào AI. Khi nguồn lỗi, hệ thống giảm chức năng thay vì mở quyền. Chi phí connector gồm worker, embedding, mạng và license nếu có; không thể coi mọi API là miễn phí.

### Slide 2 — HA / Backup / DR

**Thông điệp:** Hai AZ giữ dịch vụ khi mất AZ; backup riêng bảo vệ lỗi logic.

- API+worker hai AZ; ALB health routing; RDS Multi-AZ primary/standby; NAT và4 endpoint mỗi AZ, S3/SQS regional.
- Mất AZ10:00: route target sống, worker retry idempotent, RDS failover/DNS reconnect; N-1 phải load test.
- Availability99,5%/220h=66 phút lỗi/tháng. PITR+backup RDS; S3 versioning+replica account backup và Object Lock.
- RTO≤4h/RPO≤1h là gate diễn tập, có alarm latest-restorable-time/replication lag; kiểm restore hằng tháng, mất AZ hằng quý.
- DR cả region là phương án bổ sung ngoài baseline, chưa định giá; không dùng Deep Archive trên đường restore4h.

**Lời nói (~35s):** Khi mất một AZ, ứng dụng tiếp tục qua AZ còn lại và DB tự failover; kết nối đang chạy có thể cần retry. Khi lỗi logic, dùng PITR và workspace replica. Chúng ta đã tính tài nguyên diễn tập, nhưng chỉ biên bản phục hồi có tải mới chứng minh được RTO/RPO, không phải số phút ghi trên slide.

### Slide 3 — Rủi ro & mở rộng

**Thông điệp:** Chi phí tăng theo usage và theo bậc capacity; giữ những phần cố định dùng chung.

- 2k: 1,436.46 USD/tháng;4k: 2,520.57 USD/tháng **subtotal đã định giá**, cộng PENDING và phần Model/Tú/Phúc.
- Giữ2AZ/2NAT/ALB/endpoints; tăng task, DB200GiB/r6g.xlarge,2m vector,12.000GiB current; staging100GiB giữ nguyên.
- Rủi ro chính: corpus/vector chưa đo, ACL nguồn/Notion, SaaS throttle, Bedrock quota, log/DTO, backup lag và RTO restore.
- Agent600s: queue30s+execute510s+persist/notify30s+buffer30s; timeout không đồng nghĩa thành công, đo completion rate dưới N-1.
- Chốt trước go-live: báo cáo đáp ứng H1–H8, embedding dimension, license/API premium, load/eval/restore reports; không cộng trùng S3 audit/mạng/pgvector.

**Lời nói (~35s):** Tăng gấp đôi người dùng không làm mọi khoản tăng gấp đôi: NAT và endpoint vẫn là hai AZ, còn workspace và lưu lượng tăng. Database tăng theo bậc khi RAM/index yêu cầu. Con số subtotal có nguồn giá và công thức; các dòng còn thiếu được giữ PENDING, không được dùng số0 để làm tổng đẹp hơn.

