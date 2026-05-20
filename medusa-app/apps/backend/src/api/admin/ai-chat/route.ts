import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const SYSTEM_PROMPT = `Ти — AI-асистент для менеджерів сервісу здорового харчування "Green Balance".
Ти допомагаєш керувати меню, замовленнями, знижками та клієнтами через адмін-панель Medusa.

Твої можливості:
- Відповідати на питання про меню та страви
- Надавати інформацію про замовлення та клієнтів
- Давати поради щодо акцій та знижок
- Допомагати з управлінням раціонами та планами харчування
- Аналізувати тенденції та надавати рекомендації

Завжди відповідай українською мовою. Будь корисним, точним та лаконічним.`;

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const { message, history = [] } = req.body as {
    message: string;
    history: Message[];
  };

  if (!message?.trim()) {
    res.status(400).json({ error: "Повідомлення не може бути порожнім" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    res.status(200).json({
      reply:
        "⚠️ GROQ_API_KEY не налаштовано. Додайте ключ у файл .env бекенду для активації AI-асистента.",
    });
    return;
  }

  const messages: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages,
          temperature: 0.7,
          max_tokens: 1024,
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const reply = data.choices[0]?.message?.content ?? "Немає відповіді.";

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error("[ai-chat] Groq error:", error.message);
    res.status(500).json({
      error: "Помилка при зверненні до AI. Спробуйте ще раз.",
    });
  }
}
