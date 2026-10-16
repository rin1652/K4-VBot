# Handoff phần Tú → nhóm G03

Ngày bàn giao: **2026-10-16**. Chủ sở hữu: **Tú**. Phạm vi duy nhất: `sandbox`, `authn`, `authz`, `secrets_kms`, `governance`, `monitoring`, `cicd`. Region báo giá: AWS `ap-southeast-1`, USD/tháng chưa VAT. Tài liệu này hướng dẫn **ghép**; [Tu_security_ops.md](../Tu_security_ops.md) là nguồn chuẩn cho con số, công thức, cơ chế kỹ thuật, bằng chứng và lời thoại slide. Không dùng số trong `tu_handoff.md` cũ.

## Những gì đã bàn giao

| Artifact | Dùng để làm gì | Trạng thái |
|---|---|---|
| [`Tu_security_ops.md`](../Tu_security_ops.md) | 20 dòng TSV 5 cột, 13 E-code, 2 sơ đồ, 3 slide, 3 đáp án hội đồng | Sẵn để ghép; subtotal riêng Tú **2.321,63 USD/tháng**. |
| [`Tu_evidence/`](../Tu_evidence/) | Ảnh chụp trang giá AWS và ảnh **kết xuất từ AWS Price List JSON** có SKU/Region/rate | Chụp/trích ngày 2026-10-16; ảnh kết xuất được ghi rõ là ảnh dẫn xuất, không giả là AWS Console. |
| `tu_handoff.md` ở gốc | Bản nháp trước khi `task.html` đầy đủ | **Không dùng để ghép**: còn số 256,16 USD và lựa chọn cũ. |

Các giả định gốc dùng chung: 2.000 DAU, 1,76 triệu request/tháng, 2,376 triệu model calls/tháng, 400.000 sandbox runs × 30 giây xử lý, 90.000 ảnh/tháng, prod + staging. Mọi mục Tú tự giả định (thời gian khởi tạo, lượng staging, text units, log GB...) được gắn nhãn trong file chính; chưa phải số đo production.

## Ghép báo giá: thứ tự và ranh giới

1. Trong `G03_baogia.xlsx`/sheet `BaoGia`, **thay hoàn toàn** các dòng cũ có component thuộc bảy component trên bằng **20 dòng thành phần** trong khối TSV của `Tu_security_ops.md`. Giữ nguyên tiêu đề 5 cột của sheet. **Không dán dòng `TOTAL` 2.321,63**, vì `TOTAL` của nhóm phải cộng lại mọi thành viên. Một component có thể có nhiều dòng.
2. Trong `BangChung`, thêm E41–E53 vào cột A–D đúng như bảng bằng chứng file chính; dán ảnh cùng dòng ở cột E. Với E42/E43/E46/E47/E51/E52/E53, dùng thêm [`E-CATALOG-01_singapore_skus.png`](../Tu_evidence/E-CATALOG-01_singapore_skus.png) và URL JSON AWS Singapore để giảng viên nhìn thấy **SKU + Region + đơn giá**. Ảnh này là bản trích xuất tự động từ JSON chính thức, không phải ảnh AWS Console; các ảnh trang giá AWS gốc nằm cạnh nó. Không chỉ dán một link trang giá mặc định US East cho giá Singapore.
3. Tính lại công thức `TOTAL`, `contingency` 10% nếu vẫn giữ chính sách nhóm, và USD/DAU. Các dòng Tú cũ trong `G03.md` hiện cộng **99,98 USD**; thay bằng **2.321,63 USD** làm subtotal trước contingency tăng **2.221,65 USD**, **chỉ là delta của phần Tú**, không phải tổng mới của nhóm. Đặc biệt không đưa `ops_labor` hay contingency vào subtotal Tú lần nữa.
4. Đồng bộ `G03.md`, `build_xlsx.mjs`, workbook đã sinh, `build_deck.mjs` và slide/PDF **sau khi team chốt merge**. Các artifact chung hiện còn ghi sandbox 30 giây, Cognito 0,0055 USD/MAU, governance 0 USD và CloudWatch ingest 0,50 USD/GB. Những dòng đó xung đột với bảng bằng chứng mới. Tú **chưa tự sửa** artifact của người khác để tránh đè phần đang làm dở.
5. Chạy validator trong `task.html` trên workbook cuối: phải có 5 cột, đủ component bắt buộc, E-code hiện diện trong `BangChung`, ghi chú có SKU/Region/rate/quantity và dòng cuối là `TOTAL` chung. Kiểm tổng chi phí bằng công thức workbook sau khi chỉnh dự phòng.

### Map dòng cũ → nhóm dòng mới

| Component | Dòng nhóm hiện tại | Dòng Tú cần đưa vào | Lưu ý ghép |
|---|---:|---:|---|
| `sandbox` | 35,98 | 287,46 | 230,02 compute cho prod+stage **80 giây billable/lượt**; 57,44 cho 6 interface endpoints ở 2 AZ + 50GB xử lý. Đừng tính thêm 6 endpoints này trong `network`. |
| `authn` | 11,00 | 30,75 | Cognito enterprise SAML/OIDC 2.000 MAU prod + 50 MAU staging; MFA cưỡng chế ở IdP, không tính SMS. |
| `authz` | 0,00 | 0,00 | Nằm trong app/DB, **không** đồng nghĩa không cần RLS/ACL/IAM policy. |
| `secrets_kms` | 6,00 | 8,80 | 2 CMK + KMS request + 15 service secrets + API request. OAuth token per-user là ciphertext trong DB, không phải 2.000 Secrets Manager secrets. |
| `governance` | 0,00 | 1.966,36 | Guardrails text, prompt attack, ảnh và staging eval; CloudTrail data events và S3 audit 12 tháng. Tránh cộng lại phí sinh ảnh/model của Phúc. |
| `monitoring` | 43,00 | 25,26 | Logs 20GB ingest + 20GB hot storage, 30 custom metrics, 10 alarms, 880.000 X-Ray spans. Audit dài hạn thuộc `governance`, không nằm trong 20GB CloudWatch. |
| `cicd` | 4,00 | 3,00 | 1 CodePipeline V1, 200 CodeBuild phút, 10GB ECR; staging app/DB do chủ component compute/database tính. |

## Phối hợp Thành: contract cần giữ nguyên khi nối DB/S3/network

- **Định danh dữ liệu:** `tenant_id` + `owner_id/user_id` là scope bắt buộc của tài liệu, chunks, search result, agent run và OAuth grant. PostgreSQL bật RLS trên từng bảng; role phục vụ request không được `BYPASSRLS`; backend chỉ gắn session identity sau khi kiểm JWT hợp lệ, client không thể tự chọn `user_id`.
- **ACL tài liệu theo nguồn:** lưu `source_id`, ACL gốc, `acl_version`, classification và `deleted_at`; lọc ACL **trước vector top-K** và recheck ngay trước khi trả nội dung/presigned URL. Revoke ở connector phải invalidate cache/index. Test user A không thấy B qua direct object path, vector search, stale URL, forged role/session tag.
- **S3 workspace:** key theo `users/{user_id}/...`, giới hạn logic 10GB/user trước PUT bằng usage counter có giao dịch; IAM scoped STS/session tag và bucket policy chỉ cho prefix của principal. Hai CMK là prod/stage, không hứa KMS key riêng mỗi người. Audit bucket Object Lock riêng 18GB steady-state đã tính ở Tú, không cộng vào 6TB workspace của Thành.
- **Sandbox network:** subnet sandbox **không có route tới NAT/Internet Gateway** dù app subnet của nhóm có NAT. Chỉ 3 interface endpoints ECR API, ECR DKR, CloudWatch Logs ở cả 2 AZ và S3 gateway cho image layers. Sáu interface endpoints + 50GB endpoint data **đã nằm trong 57,44 USD dòng sandbox của Tú**, không đưa vào `network` lần nữa. Dispatcher chỉ gửi job đến runner task bằng mTLS; guest WASI không có socket, host mount hay task IAM role.
- **Staging:** tài khoản/VPC/role/bucket/DB/Cognito/KMS tách prod. Tú đã tính sandbox staging 20.000 runs, 50 federated MAU, 1.000 eval cases và phần log chung; Thành phải xác nhận app/DB/S3/network staging của mình đã có giá riêng.

## Phối hợp Phúc: model, Guardrails và H8

- Phúc giữ **model inference và 90.000 lượt sinh ảnh**. Tú chỉ báo thêm **kiểm duyệt ảnh Guardrails** 67,50 USD, **text content + PII Guardrails** 1.782 USD, prompt-attack connector 112,64 USD và eval guardrail staging 0,75 USD. Không gộp các khoản này vào giá token Bedrock của Phúc.
- Đo trên pilot `text_units` thực tế: dự toán 2,376 triệu model calls × (1 input + 2 output units) và 40% request có connector content × 2 units; AWS tính tối đa 1.000 ký tự/unit, không phải 1 unit/token. Trường hợp prompt dài hơn, tổng governance tăng tuyến tính.
- H8 cần model tham chiếu do Phúc nêu tên, dữ liệu test Việt/Anh, điểm mỗi cấp ≥95% tham chiếu, safety không có exfiltration high-severity trong bộ test, diff report và approve trước đổi model/prompt/guardrail version. Phần 1.000 eval inference calls/model tokens nếu phát sinh phải được Phúc tính, Tú mới tính phí Guardrails của lượt eval.
- Guardrails **Standard** hỗ trợ tiếng Việt nhưng dùng cross-Region inference trong cùng geography: primary vẫn Singapore song nội dung có thể xử lý ở Region APAC khác. Nhóm phải được doanh nghiệp **duyệt data residency** và ghi rõ trong H1/H5. Nếu dữ liệu bắt buộc ở Singapore tuyệt đối, phương án Guardrails Standard hiện tại không thể được trình bày là đã đạt; cần bộ lọc tiếng Việt tại chỗ và báo giá lại. Image content filter ở Singapore còn preview, chỉ một số nhóm nội dung; đừng tuyên bố đã kiểm duyệt mọi loại rủi ro ảnh.

## Handoff vận hành/bảo mật cần kiểm trước go-live

| Gate | Cách chứng minh | Chủ trì/phối hợp |
|---|---|---|
| Quota & tải sandbox | AWS Fargate On-Demand quota thực cấp ≥96 vCPU; load test 128 concurrent task, 192 cho headroom/failover một AZ; ghi p50/p95 image pull, billable lifetime, queue wait và job hoàn thành ≤10 phút. Mặc định quota AWS 6 vCPU **không đủ**. | Tú + Thành |
| No-egress/metadata | Trong guest thử DNS/TCP/HTTP tới Internet, RFC1918, `169.254.169.254`, `169.254.170.2`, host path; tất cả phải bị deny. Kiểm route table không NAT/IGW, endpoint policy, không task role và VPC Flow Logs. Không diễn đạt nhầm là **toàn task ENI** không egress: boot vẫn dùng ECR/Logs/S3 endpoints. | Tú |
| Cross-user | Automated negative tests trên DB RLS, S3 scoped role, presigned URL, pgvector ACL và OAuth token decrypt context. Revoke quyền nguồn rồi test lại ngay. | Thành + Tú |
| Hành động có side effect | `send_email`, `create_ticket`, `delete_file` phải có approval nonce một lần gắn `user_id+action+payload_hash`, TTL 5 phút, re-authorize ngay trước execute; thiếu nonce/đổi payload/đổi ACL là deny. | Tú + connector owner |
| Log & data retention | Không ghi prompt/email body/OAuth token/key vào CloudWatch/X-Ray; log 30 ngày, audit S3 Object Lock 12 tháng, restore/hash verification; kiểm Bedrock model-specific retention mode và training terms. | Tú + Phúc |
| FinOps | Usage ledger theo user/phòng ban; CloudWatch metric cardinality thấp; ngân sách và cảnh báo 50/80/100%; đo Guardrails text units, image filters, CloudWatch ingest và endpoint GB. Budget Actions/extra egress ngoài con số đã báo phải được định giá trước khi bật. | Tú + trưởng nhóm |
| Release | CI qua unit/integration/Trivy/secret/IaC policy + H8 eval → staging smoke → manual approve → canary prod → rollback; không tái build artifact giữa staging/prod. | Tú + trưởng nhóm |

## Slide và phần hội đồng

Lấy **nguyên văn 3 khối Slide 1–3** ở mục 4 của [`Tu_security_ops.md`](../Tu_security_ops.md): `Workspace & Sandbox`, `AI & Data Governance`, `Monitoring & FinOps`. Slide Workspace ghép 3 ý DB/S3 của Thành nhưng giữ nguyên điều kiện RLS/ACL và 10GB quota; không dùng chữ “sandbox TTL 30s” vì 30 giây là thời gian **chạy code**, không phải task lifetime/billing. Trước khi xuất deck/PDF, thay chi phí nhóm và mọi callout “3.333 task-hours” vốn bỏ qua mức tính tối thiểu + thời gian khởi tạo.

Ba đáp án hội đồng đã soạn đầy đủ ở mục 5 file chính: (1) prompt injection trong email đòi gửi hợp đồng ra ngoài, (2) code sandbox cố escape hoặc gọi metadata, (3) agent A đọc file B. Người thuyết trình nên nhấn **điểm chặn cuối** tương ứng: approval/policy ngoài LLM; guest không có capability + task isolation; RLS/S3 scoped identity + recheck ACL. Không trả lời chung chung “hệ thống an toàn”.

## Checklist cuối trước khi nộp

- [ ] E41–E53 đã có trong `BangChung`, ảnh ở cùng hàng cột E và URL catalog đúng Singapore.
- [ ] Dòng `TOTAL` riêng Tú **không** nằm giữa bảng báo giá nhóm; `TOTAL` chung ở dòng cuối và contingency đã tính lại.
- [ ] Dòng `sandbox` nhóm không còn 30s/0,25 vCPU/0,5GB hay 60 task slots; screenshot Fargate cho thấy **1-minute minimum** và giá ARM Singapore ở catalog.
- [ ] Authn dùng 0,015 USD/federated MAU; governance không còn 0 USD; CloudWatch ingest dùng 0,70 USD/GB Singapore.
- [ ] Network không đếm lặp 6 endpoints; staging của các chủ component khác có line item; Phúc không đếm lặp image generation và image Guardrails.
- [ ] Đã có quyết định data residency cho Guardrails Standard và bằng chứng quota/load test. Nếu chưa, đánh dấu **điều kiện chưa đạt** trong slide, không đổi thành cam kết.
- [ ] Chạy validator `task.html`, mở lại link giá sát ngày nộp và đối chiếu workbook cuối với `G03.md`/slide/PDF.
