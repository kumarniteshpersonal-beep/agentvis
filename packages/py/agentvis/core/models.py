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

class Frame(BaseModel):
    nodes: list[Node]

# models for LLM messages
class LLMMessage(BaseModel):
    id: str
    type: MessageType
    tool_name: str = ""
    tool_args: dict = {}