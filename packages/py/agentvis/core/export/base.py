from abc import ABC, abstractmethod
from agentvis.core.models import AgentGraph

class ExportStrategy(ABC):
    def __init__(self, graph: AgentGraph):
        self.graph = graph

    @abstractmethod
    def export(self) -> str:
        raise NotImplementedError