# async def test_ollama_provider():
#     provider = OllamaProvider()
#     prompt = "What is the capital of France?"

#     # Non-streaming call
#     response = await provider.generate_response(prompt, stream=False)
#     print("Non-streaming Response:", response)

#     # Streaming call
#     async for line in provider.generate_response(prompt, stream=True):
#         print("Streaming Response:", line)
