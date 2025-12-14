import { usersTable } from "@/config/schema";
import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Session } from "inspector/promises";

export async function POST(req: NextRequest){
    const user=await currentUser(); 
    
    if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const users=await db.select().from(usersTable)
            .where(eq(usersTable.email, user.primaryEmailAddress.emailAddress));
        
        if (users?.length===0){
            const result=await db.insert(usersTable).values({
                name: user?.fullName || "Unknown",
                email: user?.primaryEmailAddress?.emailAddress,
                age: 0, // Add the required age field
                credits: 10,
            }).returning();
            
            return NextResponse.json(result[0]);
        }
        
        return NextResponse.json(users[0]);
    } catch (e){
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
}


export async function GET(req: NextRequest){
    const {searchParams} = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const user=await currentUser();

    const result = await db.select().from(usersTable)
    //@ts-ignore
    .where(eq(usersTable.email, user?.primaryEmailAddress?.emailAddress));

    return NextResponse.json(result[0]);
}