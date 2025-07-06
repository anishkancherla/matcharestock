import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { accessCode } = await request.json()
    
    const validAccessCode = process.env.ACCESS_CODE
    
    if (!validAccessCode) {
      return NextResponse.json({ error: "Access code not configured" }, { status: 500 })
    }
    
    if (accessCode === validAccessCode) {
      return NextResponse.json({ valid: true })
    } else {
      return NextResponse.json({ valid: false }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
} 