import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Step, StepType, BreakdownResponseItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert ADHD coach. Your goal is to break down a user's task into extremely small, non-threatening micro-steps to overcome executive dysfunction (inertia).
The user will provide their "Current State" (what they are doing now, e.g., scrolling phone) and their "Target Goal".

You must generate exactly 5 to 7 steps in Simplified Chinese (简体中文). Follow this specific sequence:
1. Physical Reset (物理切断): A tiny change to the environment (e.g., put phone screen down, close a tab).
2. Physiological Reset (生理重置): A body action (e.g., take one deep breath, stand up, stretch hands).
3. Physical Start (物理启动): Merely touching the tool needed for the task (e.g., open the laptop lid, pick up the pen).
4-7. Action Steps (执行步骤): Very small, concrete actions to start the task.

Instructions must be short, imperative, and encouraging.
`;

const RESPONSE_SCHEMA: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      instruction: {
        type: Type.STRING,
        description: "The micro-step instruction in Chinese.",
      },
      type: {
        type: Type.STRING,
        enum: [
          "PHYSICAL_RESET",
          "PHYSIOLOGICAL_RESET",
          "PHYSICAL_START",
          "ACTION",
        ],
        description: "The category of the step.",
      },
    },
    required: ["instruction", "type"],
  },
};

export const generateBreakdown = async (
  currentStatus: string,
  targetGoal: string
): Promise<Step[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current State: ${currentStatus}. Target Goal: ${targetGoal}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.7,
      },
    });

    const rawSteps = JSON.parse(response.text || "[]") as BreakdownResponseItem[];

    // Map to internal Step interface
    return rawSteps.map((item, index) => ({
      id: crypto.randomUUID(),
      instruction: item.instruction,
      type: item.type as StepType,
      completed: false,
      timeSpentSeconds: 0,
    }));
  } catch (error) {
    console.error("Gemini breakdown error:", error);
    // Fallback steps in case of API failure (Chinese)
    return [
      { id: '1', instruction: "把手机屏幕扣在桌面上。", type: StepType.PHYSICAL_RESET, completed: false, timeSpentSeconds: 0 },
      { id: '2', instruction: "深呼吸，屏住呼吸3秒钟。", type: StepType.PHYSIOLOGICAL_RESET, completed: false, timeSpentSeconds: 0 },
      { id: '3', instruction: "坐在你的工作台前。", type: StepType.PHYSICAL_START, completed: false, timeSpentSeconds: 0 },
      { id: '4', instruction: "打开需要的APP或笔记本。", type: StepType.ACTION, completed: false, timeSpentSeconds: 0 },
      { id: '5', instruction: "写下第一句话或画出第一笔。", type: StepType.ACTION, completed: false, timeSpentSeconds: 0 },
    ];
  }
};

export const generateAdjustedBreakdown = async (
  currentStepInstruction: string,
  barrier: string,
  targetGoal: string
): Promise<Step[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user is stuck on step: "${currentStepInstruction}".
      The barrier is: "${barrier}".
      The ultimate target goal is: "${targetGoal}".

      Please generate a NEW sequence of steps to replace the current step and all subsequent steps.
      1. Acknowledgement/Regulation (1-2 steps): Address the barrier (e.g. if tired -> rest/stretch; if anxious -> breathe; if missing tool -> find alternative).
      2. Bridge (1 step): A very small, easy step to get back into motion.
      3. Action (3-5 steps): Continue towards the ultimate goal.

      Output in Simplified Chinese (简体中文).`,
      config: {
        systemInstruction: "You are a compassionate ADHD coach. Re-plan the route based on the user's difficulty. Be flexible and encouraging. JSON output.",
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA, // Reuse the array schema
        temperature: 0.7,
      },
    });

    const rawSteps = JSON.parse(response.text || "[]") as BreakdownResponseItem[];

    return rawSteps.map((item) => ({
      id: crypto.randomUUID(),
      instruction: item.instruction,
      type: item.type as StepType,
      completed: false,
      timeSpentSeconds: 0,
      isEmergency: true // Mark these as adjusted steps
    }));
  } catch (error) {
    console.error("Gemini replan error:", error);
    return [
      { id: crypto.randomUUID(), instruction: "先停下来，喝杯水休息一下。", type: StepType.PHYSIOLOGICAL_RESET, completed: false, timeSpentSeconds: 0, isEmergency: true },
      { id: crypto.randomUUID(), instruction: "深呼吸三次。", type: StepType.PHYSIOLOGICAL_RESET, completed: false, timeSpentSeconds: 0, isEmergency: true },
      { id: crypto.randomUUID(), instruction: "回到座位上。", type: StepType.PHYSICAL_START, completed: false, timeSpentSeconds: 0, isEmergency: true },
    ];
  }
};

// Deprecated or kept for fallback? Keeping it but unused in new logic.
export const generateEmergencyStep = async (currentStepInstruction: string, barrier: string): Promise<Step> => {
   // ... (Legacy code, strictly speaking not needed if we replace usage, but keeping for safety doesn't hurt)
   // For brevity in XML, I will replace the file content completely with the above, effectively removing the old single-step function if not needed, 
   // but to minimize disruption I'll just include the new function. 
   // Actually, the user asked to CHANGE the logic. So I will replace the functionality. 
   // I'll keep generateEmergencyStep definition to avoid breaking imports if I miss one, but I'll likely just use the new one.
   
   return {
        id: crypto.randomUUID(),
        instruction: "闭上眼睛休息10秒钟。",
        type: StepType.PHYSIOLOGICAL_RESET,
        completed: false,
        timeSpentSeconds: 0,
        isEmergency: true
   };
}