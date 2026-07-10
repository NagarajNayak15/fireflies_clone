import json
import os

import google.generativeai as genai
from dotenv import load_dotenv

from app.schemas.ai import AIResponse

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)


class GeminiService:

    model = genai.GenerativeModel("gemini-3.5-flash")

    PROMPT = """
You are an AI Meeting Assistant.

Analyze the meeting transcript.

Return ONLY valid JSON.

Schema:

{
    "summary":"",

    "topics":[
        ""
    ],

    "action_items":[
        {
            "task":"",
            "owner":"",
            "deadline":""
        }
    ]
}

Rules:

1. Summary should be concise.

2. Topics should contain only major discussion topics.

3. Action items should only contain actionable tasks.

4. If owner is unknown return null.

5. If deadline is unknown return null.

Return JSON only.
"""

    @classmethod
    def generate(cls, transcript: str) -> AIResponse:

        response = cls.model.generate_content(
            cls.PROMPT + "\n\nTranscript:\n\n" + transcript
        )

        text = response.text.strip()

        if text.startswith("```json"):
            text = text[7:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        data = json.loads(text)

        return AIResponse(**data)