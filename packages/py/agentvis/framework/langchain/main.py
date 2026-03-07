from agentvis.framework.base import AIFrameWork
from agentvis.core.models import LLMMessage, ToolCall
from langchain.messages import ToolMessage, AIMessage, HumanMessage, SystemMessage
from .helper import normalize_content

class LangChainAdapter(AIFrameWork):
    def __init__(self):
        super().__init__()

    def convert(self, messages: list[ToolMessage | AIMessage | HumanMessage | SystemMessage]) -> list[LLMMessage]:
        _messages: list[LLMMessage] = []

        # convert messages to LLMMessage
        for message in messages:
            tool_calls = []
            tool_name = ""
            tool_call_id = ""

            if isinstance(message, AIMessage):
                tool_calls = [ToolCall(name=tool_call["name"], args=tool_call["args"], tool_call_id=tool_call["id"]) for tool_call in message.tool_calls]
            if isinstance(message, ToolMessage):
                tool_name = message.name
                tool_call_id = message.tool_call_id
                
            _messages.append(LLMMessage(
                id=message.id,
                type=message.__class__.__name__,
                content=normalize_content(message.content),
                tool_calls=tool_calls,
                tool_name=tool_name,
                tool_call_id=tool_call_id
            ))

        return _messages