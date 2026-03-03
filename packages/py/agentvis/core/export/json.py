from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import AgentGraph
import json

class JSONExportStrategy(ExportStrategy):
    def __init__(self, graph: AgentGraph):
        super().__init__(graph)

    def export(self) -> str:
        return json.dumps(
            {"frames": [frame.model_dump() for frame in self.graph.frames], "connections": [connection.model_dump() for connection in self.graph.connections]},
            separators=(",", ":")
        )