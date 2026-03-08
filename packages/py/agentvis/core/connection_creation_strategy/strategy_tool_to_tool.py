from agentvis.core.connection_creation_strategy.base import ConnectionCreationStrategy
from agentvis.core.models import Connection, MessageType, Node, ConnectionData, ConnectionType, ToolOutputMatchDetails
from agentvis.core.retriever_strategy import ContextRetrieverStrategy, BM25RetrieverStrategy
from agentvis.core.connection_creation_strategy.helper import get_best_matched_tokens

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
                for key,value in tool_args.items():
                    value = str(value)
                    if not tool_outputs:
                        break
                    selected_documents = self.context_retriever.retrieve(value)
                    selected_document = selected_documents[0] if selected_documents else None
                    if selected_document:
                        document_index, confidence_score = selected_document.document_index, selected_document.confidence_score
                        if confidence_score == 0.0:
                            continue
                        u,v = tool_outputs[document_index][0],node.id
                        tool_output_content = tool_outputs[document_index][1]
                        best_match = get_best_matched_tokens(tool_output_content, value)
                        self.connections.append(
                            Connection(
                                id=f"{u}-{v}", 
                                source=u, 
                                target=v, 
                                data=ConnectionData(
                                    connection_type=ConnectionType.ToolToTool, 
                                    connection_details=ToolOutputMatchDetails(
                                        target_tool_arg={key:value}, 
                                        matched_tokens=best_match.get("matched_tokens", []),
                                        score=min(confidence_score, 1.0)
                                    )
                                )
                            )
                        )
            
            for node in frame:
                if node.type != MessageType.ToolMessage.value:
                    break
                if node.data["content"]:
                    tool_outputs.append((node.id, node.data["content"]))
            if tool_outputs:
                self.context_retriever.set_strategy(BM25RetrieverStrategy(documents=[str(tool_output) for _,tool_output in tool_outputs]))
                self.context_retriever.index()