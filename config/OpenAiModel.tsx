import { AIDoctorAgents } from "@/list";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
    const { notes } = await req.json();
    try {
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.5-flash-preview-05-20",
            messages: [
                { role: "system",content:JSON.stringify(AIDoctorAgents)},
                { role: "user", content: "User Notes/Symptoms: " + notes+", Depending on the user notes and symptoms, Please suggest list of doctors, Return Objects in JSON only " }
            ],
        });
        const rawResponse = completion.choices[0].message;
        return NextResponse.json({ result: rawResponse });
    } catch (e) {
        return NextResponse.json(e);
    }
}