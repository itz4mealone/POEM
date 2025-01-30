import { cohere } from "@ai-sdk/cohere"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { poem, form } = await req.json()

    if (!poem || !form) {
      return new Response(JSON.stringify({ error: "Poem and form are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { text } = await generateText({
      model: cohere("command"),
      prompt: `As a poetry expert, analyze this ${form} poem and provide feedback in JSON format with the following structure:
{
  "overallRating": "Rate the poem from 1-10 and explain why",
  "strengths": ["List 2-3 main strengths of the poem"],
  "weaknesses": ["List 2-3 areas that need improvement"],
  "technicalAnalysis": {
    "rhythm": "Rate rhythm 1-10 and explain",
    "wordChoice": "Rate word choice 1-10 and explain",
    "imagery": "Rate imagery 1-10 and explain",
    "structure": "Rate structure 1-10 and explain"
  },
  "improvements": ["List 3-4 specific suggestions for improvement"],
  "finalVerdict": "A brief, encouraging summary of the poem's potential"
}

Poem:
${poem}

Provide constructive, encouraging feedback while being honest about areas for improvement. Return ONLY the JSON object with no additional text.`,
    })

    try {
      const analysis = JSON.parse(text.trim())
      return new Response(JSON.stringify({ analysis }), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError)
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          rawResponse: text,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: "An error occurred while analyzing the poem.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

