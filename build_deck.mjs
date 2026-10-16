import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import { PDFDocument } from "pdf-lib";

const root = new URL(".", import.meta.url).pathname;
const outDir = path.join(root, ".deck-build");
await fs.mkdir(outDir, { recursive: true });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });
const C = { ink: "#0D1B26", muted: "#4F6270", blue: "#0B6E99", pale: "#D9EDF6", green: "#15803D", orange: "#B45309", red: "#B91C1C", white: "#FFFFFF", line: "#D2DCE3", dark: "#123447" };

function text(slide, value, left, top, width, height, fontSize = 20, color = C.ink, bold = false) {
  const s = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  s.text = value;
  s.text.style = { fontSize, color, bold, fontFamily: "Arial" };
  return s;
}
function box(slide, value, left, top, width, height, fill = C.white, fontSize = 18, color = C.ink) {
  const s = slide.shapes.add({ geometry: "roundRect", position: { left, top, width, height }, fill, line: { style: "solid", fill: C.line, width: 1 }, borderRadius: "rounded-lg" });
  s.text = value;
  s.text.style = { fontSize, color, bold: true, fontFamily: "Arial" };
  s.text.paragraphFormat = { alignment: "center", verticalAlignment: "middle" };
  return s;
}
function base(title, subtitle, index) {
  const s = deck.slides.add();
  s.background.fill = "#F2F5F7";
  text(s, "VBOT WORKPLACE · G03", 56, 30, 300, 22, 13, C.blue, true);
  text(s, title, 56, 68, 1120, 52, 34, C.ink, true);
  text(s, subtitle, 56, 124, 1160, 28, 17, C.muted);
  text(s, `${String(index).padStart(2, "0")} / 12`, 1150, 30, 80, 22, 13, C.muted, true);
  return s;
}
function footer(slide, value = "AWS ap-southeast-1 · 2 AZ · USD/tháng chưa VAT") { text(slide, value, 56, 680, 1160, 20, 12, C.muted); }
function columns(slide, leftTitle, leftText, rightTitle, rightText, top = 205) {
  box(slide, leftTitle, 56, top, 535, 42, C.pale, 19, C.blue);
  text(slide, leftText, 72, top + 60, 500, 330, 19, C.ink);
  box(slide, rightTitle, 640, top, 535, 42, C.white, 19, C.blue);
  text(slide, rightText, 656, top + 60, 500, 330, 19, C.ink);
}

{
  const s = base("Giả định và tính tải", "Nguồn sự thật: sizing.py · token/model-call là giả định trước telemetry", 1);
  box(s, "Học viên: Trần Tuấn Tú · 2A202602840    |    Đinh Ngọc Đức · 2A202602935    |    Nguyễn Đình Phúc · 2A202602953\nNguyễn Việt Thành · 2A202602924    |    Đoàn Tuấn Long · 2A202602609", 56, 160, 1160, 42, C.white, 13);
  box(s, "1.760M\nrequests/tháng", 56, 215, 210, 110, C.white, 23);
  box(s, "2.376M\nmodel calls", 286, 215, 210, 110, C.pale, 23);
  box(s, "9.636B input\n1.452B output", 516, 215, 230, 110, C.white, 22);
  box(s, "6.67 req/s\n9.00 calls/s peak", 766, 215, 220, 110, C.white, 21);
  box(s, "6.100 GB\nprod + stage", 1006, 215, 210, 110, C.pale, 22);
  columns(s, "Công thức", "2.000 DAU × 22 × 40 = 1.760.000 requests\n\nGiờ hành chính = 220h\n1.760.000 ÷ 792.000s = 2,22 req/s\n×3 peak = 6,67 req/s\n\n400.000 sandbox workload × 30s", "Phạm vi", "90.000 ảnh/tháng là volume riêng.\n\nProduction storage: 2.000 × 3 GB = 6.000 GB\nStaging storage: 100 GB\n\nFargate billing theo lifetime; sandbox cost dùng handoff Tú 80s billable giả định.", 385);
  footer(s);
}
{
  const s = base("Kiến trúc tổng thể", "Mỗi hộp gắn mã component của báo giá", 2);
  box(s, "User\nSSO/MFA\nauthn", 56, 250, 155, 94, C.pale, 18);
  text(s, "→", 220, 278, 36, 30, 28, C.blue, true);
  box(s, "WAF + ALB\nnetwork / load_balancer", 260, 250, 210, 94, C.white, 17);
  text(s, "→", 480, 278, 36, 30, 28, C.blue, true);
  box(s, "Fargate app\ncompute / gateway", 520, 250, 200, 94, C.white, 17);
  text(s, "→", 730, 278, 36, 30, 28, C.blue, true);
  box(s, "Bedrock routing\nllm / embedding", 770, 250, 190, 94, C.pale, 17);
  text(s, "→", 970, 278, 36, 30, 28, C.blue, true);
  box(s, "Response\nstream", 1010, 250, 170, 94, C.white, 18);
  box(s, "Aurora PostgreSQL\ndatabase / vector_db", 230, 430, 220, 90, C.white, 16);
  box(s, "S3 workspace\nobject_storage", 485, 430, 200, 90, C.white, 16);
  box(s, "Fargate WASI\nsandbox", 720, 430, 180, 90, "#FFF5E8", 17);
  box(s, "OAuth + KMS\nsecrets_kms / connectors", 935, 430, 245, 90, C.white, 16);
  text(s, "cache_queue · backup_dr · monitoring · governance · cicd", 300, 570, 700, 28, 19, C.green, true);
  footer(s, "Reference architecture · Singapore proposed; account testing currently limited to Sydney");
}
{
  const s = base("Luồng xử lý một request", "Một request có thể có nhiều LLM calls; tool call không tự sinh thêm LLM call", 3);
  const steps = ["1  Authn\nJWT + MFA", "2  Authz\nRLS + ACL", "3  RAG\npgvector", "4  Model\nroute + stream", "5  Tool\napproval", "6  Audit\nresponse"];
  steps.forEach((v, i) => { box(s, v, 56 + i * 197, 255, 165, 96, i === 3 ? C.pale : C.white, 17); if (i < steps.length - 1) text(s, "→", 224 + i * 197, 284, 25, 25, 25, C.blue, true); });
  columns(s, "Data boundaries", "Connector content is untrusted.\n\nACL is filtered before top-K retrieval and checked again before download.\n\nOAuth token remains ciphertext; only broker can decrypt.", "Side effects", "send_email / create_ticket / delete_file require approval nonce.\n\nSandbox receives only the authorized job input.\n\nAudit records decision and actor without raw secrets.");
  footer(s);
}
{
  const s = base("Model routing và LLM serving", "Baseline theo bảng giá Singapore do nhóm ghi nhận; chưa thay benchmark bằng giả định", 4);
  box(s, "C1 · Nova Micro\n1 call/request\n2.376B in · 316.8M out", 56, 220, 250, 125, C.pale, 18);
  box(s, "C2 · Nova Lite\n1 call/request\n1.760B in · 264M out", 330, 220, 250, 125, C.white, 18);
  box(s, "C3 · Nova Lite\n2 calls/request\n2.376B in · 369.6M out", 604, 220, 250, 125, C.white, 18);
  box(s, "C4 · Nova Pro\n3 calls/request\n2.640B in · 422.4M out", 878, 220, 250, 125, C.pale, 18);
  text(s, "C5 · Nova Lite: 1 text call/request · 484M input · 79.2M output · image call tách riêng", 56, 400, 1080, 30, 20, C.ink, true);
  columns(s, "Monthly token estimate", "Nova Micro: $171.23\nNova Lite C2/C3/C5: $605.17\nNova Pro: $4,675.97\n\nLLM subtotal: $5,452.37/month", "Known blocker", "Nova Canvas v1 reached EOL 2026-09-30.\n\n90.000 images remain a requirement, but no production image model is included until a supported replacement is verified.\n\nNo quality score is claimed.");
  footer(s);
}
{
  const s = base("Vì sao API thay vì GPU/hybrid", "Định hướng chi phí thấp nhất với tải bursty và chưa có throughput GPU đo được", 5);
  columns(s, "Bedrock API · chọn baseline", "• Không giữ GPU 24/7\n• Chi phí gắn model calls/token\n• Scale theo request và peak\n• Private endpoint + APAC routing\n• Dễ đổi model sau eval gate", "GPU/hybrid · chưa chốt", "• Cần giá GPU, throughput thực đo\n• Phải cộng replica HA, model storage, network và 1–2 FTE\n• Chưa có benchmark TTFT/quality\n• Chỉ chọn khi total GPU < API và đạt H6/H8\n\nKết luận này là quyết định kiến trúc, chưa phải benchmark.");
  footer(s, "Model availability, data residency và pricing cần xác minh trong pilot Singapore");
}
{
  const s = base("Connectors và phân quyền", "Identity của user đi xuyên từ IdP đến DB, S3, vector và tool", 6);
  columns(s, "Identity", "Corporate IdP → Cognito federation → signed JWT\n\nRBAC: employee / manager / admin\nABAC: tenant, department, classification\n\nOAuth delegated scope tối thiểu; refresh token ciphertext trong DB.", "Enforcement", "PostgreSQL RLS không BYPASSRLS\n\nS3 prefix: users/{user_id}/...\n\nACL trước vector top-K và trước presigned URL\n\nSide effect cần approval nonce + re-authorize.");
  footer(s, "authn · authz · connectors · database · vector_db · object_storage · secrets_kms");
}
{
  const s = base("Workspace riêng và sandbox", "Fargate + WASI guest: giới hạn capability thay vì tuyên bố zero-risk", 7);
  box(s, "400k production\n20k staging\n80s billable estimate", 56, 225, 260, 115, "#FFF5E8", 21);
  box(s, "0.5 vCPU · 1 GB\n120s hard timeout\n1 MB output", 346, 225, 260, 115, C.white, 20);
  box(s, "No NAT/IGW\nECR/Logs/S3 endpoints\nno task role", 636, 225, 260, 115, C.pale, 19);
  box(s, "128 task peak\n64 vCPU\nquota ≥96 vCPU pending", 926, 225, 260, 115, C.white, 19);
  text(s, "Cùng task không phải security boundary: guest WASI không socket, không host path, không AWS credential. Code native/pip install runtime không nằm trong baseline; nếu cần phải báo giá lại Firecracker/Kata.", 72, 425, 1100, 72, 20, C.ink);
  text(s, "Sandbox cost: $287.46/month · endpoints riêng đã nằm trong sandbox, không cộng lại network.", 72, 555, 1100, 28, 21, C.orange, true);
  footer(s);
}
{
  const s = base("AI governance và data governance", "Guardrails Standard hỗ trợ tiếng Việt nhưng có xử lý cross-Region APAC", 8);
  columns(s, "Before / after inference", "Before: classification → DLP/PII → prompt attack → model\n\nAfter: output guardrail → DLP → ACL → response\n\nConnector data is untrusted; tool result gets separate prompt-attack check.", "Human control", "send_email / ticket / delete file:\nproposal → payload hash → approval nonce → re-authz → execute\n\nAudit 12 months Object Lock\n\nNo raw prompt, token, key in logs.");
  text(s, "Governance + audit subtotal: $1,966.36/month · model/image inference charges are separate.", 56, 610, 1120, 28, 21, C.orange, true);
  footer(s, "H4/H5 designed; guardrail language/residency and H8 safety still require pilot evidence");
}
{
  const s = base("HA, backup và DR", "Thiết kế multi-AZ; RTO/RPO là mục tiêu cần restore test", 9);
  box(s, "2 AZ\nALB + app", 70, 245, 190, 95, C.pale, 20);
  box(s, "RDS PostgreSQL\nMulti-AZ prod", 300, 245, 220, 95, C.white, 19);
  box(s, "S3 workspace\nreplica + Object Lock", 560, 245, 220, 95, C.white, 18);
  box(s, "Backup\nrestore drill", 820, 245, 190, 95, C.pale, 19);
  box(s, "RTO 4h\nRPO 1h", 1040, 245, 150, 95, C.white, 20);
  text(s, "Thành subtotal: $1,436.46/month\n\nNo cross-Region DR cost is added to baseline; loss of Singapore requires a separate regional DR decision and price.", 70, 430, 520, 120, 20, C.ink);
  text(s, "Status\nDesigned: multi-AZ, backup policy, restore path\n\nNot verified: failover, restore timing, 99.5% availability under load", 670, 430, 520, 120, 20, C.ink);
  footer(s, "H7 is a design target until failover and restore drills complete");
}
{
  const s = base("Monitoring và FinOps", "Theo dõi usage ledger thay vì tạo 2.000 metric dimensions", 10);
  columns(s, "Signals", "TTFT p50/p95 · model calls · tokens\n4xx/5xx/throttle · queue age\nsandbox timeout/egress\nACL denies · KMS decrypt anomaly\nGuardrail blocks · budget 50/80/100%", "Cost controls", "Usage ledger theo user/department\n\nQuota theo user + unit\n\nGiảm image/agent cấp cao trước\n\nKhông tắt DLP/audit khi vượt budget\n\nMonitoring subtotal Tú: $25.26/month");
  footer(s, "monitoring · governance · gateway · cache_queue · cicd");
}
{
  const s = base("Chi phí tháng", "TOTAL khớp công thức SUM trong Excel; image generation chưa được cộng", 11);
  const costText = "LLM serving                       $5,452.37\nTú: security/sandbox/ops          $2,321.63\nThành: data/cloud/DR              $1,436.46\nContingency 10%                   $924.94\nEmbedding + gateway + licenses    $38.96\nOps labor                         excluded\n────────────────────────────────────────\nTOTAL                             $10,174.36\n\n$5.09 / DAU / month";
  text(s, costText, 110, 220, 700, 350, 23, C.ink, true);
  box(s, "Priced subtotal\n$9,249.42", 860, 235, 260, 105, C.pale, 22);
  box(s, "Contingency\n$924.94", 860, 370, 260, 105, C.white, 22);
  text(s, "Image generation: 90k volume remains a blocker; Nova Canvas EOL means no unsupported $0.04/image charge is included.", 820, 530, 350, 90, 18, C.red, true);
  footer(s);
}
{
  const s = base("Rủi ro, giới hạn kiểm chứng và mở rộng", "Nộp được hai file; không biến mục tiêu thiết kế thành kết quả đo", 12);
  columns(s, "Chưa thể xác minh", "AWS account thực hành bị giới hạn Sydney; Singapore chưa chạy trực tiếp.\n\nH6: chưa có TTFT p95 ≤3s benchmark.\nH7: chưa có failover/restore drill.\nH8: chưa có ≥95% quality report.\n\nImage production model: blocker.", "Khi lên 4.000 DAU", "Requests, calls, tokens, storage, WAF/egress và guardrail text units tăng gần tuyến tính.\n\nReview quota Fargate ≥96 vCPU, DB tier, queue, log budget.\n\nRerun sizing.py + cost workbook; re-evaluate API/GPU only with measured throughput.");
  text(s, "Kết luận: architecture proposed for Singapore · cost working estimate · open verification items are explicitly listed.", 56, 625, 1160, 28, 20, C.orange, true);
  footer(s, "G03 · 12 slides · 7-minute presentation");
}

for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(outDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
}
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(path.join(root, "G03_slide_students.pptx"));
const pdfDoc = await PDFDocument.create();
for (let i = 1; i <= deck.slides.items.length; i += 1) {
  const bytes = await fs.readFile(path.join(outDir, `slide-${String(i).padStart(2, "0")}.png`));
  const image = await pdfDoc.embedPng(bytes);
  const page = pdfDoc.addPage([1280, 720]);
  page.drawImage(image, { x: 0, y: 0, width: 1280, height: 720 });
}
await fs.writeFile(path.join(root, "G03_slide_students.pdf"), await pdfDoc.save());
console.log("Wrote G03_slide_students.pptx and G03_slide_students.pdf (12 slides)");
