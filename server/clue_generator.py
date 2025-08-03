from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import random
import json
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
# Initialize the Groq LLM
load_dotenv()
# api_key=os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile", temperature=1.0,top_p=0.9
)

# Define the prompt as a string

json_format = '''{\n  "question": "Guess the type(replace with type mentioned)",\n  "clues": [\n    "<general context clue>",\n    "<more specific but still challenging clue>"\n  ],\n  "answer": "<the exact correct answer>"\n}'''

prompt = PromptTemplate(
    template=(
        """You are the Game Master in a multiplayer deduction game called \"Guess the Thing\". Your task is to generate an interesting {type} and provide two challenging but solvable clues.\n\n"
        "Role: Game Master\n"
        "Task: Generate an interesting {type} and two challenging clues\n\n"
        "Requirements:\n"
        "- Choose an interesting {type} that's not immediately obvious but can be figured out. The chosen {type} should be common and known to all. The chosen {type} should have a single unambiguous answer. The answer should be a single word.\n"
        "- Create two clues that are challenging but not impossible to solve\n"
        "- First clue should be a poem which rhymes. It should hint them towards the idea but shouldnt be revealing and the clue should make sense in hindsight.\n"
        "- Second clue should be a very small story which is related to the answer as a clue. This story should be intriguing and it should make sense in hindsight. The story should not give away the answer but hint them towards it. Make sure its a bit hard to figure out the answer\n"
        "- Clues should be interesting enough to spark follow-up questions\n"
        "- The answer should be something that can be discovered through logical questioning\n"
        "- Avoid making it too easy or too hard - aim for a 3-5 question solve\n"
        "- Response must be in valid JSON format with no extra text or formatting\n"
        "- Do not include any explanations or additional text outside the JSON structure\n"
        "- The clues should not contain any newlines or special characters that would break JSON formatting\n"
        "Response Format (respond with ONLY this JSON structure, no other text):\n"
        f"{json_format}" """
    ),
    input_variables=["type", "json_format"]
)


def generate_clue():
    type_choice = random.choice(["person", "place", "invention", "mythical creature", "event", "feeling", "tool"])
    chain = LLMChain(
        llm=llm,
        prompt=prompt,
        output_key="game"
    )
    response = chain.invoke({"type": type_choice, "json_format": json_format})
    # The response may be a dict with 'game' as a string containing JSON
    game_json = response.get("game", "")
    try:
        result = json.loads(game_json)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        print("Raw response:", game_json)
        # Return a default response in case of error
        result = {
            "question": "Guess the location",
            "clues": [
                "Golden gates high, Sunset fades to blue, Misty mornings rise",
                "Where dreams take flight, and the sea whispers secrets"
            ],
            "answer": "San Francisco"
        }
    return result

def answer_question(answer, question):
    json_format=''' '''
    answer_prompt=PromptTemplate(
        template=f'''You are a strict Game Master.
                    The user gives you two inputs:

                    an object (a description of a thing, person, place, or concept)

                    a question (a yes/no question about the object)

                    Your task is to say whether the question fits the typical characteristics of the object.

                    If the object clearly implies the answer is "yes", answer yes.
                    If the object clearly implies the answer is "no", answer no.
                    If the object does not provide enough information to answer definitively, answer "unknown".

                    You must always respond in valid, strict JSON format, and nothing else.
                    The JSON must have exactly one key-value pair:

                    key: "answer"

                    value: one of the strings "yes", "no", or "unknown"

                    Do not include any text outside the JSON. Do not explain your reasoning. Do not add any comments.
                    
                    Object: {answer}
                    Question: {question}
                    Response Format (respond with ONLY this JSON structure, no other text or formatting):
                    {json_format}''',
        input_variables=["answer", "question", "json_format"]
    )
    chain = LLMChain(
        llm=llm,
        prompt=answer_prompt,
        output_key="game"
    )
    response = chain.invoke({"answer": answer, "question": question, "json_format": json_format})
    return json.loads(response["game"])["answer"]

if __name__ == "__main__":
    # result = answer_question("A detective", "Does the person usually wear a hat?")
    print(generate_clue())