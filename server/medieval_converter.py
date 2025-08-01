
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
# Initialize the Groq LLM
load_dotenv()
# api_key=os.getenv("GROQ_API_KEY")
llm = ChatGroq(
    model_name="llama-3.3-70b-versatile" # or "llama3-70b-8192", "mixtral-8x7b-32768", etc.

)

# Define the prompt template
prompt = ChatPromptTemplate.from_template(
    '''You are a british translator. Rewrite the text in a funny british style, but don’t change the meaning.

🏰 Rules:

If it’s a question, just translate it — don’t answer it.

Make the output short — about the same length as the original text.

Keep it easy to understand, even if it sounds medieval.

Make it sound a bit silly or exaggerated.

Only use words which are still known to everyone.


Text: {text}'''
)

# Create the chain
chain = LLMChain(llm=llm, prompt=prompt)
def convert_func(string):
    # Run the chain with a question
    response = chain.run(text=string)
    print(type(response))
    return response

print(convert_func("Hello how are you??"))

