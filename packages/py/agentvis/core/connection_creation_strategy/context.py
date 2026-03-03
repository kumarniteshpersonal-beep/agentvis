from agentvis.core.connection_creation_strategy.base import ConnectionCreationStrategy
from agentvis.core.models import Connection

class ContextConnectionCreation:
    def __init__(self):
        self.strategy = None
    
    def set_strategy(self, strategy: ConnectionCreationStrategy) -> None:
        self.strategy = strategy

    def create_connections(self) -> None:
        self.strategy.create_connections()
    
    def get_connections(self) -> list[Connection]:
        return self.strategy.get_connections()