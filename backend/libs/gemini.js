import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export const smartGrade = async (rubric, tasksData, projectTitle) => {
  if (!genAI) {
    throw new Error("Gemini API key is not configured.");
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2, // Low temperature for more analytical/consistent grading
    },
  });

  const prompt = `
    You are an expert university professor's grading assistant. Your job is to strictly evaluate student project tasks and assign marks based on the provided grading rubric.

    PROJECT TITLE: "${projectTitle}"

    GRADING RUBRIC DEFINED BY THE TEACHER:
    """
    ${rubric || "No specific rubric provided. Grade based on standard software engineering task complexity. Max marks is 100 unless otherwise specified."}
    """

    TASKS TO EVALUATE (Grouped by student):
    ${JSON.stringify(tasksData, null, 2)}

    EVALUATION INSTRUCTIONS:
    1. Read the rubric carefully, especially regarding maximum marks, expected complexity, and team effort distribution.
    2. Analyze each task based on its title, description, and the number of completed subtasks. A task with many completed subtasks might represent more effort.
    3. Compare tasks between students. If the rubric states "minimum 20 hours of work total", and Student A has highly complex API tasks while Student B only changed a button color, adjust grades proportionally according to the rubric's standard.
    4. Provide a suggested mark (a number) and a brief 1-2 sentence reasoning explaining WHY they got that mark based on the rubric parameters.

    OUTPUT FORMAT: You MUST return a valid JSON ARRAY of objects. Each object must have these exactly properties:
    - "taskId": the _id of the task
    - "suggestedMarks": the numeric marks awarded (e.g., 15)
    - "reasoning": "A brief explanation of the grade based on task complexity and rubric."
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedData = JSON.parse(responseText);
    return parsedData;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to generate AI grades.");
  }
};
