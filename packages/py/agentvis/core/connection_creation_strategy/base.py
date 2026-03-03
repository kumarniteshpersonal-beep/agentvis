from abc import ABC, abstractmethod
from agentvis.core.models import Node, Connection

class ConnectionCreationStrategy(ABC):
    def __init__(self, nodes_matrix: list[list[Node]]):
        self.nodes_matrix = nodes_matrix
        self.connections = []

    @abstractmethod
    def create_connections(self) -> None:
        pass

    def get_connections(self) -> list[Connection]:
        return self.connections