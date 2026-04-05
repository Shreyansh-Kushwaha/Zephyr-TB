import { NextResponse } from 'next/server';
import { AssemblyAI } from 'assemblyai';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const imageFile = formData.get('image') as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // --- 1. ASSEMBLYAI AUDIO PROCESSING ---
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });
    
    console.log("🔑 Routing audio to AssemblyAI...");
    const transcriptPromise = client.transcripts.transcribe({
      audio: audioBuffer,
      speech_models: ["universal-3-pro", "universal-2"],
      language_code: "en",
      prompt: "Produce a transcript suitable for clinical analysis. Tag sounds: [cough], [breathing]."
    });

    // --- 2. OPENCV IMAGE PROCESSING ---
    let visionResult = { success: false, bump_mm: null, error: "No image was uploaded." };
    
    if (imageFile) {
      console.log("📸 Image received. Running OpenCV Math...");
      const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}.jpg`);
      
      try {
        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        writeFileSync(tempFilePath, imageBuffer);

        // Try to run Python (Fallback to python3 if python fails)
        let pythonOutput = "";
        try {
          pythonOutput = execSync(`python measure_bump.py ${tempFilePath}`).toString();
        } catch (e) {
          pythonOutput = execSync(`python3 measure_bump.py ${tempFilePath}`).toString();
        }
        
        visionResult = JSON.parse(pythonOutput);
        console.log("✅ OpenCV Output:", visionResult);
      } catch (err) {
        console.error("❌ OpenCV Failed:", err);
        visionResult = { success: false, bump_mm: null, error: "Computer Vision script crashed." };
      } finally {
        // Always clean up the temp file
        try { unlinkSync(tempFilePath); } catch (e) {}
      }
    }

    // --- 3. WAIT FOR AUDIO AND RETURN ---
    const transcript = await transcriptPromise;
    const events = transcript.words ? transcript.words.map(w => ({
      text: w.text, confidence: w.confidence
    })) : [];

    // CRITICAL: We are explicitly returning "visionData" here
    return NextResponse.json({ 
      events,
      visionData: visionResult 
    });

  } catch (error) {
    console.error("Fatal API Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}