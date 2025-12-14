import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { db } from "@/config/db";
import { SessionChatTable } from "@/config/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    const { notes, selectedDoctor } = await req.json();
    const user = await currentUser();
    
    try {
        const sessionId = uuidv4();
        const result = await db.insert(SessionChatTable).values({
            sessionId: sessionId,
            createdBy: user?.primaryEmailAddress?.emailAddress,
            notes: notes,
            selectedDoctor: selectedDoctor,
            createdOn: (new Date()).toString()
        //@ts-ignore
        }).returning({ sessionId: SessionChatTable.sessionId });
        
        return NextResponse.json({ sessionId: result[0].sessionId });
    } catch (e) {
        console.error("Error:", e);
        return NextResponse.json({ error: e }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user = await currentUser();
    
    if (sessionId === 'all') {
        const result = await db.select().from(SessionChatTable)
            //@ts-ignore
            .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress))
            .orderBy(desc(SessionChatTable.id));
        return NextResponse.json(result);
    }
    
    const result = await db.select().from(SessionChatTable)
        //@ts-ignore
        .where(eq(SessionChatTable.sessionId, sessionId));
    
    return NextResponse.json(result[0]);
}