from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import Frame
import json

class JSONExportStrategy(ExportStrategy):
    def __init__(self, frames: list[Frame]):
        super().__init__(frames)

    def export(self):
        return json.dumps(
            {"frames": [frame.model_dump() for frame in self.frames]},
            separators=(",", ":")
        )