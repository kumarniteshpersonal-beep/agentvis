from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import Frame
import json
from urllib.parse import quote

class LinkExportStrategy(ExportStrategy):
    def __init__(self, frames: list[Frame]):
        super().__init__(frames)

    def export(self):
        _json = json.dumps(
            {"frames": [frame.model_dump() for frame in self.frames]},
            separators=(",", ":")
        )

        encoded_json = quote(_json, safe="")
        return f"http://localhost:5173?view={encoded_json}"