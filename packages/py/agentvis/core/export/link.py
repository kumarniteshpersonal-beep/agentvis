from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import AgentGraph
import json
import zlib
import base64

class LinkExportStrategy(ExportStrategy):
    def __init__(self, graph: AgentGraph):
        super().__init__(graph)
        self.BASE_URL = "https://agentvis.vercel.app"

    def export(self) -> str:
        data = {
            "frames": [frame.model_dump() for frame in self.graph.frames],
            "connections": [
                connection.model_dump()
                for connection in self.graph.connections
            ],
        }

        json_string = json.dumps(data, separators=(",", ":"))
        compressed = zlib.compress(json_string.encode("utf-8"))
        encoded = base64.urlsafe_b64encode(compressed).decode("utf-8")

        return f"{self.BASE_URL}?view={encoded}"