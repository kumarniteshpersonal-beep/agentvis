from difflib import SequenceMatcher

def get_best_match(output_text: str, tool_input: str) -> dict:
    matcher = SequenceMatcher(None, output_text, tool_input)
    blocks = matcher.get_matching_blocks()
    real_blocks = [b for b in blocks if b.size > 0]
    if not real_blocks:
        return None

    best_block = max(real_blocks, key=lambda b: b.size)
    coverage = best_block.size / len(tool_input)

    return {
        "start": best_block.a,
        "end": best_block.a + best_block.size,
        "matched_text": output_text[best_block.a: best_block.a + best_block.size].strip(),
        "coverage": coverage,
    }