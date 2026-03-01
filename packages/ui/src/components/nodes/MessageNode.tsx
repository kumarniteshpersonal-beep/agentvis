function MessageNode(props: any) {
    /*
    example props.data:
    {
      id: "123",
      type: "ToolMessage",
      data: {
        tool_name: "multiply",
        tool_args: {
          a: 1,
          b: 2
        }
      }
    }
    */
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 8,
        backgroundColor: "#e8f5e9",
        border: "2px solid #388e3c",
        minWidth: 140,
      }}
    >
      <div>
        <label htmlFor="text">Text:</label>
        <input id="text" name="text" className="nodrag" value={JSON.stringify(props)}/>
      </div>
    </div>
  );
}

export default MessageNode;
