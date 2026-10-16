import fs from "node:fs/promises";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = new URL(".", import.meta.url).pathname;
const out = root + "G03_baogia.xlsx";
const evidenceRows = [
  ["E01", "AWS Bedrock model pricing, Nova Lite/Nova Pro input-output token meters", "https://aws.amazon.com/bedrock/pricing/", "2026-10-16"],
  ["E02", "AWS Fargate Linux ARM vCPU, memory and per-second billing", "https://aws.amazon.com/fargate/pricing/", "2026-10-16"],
  ["E03", "API Gateway HTTP API per million request pricing", "https://aws.amazon.com/api-gateway/pricing/", "2026-10-16"],
  ["E04", "Application Load Balancer hourly and LCU pricing", "https://aws.amazon.com/elasticloadbalancing/pricing/", "2026-10-16"],
  ["E05", "Amazon Cognito user-pool MAU and authentication pricing", "https://aws.amazon.com/cognito/pricing/", "2026-10-16"],
  ["E06", "Aurora Serverless v2 ACU pricing and regional calculator", "https://aws.amazon.com/rds/aurora/pricing/", "2026-10-16"],
  ["E07", "Amazon S3 Standard storage pricing", "https://aws.amazon.com/s3/pricing/", "2026-10-16"],
  ["E08", "ElastiCache node pricing", "https://aws.amazon.com/elasticache/pricing/", "2026-10-16"],
  ["E09", "Amazon SQS request pricing", "https://aws.amazon.com/sqs/pricing/", "2026-10-16"],
  ["E10", "AWS Secrets Manager and KMS pricing", "https://aws.amazon.com/secrets-manager/pricing/", "2026-10-16"],
  ["E11", "AWS VPC NAT Gateway hourly and data-processing pricing", "https://aws.amazon.com/vpc/pricing/", "2026-10-16"],
  ["E12", "AWS WAF web ACL, rule and request pricing", "https://aws.amazon.com/waf/pricing/", "2026-10-16"],
  ["E13", "Amazon CloudWatch logs ingestion and metrics pricing", "https://aws.amazon.com/cloudwatch/pricing/", "2026-10-16"],
  ["E14", "AWS Backup and S3 Glacier Deep Archive pricing", "https://aws.amazon.com/backup/pricing/", "2026-10-16"],
  ["E15", "AWS CodePipeline, CodeBuild and ECR pricing", "https://aws.amazon.com/codepipeline/pricing/", "2026-10-16"],
  ["E16", "AWS region and service availability reference", "https://aws.amazon.com/about-aws/global-infrastructure/regions_az/", "2026-10-16"],
  ["E17", "AWS PrivateLink interface endpoint pricing", "https://aws.amazon.com/privatelink/pricing/", "2026-10-16"],
  ["E18", "Nova Lite APAC Geo inference profile and supported destinations", "https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-lite.html", "2026-10-16"],
  ["E19", "Nova Pro APAC Geo inference profile and supported destinations", "https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-nova-pro.html", "2026-10-16"],
  ["E20", "Titan Image Generator G1 v2 lifecycle, region and endpoint support", "https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-amazon-titan-image-generator-g1-v2.html", "2026-10-16"],
  ["E21", "Claude Opus 5.5 benchmark reference and public token price", "https://www.anthropic.com/claude-opus-5-5", "2026-10-16"],
  ["E22", "Claude Sonnet 5.5 benchmark fallback reference and public token price", "https://www.anthropic.com/claude-sonnet-5-5", "2026-10-16"],
  ["E23", "Titan Text Embeddings V2 price and model availability", "https://aws.amazon.com/blogs/machine-learning/get-started-with-amazon-titan-text-embeddings-v2-a-new-state-of-the-art-embedding-model-on-aws/", "2026-10-16"],
];

const rows = [
  ["compute", "App/API containers và staging", "AWS Fargate Linux ARM, ap-southeast-1. Prod 4 tasks 0.5 vCPU/1GB × 730h; staging 1 task × 220h; rate 0.0000089944 USD/vCPU-s + 0.0000009889 USD/GB-s.", 62.16, "E02"],
  ["llm", "LLM serving theo APAC Geo Cross-Region", "Bedrock apac.amazon.nova-lite-v1:0: 6,512M input × 0.063 + 950.4M output × 0.252; apac.amazon.nova-pro-v1:0: 4,576M × 0.84 + 739.2M × 3.36 USD/1M; agent steps C3=2, C4=3, C5=4; ảnh render SVG/HTML.", 6977.31, "E01; E18; E19; E20"],
  ["embedding", "Embedding và vector hoá tài liệu", "Titan Text Embeddings V2: 50M corpus token + 1,760M query token = 1,810M × 0.02 USD/1M; vector index pgvector trong Aurora; Singapore endpoint.", 36.20, "E06; E23"],
  ["gateway", "HTTP API, quota và budget gateway", "API Gateway HTTP API 1.76M × 1.00 USD/M + 10 budget alarms × 0.10 USD; routing, retry, quota và token log chạy trong app; ap-southeast-1.", 2.76, "E03; E13"],
  ["load_balancer", "Load balancer HA", "ALB 2 AZ × 730h × 0.0225 USD/h + 2 LCU × 730h × 0.008 USD/h; TLS termination và health check; ap-southeast-1.", 43.07, "E04"],
  ["authn", "SSO OIDC/SAML và MFA", "Cognito user pool 2,000 MAU × 0.0055 USD/MAU; SSO liên kết IdP tập đoàn, MFA; ap-southeast-1.", 11.00, "E05"],
  ["authz", "RBAC/ABAC và ACL tài liệu", "Policy enforcement trong app gateway và pgvector metadata filter; chi phí nằm trong Fargate/Aurora, zero incremental USD/month.", 0, "E02; E06"],
  ["database", "CSDL metadata và quyền", "Aurora PostgreSQL Serverless v2 HA 2 AZ: 2 replicas × 0.5 ACU × 730h × 0.12 USD/ACU-h + 100GB × 0.10 USD/GB-month; staging dùng 0.5 ACU 220h.", 98.20, "E06"],
  ["vector_db", "Vector DB và search index", "pgvector extension trong Aurora PostgreSQL, metadata ACL lọc trước truy vấn; chi phí incremental nằm trong dòng database.", 0, "E06"],
  ["object_storage", "Workspace riêng và file", "S3 Standard production 6,000GB + staging 100GB = 6,100GB × 0.023 USD/GB-month; prefix per user, SSE-KMS, lifecycle cho bản cũ.", 140.30, "E07"],
  ["cache_queue", "Cache phiên và hàng đợi", "ElastiCache cache.t4g.small 2 node × 730h × 0.032 USD/h + SQS 1.76M request × 0.40 USD/M; HA 2 AZ.", 47.43, "E08; E09"],
  ["sandbox", "Sandbox chạy code agent", "Fargate ARM sandbox 400,000 lượt × 30s × (0.25 vCPU × 0.0000089944 + 0.5GB × 0.0000009889) USD/s; 60 task slots, no egress, TTL 30s.", 35.98, "E02; E11"],
  ["connectors", "Google/M365/Notion/Jira/Confluence", "OAuth delegated connectors chạy trong app Fargate, rate limit và webhook; phí SaaS bên thứ ba ngoài phạm vi; chi phí incremental AWS bằng 0.", 0, "E02; E10"],
  ["secrets_kms", "Secrets, KMS, token vault", "Secrets Manager 10 secret × 0.40 USD/secret-month + KMS 2 key × 1.00 USD/key-month; OAuth token xoay vòng; ap-southeast-1.", 6.00, "E10"],
  ["backup_dr", "Backup, RTO/RPO và DR", "AWS Backup/S3 Glacier Deep Archive 6,000GB × 0.00099 USD/GB-month + 6,000GB logical backup copy × 0.00099; daily backup, RPO 1h, RTO 4h.", 11.88, "E14"],
  ["monitoring", "Logs, metrics, traces và LLM observability", "CloudWatch Logs 20GB ingest × 0.50 USD/GB + 100 custom metrics × 0.30 USD/metric-month + alarms 10 × 0.10 USD; 12-month archive S3.", 43.00, "E13; E07"],
  ["governance", "Guardrail, DLP, audit, eval gate", "Guardrail/DLP policy engine chạy trong app Fargate; audit 12 tháng lưu S3; eval gate trong CI/CD; chi phí incremental AWS bằng 0.", 0, "E02; E07; E15"],
  ["network", "VPC, NAT, WAF và Bedrock PrivateLink", "2 NAT × 730h × 0.059 + 50GB NAT × 0.059 + WAF 1 ACL/2 rule/1.76M request + 1 Bedrock interface endpoint/AZ × 2 AZ × 730h × 0.01 + 50GB endpoint × 0.01; private subnets, sandbox no egress.", 118.20, "E11; E12; E17"],
  ["cicd", "CI/CD, registry, IaC, staging", "CodePipeline 1 pipeline × 1 USD + CodeBuild 10h × 0.005 USD/min × 60 + ECR 10GB × 0.10 USD/GB-month; staging deploy mỗi ngày.", 4.00, "E15"],
  ["ops_labor", "SRE/MLOps vận hành", "1 FTE SRE/MLOps × 6,000 USD/tháng; trực giờ hành chính, on-call escalation, model eval và diễn tập DR.", 6000.00, "NA"],
  ["licenses", "License phần mềm và support", "OSS policy engine, pgvector và OpenTelemetry dưới license cộng đồng; paid SaaS ngoài phạm vi; chi phí license incremental = 0 USD/tháng.", 0, "E06; E13"],
  ["contingency", "Dự phòng", "10% × subtotal trước dự phòng; bao phủ biến động request, log và egress; tính từ các dòng chi phí bên trên.", 0, "NA"],
];
const subtotal = rows.reduce((s, r) => s + r[3], 0);
rows[rows.length - 1][3] = Math.round(subtotal * 0.10 * 100) / 100;
const total = Math.round((subtotal + rows[rows.length - 1][3]) * 100) / 100;

const workbook = Workbook.create();
const quote = workbook.worksheets.add("BaoGia");
const evidence = workbook.worksheets.add("BangChung");
quote.showGridLines = false;
evidence.showGridLines = false;
quote.getRange("A1:E1").values = [["Component", "Ý nghĩa", "Ghi chú", "Chi phí/tháng (USD)", "Bằng chứng"]];
quote.getRange(`A2:E${rows.length + 1}`).values = rows.map(r => [r[0], r[1], r[2], r[3], r[4]]);
quote.getRange(`A${rows.length + 2}:E${rows.length + 2}`).values = [["TOTAL", "Tổng hạ tầng + vận hành", "Tổng các dòng chi phí; USD/tháng, chưa VAT; 2,000 DAU.", total, ""]];
quote.getRange(`D${rows.length + 2}`).formulas = [[`=SUM(D2:D${rows.length + 1})`]];
quote.getRange("A1:E1").format = { fill: "#0B6E99", font: { color: "#FFFFFF", bold: true }, wrapText: true, verticalAlignment: "center" };
quote.getRange(`A2:E${rows.length + 2}`).format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#D2DCE3" } };
quote.getRange(`D2:D${rows.length + 2}`).format.numberFormat = [["0.00"]];
quote.getRange(`A${rows.length + 2}:E${rows.length + 2}`).format = { fill: "#E8EEF2", font: { bold: true }, wrapText: true };
quote.getRange("A:A").format.columnWidth = 18;
quote.getRange("B:B").format.columnWidth = 28;
quote.getRange("C:C").format.columnWidth = 82;
quote.getRange("D:D").format.columnWidth = 20;
quote.getRange("E:E").format.columnWidth = 18;
quote.freezePanes.freezeRows(1);

evidence.getRange("A1:E1").values = [["evidence_id", "Mô tả", "Link", "Ngày chụp", "Ảnh chụp / ghi nhận"]];
evidence.getRange(`A2:E${evidenceRows.length + 1}`).values = evidenceRows.map(r => [...r, "Trang giá mở ngày 2026-10-16; cập nhật lại screenshot trước khi nộp nếu AWS thay đổi SKU."]);
evidence.getRange("A1:E1").format = { fill: "#0B6E99", font: { color: "#FFFFFF", bold: true }, wrapText: true };
evidence.getRange(`A2:E${evidenceRows.length + 1}`).format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#D2DCE3" } };
evidence.getRange("A:A").format.columnWidth = 14;
evidence.getRange("B:B").format.columnWidth = 48;
evidence.getRange("C:C").format.columnWidth = 58;
evidence.getRange("D:D").format.columnWidth = 16;
evidence.getRange("E:E").format.columnWidth = 70;
evidence.freezePanes.freezeRows(1);

await workbook.recalculate();
const check = await workbook.inspect({ kind: "region", sheetId: "BaoGia", range: `A1:E${rows.length + 2}`, maxChars: 2000 });
console.log(check.ndjson);
await (await SpreadsheetFile.exportXlsx(workbook)).save(out);
console.log(`Wrote ${out}; subtotal=${subtotal.toFixed(2)} contingency=${rows.at(-1)[3].toFixed(2)} total=${total.toFixed(2)}`);
