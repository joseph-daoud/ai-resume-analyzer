from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)


def generate_feedback(
    resume_text: str,
    job_description: str,
    score_breakdown: dict
) -> list[dict]:
    """
    Use Groq (openai/gpt-oss-120b) to generate actionable feedback
    on how to improve the resume for the target job.
    """
    prompt = f"""You are an expert career coach and resume reviewer.

Analyze this resume against the job description and provide specific, actionable feedback.

RESUME TEXT:
{resume_text[:3000]}

JOB DESCRIPTION:
{job_description[:2000]}

SCORE CONTEXT:
- Overall fit score: {score_breakdown['fit_score']}/100
- ATS keyword score: {score_breakdown['ats_score']}/100
- Skills matched: {', '.join(score_breakdown['matched_skills'])}
- Skills missing from job description: {', '.join(score_breakdown['missing_skills'])}

Provide exactly 5 feedback items. For each item respond with this exact format:
SECTION: [one of: summary, experience, skills, education, formatting]
TYPE: [one of: improvement, missing_keyword, strength]
PRIORITY: [1, 2, or 3 where 1 is highest priority]
CONTENT: [your specific actionable feedback in 1-2 sentences]
---

Focus on concrete improvements the candidate can make immediately.
Do not repeat the same point twice."""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000
    )

    return parse_feedback_response(response.choices[0].message.content)


def parse_feedback_response(response_text: str) -> list[dict]:
    """
    Parse the LLM response into structured feedback items.
    """
    feedback_items = []
    blocks = response_text.strip().split("---")

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        item = {}
        lines = block.split("\n")

        for line in lines:
            line = line.strip()
            if line.startswith("SECTION:"):
                item["section"] = line.replace("SECTION:", "").strip().lower()
            elif line.startswith("TYPE:"):
                item["type"] = line.replace("TYPE:", "").strip().lower()
            elif line.startswith("PRIORITY:"):
                priority_str = line.replace("PRIORITY:", "").strip()
                try:
                    item["priority"] = int(priority_str)
                except ValueError:
                    item["priority"] = 2
            elif line.startswith("CONTENT:"):
                item["content"] = line.replace("CONTENT:", "").strip()

        if all(k in item for k in ["section", "type", "priority", "content"]):
            feedback_items.append(item)

    return feedback_items