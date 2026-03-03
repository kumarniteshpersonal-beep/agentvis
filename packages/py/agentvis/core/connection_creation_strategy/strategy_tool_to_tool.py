from agentvis.core.connection_creation_strategy.base import ConnectionCreationStrategy
from agentvis.core.models import Connection, MessageType
from agentvis.core.models import Node
from agentvis.core.retriever_strategy import ContextRetrieverStrategy, BM25RetrieverStrategy

class StrategyToolToTool(ConnectionCreationStrategy):
    def __init__(self, nodes_matrix: list[list[Node]]):
        super().__init__(nodes_matrix)
        self.context_retriever = ContextRetrieverStrategy()

    def create_connections(self) -> None:
        tool_outputs = [] # store tuple (node_id, output)

        # iterate over each frame
        for frame in self.nodes_matrix:
            for node in frame:
                if node.type != MessageType.ToolMessage.value:
                    break
                tool_args = node.data["tool_args"]
                for _,value in tool_args.items():
                    if not tool_outputs:
                        break
                    tool_idx = self.context_retriever.retrieve(str(value))
                    if tool_idx != -1:
                        u,v = tool_outputs[tool_idx][0],node.id
                        self.connections.append(Connection(id=f"{u}-{v}", source=u, target=v))
            
            for node in frame:
                if node.type != MessageType.ToolMessage.value:
                    break
                if node.data["content"]:
                    tool_outputs.append((node.id, node.data["content"]))
                self.context_retriever.set_strategy(BM25RetrieverStrategy(documents=[str(tool_output) for _,tool_output in tool_outputs]))
                self.context_retriever.index()