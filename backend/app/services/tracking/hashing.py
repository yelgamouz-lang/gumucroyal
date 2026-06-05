import hashlib
import re


def sha256_hash(value: str) -> str:
    return hashlib.sha256(value.strip().lower().encode("utf-8")).hexdigest()


def to_e164_digits(normalized_phone: str) -> str:
    """Normalize Morocco phone to E.164 digits (+212XXXXXXXXX without plus) for CAPI hashing."""
    digits = re.sub(r"\D", "", normalized_phone.strip())
    if digits.startswith("0") and len(digits) == 10:
        digits = f"212{digits[1:]}"
    elif not digits.startswith("212"):
        digits = f"212{digits}"
    return digits


def hash_phone_e164(normalized_phone: str) -> str:
    return sha256_hash(to_e164_digits(normalized_phone))


def hash_name(name: str) -> str:
    return sha256_hash(name.strip().lower())


def split_name_hashes(full_name: str) -> tuple[str, str | None]:
    parts = full_name.strip().split()
    fn = hash_name(parts[0]) if parts else hash_name(full_name)
    ln = hash_name(parts[-1]) if len(parts) > 1 else None
    return fn, ln
