from agentvis.core.connection_creation_strategy.base import ConnectionCreationStrategy
from agentvis.core.models import Connection, MessageType
from agentvis.core.models import Node

class StrategyToolToTool(ConnectionCreationStrategy):
    def __init__(self, nodes_matrix: list[list[Node]]):
        super().__init__(nodes_matrix)

    def create_connections(self) -> None:
        flat_nodes = [node for row in self.nodes_matrix for node in row]
        for idx,node in enumerate(flat_nodes):
            if node.type == MessageType.ToolMessage.value:
                self.connections.append(Connection(id=f"{node.id}--{flat_nodes[idx+1].id}", source=node.id, target=flat_nodes[idx+1].id))
    
    def get_connections(self) -> list[Connection]:
        return self.connections