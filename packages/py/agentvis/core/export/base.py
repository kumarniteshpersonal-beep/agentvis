from abc import ABC, abstractmethod
from agentvis.core.models import Frame

class ExportStrategy(ABC):
    def __init__(self, frames: list[Frame]):
        self.frames = frames

    @abstractmethod
    def export(self):
        raise NotImplementedError