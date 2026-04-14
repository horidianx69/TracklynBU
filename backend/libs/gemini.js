import Groq from "groq-sdk";

let groqClient = null;

const getGroq = () => {
  if (groqClient) return groqClient;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key is not configured. Please add GROQ_API_KEY to your .env file.");
  }

  groqClient = new Groq({ apiKey });
  return groqClient;
};

// Use best model for grading (needs reasoning), fast model for rest
const MODELS = {
  smartGrade: "llama-3.3-70b-versatile",  // 1K/day — save for grading only
  plagiarism: "llama-3.1-8b-instant",      // 14.4K/day — fast, fine for comparisons
  benchmarks: "llama-3.1-8b-instant",      // 14.4K/day — fast, fine for structured output
};

/**
 * Helper to call Groq and parse JSON response safely
 */
const callGroq = async (systemPrompt, userPrompt, model = MODELS.plagiarism) => {
  const client = getGroq();

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text);
  } catch {
    // Strip markdown fences if model adds them despite json_object mode
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  }
};

/**
 * Grades student project tasks based on a rubric.
 * @param {string} rubric - The grading rubric defined by the teacher
 * @param {Array} tasksData - Array of { studentName, tasks[] } objects
 * @param {string} projectTitle - The project title
 */
export const smartGrade = async (rubric, tasksData, projectTitle) => {
  // Ensure tasksData is an array (controller passes Object.values(groupedData))
  if (!Array.isArray(tasksData)) {
    tasksData = Object.values(tasksData);
  }

  // Trim task data to reduce token usage
  // Handles both _id and taskId field names from the controller
  const trimmedTasks = tasksData.map((student) => ({
    studentName: student.studentName,
    tasks: student.tasks.map((t) => ({
      _id: t._id || t.taskId,         // handle both field names
      title: t.title,
      description: t.description || "",
      subtasksDone: t.subtasksCompleted ?? t.subtasks?.filter((s) => s.completed).length ?? 0,
      totalSubtasks: t.subtasksTotal ?? t.subtasks?.length ?? 0,
    })),
  }));

  const systemPrompt = `You are an expert university professor's grading assistant.
You strictly evaluate student project tasks and assign marks based on the provided grading rubric.
You MUST respond with a valid JSON object only — no explanation, no markdown.
The JSON object must have a "grades" key containing an array of grade objects.`;

  const userPrompt = `
PROJECT TITLE: "${projectTitle}"

GRADING RUBRIC:
"""
${rubric || "No specific rubric provided. Grade based on standard software engineering task complexity. Max marks is 100."}
"""

TASKS TO EVALUATE (Grouped by student):
${JSON.stringify(trimmedTasks, null, 2)}

EVALUATION INSTRUCTIONS:
1. Read the rubric carefully regarding maximum marks, expected complexity, and team effort distribution.
2. Analyze each task based on its title, description, and completed subtasks ratio.
3. Compare tasks between students and adjust grades proportionally per the rubric.
4. Provide a suggested mark and brief 1-2 sentence reasoning.

Return a JSON object with a "grades" array where each object has:
- "taskId": the _id of the task (string)
- "suggestedMarks": numeric marks awarded (number)
- "reasoning": brief explanation based on rubric (string)

Example: {"grades": [{"taskId":"abc123","suggestedMarks":15,"reasoning":"..."}]}
`;

  try {
    const result = await callGroq(systemPrompt, userPrompt, MODELS.smartGrade);

    // Handle all possible response shapes from the model
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.grades)) return result.grades;
    if (Array.isArray(result.tasks)) return result.tasks;

    // Last resort: grab first array value from the object
    const firstArray = Object.values(result).find((v) => Array.isArray(v));
    if (firstArray) return firstArray;

    throw new Error("Unexpected response shape from AI: " + JSON.stringify(result));
  } catch (error) {
    console.error("Smart Grade Error:", error?.message || error);
    throw new Error("Failed to generate AI grades.");
  }
};

/**
 * Checks a new project request for plagiarism against existing workspace projects.
 */
export const checkPlagiarism = async (newProject, existingProjects) => {
  const systemPrompt = `You are an expert academic plagiarism detection system for university project submissions.
You compare project proposals and return similarity scores.
You MUST respond with a valid JSON object only — no explanation, no markdown.`;

  const userPrompt = `
Compare this NEW project against EXISTING approved projects for semantic similarity.

NEW PROJECT:
Title: "${newProject.title}"
Description: "${newProject.description || "No description provided"}"

EXISTING PROJECTS:
${JSON.stringify(
    existingProjects.map((p) => ({
      id: p._id,
      title: p.title,
      description: p.description || "",
    })),
    null,
    2
  )}

INSTRUCTIONS:
1. Compare the NEW project's core idea and concept against each existing project.
2. Focus on SEMANTIC similarity, not just keyword matching.
3. Only include projects with similarityScore >= 30.

Return a JSON object:
{
  "plagiarismScore": <number 0-100>,
  "similarProjects": [
    {
      "projectId": "<existing project id>",
      "projectTitle": "<existing project title>",
      "similarityScore": <number 0-100>,
      "reasoning": "<brief explanation>"
    }
  ],
  "verdict": "<one of: original | needs_review | plagiarism_detected>"
}

RULES: "original" = score < 40, "needs_review" = score 40-69, "plagiarism_detected" = score >= 70.
`;

  try {
    return await callGroq(systemPrompt, userPrompt, MODELS.plagiarism);
  } catch (error) {
    console.error("Plagiarism Check Error:", error?.message || error);
    throw new Error("Failed to check plagiarism via AI.");
  }
};

/**
 * Generates 12-hour project benchmarks tailored to a specific project idea.
 */
export const generateBenchmarks = async (projectTitle, projectDescription) => {
  const systemPrompt = `You are a university-level software engineering professor.
You generate structured project benchmarks for evaluating student projects.
You MUST respond with a valid JSON object only — no explanation, no markdown.`;

  const userPrompt = `
Generate BENCHMARKS for this project to be viable as a 12-hour development project.

PROJECT:
Title: "${projectTitle}"
Description: "${projectDescription || "No description provided"}"

Generate benchmarks covering:
1. Fullstack Architecture
2. Database Integration
3. Authentication & Authorization
4. Containerization / Deployment
5. Code Quality
6. UI/UX

Return a JSON object:
{
  "benchmarks": [
    {
      "category": "<category name>",
      "description": "<specific requirement>"
    }
  ],
  "benchmarkSummary": "<overall summary>",
  "meetsStandard": <true or false>,
  "reviewComment": "<professor's review comment>"
}
`;

  try {
    return await callGroq(systemPrompt, userPrompt, MODELS.benchmarks);
  } catch (error) {
    console.error("Benchmark Generation Error:", error?.message || error);
    throw new Error("Failed to generate project benchmarks via AI.");
  }
};