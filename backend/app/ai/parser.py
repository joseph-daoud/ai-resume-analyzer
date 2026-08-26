import os
import pymupdf
import docx


def extract_text_from_txt(file_path: str) -> str:
    """Read plain text files directly."""
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file using PyMuPDF.
    Iterates through every page and collects all text.
    """
    text = ""
    doc = pymupdf.open(file_path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from a Word document.
    Iterates through every paragraph and joins them with newlines.
    """
    doc = docx.Document(file_path)
    paragraphs = [paragraph.text for paragraph in doc.paragraphs]
    return "\n".join(paragraphs)


def parse_resume(file_path: str) -> str:
    """
    Main entry point for the parser.
    Detects the file type by extension and calls the correct extractor.
    Returns the full text content of the resume as a string.
    Raises ValueError if the file type is not supported.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    extension = file_path.rsplit(".", 1)[-1].lower()

    if extension == "txt":
        return extract_text_from_txt(file_path)
    elif extension == "pdf":
        return extract_text_from_pdf(file_path)
    elif extension == "docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: .{extension}")