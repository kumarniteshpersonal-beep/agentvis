from agentvis.core.export.base import ExportStrategy
from agentvis.core.models import Frame

class LinkExportStrategy(ExportStrategy):
    def __init__(self, frames: list[Frame]):
        super().__init__(frames)

    def export(self):
        return "https://app.agentvis.io/frames/"