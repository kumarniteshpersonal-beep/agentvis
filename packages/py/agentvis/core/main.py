from agentvis.core.models import LLMMessage, Frame, Node, MessageType

class BusinessLogic:
    @staticmethod
    def build_frames(messages: list[LLMMessage]) -> list[Frame]:
        frames = []
        tool_msg_start_idx, tool_msg_end_idx = -1, -1
        function_to_args_map = {}

        for idx, message in enumerate(messages):
            # if tool message, store the start and end index of the tool message
            if message.type == MessageType.ToolMessage.value:
                if tool_msg_start_idx == -1:
                    tool_msg_start_idx = idx
                tool_msg_end_idx = idx
            else:
                if tool_msg_start_idx != -1 and tool_msg_end_idx != -1:
                    tool_nodes = [Node(id=tool_msg.id, type=tool_msg.type, data={"content": tool_msg.content, "tool_name": tool_msg.tool_name, "tool_args": function_to_args_map[tool_msg.tool_name]}) for tool_msg in messages[tool_msg_start_idx:tool_msg_end_idx+1]]
                    frames.append(Frame(nodes=tool_nodes))
                    tool_msg_start_idx, tool_msg_end_idx = -1, -1
                    function_to_args_map = {}

                # simply add the frame   
                frames.append(Frame(
                    nodes=[Node(
                        id=message.id,
                        type=message.type,
                        data={"content": message.content}
                    )]
                ))
            
            # if ai message, store the function calls
            if message.type == MessageType.AIMessage.value:
                if message.tool_calls:
                    for tool_call in message.tool_calls:
                        function_to_args_map[tool_call.name] = tool_call.args

        return frames