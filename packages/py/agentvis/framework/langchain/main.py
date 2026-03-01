from agentvis.framework.base import AIFrameWork
from agentvis.core.models import Frame, Node

class LangChainFrameWork(AIFrameWork):
    def __init__(self):
        super().__init__()

    def build_frames(self, messages = []) -> list[Frame]:
        frames = []
        for message in messages:
            frames.append(Frame(
                nodes=[Node(
                    id=message.id,
                    type=message.__class__.__name__
                )]
            ))
        return frames