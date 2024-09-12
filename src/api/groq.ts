import Groq from "groq-sdk";

export type Message = {
  role: "user" | "assistant",
  content: string,
  subject?: string
}

const groq = new Groq({
  apiKey: import.meta.env.VITE_OPENGROQ_KEY,
  dangerouslyAllowBrowser: true
});

export async function sendMessage(messages: Message[]) {
  try {
    const response = await groq.chat.completions.create({
      model: 'gemma2-9b-it',
      messages: messages.map(message => (
        { role: message.role, content: message.content }
      ))
    });

    return {
      role: response.choices[0].message.role,
      content: response.choices[0].message.content || ''
    }
  } catch(err) {
    if (err instanceof Groq.APIError) {
      console.log(err.status); // 400
      console.log(err.name); // BadRequestError
      console.log(err.headers); // {server: 'nginx', ...}
    } else {
      throw err;
    }
  };
}
