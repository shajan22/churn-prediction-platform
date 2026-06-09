"""
Test script to check Gemini API availability and list available models
"""
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    import google.generativeai as genai
    api_key = os.getenv('GEMINI_API_KEY', '')

    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env file")
        print("Please add your API key to server/.env:")
        print("GEMINI_API_KEY=your_actual_key_here")
        exit(1)

    print(f"✓ API Key found: {str(api_key)[:10]}...")

    try:
        genai.configure(api_key=api_key) # type: ignore
        print("✓ Gemini API configured successfully")
        
        # List available models
        print("\n📋 Available Gemini Models:")
        print("-" * 60)
        
        for model in genai.list_models(): # type: ignore
            if 'generateContent' in model.supported_generation_methods:
                print(f"✓ {model.name}")
                print(f"  Display Name: {model.display_name}")
                print(f"  Description: {model.description}")
                print(f"  Supported: {', '.join(model.supported_generation_methods)}")
                print()
        
        # Test with a simple prompt
        print("\n🧪 Testing model with simple prompt...")
        model = genai.GenerativeModel('gemini-1.5-flash') # type: ignore
        response = model.generate_content("Say hello in one word")
        print(f"✓ Response: {response.text}")
        print("\n✅ Gemini API is working correctly!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. API key doesn't have proper permissions")
        print("3. Need to upgrade google-generativeai package:")
        print("   pip install --upgrade google-generativeai")
