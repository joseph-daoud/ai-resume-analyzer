import re
import spacy

# Load the English model once when the module is imported
# Loading it once and reusing it is much faster than loading per request
nlp = spacy.load("en_core_web_sm")

# Skill keywords to look for in the resume text
SKILL_KEYWORDS = [
    # Programming languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "swift", "kotlin", "php", "ruby", "scala", "r", "matlab",
    # Web frameworks
    "fastapi", "django", "flask", "react", "vue", "angular", "nextjs",
    "express", "spring", "rails",
    # Databases
    "postgresql", "mysql", "mongodb", "redis", "sqlite", "elasticsearch",
    "cassandra", "dynamodb",
    # Cloud and DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "jenkins",
    "github actions", "ci/cd",
    # AI/ML
    "machine learning", "deep learning", "nlp", "pytorch", "tensorflow",
    "scikit-learn", "pandas", "numpy", "computer vision",
    # General
    "git", "linux", "rest api", "graphql", "microservices", "agile", "scrum",
]


def extract_skills(text: str) -> list[str]:
    """
    Find skill keywords in the resume text.
    Case-insensitive search against our predefined skill list.

    Uses boundary-aware matching (not plain substring containment) so that
    short skills like "r" or "git" only match as standalone words — not as
    substrings inside unrelated words like "user" or "digital".
    """
    text_lower = text.lower()
    found_skills = []
    for skill in SKILL_KEYWORDS:
        # (?<!\w) / (?!\w) check what's immediately outside the match:
        # "not a word character on that side (or start/end of string)".
        # More reliable here than \b, which requires a word/non-word
        # *transition* and breaks for skills ending in symbols like
        # "c++" or "c#" when followed by whitespace.
        pattern = r'(?<!\w)' + re.escape(skill) + r's?(?!\w)'
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    return found_skills


def extract_entities(text: str) -> dict:
    """
    Use spaCy NER to extract named entities from the text.
    Returns organizations, locations, and other relevant entities.
    """
    doc = nlp(text)
    entities = {
        "organizations": [],
        "locations": [],
        "dates": [],
    }
    for ent in doc.ents:
        if ent.label_ == "ORG" and ent.text not in entities["organizations"]:
            entities["organizations"].append(ent.text)
        elif ent.label_ == "GPE" and ent.text not in entities["locations"]:
            entities["locations"].append(ent.text)
        elif ent.label_ == "DATE" and ent.text not in entities["dates"]:
            entities["dates"].append(ent.text)
    return entities


def extract_email(text: str) -> str | None:
    """Extract email address from text using a simple search."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> str | None:
    """Extract phone number from text. Handles common formats."""
    pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_resume_data(text: str) -> dict:
    """
    Main entry point for the extractor.
    Runs all extraction functions and returns a structured dictionary.
    """
    entities = extract_entities(text)
    return {
        "skills": extract_skills(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "organizations": entities["organizations"],
        "locations": entities["locations"],
        "dates": entities["dates"],
        "word_count": len(text.split()),
    }