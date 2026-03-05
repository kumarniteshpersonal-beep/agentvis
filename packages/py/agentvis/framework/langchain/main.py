from agentvis.framework.base import AIFrameWork
from agentvis.core.models import LLMMessage, Frame, ToolCall, AgentGraph
from agentvis.core import BusinessLogic
from langchain.messages import ToolMessage, AIMessage, HumanMessage, SystemMessage

class LangChainAdapter(AIFrameWork):
    def __init__(self):
        super().__init__()

    def build_agent_graph(self, messages: list[ToolMessage | AIMessage | HumanMessage | SystemMessage]) -> AgentGraph:
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
                content=message.content,
                tool_calls=tool_calls,
                tool_name=tool_name,
                tool_call_id=tool_call_id
            ))

        frames = BusinessLogic.build_frames(_messages)
        connections = BusinessLogic.create_connections(frames)
        return AgentGraph(frames=frames, connections=connections)