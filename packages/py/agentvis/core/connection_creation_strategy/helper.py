import re

# Common stop words to exclude from matched tokens
STOP_WORDS = frozenset({
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
    "in", "is", "it", "its", "of", "on", "or", "that", "the", "to", "was", "were",
    "will", "with", "this", "but", "they", "have", "had", "what", "when", "where",
    "who", "which", "why", "how", "all", "each", "every", "both", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "just", "can", "should", "now",
})

def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z0-9\-_]+", text.lower())

def get_best_matched_tokens(output_text: str, tool_input: str):
    output_tokens = set(tokenize(output_text))
    input_tokens = tokenize(tool_input)

    matches = []

    for token in input_tokens:
        if token not in STOP_WORDS and token in output_tokens:
            matches.append(token)

    return {
        "matched_tokens": matches
    }