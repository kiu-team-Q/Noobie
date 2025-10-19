import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rules } = await req.json();

    if (!rules) {
      return new Response(
        JSON.stringify({ error: 'Rules are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const systemPrompt = `You are a coding instructor creating practice tasks for interns. Based on the company's coding guidelines, generate 3 progressive training tasks that help interns learn and practice these rules.

Each task should:
1. Start simple and increase in difficulty
2. Focus on specific rules from the guidelines
3. Include clear requirements
4. Be realistic and practical

Format your response as:

TASK 1: [Title]
Difficulty: Easy
Focus: [Which rules this practices]
Description: [Clear task description]
Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

TASK 2: [Title]
Difficulty: Medium
Focus: [Which rules this practices]
Description: [Clear task description]
Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

TASK 3: [Title]
Difficulty: Hard
Focus: [Which rules this practices]
Description: [Clear task description]
Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Company Coding Guidelines:\n\n${rules}\n\nGenerate 3 progressive training tasks based on these guidelines.` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please contact admin.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const tasks = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ tasks }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-training-tasks:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
