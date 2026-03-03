import base64
import tempfile
from openai import OpenAI


async def transcribe_audio(client: OpenAI, audio_base64: str) -> str:
    """Transcribe audio using OpenAI Whisper API."""
    audio_bytes = base64.b64decode(audio_base64)

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()

        with open(tmp.name, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )

    return transcript.text
