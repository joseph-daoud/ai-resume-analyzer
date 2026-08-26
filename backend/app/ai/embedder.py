from sentence_transformers import SentenceTransformer
import numpy as np

# Load the model once when the module is imported
# This model produces 384-dimensional vectors — matching our Vector(384) column
model = SentenceTransformer("all-MiniLM-L6-v2")


def generate_embedding(text: str) -> list[float]:
    """
    Convert a text string into a 384-dimensional vector.
    This vector captures the semantic meaning of the text —
    similar texts will produce similar vectors.
    """
    # Truncate text to 512 words to stay within the model's token limit
    words = text.split()
    if len(words) > 512:
        text = " ".join(words[:512])

    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()


def compute_similarity(embedding1: list[float], embedding2: list[float]) -> float:
    """
    Compute cosine similarity between two embeddings, scaled to 0-100.
    - 100 means identical meaning
    - 0 means unrelated (cosine similarity can go slightly negative for
      dissimilar vectors — clamped here since a display score should
      never read as negative)
    """
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)

    # Cosine similarity formula: dot product divided by product of magnitudes
    dot_product = np.dot(vec1, vec2)
    magnitude1 = np.linalg.norm(vec1)
    magnitude2 = np.linalg.norm(vec2)

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    similarity = dot_product / (magnitude1 * magnitude2)
    score = float(similarity) * 100

    # Clamp to 0-100: guards against floating-point drift above 100 and
    # against genuinely negative cosine similarity for very dissimilar text
    score = max(0.0, min(100.0, score))
    return round(score, 2)