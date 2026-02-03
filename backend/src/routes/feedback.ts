import { supabaseAdmin } from '../lib/supabase';
import { optionalAuth, jsonResponse, errorResponse, handleCors } from '../middleware/auth';

// POST /feedback - Submit feedback
export async function submitFeedback(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // Auth is optional for feedback
  const { user } = await optionalAuth(request);

  try {
    const body = await request.json() as {
      message: string;
    };

    const { message } = body;

    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required');
    }

    if (message.length > 2000) {
      return errorResponse('Message must be 2000 characters or less');
    }

    // Create feedback record
    const { error } = await supabaseAdmin
      .from('feedback')
      .insert({
        user_id: user?.id || null,
        message: message.trim(),
      });

    if (error) {
      console.error('Submit feedback error:', error);
      return errorResponse('Failed to submit feedback', 500);
    }

    return jsonResponse({
      message: 'Thank you for your feedback!',
    }, 201);
  } catch (error) {
    console.error('Submit feedback exception:', error);
    return errorResponse('Failed to submit feedback', 500);
  }
}
