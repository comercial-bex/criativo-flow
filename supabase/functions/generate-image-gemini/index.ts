import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, onboardingData } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google AI API key not configured');
    }

    console.log('Generating image with Gemini for prompt:', prompt);
    console.log('Using onboarding data for context:', onboardingData?.segmentoAtuacao || 'none');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${googleApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Image generated successfully with Gemini');

    // Extract image data from Gemini response
    const candidate = data.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.inlineData) {
      throw new Error('No image data received from Gemini');
    }

    const imageData = candidate.content.parts[0].inlineData;
    const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

    return new Response(JSON.stringify({ 
      imageUrl: imageUrl,
      prompt: prompt,
      model: 'gemini-2.5-flash-image'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-image-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});