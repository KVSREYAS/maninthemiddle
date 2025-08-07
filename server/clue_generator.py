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
    model_name="openai/gpt-oss-120b", temperature=1.2,top_p=0.9,response_format={"type": "json_object"}
)
llm2=ChatGroq(
    model_name="openai/gpt-oss-20b", temperature=0.1,tools=[{"type":"browser_search"}]
)


# Define the prompt as a string

with open("clue_prompt_variants.json", "r") as file:
    clue_generator_json = json.load(file)

json_format = '''{\n  "question": "Guess the <replace with type>",\n  "clues": [\n    "<general context clue>",\n    "<more specific but still challenging clue>"\n  ],\n  "answer": "<the exact correct answer>"\n}'''

prompt = PromptTemplate(
    template=(
        """You are the Game Master in a multiplayer deduction game called \"Guess the Thing\". Your task is to generate an interesting {type} and provide two challenging but solvable clues.\n\n"
        "Role: Game Master\n"
        "Task: Generate an interesting {type} and two challenging clues\n\n"
        "Requirements:\n"
        "- Choose an interesting {type} that's not immediately obvious but can be figured out. The chosen {type} should be common and known to all. The chosen {type} should have a single unambiguous answer. The answer should be a single word.\n"
        "- Create two clues that are challenging but not impossible to solve\n"
        "Instructions for clue 1: {clue_1_prompt}\n"
        "Instructions for clue 2: {clue_2_prompt}\n"
        "- Clues should be interesting enough to spark follow-up questions\n"
        "- The answer should be something that can be discovered through logical questioning\n"
        "- Avoid making it too easy or too hard - aim for a 3-5 question solve\n"
        "- Response must be in valid JSON format with no extra text or formatting\n"
        "- Do not include any explanations or additional text outside the JSON structure\n"
        "- The clues should not contain any newlines or special characters that would break JSON formatting\n"
        "Response Format (respond with ONLY this JSON structure, no other text):\n"
        f"{json_format}" """
    ),
    input_variables=["type", "json_format","clue_1_prompt", "clue_2_prompt"]
)


def generate_clue():
    type_choice = random.choice(["Famous Monument", "Object", "Animal", "Event","Food","Country","Everyday Item","Profession",""])
    clue_no = random.randint(1, 30)
    clue1 = clue_generator_json[str(clue_no)]["clue1_prompt"]
    clue2 = clue_generator_json[str(clue_no)]["clue2_prompt"]
    chain = LLMChain(
        llm=llm,
        prompt=prompt,
        output_key="game"
    )
    response = chain.invoke({"type": type_choice, "json_format": json_format, "clue_1_prompt": clue1, "clue_2_prompt": clue2})
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
        llm=llm2,
        prompt=answer_prompt,
        output_key="game"
    )
    response = chain.invoke({"answer": answer, "question": question, "json_format": json_format})
    return json.loads(response["game"])["answer"]

if __name__ == "__main__":
    # result = answer_question("A detective", "Does the person usually wear a hat?")
    print(generate_clue())