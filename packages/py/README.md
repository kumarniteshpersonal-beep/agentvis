# agentvis

<p align="center">
  <picture align="center">
    <img align="center" alt="agentvis logo" src="https://raw.githubusercontent.com/kumarniteshpersonal-beep/agentvis/968caea6e04577583d7d16f7015b9925362d5f53/packages/ui/public/agentvis_logo.svg" width="560">
  </picture>
</p>


*agentvis* visualizes an agent’s reasoning trace, giving you clear insight into *why* the agent chose a particular path or triggered a specific tool call.  

By exposing the influence flow behind each decision, it transforms opaque agent behavior into something understandable and actionable — so you can confidently refine and improve your prompts, which is often the hardest part of building reliable agents. 🧠✨

## *agentvis* reasoning visualization example

![flow_diagram](https://raw.githubusercontent.com/kumarniteshpersonal-beep/agentvis/refs/heads/main/packages/py/images/vis.png)

## Installation

Install core:

```bash
pip install agentvis
```

With LangChain support:

```bash
pip install agentvis[langchain]
```


## How to generate an agent reasoning graph

### 1. Define your LangChain / LangGraph agent

```python
from langchain_tavily import TavilySearch
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_agent
from langchain.messages import HumanMessage
import os

os.environ["TAVILY_API_KEY"] = "<your-tavily-api-key>"

tavily_search = TavilySearch(
    max_results=5,
    search_depth="basic",
)

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.7,
    google_api_key="<your-google-api-key>",
)

agent = create_agent(
    llm,
    [tavily_search],
    system_prompt=(
        "You are a helpful web search agent. "
        "Use the Tavily tool when you need fresh information from the web."
    ),
)

result = agent.invoke(
    {"messages": [HumanMessage("Top warm countries and weather of each.")]}
)
messages = result["messages"]
```

### 2. Build the reasoning graph with *agentvis* and get a shareable link in exchange of messages produced by agent

```python
from agentvis.framework.langchain import LangChainAdapter
from agentvis.core.export import ExportFactory

# Convert LLM messages into an AgentGraph
graph = LangChainAdapter().build_agent_graph(messages)

# Export as a short link you can open in the UI
link = ExportFactory.export_graph(graph=graph, export_strategy="link")  # or "json"
print(link)
```

> Open the printed `link` in your browser to inspect the full reasoning trace of the `websearch` agent. 

## License

This project is licensed under the Apache License 2.0.
