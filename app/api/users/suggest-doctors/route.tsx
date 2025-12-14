import { AIDoctorAgents } from "@/list";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

// List of free models to try in order
const freeModels = [
    "qwen/qwen3-8b:free",
    "google/gemma-3-1b-it:free",
    "nousresearch/deephermes-3-llama-3-8b-preview:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
];

export async function POST(req: NextRequest) {
    const { notes } = await req.json();
    
    let lastError = null;
    
    for (const model of freeModels) {
        try {
            console.log(`Trying model: ${model}`);
            const completion = await openai.chat.completions.create({
                model: model,
                max_tokens: 1000,
                messages: [
                    { role: 'system', content: JSON.stringify(AIDoctorAgents) },
                    { role: "user", content: "User Notes/Symptoms:" + notes + ", Depending on the user notes and symptoms, Please suggest list of doctors from the provided list. Return ONLY a valid JSON array of doctor objects, no other text." },
                ],
            });
            
            console.log("Completion:", completion);
            const rawResp = completion.choices[0].message.content || '';
            console.log("Raw Response:", rawResp);
            
            // Clean up response
            const Resp = rawResp.trim().replace(/```json/g, '').replace(/```/g, '').trim();
            console.log("Cleaned Response:", Resp);
            
            const JSONResp = JSON.parse(Resp);
            
            // Ensure image paths are correctly mapped from the original AIDoctorAgents list
            const mappedDoctors = JSONResp.map((doctor: any) => {
                const originalDoctor = AIDoctorAgents.find(d => d.id === doctor.id || d.specialist === doctor.specialist);
                if (originalDoctor) {
                    return { ...originalDoctor, ...doctor, image: originalDoctor.image };
                }
                return doctor;
            });
            
            return NextResponse.json(mappedDoctors);
            
        } catch (e: any) {
            console.log(`Model ${model} failed:`, e?.message || e);
            lastError = e;
            // Continue to next model
        }
    }
    
    // All models failed
    console.error("All models failed. Last error:", lastError);
    return NextResponse.json({ error: "All AI models are currently busy. Please wait 30 seconds and try again." }, { status: 503 });
}