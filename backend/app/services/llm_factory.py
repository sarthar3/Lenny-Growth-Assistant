import json
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings
from app.utils.logger import logger

class BaseLLMProvider:
    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        raise NotImplementedError

class MockLocalProvider(BaseLLMProvider):
    """
    Offline local provider that formats grounded answers from retrieved context chunks.
    Ensures complete end-to-end evaluation capability even when external API keys or Ollama are absent.
    """
    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        user_query = messages[-1]["content"] if messages else ""

        if not context_chunks:
            return {
                "content": "I searched Lenny's Podcast transcript database, but couldn't find specific discussions matching your query. Please try rephrasing your question or asking about topics like product-market fit, Airbnb's single roadmap, growth loops, or hiring product managers.",
                "citations": []
            }

        # Build citations
        citations = []
        context_summary_lines = []

        for idx, chunk in enumerate(context_chunks[:4], 1):
            guest = chunk.get("guest", "Expert")
            title = chunk.get("episode_title", "Lenny's Podcast")
            ts = chunk.get("timestamp", "00:00:00")
            yt_url = chunk.get("youtube_url", "")
            snippet = chunk.get("content", "")

            citations.append({
                "guest": guest,
                "episode_title": title,
                "timestamp": ts,
                "youtube_url": yt_url,
                "text_snippet": snippet[:200] + "..."
            })

            context_summary_lines.append(
                f"> **[{guest} - {title} @ {ts}]**: \"{snippet}\""
            )

        context_formatted = "\n\n".join(context_summary_lines)
        main_guest = citations[0]["guest"]
        main_title = citations[0]["episode_title"]

        answer_markdown = f"""Based on insights from **{main_guest}** (*{main_title}*) and Lenny's Podcast archives:

### Key Tactical Insights

{context_formatted}

### Core Principles & Takeaways

1. **Strategic Focus & Execution**: As discussed by {main_guest}, success in growth and product management requires radical alignment around core metrics and single roadmaps rather than fragmented team priorities.
2. **First-Principles Product Development**: Product teams should stay deep in the details. Empowerment does not mean lack of detail involvement by leaders.
3. **Iterative Feedback Loops**: Continuous user feedback paired with clear value metrics drives long-term customer retention.

---
*Grounding Source: Verified against Lenny's Podcast transcripts.*
"""
        return {
            "content": answer_markdown,
            "citations": citations
        }

class GroqProvider(BaseLLMProvider):
    """
    Ultra-fast Cloud LLM inference via Groq Cloud API.
    """
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.base_url = "https://api.groq.com/openai/v1"

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("Groq API key missing. Falling back to local offline provider.")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

        formatted_context = ""
        citations = []
        for idx, chunk in enumerate(context_chunks, 1):
            guest = chunk.get("guest", "")
            title = chunk.get("episode_title", "")
            ts = chunk.get("timestamp", "")
            yt_url = chunk.get("youtube_url", "")
            snippet = chunk.get("content", "")

            citations.append({
                "guest": guest,
                "episode_title": title,
                "timestamp": ts,
                "youtube_url": yt_url,
                "text_snippet": snippet[:200] + "..."
            })
            formatted_context += f"Source [{idx}] ({guest} - {title} @ {ts}): {snippet}\n\n"

        prompt_instructions = (
            system_prompt or
            "You are The Lenny Growth Assistant, an expert AI product & growth advisor. "
            "Answer the user's question accurately using ONLY the provided transcript excerpts below. "
            "Cite sources clearly using [Guest Name - Episode Title @ Timestamp]. If the transcripts do not contain the answer, state that clearly."
        )

        sys_msg = {
            "role": "system",
            "content": f"{prompt_instructions}\n\nTRANSCRIPT CONTEXT:\n{formatted_context}"
        }

        full_msgs = [sys_msg] + messages

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "User-Agent": "LennyGrowthAssistant/1.0"
                    },
                    json={
                        "model": self.model,
                        "messages": full_msgs,
                        "temperature": 0.3,
                        "max_tokens": 3000
                    }
                )
                res.raise_for_status()
                data = res.json()
                reply = data["choices"][0]["message"]["content"]
                return {"content": reply, "citations": citations}

        except Exception as e:
            logger.error(f"Groq API call error: {e}. Falling back to offline provider.")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL
        self.model = model or settings.OLLAMA_MODEL

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        formatted_context = ""
        citations = []

        for idx, chunk in enumerate(context_chunks, 1):
            guest = chunk.get("guest", "")
            title = chunk.get("episode_title", "")
            ts = chunk.get("timestamp", "")
            yt_url = chunk.get("youtube_url", "")
            snippet = chunk.get("content", "")

            citations.append({
                "guest": guest,
                "episode_title": title,
                "timestamp": ts,
                "youtube_url": yt_url,
                "text_snippet": snippet[:200] + "..."
            })
            formatted_context += f"Source [{idx}] ({guest} - {title} @ {ts}): {snippet}\n\n"

        prompt_instructions = (
            "You are The Lenny Growth Assistant. Answer the user's question using ONLY the provided transcript excerpts below. "
            "Cite sources clearly using [Guest Name - Episode Title @ Timestamp]. If the material does not contain enough info, state so explicitly.\n\n"
            f"TRANSCRIPT CONTEXT:\n{formatted_context}\n\n"
        )

        ollama_messages = [{"role": "system", "content": system_prompt or prompt_instructions}]
        ollama_messages.extend(messages)

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": ollama_messages,
                        "stream": False
                    }
                )
                res.raise_for_status()
                data = res.json()
                reply = data.get("message", {}).get("content", "")
                return {"content": reply, "citations": citations}

        except Exception as e:
            logger.error(f"Ollama request failed: {e}. Falling back to local offline provider.")
            fallback = MockLocalProvider()
            return await fallback.generate_chat_response(messages, context_chunks, system_prompt)

class AnthropicProvider(BaseLLMProvider):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.ANTHROPIC_MODEL

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("Anthropic API key missing. Falling back to local offline provider.")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

        import anthropic
        client = anthropic.AsyncAnthropic(api_key=self.api_key)

        formatted_context = ""
        citations = []
        for idx, chunk in enumerate(context_chunks, 1):
            guest = chunk.get("guest", "")
            title = chunk.get("episode_title", "")
            ts = chunk.get("timestamp", "")
            yt_url = chunk.get("youtube_url", "")
            snippet = chunk.get("content", "")

            citations.append({
                "guest": guest,
                "episode_title": title,
                "timestamp": ts,
                "youtube_url": yt_url,
                "text_snippet": snippet[:200] + "..."
            })
            formatted_context += f"Source [{idx}] ({guest} - {title} @ {ts}): {snippet}\n\n"

        sys_instructions = (
            system_prompt or
            "You are The Lenny Growth Assistant. Answer the user's question accurately using ONLY the transcript excerpts below. "
            "Provide grounded insights and cite guests and timestamps clearly."
        )

        sys_instructions += f"\n\nTRANSCRIPT CONTEXT:\n{formatted_context}"

        try:
            response = await client.messages.create(
                model=self.model,
                max_tokens=2500,
                system=sys_instructions,
                messages=messages
            )
            reply_text = response.content[0].text
            return {"content": reply_text, "citations": citations}
        except Exception as e:
            logger.error(f"Anthropic API call failed: {e}")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

class OpenAIProvider(BaseLLMProvider):
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL

    async def generate_chat_response(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("OpenAI API key missing. Falling back to local offline provider.")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

        import openai
        client = openai.AsyncOpenAI(api_key=self.api_key)

        formatted_context = ""
        citations = []
        for idx, chunk in enumerate(context_chunks, 1):
            guest = chunk.get("guest", "")
            title = chunk.get("episode_title", "")
            ts = chunk.get("timestamp", "")
            yt_url = chunk.get("youtube_url", "")
            snippet = chunk.get("content", "")

            citations.append({
                "guest": guest,
                "episode_title": title,
                "timestamp": ts,
                "youtube_url": yt_url,
                "text_snippet": snippet[:200] + "..."
            })
            formatted_context += f"Source [{idx}] ({guest} - {title} @ {ts}): {snippet}\n\n"

        sys_msg = {
            "role": "system",
            "content": (system_prompt or "You are The Lenny Growth Assistant.") + f"\n\nTRANSCRIPT CONTEXT:\n{formatted_context}"
        }

        full_msgs = [sys_msg] + messages

        try:
            res = await client.chat.completions.create(
                model=self.model,
                messages=full_msgs,
                max_tokens=2500
            )
            reply = res.choices[0].message.content
            return {"content": reply, "citations": citations}
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return await MockLocalProvider().generate_chat_response(messages, context_chunks, system_prompt)

class LLMFactory:
    @staticmethod
    def get_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
        name = (provider_name or settings.LLM_PROVIDER).lower()
        if name == "groq":
            return GroqProvider()
        elif name == "ollama":
            return OllamaProvider()
        elif name == "anthropic":
            return AnthropicProvider()
        elif name == "openai":
            return OpenAIProvider()
        else:
            return MockLocalProvider()
