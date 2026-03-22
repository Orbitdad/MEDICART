import docx

doc = docx.Document("temp_read.docx")
lines = []
for i, para in enumerate(doc.paragraphs):
    if "MERMAID" in para.text or "mermaid" in para.text:
        lines.append(f"Line {i}: {para.text[:100]}")
    elif para.text.strip().startswith("graph") or para.text.strip().startswith("flowchart") or para.text.strip().startswith("sequenceDiagram") or para.text.strip().startswith("erDiagram") or para.text.strip().startswith("classDiagram") or para.text.strip().startswith("gantt"):
        lines.append(f"Line {i} START DIAGRAM: {para.text[:100]}")

with open("docx_structure.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
