import os
from dotenv import load_dotenv
from typing import List
import httpx
from langchain_core.documents import Document as LangchainDocument
from utils.logger import logger
from config.constants import EMBEDDINGS_MODEL, OPENROUTER_BASE_URL


class EmbeddingService:
    def __init__(self):
        """Initialize the embedding service with OpenRouter embeddings API."""
        # Make sure .env is loaded in case this module is imported before others
        load_dotenv()
        api_key = os.environ.get("OPENROUTER_API_KEY")
        if not api_key:
            raise RuntimeError("OPENROUTER_API_KEY environment variable is not set")
        self.api_key = api_key
        self.base_url = OPENROUTER_BASE_URL.rstrip("/")
        self.model_name = EMBEDDINGS_MODEL
        # Disable redirects so we can detect if the request is being redirected to HTML pages
        self.client = httpx.Client(timeout=30, follow_redirects=False)
        logger.info(f"EmbeddingService initialized with OpenRouter model: {self.model_name}")

    def _headers(self) -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        # Optional but recommended by OpenRouter
        # Support both naming conventions found in .env files
        site_url = os.environ.get("OPENROUTER_SITE_URL") or os.environ.get("OPENROUTER_REFERRER")
        app_name = os.environ.get("OPENROUTER_APP_NAME") or os.environ.get("OPENROUTER_TITLE")
        if site_url:
            headers["HTTP-Referer"] = site_url
            # Some providers expect Origin in addition to Referer for CORS/CDN rules
            headers["Origin"] = site_url
        if app_name:
            headers["X-Title"] = app_name
        headers["Accept"] = "application/json"
        headers["User-Agent"] = os.environ.get("USER_AGENT", "obot-ai/1.0 (+httpx)")
        return headers

    def embed_document(self, chunkdoc: LangchainDocument) -> List[float]:
        """Generate an embedding for a single LangChain document via OpenRouter."""
        try:
            text = chunkdoc.page_content
            logger.debug(f"Generating embedding for document with {len(text)} characters")
            resp = self.client.post(
                f"{self.base_url}/embeddings",
                headers=self._headers(),
                json={"model": self.model_name, "input": text},
            )
            # If redirected, treat as error (often indicates auth/headers issue)
            if 300 <= resp.status_code < 400:
                location = resp.headers.get("location", "<none>")
                logger.error(f"Embeddings request redirected to: {location}")
                resp.raise_for_status()
            resp.raise_for_status()
            # Some proxies may return non-JSON with 2xx. Guard parsing and log details.
            ctype = resp.headers.get("content-type", "")
            if "application/json" not in ctype.lower():
                logger.error(
                    f"Unexpected embeddings response: status={resp.status_code} content-type={ctype} body={resp.text[:300]}"
                )
                raise RuntimeError("Embeddings API did not return JSON")
            data = resp.json()
            vec = data["data"][0]["embedding"]
            logger.debug(f"Generated embedding with {len(vec)} dimensions")
            return vec
        except Exception as e:
            logger.error(f"Error generating embeddings: {str(e)}", exc_info=True)
            raise e

    def embed_documents(self, docs: List[LangchainDocument]) -> List[List[float]]:
        """Generate embeddings for multiple LangChain documents via OpenRouter."""
        try:
            contents = [doc.page_content for doc in docs]
            logger.info(f"Generating embeddings for {len(docs)} documents")
            resp = self.client.post(
                f"{self.base_url}/embeddings",
                headers=self._headers(),
                json={"model": self.model_name, "input": contents},
            )
            if 300 <= resp.status_code < 400:
                location = resp.headers.get("location", "<none>")
                logger.error(f"Embeddings request redirected to: {location}")
                resp.raise_for_status()
            resp.raise_for_status()
            ctype = resp.headers.get("content-type", "")
            if "application/json" not in ctype.lower():
                logger.error(
                    f"Unexpected batch embeddings response: status={resp.status_code} content-type={ctype} body={resp.text[:300]}"
                )
                raise RuntimeError("Embeddings API did not return JSON")
            data = resp.json()
            vectors = [item["embedding"] for item in data["data"]]
            logger.info(f"Generated embeddings for {len(docs)} documents successfully")
            return vectors
        except Exception as e:
            logger.error(f"Batch embedding failed: {str(e)}", exc_info=True)
            raise e
