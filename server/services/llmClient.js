
export async function askLLM(instructions, inputPrompt) {
    if(!instructions) throw new Error('Instructions are missing!')
    if(!inputPrompt) throw new Error('Input prompt is missing!')

    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) throw new Error('Missing api key');

    const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4.1-nano',
            instructions: instructions,
            input: inputPrompt
        })
    })

    if (!resp.ok) {
        const errorText = await resp.text()
        throw new Error(`Request failed with error: ${errorText}`);
    }

    const data = await resp.json();
    const assistantResponse = data.output[0].content[0].text;

    if(!assistantResponse) throw new Error('No output returned from LLM');

    return assistantResponse;
};