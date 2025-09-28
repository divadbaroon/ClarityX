import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { CONCEPT_MAP_SYSTEM_PROMPT } from '@/lib/prompt/conceptMapPrompts';
import { ConceptMapContextBuilder } from '@/lib/context/conceptMapContext';

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Concept map API called!');
    
    const body = await req.json();
    const { context } = body;

    if (!context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    console.log('📨 Received context for method:', context.methodName);

    // Build the user prompt
    const userPrompt = ConceptMapContextBuilder.buildUserPrompt(context);
    
    // Call AI SDK directly
    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: CONCEPT_MAP_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.3,
      maxOutputTokens: 4000,
    });

    console.log('🔍 Raw AI response:', result.text.substring(0, 200));

    // Extract JSON from the response
    const jsonText = result.text.trim();
    
    // Try multiple ways to extract JSON
    let response;
    
    // Method 1: Look for JSON code block
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        response = JSON.parse(jsonMatch[1]);
        console.log('✅ Parsed from code block');
      } catch {
        console.log('⚠️ Failed to parse from code block');
      }
    }
    
    // Method 2: Look for JSON object directly
    if (!response) {
      const objectMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          response = JSON.parse(objectMatch[0]);
          console.log('✅ Parsed from object match');
        } catch {
          console.log('⚠️ Failed to parse from object match');
        }
      }
    }
    
    // Method 3: Try parsing the whole response
    if (!response) {
      try {
        response = JSON.parse(jsonText);
        console.log('✅ Parsed whole response');
      } catch {
        console.log('⚠️ Failed to parse whole response');
      }
    }
    
    // If all parsing fails, create a fallback response
    if (!response) {
      console.log('⚠️ All parsing attempts failed, using fallback');
      response = {
        updatedConceptMap: {
          "Arrays": {
            understandingLevel: 0.5,
            confidenceInAssessment: 0.3,
            reasoning: "Unable to parse AI response, using default assessment",
            lastUpdated: new Date().toISOString()
          },
          "Hash Tables": {
            understandingLevel: 0.5,
            confidenceInAssessment: 0.3,
            reasoning: "Unable to parse AI response, using default assessment",
            lastUpdated: new Date().toISOString()
          }
        }
      };
    }

    console.log('🎯 Concept map assessment completed');

    return NextResponse.json({
      updatedConceptMap: response.updatedConceptMap || response
    });

  } catch (error) {
    console.error('❌ Error in concept map API:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return a fallback concept map even on error
    return NextResponse.json({
      updatedConceptMap: {
        "Arrays": {
          understandingLevel: 0.5,
          confidenceInAssessment: 0.2,
          reasoning: `Error during assessment: ${errorMessage}`,
          lastUpdated: new Date().toISOString()
        },
        "Hash Tables": {
          understandingLevel: 0.5,
          confidenceInAssessment: 0.2,
          reasoning: `Error during assessment: ${errorMessage}`,
          lastUpdated: new Date().toISOString()
        }
      },
      error: errorMessage
    });
  }
}