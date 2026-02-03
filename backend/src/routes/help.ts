import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, jsonResponse, errorResponse, handleCors } from '../middleware/auth';
import { sendHelpRequestNotification } from '../lib/resend';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// POST /help/request - Submit a help request with optional file upload
export async function createHelpRequest(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    const message = formData.get('message') as string;
    const budgetUsd = formData.get('budget_usd') as string | null;
    const contactEmail = formData.get('contact_email') as string;
    const contactPhone = formData.get('contact_phone') as string | null;
    const externalUrl = formData.get('external_url') as string | null;
    const file = formData.get('file') as File | null;

    // Validation
    if (!message || message.trim().length === 0) {
      return errorResponse('Message is required');
    }

    if (message.length > 5000) {
      return errorResponse('Message must be 5000 characters or less');
    }

    if (!contactEmail || !contactEmail.includes('@')) {
      return errorResponse('Valid contact email is required');
    }

    // Handle file upload
    let fileUrl: string | null = null;

    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse('File size must be 10MB or less');
      }

      // Generate unique filename
      const ext = file.name.split('.').pop() || 'bin';
      const filename = `help-requests/${user.id}/${Date.now()}.${ext}`;

      // Upload to Supabase Storage
      const arrayBuffer = await file.arrayBuffer();
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('uploads')
        .upload(filename, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        return errorResponse('Failed to upload file', 500);
      }

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('uploads')
        .getPublicUrl(filename);

      fileUrl = urlData.publicUrl;
    }

    // Create help request record
    const { data: helpRequest, error: dbError } = await supabaseAdmin
      .from('help_requests')
      .insert({
        user_id: user.id,
        message: message.trim(),
        budget_usd: budgetUsd ? parseFloat(budgetUsd) : null,
        contact_email: contactEmail.trim(),
        contact_phone: contactPhone?.trim() || null,
        file_url: fileUrl,
        external_url: externalUrl?.trim() || null,
        status: 'new',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Help request DB error:', dbError);
      return errorResponse('Failed to submit help request', 500);
    }

    // Get user profile for email notification
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const userName = profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'User'
      : 'User';

    // Send email notification to support team
    await sendHelpRequestNotification({
      userName,
      userEmail: contactEmail,
      message: message.trim(),
      budget: budgetUsd ? parseFloat(budgetUsd) : undefined,
      phone: contactPhone?.trim(),
      fileUrl: fileUrl || undefined,
      externalUrl: externalUrl?.trim(),
    });

    return jsonResponse({
      message: 'Help request submitted successfully! We\'ll get back to you soon.',
      requestId: helpRequest.id,
    }, 201);
  } catch (error) {
    console.error('Create help request exception:', error);
    return errorResponse('Failed to submit help request', 500);
  }
}

// GET /help/requests - Get user's own help requests
export async function getMyHelpRequests(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const { data: requests, error } = await supabaseAdmin
      .from('help_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get help requests error:', error);
      return errorResponse('Failed to fetch help requests', 500);
    }

    return jsonResponse({
      requests: requests?.map(r => ({
        id: r.id,
        message: r.message,
        budgetUsd: r.budget_usd,
        contactEmail: r.contact_email,
        contactPhone: r.contact_phone,
        fileUrl: r.file_url,
        externalUrl: r.external_url,
        status: r.status,
        createdAt: r.created_at,
      })) || [],
    });
  } catch (error) {
    console.error('Get help requests exception:', error);
    return errorResponse('Failed to fetch help requests', 500);
  }
}
