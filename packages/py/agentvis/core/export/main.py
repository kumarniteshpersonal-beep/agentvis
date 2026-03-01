from agentvis.core.models import Frame
from typing import Literal
from agentvis.core.export.json import JSONExportStrategy
from agentvis.core.export.link import LinkExportStrategy

class ExportFactory:
    @staticmethod
    def export_frames(frames: list[Frame], export_strategy: Literal["json", "link"] = "json") -> str:
        match export_strategy:
            case "json":
                return JSONExportStrategy(frames).export()
            case "link":
                return LinkExportStrategy(frames).export()
            case _:
                raise ValueError(f"Invalid export strategy: {export_strategy}")