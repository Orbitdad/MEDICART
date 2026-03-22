import docx

doc = docx.Document("temp_read.docx")

markdown_content = "# All Diagrams from MediCart_Complete_BlackBook.docx\n\n"
diagram_count = 0
in_diagram = False
current_diagram = []

for para in doc.paragraphs:
    text = para.text.strip()
    
    # Heuristic to detect start of diagram code
    if text.startswith("flowchart ") or text.startswith("gantt") or text.startswith("erDiagram") or text.startswith("sequenceDiagram") or text.startswith("classDiagram") or text.startswith("stateDiagram"):
        if in_diagram:
            # Somehow missed the end of previous
            markdown_content += f"## Diagram {diagram_count}\n\n```mermaid\n" + "\n".join(current_diagram) + "\n```\n\n"
        in_diagram = True
        diagram_count += 1
        current_diagram = [para.text] # Keep original spacing
        continue
        
    if in_diagram:
        # Stop condition: if we hit a Note, Table, or empty line denoting end.
        # Looking at docx_structure.txt, there are text lines. A Mermaid diagram code usually ends before a normal paragraph.
        # Actually in docx, a code block might be multiple paragraphs
        if text.startswith("[Note:") or text.startswith("Table ") or text.startswith("Figure ") or "CHAPTER" in text:
            in_diagram = False
            markdown_content += f"## Diagram {diagram_count}\n\n```mermaid\n" + "\n".join(current_diagram) + "\n```\n\n"
            current_diagram = []
        else:
            if text != "":
                current_diagram.append(para.text) # Keep original spacing

# Catch last one
if in_diagram and current_diagram:
    markdown_content += f"## Diagram {diagram_count}\n\n```mermaid\n" + "\n".join(current_diagram) + "\n```\n\n"

with open("extracted_diagrams.md", "w", encoding="utf-8") as f:
    f.write(markdown_content)

print(f"Extracted {diagram_count} diagrams metadata to extracted_diagrams.md")
