import os
from google import genai
from google.genai import types
from fastapi import HTTPException

class ClinicalInferenceService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("[Warning] GEMINI_API_KEY is missing from environment. Inference calls will fail.")
        
        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-2.5-flash"

    def execute_grounded_generation(self, system_prompt: str, user_prompt: str) -> str:
        """
        Transmits the engineered system prompt context block along with the clinician query
        to Gemini 2.5 Flash, enforcing deterministic clinical reasoning parameters.
        """
        try:
            config = types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=1000,
                system_instruction=system_prompt
            )
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_prompt,
                config=config
            )
            
            return response.text
        except Exception as e:
            print(f"[LLM Exception] Gemini execution failure: {str(e)}")
            raise HTTPException(
                status_code=502, 
                detail=f"Downstream LLM provider processing failed: {str(e)}"
            )

clinical_llm = ClinicalInferenceService()