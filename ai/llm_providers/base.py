from abc import ABC, abstractmethod
from typing import Generator, Optional

class LLMProvider(ABC):
    @abstractmethod
    def generate_response(self, prompt: str, stream: bool = False) -> Optional[str | Generator[str, None, None]]:
        pass
