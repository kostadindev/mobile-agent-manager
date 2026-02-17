from crewai.tools import tool
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
import json


# ---------------------------------------------------------------------------
# Raw implementations (called directly by execution tracker)
# ---------------------------------------------------------------------------

def _arxiv_search(query: str, max_results: int = 5) -> str:
    encoded = urllib.parse.quote(query)
    url = (
        f"http://export.arxiv.org/api/query?search_query=all:{encoded}"
        f"&start=0&max_results={max_results}"
        f"&sortBy=submittedDate&sortOrder=descending"
    )
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = resp.read().decode()
        root = ET.fromstring(data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entries = root.findall("atom:entry", ns)
        if not entries:
            return f"No arXiv papers found for '{query}'."
        results = []
        for entry in entries:
            title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
            summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")[:300]
            authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]
            link = entry.find("atom:id", ns).text
            results.append(
                f"**{title}**\n"
                f"Authors: {', '.join(authors[:3])}{'...' if len(authors) > 3 else ''}\n"
                f"URL: {link}\n"
                f"Abstract: {summary}..."
            )
        return f"Found {len(results)} recent papers for '{query}':\n\n" + "\n\n---\n\n".join(results)
    except Exception as e:
        return f"arXiv search failed: {e}"


def _arxiv_summarize(paper_url: str) -> str:
    paper_id = paper_url.split("/")[-1]
    url = f"http://export.arxiv.org/api/query?id_list={paper_id}"
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            data = resp.read().decode()
        root = ET.fromstring(data)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        entry = root.find("atom:entry", ns)
        if entry is None:
            return f"Paper {paper_id} not found."
        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
        authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]
        categories = [c.get("term") for c in entry.findall("atom:category", ns)]
        return (
            f"**{title}**\n"
            f"Authors: {', '.join(authors)}\n"
            f"Categories: {', '.join(categories)}\n\n"
            f"Abstract:\n{summary}"
        )
    except Exception as e:
        return f"Failed to fetch paper: {e}"


def _generate_proposal(topic: str, context: str = "") -> str:
    return (
        f"## Research Proposal: {topic}\n\n"
        f"### 1. Introduction & Motivation\n"
        f"- Research gap identified in the area of {topic}\n"
        f"- Context: {context[:300] if context else 'To be filled from literature review'}\n\n"
        f"### 2. Research Questions\n"
        f"- RQ1: What are the current limitations in {topic}?\n"
        f"- RQ2: How can novel approaches improve the state of the art?\n\n"
        f"### 3. Proposed Methodology\n"
        f"- Literature survey and gap analysis\n"
        f"- Experimental design and evaluation\n\n"
        f"### 4. Expected Contributions\n"
        f"- Novel framework / algorithm / analysis for {topic}\n"
        f"- Empirical evaluation and reproducible benchmarks\n\n"
        f"### 5. Timeline\n"
        f"- Phase 1 (Months 1-3): Literature review\n"
        f"- Phase 2 (Months 4-8): Implementation\n"
        f"- Phase 3 (Months 9-12): Evaluation & writing"
    )


def _outline_methodology(approach: str, domain: str = "") -> str:
    return (
        f"## Methodology: {approach}\n"
        f"**Domain:** {domain or 'General'}\n\n"
        f"### 1. Data Collection\n"
        f"- Sources, datasets, and sampling strategy\n\n"
        f"### 2. Approach Details\n"
        f"- {approach}: step-by-step procedure\n"
        f"- Baselines for comparison\n\n"
        f"### 3. Evaluation Metrics\n"
        f"- Quantitative: accuracy, F1, BLEU, etc.\n"
        f"- Qualitative: human evaluation, case studies\n\n"
        f"### 4. Reproducibility\n"
        f"- Code and data availability plan"
    )


def _wiki_search(query: str) -> str:
    encoded = urllib.parse.quote(query)
    url = (
        f"https://en.wikipedia.org/w/api.php?action=query&list=search"
        f"&srsearch={encoded}&srlimit=5&format=json"
    )
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AgentFlow/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        results = data.get("query", {}).get("search", [])
        if not results:
            return f"No Wikipedia articles found for '{query}'."
        lines = []
        for r in results:
            snippet = (
                r["snippet"]
                .replace('<span class="searchmatch">', "")
                .replace("</span>", "")
            )
            lines.append(f"**{r['title']}** (pageid: {r['pageid']})\n{snippet}")
        return f"Found {len(lines)} Wikipedia articles for '{query}':\n\n" + "\n\n".join(lines)
    except Exception as e:
        return f"Wikipedia search failed: {e}"


def _wiki_summarize(title: str) -> str:
    encoded = urllib.parse.quote(title)
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AgentFlow/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
        extract = data.get("extract", "No summary available.")
        page_url = data.get("content_urls", {}).get("desktop", {}).get("page", "")
        return f"**{data.get('title', title)}**\n{page_url}\n\n{extract}"
    except Exception as e:
        return f"Wikipedia fetch failed: {e}"


# ---------------------------------------------------------------------------
# CrewAI @tool wrappers (used by CrewAI agents during hierarchical execution)
# ---------------------------------------------------------------------------

@tool("arxiv_search")
def arxiv_search(query: str, max_results: int = 5) -> str:
    """Search arXiv for recent papers matching a query. Returns titles, authors, and abstracts."""
    return _arxiv_search(query, max_results)


@tool("arxiv_summarize")
def arxiv_summarize(paper_url: str) -> str:
    """Fetch and return the abstract/metadata of a specific arXiv paper by its URL or ID."""
    return _arxiv_summarize(paper_url)


@tool("generate_proposal")
def generate_proposal(topic: str, context: str = "") -> str:
    """Generate a structured research proposal outline given a topic and optional context from papers."""
    return _generate_proposal(topic, context)


@tool("outline_methodology")
def outline_methodology(approach: str, domain: str = "") -> str:
    """Generate a detailed methodology section for a research approach in a given domain."""
    return _outline_methodology(approach, domain)


@tool("wiki_search")
def wiki_search(query: str) -> str:
    """Search Wikipedia for articles matching a query. Returns titles and snippets."""
    return _wiki_search(query)


@tool("wiki_summarize")
def wiki_summarize(title: str) -> str:
    """Fetch the summary/introduction of a Wikipedia article by title."""
    return _wiki_summarize(title)


# ---------------------------------------------------------------------------
# Exports
# ---------------------------------------------------------------------------

# CrewAI tool objects for agent assignment
AGENT_TOOLS = {
    "arxiv": [arxiv_search, arxiv_summarize],
    "proposal": [generate_proposal, outline_methodology],
    "wikipedia": [wiki_search, wiki_summarize],
}

# Raw callables for direct execution by the execution tracker
TOOL_FUNCTIONS: dict[str, callable] = {
    "arxiv_search": _arxiv_search,
    "arxiv_summarize": _arxiv_summarize,
    "generate_proposal": _generate_proposal,
    "outline_methodology": _outline_methodology,
    "wiki_search": _wiki_search,
    "wiki_summarize": _wiki_summarize,
}
