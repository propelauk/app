import { supabaseAdmin } from '../../lib/supabase';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';

// GET /admin/help-requests - List all help requests
export async function listHelpRequests(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('help_requests')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error, count } = await query;

    if (error) {
      console.error('List help requests error:', error);
      return errorResponse('Failed to fetch help requests', 500);
    }

    return jsonResponse({
      requests: requests?.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: `${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.trim() || 'Unknown',
        message: r.message,
        budgetUsd: r.budget_usd,
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone,
        fileUrl: r.file_url,
        externalUrl: r.external_url,
        status: r.status,
        createdAt: r.created_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List help requests exception:', error);
    return errorResponse('Failed to fetch help requests', 500);
  }
}

// PUT /admin/help-requests/:id/status - Update help request status
export async function updateHelpRequestStatus(request: Request, requestId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as {
      status: 'new' | 'in_progress' | 'resolved' | 'closed';
    };

    const validStatuses = ['new', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(body.status)) {
      return errorResponse('Invalid status');
    }

    const { error } = await supabaseAdmin
      .from('help_requests')
      .update({ status: body.status })
      .eq('id', requestId);

    if (error) {
      console.error('Update help request status error:', error);
      return errorResponse('Failed to update status', 500);
    }

    return jsonResponse({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Update help request status exception:', error);
    return errorResponse('Failed to update status', 500);
  }
}

// DELETE /admin/help-requests/:id - Delete help request
export async function deleteHelpRequest(request: Request, requestId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { error } = await supabaseAdmin
      .from('help_requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      console.error('Delete help request error:', error);
      return errorResponse('Failed to delete request', 500);
    }

    return jsonResponse({ message: 'Help request deleted successfully' });
  } catch (error) {
    console.error('Delete help request exception:', error);
    return errorResponse('Failed to delete request', 500);
  }
}

// GET /admin/feedback - List all feedback
export async function listFeedback(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = (page - 1) * limit;

    const { data: feedback, error, count } = await supabaseAdmin
      .from('feedback')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('List feedback error:', error);
      return errorResponse('Failed to fetch feedback', 500);
    }

    // Get user emails for feedback with user_id
    const userIds = feedback?.filter(f => f.user_id).map(f => f.user_id) || [];
    const userEmails: Record<string, string> = {};

    for (const userId of userIds) {
      if (userId) {
        const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (data.user?.email) {
          userEmails[userId] = data.user.email;
        }
      }
    }

    return jsonResponse({
      feedback: feedback?.map(f => ({
        id: f.id,
        userId: f.user_id,
        email: f.user_id ? userEmails[f.user_id] : null,
        userName: f.profiles
          ? `${f.profiles.first_name || ''} ${f.profiles.last_name || ''}`.trim()
          : 'Anonymous',
        message: f.message,
        createdAt: f.created_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List feedback exception:', error);
    return errorResponse('Failed to fetch feedback', 500);
  }
}

// DELETE /admin/feedback/:id - Delete feedback
export async function deleteFeedback(request: Request, feedbackId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { error } = await supabaseAdmin
      .from('feedback')
      .delete()
      .eq('id', feedbackId);

    if (error) {
      console.error('Delete feedback error:', error);
      return errorResponse('Failed to delete feedback', 500);
    }

    return jsonResponse({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback exception:', error);
    return errorResponse('Failed to delete feedback', 500);
  }
}
