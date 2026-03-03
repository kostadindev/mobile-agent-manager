from openai import OpenAI


async def analyze_image(client: OpenAI, image_base64: str) -> str:
    """Analyze an image using GPT-4o vision and return a description."""
    response = client.chat.completions.create(
        model="gpt-4.1",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Analyze this image in the context of a research assistant. "
                            "Describe what you see and what research tasks might be "
                            "relevant (e.g., paper search, literature review, proposal "
                            "generation). Be concise."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        },
                    },
                ],
            }
        ],
        max_tokens=300,
    )
    return response.choices[0].message.content
