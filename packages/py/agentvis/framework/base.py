from abc import ABC, abstractmethod
from agentvis.core.models import Frame

class AIFrameWork(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def build_frames(self, messages = []) -> list[Frame]:
        raise NotImplementedError
