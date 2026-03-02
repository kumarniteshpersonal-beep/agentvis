from agentvis.core.models import LLMMessage, Frame, Node

class BusinessLogic:
    @staticmethod
    def build_frames(messages: list[LLMMessage]) -> list[Frame]:
        frames = []
        for message in messages:
            frames.append(Frame(
                nodes=[Node(
                    id=message.id,
                    type=message.type,
                    data={
                        "tool_name": message.tool_name,
                        "tool_args": message.tool_args
                    }
                )]
            ))
        return frames