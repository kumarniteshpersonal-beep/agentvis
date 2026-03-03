from agentvis.core.models import AgentGraph
from typing import Literal
from agentvis.core.export.json import JSONExportStrategy
from agentvis.core.export.link import LinkExportStrategy

class ExportFactory:
    @staticmethod
    def export_graph(graph: AgentGraph, export_strategy: Literal["json", "link"] = "json") -> str:
        match export_strategy:
            case "json":
                return JSONExportStrategy(graph).export()
            case "link":
                return LinkExportStrategy(graph).export()
            case _:
                raise ValueError(f"Invalid export strategy: {export_strategy}")