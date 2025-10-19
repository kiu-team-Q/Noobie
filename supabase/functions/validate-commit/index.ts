import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Scoring coefficients (can be adjusted)
const COEFFICIENTS = {
  excellent: 1.0,  // Points per line of excellent code
  ok: 0.5,         // Points per line of okay code
  bad: -1.5,       // Points per line of bad code
};

// Category thresholds based on percentage score
const THRESHOLDS = {
  A: 70,  // >= 70% is excellent (A)
  B: 40,  // >= 40% is acceptable (B)
  // < 40% is bad (C) and blocks commit
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, gitDiff } = await req.json();
    
    if (!email || !password || !gitDiff) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, gitDiff' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // Authenticate user
    const authClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's position and rules
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('position_id, company_id')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData?.position_id) {
      return new Response(
        JSON.stringify({ error: 'User position not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: positionData, error: positionError } = await adminClient
      .from('positions')
      .select('rules, name')
      .eq('id', userData.position_id)
      .single();

    if (positionError || !positionData?.rules) {
      return new Response(
        JSON.stringify({ error: 'Position rules not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Count total lines of code changes in git diff
    const totalLines = countGitDiffLines(gitDiff);
    
    if (totalLines === 0) {
      return new Response(
        JSON.stringify({
          category: 'A',
          score: 100,
          breakdown: { excellent_lines: 0, ok_lines: 0, bad_lines: 0 },
          feedback: 'No code changes detected',
          allow_commit: true,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare AI prompt for validation
    const systemPrompt = `You are a code reviewer analyzing git diff changes against company coding guidelines.

Analyze the git diff and categorize EACH CHANGED LINE into three categories:
1. EXCELLENT: Lines that perfectly follow the guidelines
2. OK: Lines that are acceptable but could be improved
3. BAD: Lines that violate the guidelines

IMPORTANT: Only analyze the lines that were ADDED (starting with +) in the diff, ignore removed lines (starting with -).

Return your analysis in this EXACT format:

EXCELLENT_LINES: [number]
OK_LINES: [number]
BAD_LINES: [number]

FEEDBACK:
[Provide specific feedback about what was good and what needs improvement]

ISSUES:
[List specific guideline violations if any]

Be precise with line counts. The sum of EXCELLENT_LINES + OK_LINES + BAD_LINES should equal the total number of added lines.`;

    const userPrompt = `Company Guidelines for ${positionData.name}:
${positionData.rules}

Git Diff to analyze:
\`\`\`diff
${gitDiff}
\`\`\`

Analyze the code changes and provide your assessment.`;

    // Call AI for validation
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content;
    
    console.log('AI Analysis:', analysis);

    // Parse AI response
    const parsed = parseAIAnalysis(analysis);
    
    // Calculate score
    const excellentScore = parsed.excellent_lines * COEFFICIENTS.excellent;
    const okScore = parsed.ok_lines * COEFFICIENTS.ok;
    const badScore = parsed.bad_lines * COEFFICIENTS.bad;
    const totalScore = excellentScore + okScore + badScore;
    
    // Calculate max possible score (all lines excellent)
    const maxScore = totalLines * COEFFICIENTS.excellent;
    
    // Calculate percentage score
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 100;
    
    // Determine category
    let category: 'A' | 'B' | 'C';
    if (percentageScore >= THRESHOLDS.A) {
      category = 'A';
    } else if (percentageScore >= THRESHOLDS.B) {
      category = 'B';
    } else {
      category = 'C';
    }

    const allowCommit = category !== 'C';

    // Store submission in database
    const points = Math.max(0, Math.round(percentageScore));
    const submissionFeedback = `Category: ${category} | Score: ${Math.round(percentageScore * 10) / 10}%\n\n${parsed.feedback}\n\n${parsed.issues ? `Issues:\n${parsed.issues}` : ''}`;
    
    const { error: insertError } = await adminClient
      .from('code_submissions')
      .insert({
        intern_id: authData.user.id,
        code: gitDiff,
        feedback: submissionFeedback,
        points_awarded: points,
        status: allowCommit ? 'approved' : 'rejected',
      });

    if (insertError) {
      console.error('Error storing submission:', insertError);
    }

    // Update user's rating points
    const { error: updateError } = await adminClient.rpc('increment_user_points', {
      user_id: authData.user.id,
      points_to_add: points
    });

    if (updateError) {
      console.error('Error updating user points:', updateError);
    }

    return new Response(
      JSON.stringify({
        category,
        score: Math.round(percentageScore * 10) / 10,
        breakdown: {
          excellent_lines: parsed.excellent_lines,
          ok_lines: parsed.ok_lines,
          bad_lines: parsed.bad_lines,
          total_lines: totalLines,
        },
        feedback: parsed.feedback,
        issues: parsed.issues,
        allow_commit: allowCommit,
        details: {
          coefficients: COEFFICIENTS,
          thresholds: THRESHOLDS,
          raw_score: Math.round(totalScore * 10) / 10,
          max_score: maxScore,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in validate-commit function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to count lines in git diff (only additions)
function countGitDiffLines(gitDiff: string): number {
  const lines = gitDiff.split('\n');
  let count = 0;
  
  for (const line of lines) {
    // Count lines that start with + (additions) but not +++ (file markers)
    if (line.startsWith('+') && !line.startsWith('+++')) {
      count++;
    }
  }
  
  return count;
}

// Helper function to parse AI analysis response
function parseAIAnalysis(analysis: string): {
  excellent_lines: number;
  ok_lines: number;
  bad_lines: number;
  feedback: string;
  issues: string;
} {
  const excellentMatch = analysis.match(/EXCELLENT_LINES:\s*(\d+)/i);
  const okMatch = analysis.match(/OK_LINES:\s*(\d+)/i);
  const badMatch = analysis.match(/BAD_LINES:\s*(\d+)/i);
  
  const feedbackMatch = analysis.match(/FEEDBACK:\s*([\s\S]*?)(?=ISSUES:|$)/i);
  const issuesMatch = analysis.match(/ISSUES:\s*([\s\S]*?)$/i);
  
  return {
    excellent_lines: excellentMatch ? parseInt(excellentMatch[1]) : 0,
    ok_lines: okMatch ? parseInt(okMatch[1]) : 0,
    bad_lines: badMatch ? parseInt(badMatch[1]) : 0,
    feedback: feedbackMatch ? feedbackMatch[1].trim() : 'No feedback provided',
    issues: issuesMatch ? issuesMatch[1].trim() : 'No issues found',
  };
}
