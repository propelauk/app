import { supabaseAdmin, type CommunityPost, type CommunityComment } from '../lib/supabase';
import { authMiddleware, optionalAuth, jsonResponse, errorResponse, handleCors } from '../middleware/auth';

// GET /community/posts - Get approved posts (with optional auth for like status)
export async function getPosts(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const { user } = await optionalAuth(request);

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('community_posts')
      .select(`
        *,
        profiles:user_id (first_name, avatar_url),
        comments:community_comments (
          id,
          user_id,
          content,
          likes_count,
          created_at,
          profiles:user_id (first_name, avatar_url)
        )
      `, { count: 'exact' })
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: posts, error, count } = await query;

    if (error) {
      console.error('Get posts error:', error);
      return errorResponse('Failed to fetch posts', 500);
    }

    // Get user's likes if authenticated
    let userLikes: Set<string> = new Set();
    let userCommentLikes: Set<string> = new Set();

    if (user) {
      const { data: postLikes } = await supabaseAdmin
        .from('community_post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      const { data: commentLikes } = await supabaseAdmin
        .from('community_comment_likes')
        .select('comment_id')
        .eq('user_id', user.id);

      userLikes = new Set(postLikes?.map(l => l.post_id) || []);
      userCommentLikes = new Set(commentLikes?.map(l => l.comment_id) || []);
    }

    // Format response
    const formattedPosts = posts?.map(post => ({
      id: post.id,
      authorName: post.profiles?.first_name || 'Anonymous',
      authorInitials: (post.profiles?.first_name || 'A').slice(0, 2).toUpperCase(),
      avatarUrl: post.profiles?.avatar_url,
      content: post.content,
      category: post.category,
      likesCount: post.likes_count,
      isLiked: userLikes.has(post.id),
      commentsCount: post.comments?.length || 0,
      comments: post.comments?.map((c: any) => ({
        id: c.id,
        authorName: c.profiles?.first_name || 'Anonymous',
        authorInitials: (c.profiles?.first_name || 'A').slice(0, 2).toUpperCase(),
        avatarUrl: c.profiles?.avatar_url,
        content: c.content,
        likesCount: c.likes_count,
        isLiked: userCommentLikes.has(c.id),
        createdAt: c.created_at,
      })) || [],
      createdAt: post.created_at,
    }));

    return jsonResponse({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error('Get posts exception:', error);
    return errorResponse('Failed to fetch posts', 500);
  }
}

// POST /community/posts - Create a new post
export async function createPost(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json() as {
      content: string;
      category: CommunityPost['category'];
    };

    const { content, category } = body;

    if (!content || content.trim().length === 0) {
      return errorResponse('Content is required');
    }

    if (content.length > 1000) {
      return errorResponse('Content must be 1000 characters or less');
    }

    const validCategories = ['win', 'tip', 'question', 'motivation'];
    if (!validCategories.includes(category)) {
      return errorResponse('Invalid category');
    }

    // Create post (pending approval by default)
    const { data: post, error } = await supabaseAdmin
      .from('community_posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        category,
        status: 'pending', // Requires admin approval
        likes_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create post error:', error);
      return errorResponse('Failed to create post', 500);
    }

    return jsonResponse({
      message: 'Post submitted successfully! It will appear after review.',
      post: {
        id: post.id,
        content: post.content,
        category: post.category,
        status: post.status,
        createdAt: post.created_at,
      },
    }, 201);
  } catch (error) {
    console.error('Create post exception:', error);
    return errorResponse('Failed to create post', 500);
  }
}

// POST /community/posts/:id/like - Toggle like on a post
export async function togglePostLike(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('community_post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabaseAdmin
        .from('community_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      // Decrement likes count
      await supabaseAdmin.rpc('decrement_post_likes', { post_id: postId });

      return jsonResponse({ liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from('community_post_likes')
        .insert({
          post_id: postId,
          user_id: user.id,
        });

      // Increment likes count
      await supabaseAdmin.rpc('increment_post_likes', { post_id: postId });

      return jsonResponse({ liked: true });
    }
  } catch (error) {
    console.error('Toggle post like error:', error);
    return errorResponse('Failed to toggle like', 500);
  }
}

// POST /community/posts/:id/comments - Add comment to a post
export async function addComment(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json() as { content: string };
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return errorResponse('Content is required');
    }

    if (content.length > 500) {
      return errorResponse('Comment must be 500 characters or less');
    }

    // Verify post exists and is approved
    const { data: post } = await supabaseAdmin
      .from('community_posts')
      .select('id, status')
      .eq('id', postId)
      .single();

    if (!post || post.status !== 'approved') {
      return errorResponse('Post not found', 404);
    }

    // Create comment
    const { data: comment, error } = await supabaseAdmin
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
        likes_count: 0,
      })
      .select(`
        *,
        profiles:user_id (first_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Add comment error:', error);
      return errorResponse('Failed to add comment', 500);
    }

    return jsonResponse({
      comment: {
        id: comment.id,
        authorName: comment.profiles?.first_name || 'Anonymous',
        authorInitials: (comment.profiles?.first_name || 'A').slice(0, 2).toUpperCase(),
        avatarUrl: comment.profiles?.avatar_url,
        content: comment.content,
        likesCount: 0,
        isLiked: false,
        createdAt: comment.created_at,
      },
    }, 201);
  } catch (error) {
    console.error('Add comment exception:', error);
    return errorResponse('Failed to add comment', 500);
  }
}

// POST /community/comments/:id/like - Toggle like on a comment
export async function toggleCommentLike(request: Request, commentId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('community_comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabaseAdmin
        .from('community_comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.id);

      // Decrement likes count
      await supabaseAdmin.rpc('decrement_comment_likes', { comment_id: commentId });

      return jsonResponse({ liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from('community_comment_likes')
        .insert({
          comment_id: commentId,
          user_id: user.id,
        });

      // Increment likes count
      await supabaseAdmin.rpc('increment_comment_likes', { comment_id: commentId });

      return jsonResponse({ liked: true });
    }
  } catch (error) {
    console.error('Toggle comment like error:', error);
    return errorResponse('Failed to toggle like', 500);
  }
}

// DELETE /community/posts/:id - Delete own post
export async function deletePost(request: Request, postId: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    // Verify ownership
    const { data: post } = await supabaseAdmin
      .from('community_posts')
      .select('user_id')
      .eq('id', postId)
      .single();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    if (post.user_id !== user.id) {
      return errorResponse('You can only delete your own posts', 403);
    }

    // Soft delete (mark as deleted)
    await supabaseAdmin
      .from('community_posts')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', postId);

    return jsonResponse({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return errorResponse('Failed to delete post', 500);
  }
}
