def normalize_content(content: str | list[dict] | None) -> str | list[dict]:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    
    normalized_content = []
    for item in content:
        if isinstance(item,str):
            normalized_content.append({"type": "text", "text": item})
        elif isinstance(item,dict):
            match item.get("type",""):
                case "text":
                    normalized_content.append({
                        "type": "text",
                        "text": item.get("text")
                    })

                case "thinking" | "reasoning":
                    normalized_content.append({
                        "type": "reasoning",
                        "reasoning": item.get("thinking") or item.get("reasoning")
                    })

                case "image" | "image_url":
                    normalized_content.append({
                        "type": "image",
                        "url": (
                            item.get("url")
                            or item.get("image_url", {}).get("url")
                        )
                    })

                case _:
                    normalized_content.append(item)

    return normalized_content if normalized_content else ""