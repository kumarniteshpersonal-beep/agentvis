from agentvis.core.retriever_strategy.base import RetrieverStrategy
from agentvis.core.retriever_strategy.models import SelectedDocument

class ContextRetrieverStrategy:
    def __init__(self):
        self.strategy = None

    def set_strategy(self, strategy: RetrieverStrategy):
        self.strategy = strategy

    def index(self):
        self.strategy.index()

    def retrieve(self, query: str, k: int = 1) -> list[SelectedDocument]:
        return self.strategy.retrieve(query, k)