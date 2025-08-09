from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import random
import json
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Detective Game — single-file implementation
# Features:
# - LLM generates a small crime-scene narrative anchored to a simple GK answer
# - Two in-world "documents" (manifesto/notes/letter) are produced as clues
# - A witness exists and can be interrogated with yes/no questions (answers: yes/no/unknown)
# - The answer is basic GK (common objects/animals/landmarks) so it's inclusive

load_dotenv()

# Configure your models (change API keys and model names as needed)
llm = ChatGroq(
    model_name=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
    temperature=1.0,
    top_p=0.9,
    response_format={"type": "json_object"}
)

llm2 = ChatGroq(
    model_name=os.getenv("GROQ_MODEL_SMALL", "openai/gpt-oss-20b"),
    temperature=0.0,
    tools=[]
)

# Basic-GK answer pool grouped by type (animals, landmarks, objects, natural)
GK_POOL = {
    "animal": [
        "cat", "dog", "horse", "owl", "fish"
    ],
    "landmark": [
        "eiffel tower", "pyramids", "statue of liberty"
    ],
    "object": [
        "umbrella", "clock", "bicycle", "ladder", "bread", "door",
        "window", "glasses", "polaroid", "backpack", "candle", "chair"
    ],
    "natural": [
        "sun", "rainbow"
    ]
}


# Prompt: instruct LLM to pick an answer from BASIC_GK_POOL and craft crime scene + two documents + brief witness note
GEN_CLUE_PROMPT = PromptTemplate(
    template=(
        '''
You are a noir-style case writer creating a compact, immersive crime scene for a detective game.
Answer: {ans}
Requirements:
1) Crete the scene based on the answer given but do not mention the answer in the scene.
2) Build a short crime-scene description (1-2 sentences) that would plausibly contain the answer as an object/landmark/animal.
3) Create TWO in-universe written documents recovered at the scene ("manifesto", "diary fragment", "shipping note", "police tag", etc.). Each document should be 1-2 sentences long and suggest partial clues about the answer but NOT name it.
5) The two documents alone should NOT be sufficient to determine the answer with certainty — they must require at least one yes/no interrogation to resolve ambiguity.
Output format (STRICT JSON, no extra text):
{{
  "crime_scene": "...",
  "documents": ["...", "..."],
  "answer": "..."
}}
'''
    ),
    input_variables=["ans"]
)


# Prompt for witness interrogation — llm2 will act as the witness and must reply with {"answer":"yes"/"no"/"unknown"}


def generate_clue():
    """Generate a round payload compatible with server.py usage.
    Returns a dict with keys: question (str), clues (list[str]), answer (str)
    """
    chain = LLMChain(llm=llm, prompt=GEN_CLUE_PROMPT, output_key="game")
    try:
        type_key = random.choice(list(GK_POOL.keys()))
        ans = random.choice(GK_POOL[type_key])
        # Debug: print formatted prompt input
        try:
            formatted_prompt = GEN_CLUE_PROMPT.format(ans=ans)
            print("\n[DEBUG] GEN_CLUE_PROMPT input ->\n" + formatted_prompt + "\n")
        except Exception as _:
            print(f"[DEBUG] Failed to format GEN_CLUE_PROMPT with ans={ans}")
        response = chain.invoke({"ans": ans})
        raw = response.get("game", "")
        obj = json.loads(raw)
        # Validate expected keys from the LLM
        if not all(k in obj for k in ("crime_scene", "documents", "answer")):
            raise ValueError("Missing keys in LLM response")
        if not isinstance(obj["documents"], list) or len(obj["documents"]) < 2:
            raise ValueError("Documents must be a list of two strings")
        # Map to server.py expected schema
        question_text = f"{obj['crime_scene']}"
        clues_list = [obj["documents"][0], obj["documents"][1]]
        return {
            "Crime Scene": question_text,
            "documents": clues_list,
            "answer": ans,
        }
    except Exception as e:
        # Fallback example if LLM fails — already mapped to expected schema
        print("[generate_clue] LLM error or invalid response — using fallback. Error:", e)
        type_key = random.choice(list(GK_POOL.keys()))
        answer = random.choice(GK_POOL[type_key])
        crime_scene = "A dim alley dusted with rain; a single streetlight flickers over a scattered trail."
        documents = [
            "Evidence bag: metal spokes and a curved handle imprint near the doorway.",
            "Receipt stub: Purchased near a station on a stormy evening."
        ]
        return {
            "Crime Scene": f"{crime_scene}",
            "Documents": [documents[0], documents[1]],
            "answer": answer,
        }
witness_json_format='''{"answer": "yes"/"no"/"unknown"}'''
WITNESS_PROMPT = PromptTemplate(
    template=(
        '''
        
        You are a witness. The hidden answer (object/animal/landmark) is provided in context.
        Answer the detective's yes/no question ONLY with strict JSON as {witness_json_format}.
        If the question asserts something that is generally true about the hidden answer, reply 'yes'. If generally false, 'no'. If ambiguous, reply 'unknown'.
        Context (hidden true answer): {context}
        Question: {question}
        Response format: {witness_json_format}
        '''
    ),
    input_variables=["context", "question","witness_json_format"]
)



def answer_question(answer, question):
    """Ask the witness (llm2) a yes/no question given the hidden answer.
    Returns 'yes'/'no'/'unknown'.
    """
    print(answer,question)
    print(WITNESS_PROMPT.format(context=answer, question=question,witness_json_format=witness_json_format))
    # print(witness_json_format)
    chain = LLMChain(llm=llm2, prompt=WITNESS_PROMPT, output_key="resp")
    try:
        # Debug: print formatted prompt input
        try:
            formatted_prompt = WITNESS_PROMPT.format(context=answer, question=question,witness_json_format=witness_json_format)
            print("\n[DEBUG] WITNESS_PROMPT input ->\n" + formatted_prompt + "\n")
        except Exception as _:
            print("[DEBUG] Failed to format WITNESS_PROMPT")
        response = chain.invoke({"context": answer, "question": question,"witness_json_format":witness_json_format})
        raw = response.get("resp", "")
        obj = json.loads(raw)
        ans = obj.get("answer", "unknown")
        if ans not in ("yes", "no", "unknown"):
            return "unknown"
        return ans
    except Exception:
        return "unknown"



if __name__ == "__main__":
    print(answer_question("cat","Does it have whiskers"))