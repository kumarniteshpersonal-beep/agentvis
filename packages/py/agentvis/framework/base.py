from abc import ABC, abstractmethod
from agentvis.core.models import AgentGraph

class AIFrameWork(ABC):
    def __init__(self):
        pass

    @abstractmethod
    def build_agent_graph(self, messages = []) -> AgentGraph:
        raise NotImplementedError
