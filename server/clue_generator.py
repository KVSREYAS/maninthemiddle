from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import random
import json
# Initialize the Groq LLM
load_dotenv()
# api_key=os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile" # or "llama3-70b-8192", "mixtral-8x7b-32768", etc.
)
type = random.choice(["person", "place", "invention", "mythical creature", "event", "feeling", "tool"])
# Define the prompt as a string
prompt = f'''You are the Game Master in a multiplayer deduction game called "Guess the Thing". Your task is to generate an interesting {type} and provide two challenging but solvable clues.

Role: Game Master
Task: Generate an interesting {type} and two challenging clues

Requirements:
- Choose an interesting {type} that's not immediately obvious but can be figured out
- Create two clues that are challenging but not impossible to solve
- First clue should be more general, giving a broad category or context
- Second clue should be more specific but still require some deduction
- Clues should be interesting enough to spark follow-up questions
- The answer should be something that can be discovered through logical questioning
- Avoid making it too easy or too hard - aim for a 3-5 question solve
- Response must be in valid JSON format with no extra text or formatting
- Do not include any explanations or additional text outside the JSON structure

Response Format (respond with ONLY this JSON structure, no other text):
{{
  "question": "Guess the {type}",
  "clues": [
    "<general context clue>",
    "<more specific but still challenging clue>"
  ],
  "answer": "<the exact correct answer>"
}}'''

def generate_clue():
    try:
        # Run the chain with the prompt
        response = llm.invoke(prompt)
        # Try to parse the JSON response
        return json.loads(response.content)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print("Raw response:", response.content)
        # Return a default response in case of error
        return {
            "question": f"Guess the {type}",
            "clues": [
                "Error generating clues. Please try again.",
                "The system encountered an issue."
            ],
            "answer": "Error"
        }

if __name__ == "__main__":
    result = generate_clue()
    print(result)