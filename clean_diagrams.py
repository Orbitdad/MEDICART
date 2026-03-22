import re

with open("extracted_diagrams.md", "r", encoding="utf-8") as f:
    content = f.read()

# Split by Diagram headings
diagrams = re.split(r"## Diagram \d+\n\n", content)
header = diagrams[0]
diagram_blocks = diagrams[1:]

cleaned_blocks = []
for i, block in enumerate(diagram_blocks, 1):
    # Find the mermaid block
    match = re.search(r"```mermaid\n(.*?)\n```", block, re.DOTALL)
    if match:
        code = match.group(1).strip()
        # Remove any non-mermaid text that might have been accidentally included
        # Mermaid code blocks in my extraction might have trailing text before the ```
        # Let's refine the split
        lines = code.split('\n')
        cleaned_lines = []
        for line in lines:
            # Heuristic: stop if we see something that looks like regular text or section numbers
            if re.match(r"^\d+\.\d+", line.strip()) or line.strip().startswith("Critical Path") or line.strip().startswith("Table ") or line.strip().startswith("Figure ") or line.strip().startswith("CHAPTER"):
                break
            cleaned_lines.append(line)
        
        final_code = "\n".join(cleaned_lines).strip()
        cleaned_blocks.append(f"## Diagram {i}\n\n```mermaid\n{final_code}\n```\n\n")

with open("extracted_diagrams_cleaned.md", "w", encoding="utf-8") as f:
    f.write(header + "\n" + "".join(cleaned_blocks))

print(f"Cleaned {len(cleaned_blocks)} diagrams into extracted_diagrams_cleaned.md")
