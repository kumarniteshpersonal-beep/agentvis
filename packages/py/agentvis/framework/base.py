from abc import ABC, abstractmethod
from agentvis.core.models import LLMMessage

class AIFrameWork(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def convert(self, messages: list[any], subagent_messages: dict[str, list[any]]) -> list[LLMMessage]:
        raise NotImplementedError