import os
from openai import OpenAI
import json

def generate_recommendations(query: str, memory_context: list, trends_context: str, preferences: dict = None):
    """
    Generates personalized recommendations using OpenAI based on the query,
    past memory context, live trends, and user preferences.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"error": "Groq API key not configured. Please add a free key to .env"}

    # Groq uses the exact same OpenAI SDK, just point it to their URL
    client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=api_key
    )

    memory_str = "\n".join([f"- {m}" for m in memory_context])
    preferences_str = json.dumps(preferences) if preferences else "{}"
    
    system_prompt = """
    You are an intelligent, conversational shopping assistant called "ShopMate AI".
    Your goal is to help users find the perfect products.
    
    You have a memory of past queries and preferences. NEVER ask the user the same type of clarifying question repeatedly.
    If the user's query lacks some context (like exact budget or specific category), DO NOT ask for it. Instead, proactively provide exactly 3 diverse product recommendations across different price ranges or styles based on the information you do have.
    Always aim to provide recommendations rather than blocking the user with a question. One of them should be marked as the best match ("best_match": true).
    
    You must extract and update the user's preferences (like budget, category, styles) from their query and return them in `extracted_preferences`. Merge new information with existing preferences conceptually.
    
    You must respond strictly in JSON format.
    
    The JSON structure MUST be:
    {
      "message": "A conversational reply or greeting explaining your recommendations or asking a clarifying question.",
      "products": [
        {
          "name": "Product Name",
          "price": "Price Range (e.g., $200 - $300 or Rs. 15,000)",
          "reason": "General reason for recommendation.",
          "why_for_you": "Why this product fits the user's specific extracted preferences.",
          "rating": "A numeric rating string like '4.5' or '5.0'",
          "url": "A real shopping website URL for this exact product. If a direct link isn't explicitly known, generate an Amazon search link (e.g., https://www.amazon.com/s?k=[product+name]).",
          "best_match": true
        }
      ],
      "extracted_preferences": {
         "budget": "any extracted budget",
         "category": "any extracted category",
         "other": "any other preferences"
      }
    }
    """

    user_prompt = f"""
    Current User Preferences: {preferences_str}

    User Query: {query}
    
    Past Context (Memory):
    {memory_str if memory_str else 'No past context.'}
    
    Live Trending Data:
    {trends_context if trends_context else 'No live trends.'}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result_json = response.choices[0].message.content
        return json.loads(result_json)
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return {"error": str(e)}
