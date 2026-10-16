import fs from "node:fs/promises";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import { PDFDocument } from "pdf-lib";

const root = new URL(".", import.meta.url).pathname;
const outDir = root + ".deck-build";
await fs.mkdir(outDir, { recursive: true });
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const colors = { ink: "#0D1B26", muted: "#4F6270", blue: "#0B6E99", pale: "#D9EDF6", green: "#15803D", orange: "#B45309", white: "#FFFFFF", line: "#D2DCE3" };
function box(slide, text, left, top, width, height, fill = colors.white, fontSize = 17, color = colors.ink) {
  const s = slide.shapes.add({ geometry: "roundRect", position: { left, top, width, height }, fill, line: { style: "solid", fill: colors.line, width: 1 }, borderRadius: "rounded-lg" });
  s.text = text;
  s.text.style = { fontSize, color, bold: true, fontFamily: "Arial" };
  s.text.paragraphFormat = { alignment: "center", verticalAlignment: "middle" };
  return s;
}
function text(slide, value, left, top, width, height, fontSize = 18, color = colors.ink, bold = false) {
  const s = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { style: "solid", fill: "none", width: 0 } });
  s.text = value;
  s.text.style = { fontSize, color, bold, fontFamily: "Arial" };
  return s;
}

{
  const s = deck.slides.add();
  s.background.fill = "#F2F5F7";
  text(s, "VBOT WORKPLACE", 64, 42, 300, 24, 14, colors.blue, true);
  text(s, "Giả định tải và lựa chọn cloud", 64, 82, 760, 54, 38, colors.ink, true);
  text(s, "2.000 DAU · AWS ap-southeast-1 · APAC Geo Cross-Region · chưa VAT", 64, 145, 900, 28, 19, colors.muted, false);
  box(s, "1.76M\nrequest/tháng", 64, 230, 220, 122, colors.white, 24);
  box(s, "9.636B input\n1.452B output token", 302, 230, 250, 122, colors.pale, 22);
  box(s, "6.67 req/s\nđỉnh 3x", 570, 230, 190, 122, colors.white, 24);
  box(s, "6,667 billable\ntask-h/tháng", 778, 230, 220, 122, colors.white, 22);
  box(s, "6,100 GB\nworkspace", 1016, 230, 200, 122, colors.white, 22);
  text(s, "Công thức chính", 64, 400, 240, 26, 18, colors.blue, true);
  text(s, "2,000 × 22 × 40 = 1.76M request\n1.76M ÷ 220h ÷ 3,600 = 2.22 req/s; × 3 = 6.67 req/s\n2.376M model calls; 9.636B input + 1.452B output token\n400,000 × minimum 60s ÷ 3,600 = 6,667 billable task-hours\n2,000 × 3 GB + 100 GB staging = 6,100 GB", 64, 438, 560, 180, 18, colors.ink, false);
  text(s, "Lựa chọn chi phí", 700, 400, 240, 26, 18, colors.blue, true);
  text(s, "• Bedrock API qua PrivateLink; không giữ GPU chạy 24/7\n• Routing Lite C1–3 / Pro C4–5 là baseline để benchmark; không dùng agent-step để nhân token\n• Titan Image G1 v2 không dùng: legacy/EOL; ảnh SVG/HTML là giả định cần benchmark\n• Titan Embeddings V2 + S3 + pgvector trong Aurora; giá LLM/sandbox PENDING_VERIFICATION", 700, 438, 510, 190, 17, colors.ink, false);
  text(s, "TOTAL working estimate 12,814.26 USD/tháng · 6.41 USD/DAU/tháng", 64, 650, 1120, 30, 21, colors.orange, true);
}

{
  const s = deck.slides.add();
  s.background.fill = "#F2F5F7";
  text(s, "VBOT WORKPLACE", 64, 42, 300, 24, 14, colors.blue, true);
  text(s, "Kiến trúc và luồng một request", 64, 82, 820, 54, 38, colors.ink, true);
  text(s, "H1–H8 được gắn vào node, dữ liệu và guardrail; benchmark là gate trước production", 64, 145, 1050, 28, 18, colors.muted, false);
  box(s, "User\nSSO/MFA\nauthn", 64, 240, 150, 100, colors.pale, 19);
  text(s, "→", 222, 270, 40, 32, 28, colors.blue, true);
  box(s, "WAF + ALB\nnetwork / load_balancer", 270, 240, 200, 100, colors.white, 17);
  text(s, "→", 478, 270, 40, 32, 28, colors.blue, true);
  box(s, "Fargate app\ncompute / gateway", 526, 240, 200, 100, colors.white, 17);
  text(s, "→", 734, 270, 40, 32, 28, colors.blue, true);
  box(s, "Bedrock APAC Geo\nllm + embedding", 782, 240, 190, 100, colors.pale, 17);
  text(s, "→", 980, 270, 40, 32, 28, colors.blue, true);
  box(s, "stream token\nresponse", 1028, 240, 170, 100, colors.white, 18);
  box(s, "Aurora + pgvector\ndatabase / vector_db\nACL filter", 270, 420, 210, 100, colors.white, 16);
  box(s, "S3 workspace\nobject_storage\nper-user KMS", 510, 420, 210, 100, colors.white, 16);
  box(s, "Fargate sandbox\nsandbox\nno egress · TTL 30s", 750, 420, 210, 100, "#FFF5E8", 16);
  box(s, "OAuth connectors\nsecrets_kms\nqueue / cache", 990, 420, 210, 100, colors.white, 16);
  text(s, "PrivateLink giữ entry point ở Singapore; APAC Geo có thể xử lý ở destination APAC; sandbox trả result; user xác nhận hành động ghi", 270, 552, 930, 28, 16, colors.muted, false);
  text(s, "H2/H3", 64, 616, 92, 24, 16, colors.green, true);
  text(s, "SSO · RBAC/ABAC · workspace tách user · OAuth scope tối thiểu", 158, 616, 470, 24, 16, colors.ink, false);
  text(s, "H4/H5/H7/H8", 650, 616, 120, 24, 16, colors.green, true);
  text(s, "DLP · audit 12 tháng · multi-AZ · backup RPO 1h · golden set 100 mẫu", 780, 616, 420, 24, 15, colors.ink, false);
}

for (const [i, slide] of deck.slides.items.entries()) {
  const png = await deck.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(`${outDir}/slide-${String(i + 1).padStart(2, "0")}.png`, new Uint8Array(await png.arrayBuffer()));
}
const pptx = await PresentationFile.exportPptx(deck);
await pptx.save(root + "G03_slide.pptx");
const pdfDoc = await PDFDocument.create();
for (let i = 1; i <= deck.slides.items.length; i += 1) {
  const pngBytes = await fs.readFile(`${outDir}/slide-${String(i).padStart(2, "0")}.png`);
  const image = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([1280, 720]);
  page.drawImage(image, { x: 0, y: 0, width: 1280, height: 720 });
}
await fs.writeFile(root + "G03_slide.pdf", await pdfDoc.save());
console.log("Wrote G03_slide.pptx and G03_slide.pdf");
