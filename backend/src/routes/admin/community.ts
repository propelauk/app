import { supabaseAdmin } from '../../lib/supabase';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';

// GET /admin/community/posts - List all posts (including pending/flagged)
export async function listPosts(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const status = url.searchParams.get('status'); // pending, approved, flagged, deleted
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (first_name, last_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('List posts error:', error);
      return errorResponse('Failed to fetch posts', 500);
    }

    // Get user emails
    const userIds = [...new Set(posts?.map(p => p.user_id) || [])];
    const userEmails: Record<string, string> = {};

    for (const userId of userIds) {
      const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (data.user?.email) {
        userEmails[userId] = data.user.email;
      }
    }

    return jsonResponse({
      posts: posts?.map(p => ({
        id: p.id,
        userId: p.user_id,
        email: userEmails[p.user_id],
        authorName: `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.trim() || 'Unknown',
        content: p.content,
        category: p.category,
        status: p.status,
        likesCount: p.likes_count,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List posts exception:', error);
    return errorResponse('Failed to fetch posts', 500);
  }
}

// PUT /admin/community/posts/:id/approve - Approve a post
export async function approvePost(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (error) {
      console.error('Approve post error:', error);
      return errorResponse('Failed to approve post', 500);
    }

    return jsonResponse({ message: 'Post approved successfully' });
  } catch (error) {
    console.error('Approve post exception:', error);
    return errorResponse('Failed to approve post', 500);
  }
}

// PUT /admin/community/posts/:id/flag - Flag a post
export async function flagPost(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as { reason?: string };

    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        status: 'flagged',
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId);

    if (error) {
      console.error('Flag post error:', error);
      return errorResponse('Failed to flag post', 500);
    }

    return jsonResponse({ message: 'Post flagged successfully' });
  } catch (error) {
    console.error('Flag post exception:', error);
    return errorResponse('Failed to flag post', 500);
  }
}

// DELETE /admin/community/posts/:id - Delete a post
export async function deletePost(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const hard = url.searchParams.get('hard') === 'true';

    if (hard) {
      // Hard delete
      await supabaseAdmin
        .from('community_comments')
        .delete()
        .eq('post_id', postId);

      await supabaseAdmin
        .from('community_post_likes')
        .delete()
        .eq('post_id', postId);

      await supabaseAdmin
        .from('community_posts')
        .delete()
        .eq('id', postId);
    } else {
      // Soft delete
      await supabaseAdmin
        .from('community_posts')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);
    }

    return jsonResponse({ message: `Post ${hard ? 'permanently ' : ''}deleted successfully` });
  } catch (error) {
    console.error('Delete post exception:', error);
    return errorResponse('Failed to delete post', 500);
  }
}

// PUT /admin/community/posts/bulk-approve - Approve multiple posts
export async function bulkApprovePosts(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as { postIds: string[] };
    const { postIds } = body;

    if (!postIds || postIds.length === 0) {
      return errorResponse('No post IDs provided');
    }

    const { error } = await supabaseAdmin
      .from('community_posts')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .in('id', postIds);

    if (error) {
      console.error('Bulk approve error:', error);
      return errorResponse('Failed to approve posts', 500);
    }

    return jsonResponse({ message: `${postIds.length} posts approved successfully` });
  } catch (error) {
    console.error('Bulk approve exception:', error);
    return errorResponse('Failed to approve posts', 500);
  }
}

// GET /admin/community/comments - List all comments
export async function listComments(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const postId = url.searchParams.get('post_id');
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('community_comments')
      .select(`
        *,
        profiles:user_id (first_name, last_name),
        posts:post_id (content, status)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postId) {
      query = query.eq('post_id', postId);
    }

    const { data: comments, error, count } = await query;

    if (error) {
      console.error('List comments error:', error);
      return errorResponse('Failed to fetch comments', 500);
    }

    return jsonResponse({
      comments: comments?.map(c => ({
        id: c.id,
        postId: c.post_id,
        postContent: c.posts?.content?.substring(0, 100),
        postStatus: c.posts?.status,
        userId: c.user_id,
        authorName: `${c.profiles?.first_name || ''} ${c.profiles?.last_name || ''}`.trim() || 'Unknown',
        content: c.content,
        likesCount: c.likes_count,
        createdAt: c.created_at,
      })) || [],
      pagination: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('List comments exception:', error);
    return errorResponse('Failed to fetch comments', 500);
  }
}

// DELETE /admin/community/comments/:id - Delete a comment
export async function deleteComment(request: Request, commentId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    // Delete likes first
    await supabaseAdmin
      .from('community_comment_likes')
      .delete()
      .eq('comment_id', commentId);

    // Delete comment
    await supabaseAdmin
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    return jsonResponse({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment exception:', error);
    return errorResponse('Failed to delete comment', 500);
  }
}
