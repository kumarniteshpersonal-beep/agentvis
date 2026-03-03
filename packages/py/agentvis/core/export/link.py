from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import AgentGraph
import json
from urllib.parse import quote

class LinkExportStrategy(ExportStrategy):
    def __init__(self, graph: AgentGraph):
        super().__init__(graph)

    def export(self) -> str:
        _json = json.dumps(
            {"frames": [frame.model_dump() for frame in self.graph.frames], "connections": [connection.model_dump() for connection in self.graph.connections]},
            separators=(",", ":")
        )

        encoded_json = quote(_json, safe="")
        return f"http://localhost:5173?view={encoded_json}"