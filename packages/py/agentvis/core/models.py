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

class Connection(BaseModel):
    id: str
    source: str
    target: str

class Frame(BaseModel):
    nodes: list[Node]

class AgentGraph(BaseModel):
    frames: list[Frame]
    connections: list[Connection]

# models for LLM messages
class ToolCall(BaseModel):
    name: str
    args: dict

class LLMMessage(BaseModel):
    id: str
    type: MessageType
    content: str = ""
    tool_calls: list[ToolCall] = []
    tool_name: str = ""