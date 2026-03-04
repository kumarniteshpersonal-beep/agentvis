import bm25s
from agentvis.core.retriever_strategy.base import RetrieverStrategy
from agentvis.core.retriever_strategy.models import SelectedDocument

class BM25RetrieverStrategy(RetrieverStrategy):
    def __init__(self, documents: list[str]):
        super().__init__(documents)
    
    def tokenize(self, text: str) -> list[str]:
        return text.lower().strip().split()

    def index(self):
        self.retriever = bm25s.BM25()
        tokenized_corpus = [self.tokenize(doc) for doc in self.documents]
        self.retriever.index(tokenized_corpus)

    def retrieve(self, query: str, k: int = 1) -> SelectedDocument:
        try:
            return SelectedDocument(
                document_index=int(self.retriever.retrieve([self.tokenize(query)], k=k).documents[0][0]),
                confidence_score=float(self.retriever.retrieve([self.tokenize(query)], k=k).scores[0][0])
            )
        except IndexError:
            return None