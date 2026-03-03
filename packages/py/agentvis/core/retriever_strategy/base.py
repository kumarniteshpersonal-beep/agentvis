from abc import ABC, abstractmethod

class RetrieverStrategy(ABC):
    def __init__(self, documents: list[str]):
        self.documents = documents
        self.retriever = None

    @abstractmethod
    def index(self):
        pass

    @abstractmethod
    def retrieve(self, query: str, k: int = 1) -> int:
        pass