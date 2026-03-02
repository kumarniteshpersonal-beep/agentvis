from agentvis.framework.base import AIFrameWork
from agentvis.core.models import LLMMessage, Frame, ToolCall
from agentvis.core import BusinessLogic
from langchain.messages import ToolMessage, AIMessage, HumanMessage, SystemMessage

class LangChainFrameWork(AIFrameWork):
    def __init__(self):
        super().__init__()

    def build_frames(self, messages: list[ToolMessage | AIMessage | HumanMessage | SystemMessage]) -> list[Frame]:
        _messages: list[LLMMessage] = []

        # convert messages to LLMMessage
        for message in messages:
            tool_calls = []
            tool_name = ""

            if isinstance(message, AIMessage):
                tool_calls = [ToolCall(name=tool_call["name"], args=tool_call["args"]) for tool_call in message.tool_calls]
            if isinstance(message, ToolMessage):
                tool_name = message.name

            _messages.append(LLMMessage(
                id=message.id,
                type=message.__class__.__name__,
                content=message.content,
                tool_calls=tool_calls,
                tool_name=tool_name
            ))

        return BusinessLogic.build_frames(_messages)