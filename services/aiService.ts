interface ParsedTask {
  title: string;
  duration: number;
  deadline: string;
  priority: "low" | "medium" | "high";
  description?: string;
}

interface Task {
  id: string;
  title: string;
  duration: number;
  deadline: string;
  priority: "low" | "medium" | "high";
  description?: string;
}

interface ScheduleItem {
  start: string;
  end: string;
  task?: string;
  taskId?: string;
  break?: boolean;
}

interface StudyPlan {
  date: string;
  schedule: ScheduleItem[];
}

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY?.trim() || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    console.error("Gemini API key not found in environment variables");
    throw new Error("Gemini API key not configured");
  }

  try {
    console.log("Calling Gemini API...");
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error response:", errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
}

function extractJSON(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
}

// Smart local parser that works without API
function smartLocalParser(text: string): ParsedTask {
  const lowerText = text.toLowerCase();

  // Extract title - first meaningful phrase
  const title = text.split(/[,.!?]/)[0].trim() || text.substring(0, 50).trim();

  // Parse priority
  let priority: "low" | "medium" | "high" = "medium";
  if (
    lowerText.includes("urgent") ||
    lowerText.includes("asap") ||
    lowerText.includes("critical")
  ) {
    priority = "high";
  } else if (
    lowerText.includes("low priority") ||
    lowerText.includes("whenever") ||
    lowerText.includes("flexible")
  ) {
    priority = "low";
  }

  // Parse duration (look for time patterns like "2 hours", "30 minutes", "1.5 hours")
  let duration = 60;
  const durationMatch = text.match(
    /(\d+(?:\.\d+)?)\s*(hour|hr|h|minute|min|m)/i
  );
  if (durationMatch) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.includes("h")) {
      duration = Math.round(value * 60);
    } else {
      duration = Math.round(value);
    }
  }
  // Clamp duration between 15 and 480 minutes
  duration = Math.max(15, Math.min(480, duration));

  // Parse deadline (look for dates like "tomorrow", "next week", specific dates)
  let deadline = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: tomorrow

  if (lowerText.includes("today")) {
    deadline = new Date();
  } else if (lowerText.includes("tomorrow")) {
    deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  } else if (lowerText.includes("next week")) {
    deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else if (lowerText.includes("next month")) {
    deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (lowerText.includes("in") && lowerText.includes("day")) {
    const dayMatch = text.match(/in\s+(\d+)\s+day/i);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      deadline = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }

  // Set default time to 6 PM if not specified
  deadline.setHours(18, 0, 0, 0);

  return {
    title,
    duration,
    deadline: deadline.toISOString(),
    priority,
  };
}

export async function parseTaskText(text: string): Promise<ParsedTask> {
  try {
    const prompt = `Parse this task description and return ONLY valid JSON (no markdown, no extra text):
"${text}"

Return JSON with this exact structure:
{
  "title": "subject/topic (string)",
  "duration": number in minutes,
  "deadline": "ISO 8601 datetime string",
  "priority": "low|medium|high",
  "description": "optional detailed description"
}

Rules:
- If no time is mentioned, default to tomorrow at 6 PM
- If no duration is mentioned, default to 60 minutes
- Default priority is "medium"
- Duration must be between 15 and 480 minutes
- Return ONLY the JSON object, nothing else`;

    const response = await callGemini(prompt);
    const parsed = extractJSON(response);

    if (parsed && parsed.title) {
      return {
        title: parsed.title || text.substring(0, 50),
        duration: Math.max(15, Math.min(480, parsed.duration || 60)),
        deadline:
          parsed.deadline ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: ["low", "medium", "high"].includes(parsed.priority)
          ? parsed.priority
          : "medium",
        description: parsed.description,
      };
    }

    // If API parsing fails, use smart local parser
    console.log("API parsing failed, using local smart parser");
    return smartLocalParser(text);
  } catch (error) {
    console.error("Task parsing failed, using local smart parser:", error);
    // Use local parser as fallback when API is unavailable
    return smartLocalParser(text);
  }
}

export async function generateStudyPlan(tasks: Task[]): Promise<StudyPlan> {
  const today = new Date().toISOString().split("T")[0];

  const fallbackPlan: StudyPlan = {
    date: today,
    schedule: [
      { start: "08:00", end: "09:00", task: "Morning Review" },
      { start: "09:00", end: "09:15", break: true },
      { start: "09:15", end: "10:15", task: "Main Task" },
      { start: "10:15", end: "10:30", break: true },
      { start: "10:30", end: "11:30", task: "Secondary Task" },
    ],
  };

  try {
    if (!tasks || tasks.length === 0) {
      return fallbackPlan;
    }

    const taskDescriptions = tasks
      .map(
        (t) =>
          `- "${t.title}" (${t.duration} min, priority: ${t.priority}, deadline: ${t.deadline})`
      )
      .join("\n");

    const prompt = `Create an optimized study schedule for today. Return ONLY valid JSON (no markdown, no extra text):

Tasks to schedule:
${taskDescriptions}

Return JSON with this exact structure:
{
  "date": "YYYY-MM-DD",
  "schedule": [
    { "start": "HH:MM", "end": "HH:MM", "task": "task name", "taskId": "id" },
    { "start": "HH:MM", "end": "HH:MM", "break": true }
  ]
}

Rules:
- Schedule from 08:00 to 22:00
- Max 2 hours per study session
- Include 10-15 minute breaks between sessions
- Prioritize high priority tasks and urgent deadlines
- Schedule heavier tasks earlier in the day
- Return ONLY the JSON object, nothing else`;

    const response = await callGemini(prompt);
    const parsed = extractJSON(response);

    if (parsed && Array.isArray(parsed.schedule)) {
      return {
        date: parsed.date || today,
        schedule: parsed.schedule,
      };
    }

    return fallbackPlan;
  } catch (error) {
    console.error("Study plan generation failed, using fallback:", error);
    return fallbackPlan;
  }
}
