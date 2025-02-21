import {serverConfig} from "@/serverConfig";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        console.log('HELLO 111', serverConfig.backendOneUrl)
        await fetch(serverConfig.backendOneUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json({ status: 200 });
    } catch (error) {
        console.error('Error handling POST request:', error);
        return NextResponse.json({ error }, { status: 500, });
    }
}