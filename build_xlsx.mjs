import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const root = new URL(".", import.meta.url).pathname;
const out = path.join(root, "G03_baogia.xlsx");
const pending = "PENDING_VERIFICATION";

function parseTsv(text) {
  return text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean).map(line => line.split("\t"));
}

function extractTuRows(text) {
  const block = text.match(/```tsv\n([\s\S]*?)\n```/);
  if (!block) throw new Error("Tu TSV block not found");
  return parseTsv(block[1]).slice(1).filter(row => row[0] !== "TOTAL");
}

function num(value) {
  if (value === "PENDING") return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Non-numeric cost: ${value}`);
  return n;
}

const thanhText = await fs.readFile(path.join(root, "docs/Thanh_cloud_data/Thanh_cost_2000.tsv"), "utf8");
const tuText = await fs.readFile(path.join(root, "Tu_security_ops.md"), "utf8");
const thanhRows = parseTsv(thanhText).slice(1).filter(row => row[0] !== "SUBTOTAL_VERIFIED");
const tuRows = extractTuRows(tuText);

const phucRows = [
  ["llm", "Bedrock text model inference", "Baseline calls from sizing.py: C1 Micro 792000 calls (2376M input, 316.8M output) × 0.047/0.188 USD per 1M; C2 Lite 440000 (1760M, 264M) × 0.081/0.324; C3 Lite 528000 (2376M, 369.6M) × 0.081/0.324; C4 Pro 528000 (2640M, 422.4M) × 1.08/4.32; C5 Lite 88000 (484M, 79.2M) × 0.081/0.324; total 2376000 calls, 9636M input, 1452M output. Price source is team-provided Singapore table; benchmark and account availability remain pending.", 5452.3656, "E60; E61"],
  ["embedding", "Text embedding and vectorization", "Titan Text Embeddings V2 working estimate: 50M corpus tokens + 1760M query tokens = 1810M × 0.02 USD/1M; pgvector storage is already in Thành database line; Singapore availability and measured query volume require pilot verification.", 36.20, "E62"],
  ["gateway", "HTTP API and LLM gateway", "API Gateway HTTP API ap-southeast-1: 1.76M requests × 1.00 USD/M + 10 standard budget/latency alarms × 0.10 USD; quotas, retries and token ledger run in app; no duplicate gateway charge in Thành Fargate.", 2.76, "E63"],
  ["ops_labor", "SRE/MLOps operations", "1 FTE SRE/MLOps × 6000 USD/month; business-hours operations, escalation, model evaluation and DR rehearsal; labor is an explicit planning assumption.", 6000.00, "NA"],
  ["licenses", "SaaS/API licenses and support", "No paid-seat inventory or contract was supplied; license pricing is nằm trong trạng thái PENDING_VERIFICATION and excluded from the working estimate; zero is not a price claim.", 0, `${pending}; https://developers.google.com/terms/api-services-user-data-policy; https://learn.microsoft.com/en-us/graph/overview`],
  ["contingency", "Contingency reserve", "10% × priced subtotal before contingency; covers traffic, log and egress variance; formula is generated in workbook and remains below the 10% cap.", 0, "NA"],
];

const rows = [...thanhRows, ...tuRows, ...phucRows].map(row => {
  let note = row[2];
  note = note.replace(/miễn phí/gi, "không tính thêm");
  if (row[0] === "connectors" && row[1] === "License/quyền API bên thứ ba") {
    note = `${note}; license đang nằm trong trạng thái PENDING_VERIFICATION và chưa đưa vào TOTAL.`;
  }
  return [row[0], row[1], note, num(row[3]), row[4]];
});
const base = rows.reduce((sum, row) => sum + row[3], 0);
const contingency = Math.round(base * 0.10 * 100) / 100;
rows[rows.length - 1][3] = contingency;
const total = Math.round((base + contingency) * 100) / 100;

const evidenceRows = [];
const seen = new Set();
function addEvidence(id, description, link, date, imagePath = null) {
  if (seen.has(id)) return;
  seen.add(id);
  evidenceRows.push({ id, description, link, date, imagePath });
}

const manifest = JSON.parse(await fs.readFile(path.join(root, "docs/Thanh_cloud_data/evidence_manifest.json"), "utf8"));
for (const item of manifest) {
  const id = String(item.code).replace(/^E/, "E");
  const source = String(item.source).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  addEvidence(id, `Thành evidence: ${source}; SHA-256 ${item.sha256}`, item.source.match(/https?:\/\/[^)\s]+/)?.[0] || "https://aws.amazon.com/pricing/", item.capture_date.split(" ")[0], path.join(root, "docs/Thanh_cloud_data", item.file));
}
const tuEvidence = [
  ["E41", "Fargate ARM 60-second minimum and image-pull billing", "https://aws.amazon.com/fargate/pricing/", "Tu_evidence/E-SBX-01_fargate.png"],
  ["E42", "Fargate ARM Singapore vCPU/GB SKU and rate catalog", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonECS/current/ap-southeast-1/index.json", "Tu_evidence/E-CATALOG-01_singapore_skus.png"],
  ["E43", "Sandbox VPC endpoint hourly and data processing rates", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonVPC/current/ap-southeast-1/index.json", "Tu_evidence/E-CATALOG-01_singapore_skus.png"],
  ["E44", "Cognito enterprise federation MAU pricing", "https://aws.amazon.com/cognito/pricing/", "Tu_evidence/E-AUTH-01_cognito.png"],
  ["E45", "IAM and PostgreSQL RLS included mechanisms", "https://aws.amazon.com/iam/pricing/", null],
  ["E46", "KMS key and symmetric API request pricing", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/awskms/current/ap-southeast-1/index.json", "Tu_evidence/E-KMS-01_kms.png"],
  ["E47", "Secrets Manager secret-month and API request pricing", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSSecretsManager/current/ap-southeast-1/index.json", "Tu_evidence/E-SEC-01_secrets.png"],
  ["E48", "Bedrock Guardrails content, PII and image filter pricing", "https://aws.amazon.com/bedrock/pricing/", "Tu_evidence/E-GOV-01_guardrails.png"],
  ["E49", "InvokeGuardrailChecks prompt-attack pricing", "https://aws.amazon.com/bedrock/pricing/", "Tu_evidence/E-GOV-02_prompt_attack.png"],
  ["E50", "CloudTrail data-event pricing", "https://aws.amazon.com/cloudtrail/pricing/", "Tu_evidence/E-AUD-01_cloudtrail.png"],
  ["E51", "S3 audit storage and PUT pricing", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/ap-southeast-1/index.json", "Tu_evidence/E-AUD-02_s3.png"],
  ["E52", "CloudWatch Logs, metrics, alarms and X-Ray pricing", "https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonCloudWatch/current/ap-southeast-1/index.json", "Tu_evidence/E-MON-01_cloudwatch.png"],
  ["E53", "CodePipeline, CodeBuild and ECR pricing", "https://aws.amazon.com/codepipeline/pricing/", "Tu_evidence/E-CICD-01_codebuild.png"],
];
for (const [id, description, link, image] of tuEvidence) addEvidence(id, description, link, "2026-10-16", image ? path.join(root, image) : null);
addEvidence("E60", "Team-recorded Singapore standard token prices: Nova Micro 0.047/0.188, Lite 0.081/0.324, Pro 1.08/4.32 USD per 1M input/output; benchmark/account availability pending", "https://aws.amazon.com/bedrock/pricing/", "2026-10-16", path.join(root, "docs/prices/nova_singapore_standard.png"));
addEvidence("E61", "Nova Micro/Lite/Pro model cards and APAC inference availability; no quality benchmark result", "https://docs.aws.amazon.com/bedrock/latest/userguide/models-region-compatibility.html", "2026-10-16", null);
addEvidence("E62", "Titan Text Embeddings V2 public price reference", "https://aws.amazon.com/blogs/machine-learning/get-started-with-amazon-titan-text-embeddings-v2-a-new-state-of-the-art-embedding-model-on-aws/", "2026-10-16", null);
addEvidence("E63", "API Gateway HTTP API pricing", "https://aws.amazon.com/api-gateway/pricing/", "2026-10-16", null);

const workbook = Workbook.create();
const quote = workbook.worksheets.add("BaoGia");
const evidence = workbook.worksheets.add("BangChung");
quote.showGridLines = false;
evidence.showGridLines = false;
quote.getRange("A1:E1").values = [["Component", "Ý nghĩa", "Ghi chú", "Chi phí/tháng (USD)", "Bằng chứng"]];
quote.getRange(`A2:E${rows.length + 1}`).values = rows;
quote.getRange(`A${rows.length + 2}:E${rows.length + 2}`).values = [["TOTAL", "Tổng hạ tầng + vận hành", `Tổng component đã ghép; working estimate; image generation chưa tính vì Nova Canvas EOL và phương án production thay thế chưa xác minh.`, total, `FORMULA: SUM(D2:D${rows.length + 1})`]];
quote.getRange(`D${rows.length + 2}`).formulas = [[`=SUM(D2:D${rows.length + 1})`]];
quote.getRange("A1:E1").format = { fill: "#0B6E99", font: { color: "#FFFFFF", bold: true }, wrapText: true, verticalAlignment: "center" };
quote.getRange(`A2:E${rows.length + 2}`).format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#D2DCE3" } };
quote.getRange(`D2:D${rows.length + 2}`).format.numberFormat = [["0.00"]];
quote.getRange(`A${rows.length + 2}:E${rows.length + 2}`).format = { fill: "#E8EEF2", font: { bold: true }, wrapText: true };
quote.getRange("A:A").format.columnWidth = 18;
quote.getRange("B:B").format.columnWidth = 31;
quote.getRange("C:C").format.columnWidth = 94;
quote.getRange("D:D").format.columnWidth = 20;
quote.getRange("E:E").format.columnWidth = 30;
quote.freezePanes.freezeRows(1);

evidence.getRange("A1:E1").values = [["evidence_id", "Mô tả", "Link nguồn", "Ngày chụp", "Ảnh chụp thực tế / ghi nhận"]];
evidence.getRange(`A2:E${evidenceRows.length + 1}`).values = evidenceRows.map(e => [e.id, e.description, e.link, e.date, e.imagePath ? `Attached: ${path.basename(e.imagePath)}` : `${pending}: no raster screenshot available for this source`]);
evidence.getRange("A1:E1").format = { fill: "#0B6E99", font: { color: "#FFFFFF", bold: true }, wrapText: true };
evidence.getRange(`A2:E${evidenceRows.length + 1}`).format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: "#D2DCE3" } };
evidence.getRange("A:A").format.columnWidth = 14;
evidence.getRange("B:B").format.columnWidth = 64;
evidence.getRange("C:C").format.columnWidth = 70;
evidence.getRange("D:D").format.columnWidth = 18;
evidence.getRange("E:E").format.columnWidth = 38;
evidence.freezePanes.freezeRows(1);

for (let i = 0; i < evidenceRows.length; i += 1) {
  const e = evidenceRows[i];
  if (!e.imagePath) continue;
  try {
    const bytes = await fs.readFile(e.imagePath);
    const contentType = e.imagePath.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    evidence.images.add({ blob: bytes, contentType, anchor: { from: { row: i + 1, col: 4 }, extent: { widthPx: 220, heightPx: 120 } }, alt: `${e.id} ${e.description}` });
    evidence.getRange(`E${i + 2}`).values = [[`Attached image: ${path.basename(e.imagePath)}`]];
  } catch (error) {
    evidence.getRange(`E${i + 2}`).values = [[`${pending}: ${path.basename(e.imagePath)} unavailable`]];
  }
}

await workbook.recalculate();
const check = await workbook.inspect({ kind: "region", sheetId: "BaoGia", range: `A1:E${rows.length + 2}`, maxChars: 3000 });
console.log(check.ndjson);
await (await SpreadsheetFile.exportXlsx(workbook)).save(out);
console.log(`Wrote ${out}; priced_subtotal=${base.toFixed(2)} contingency=${contingency.toFixed(2)} total=${total.toFixed(2)} components=${new Set(rows.map(r => r[0])).size} evidence=${evidenceRows.length}`);
