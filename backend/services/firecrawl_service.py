import os
import requests

def fetch_trending_products(query: str) -> str:
    """
    Uses the Firecrawl Search API to find trending products related to the query.
    Returns a formatted string of the search results context.
    """
    api_key = os.getenv("FIRECRAWL_API_KEY")
    if not api_key:
        return "Firecrawl API key not configured. Cannot fetch live trends."

    url = "https://api.firecrawl.dev/v1/search"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "query": f"best trending {query} to buy right now",
        "limit": 5,
        "searchOptions": {
            "limit": 5
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        
        if data.get("success") and "data" in data:
            results = data["data"]
            context_pieces = []
            for item in results:
                title = item.get("title", "")
                description = item.get("description", "")
                context_pieces.append(f"Title: {title}\nDescription: {description}")
            return "\n\n".join(context_pieces)
        else:
            return "No trending products found."
    except Exception as e:
        print(f"Error fetching from Firecrawl: {e}")
        return f"Error fetching trends: {e}"
