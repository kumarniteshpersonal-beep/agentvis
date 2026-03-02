from agentvis.framework.base import AIFrameWork
from agentvis.core.models import LLMMessage, Frame
from agentvis.core import BusinessLogic
from langchain.messages import ToolMessage, AIMessage, HumanMessage, SystemMessage

class LangChainFrameWork(AIFrameWork):
    def __init__(self):
        super().__init__()

    def build_frames(self, messages: list[ToolMessage | AIMessage | HumanMessage | SystemMessage]) -> list[Frame]:
        _messages: list[LLMMessage] = []

        # convert messages to LLMMessage
        for message in messages:
            if isinstance(message, ToolMessage):
                _messages.append(LLMMessage(
                    id=message.id,
                    type=message.__class__.__name__,
                    tool_name=message.name,
                    tool_args={}
                ))
            else:
                _messages.append(LLMMessage(
                    id=message.id,
                    type=message.__class__.__name__,
                ))

        return BusinessLogic.build_frames(_messages)