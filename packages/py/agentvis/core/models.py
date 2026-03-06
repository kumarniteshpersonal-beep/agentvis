from enum import Enum
from pydantic import BaseModel

# models for tree structure
class MessageType(str, Enum):
    AIMessage = "AIMessage"
    ToolMessage = "ToolMessage"
    HumanMessage = "HumanMessage"
    SystemMessage = "SystemMessage"

class Node(BaseModel):
    id: str
    type: MessageType
    data: dict = {}

class ConnectionType(str, Enum):
    ToolToTool = "ToolToTool"

class ToolOutputMatchDetails(BaseModel):
    target_tool_arg: dict = {}
    source_tool_output_matched_text: str = ""
    source_tool_ouput_start_index: int = 0
    source_tool_ouput_end_index: int = 0
    confidence_score: float = 0.0

class ConnectionData(BaseModel):
    connection_type: ConnectionType
    connection_details: ToolOutputMatchDetails = None

class Connection(BaseModel):
    id: str
    source: str
    target: str
    data: ConnectionData = None

class Frame(BaseModel):
    nodes: list[Node]

class AgentGraph(BaseModel):
    frames: list[Frame]
    connections: list[Connection]

# models for LLM messages
class ToolCall(BaseModel):
    name: str
    args: dict
    tool_call_id: str

class LLMMessage(BaseModel):
    id: str
    type: MessageType
    content: str | list[dict] = ""
    tool_calls: list[ToolCall] = []
    tool_name: str = ""
    tool_call_id: str = ""