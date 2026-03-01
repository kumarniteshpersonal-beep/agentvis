from enum import Enum
from pydantic import BaseModel

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