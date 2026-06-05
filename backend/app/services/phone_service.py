import re

MOROCCO_PHONE_PATTERN = re.compile(r"^(?:0|\+?212)?([67]\d{8})$")


def normalize_morocco_phone(phone: str) -> str | None:
    cleaned = re.sub(r"[\s\-\(\)\.]", "", phone.strip())
    match = MOROCCO_PHONE_PATTERN.match(cleaned)
    if not match:
        return None
    return f"212{match.group(1)}"


def format_display_phone(normalized: str) -> str:
    local = f"0{normalized[3:]}"
    return f"{local[:2]} {local[2:4]} {local[4:6]} {local[6:8]} {local[8:10]}"
