import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors, jsonResponse, errorResponse } from '../src/middleware/auth';

// Subscription routes
import { createCheckout, createBillingPortal, getSubscriptionStatus, handleWebhook } from '../src/routes/subscription';

// Community routes
import { getPosts, createPost, togglePostLike, addComment, toggleCommentLike, deletePost } from '../src/routes/community';

// Help routes
import { createHelpRequest, getMyHelpRequests } from '../src/routes/help';

// Backup routes
import { updateBackupMetadata, getBackupMetadata } from '../src/routes/backup';

// Feedback routes
import { submitFeedback } from '../src/routes/feedback';

// Static pages routes
import { getStaticPage, listStaticPages } from '../src/routes/static';

// Feature flags routes
import { getAllEnabledFlags } from '../src/routes/admin/featureFlags';

// Admin routes
import * as adminUsers from '../src/routes/admin/users';
import * as adminSubscriptions from '../src/routes/admin/subscriptions';
import * as adminCommunity from '../src/routes/admin/community';
import * as adminAnalytics from '../src/routes/admin/analytics';
import * as adminFeatureFlags from '../src/routes/admin/featureFlags';
import * as adminSupport from '../src/routes/admin/support';

// Convert Vercel request to Web Request
function toWebRequest(req: VercelRequest): Request {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `${protocol}://${host}`);
  
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  // Add body for non-GET/HEAD requests
  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  return new Request(url.toString(), init);
}

// Convert Web Response to Vercel response
async function sendWebResponse(res: VercelResponse, webResponse: Response): Promise<void> {
  // Set status
  res.status(webResponse.status);
  
  // Set headers
  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Send body
  const body = await webResponse.text();
  res.send(body);
}

/**
 * Main request router
 */
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  // Remove /api prefix for routing
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  try {
    // Health check
    if ((path === '/health' || path === '/') && method === 'GET') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // ============================================
    // SUBSCRIPTION ROUTES
    // ============================================
    
    if (path === '/subscription/checkout' && method === 'POST') {
      return createCheckout(req);
    }
    
    if (path === '/subscription/portal' && method === 'POST') {
      return createBillingPortal(req);
    }
    
    if (path === '/subscription/status' && method === 'GET') {
      return getSubscriptionStatus(req);
    }
    
    if (path === '/subscription/webhook' && method === 'POST') {
      return handleWebhook(req);
    }

    // ============================================
    // COMMUNITY ROUTES
    // ============================================
    
    if (path === '/community/posts' && method === 'GET') {
      return getPosts(req);
    }
    
    if (path === '/community/posts' && method === 'POST') {
      return createPost(req);
    }
    
    const postLikeMatch = path.match(/^\/community\/posts\/([^\/]+)\/like$/);
    if (postLikeMatch && method === 'POST') {
      return togglePostLike(req, postLikeMatch[1]);
    }
    
    const deletePostMatch = path.match(/^\/community\/posts\/([^\/]+)$/);
    if (deletePostMatch && method === 'DELETE') {
      return deletePost(req, deletePostMatch[1]);
    }
    
    const addCommentMatch = path.match(/^\/community\/posts\/([^\/]+)\/comments$/);
    if (addCommentMatch && method === 'POST') {
      return addComment(req, addCommentMatch[1]);
    }
    
    const commentLikeMatch = path.match(/^\/community\/comments\/([^\/]+)\/like$/);
    if (commentLikeMatch && method === 'POST') {
      return toggleCommentLike(req, commentLikeMatch[1]);
    }

    // ============================================
    // HELP REQUEST ROUTES
    // ============================================
    
    if (path === '/help/requests' && method === 'POST') {
      return createHelpRequest(req);
    }
    
    if (path === '/help/requests' && method === 'GET') {
      return getMyHelpRequests(req);
    }

    // ============================================
    // BACKUP ROUTES
    // ============================================
    
    if (path === '/backup/metadata' && method === 'POST') {
      return updateBackupMetadata(req);
    }
    
    if (path === '/backup/metadata' && method === 'GET') {
      return getBackupMetadata(req);
    }

    // ============================================
    // FEEDBACK ROUTES
    // ============================================
    
    if (path === '/feedback' && method === 'POST') {
      return submitFeedback(req);
    }

    // ============================================
    // STATIC PAGES ROUTES
    // ============================================
    
    if (path === '/static/pages' && method === 'GET') {
      return listStaticPages(req);
    }
    
    const staticPageMatch = path.match(/^\/static\/pages\/([^\/]+)$/);
    if (staticPageMatch && method === 'GET') {
      return getStaticPage(req, staticPageMatch[1]);
    }

    // ============================================
    // FEATURE FLAGS (PUBLIC)
    // ============================================
    
    if (path === '/feature-flags' && method === 'GET') {
      return getAllEnabledFlags(req);
    }

    // ============================================
    // ADMIN ROUTES
    // ============================================
    
    // Admin: Users
    if (path === '/admin/users' && method === 'GET') {
      return adminUsers.listUsers(req);
    }
    
    const adminUserMatch = path.match(/^\/admin\/users\/([^\/]+)$/);
    if (adminUserMatch) {
      if (method === 'GET') {
        return adminUsers.getUser(req, adminUserMatch[1]);
      }
      if (method === 'DELETE') {
        return adminUsers.deleteUser(req, adminUserMatch[1]);
      }
    }
    
    const banUserMatch = path.match(/^\/admin\/users\/([^\/]+)\/ban$/);
    if (banUserMatch && method === 'POST') {
      return adminUsers.banUser(req, banUserMatch[1]);
    }
    
    const unbanUserMatch = path.match(/^\/admin\/users\/([^\/]+)\/unban$/);
    if (unbanUserMatch && method === 'POST') {
      return adminUsers.unbanUser(req, unbanUserMatch[1]);
    }

    // Admin: Subscriptions
    if (path === '/admin/subscriptions' && method === 'GET') {
      return adminSubscriptions.listSubscriptions(req);
    }
    
    const adminSubMatch = path.match(/^\/admin\/subscriptions\/([^\/]+)$/);
    if (adminSubMatch) {
      if (method === 'PATCH') {
        return adminSubscriptions.updateSubscription(req, adminSubMatch[1]);
      }
    }
    
    const cancelSubMatch = path.match(/^\/admin\/subscriptions\/([^\/]+)\/cancel$/);
    if (cancelSubMatch && method === 'POST') {
      return adminSubscriptions.cancelSubscription(req, cancelSubMatch[1]);
    }
    
    const grantPremiumMatch = path.match(/^\/admin\/users\/([^\/]+)\/grant-premium$/);
    if (grantPremiumMatch && method === 'POST') {
      return adminSubscriptions.grantPremium(req, grantPremiumMatch[1]);
    }

    // Admin: Community
    if (path === '/admin/community/posts' && method === 'GET') {
      return adminCommunity.listPosts(req);
    }
    
    if (path === '/admin/community/posts/bulk-approve' && method === 'POST') {
      return adminCommunity.bulkApprovePosts(req);
    }
    
    const adminPostMatch = path.match(/^\/admin\/community\/posts\/([^\/]+)$/);
    if (adminPostMatch && method === 'DELETE') {
      return adminCommunity.deletePost(req, adminPostMatch[1]);
    }
    
    const approvePostMatch = path.match(/^\/admin\/community\/posts\/([^\/]+)\/approve$/);
    if (approvePostMatch && method === 'POST') {
      return adminCommunity.approvePost(req, approvePostMatch[1]);
    }
    
    const flagPostMatch = path.match(/^\/admin\/community\/posts\/([^\/]+)\/flag$/);
    if (flagPostMatch && method === 'POST') {
      return adminCommunity.flagPost(req, flagPostMatch[1]);
    }
    
    if (path === '/admin/community/comments' && method === 'GET') {
      return adminCommunity.listComments(req);
    }
    
    const adminCommentMatch = path.match(/^\/admin\/community\/comments\/([^\/]+)$/);
    if (adminCommentMatch && method === 'DELETE') {
      return adminCommunity.deleteComment(req, adminCommentMatch[1]);
    }

    // Admin: Analytics
    if (path === '/admin/analytics' && method === 'GET') {
      return adminAnalytics.getAnalytics(req);
    }
    
    if (path === '/admin/analytics/trends' && method === 'GET') {
      return adminAnalytics.getTrends(req);
    }

    // Admin: Feature Flags
    if (path === '/admin/feature-flags' && method === 'GET') {
      return adminFeatureFlags.listFeatureFlags(req);
    }
    
    if (path === '/admin/feature-flags' && method === 'POST') {
      return adminFeatureFlags.createFeatureFlag(req);
    }
    
    const adminFlagMatch = path.match(/^\/admin\/feature-flags\/([^\/]+)$/);
    if (adminFlagMatch) {
      if (method === 'GET') {
        return adminFeatureFlags.getFeatureFlag(req, adminFlagMatch[1]);
      }
      if (method === 'PATCH') {
        return adminFeatureFlags.updateFeatureFlag(req, adminFlagMatch[1]);
      }
      if (method === 'DELETE') {
        return adminFeatureFlags.deleteFeatureFlag(req, adminFlagMatch[1]);
      }
    }

    // Admin: Support
    if (path === '/admin/support/help-requests' && method === 'GET') {
      return adminSupport.listHelpRequests(req);
    }
    
    const adminHelpMatch = path.match(/^\/admin\/support\/help-requests\/([^\/]+)$/);
    if (adminHelpMatch) {
      if (method === 'PATCH') {
        return adminSupport.updateHelpRequestStatus(req, adminHelpMatch[1]);
      }
      if (method === 'DELETE') {
        return adminSupport.deleteHelpRequest(req, adminHelpMatch[1]);
      }
    }
    
    if (path === '/admin/support/feedback' && method === 'GET') {
      return adminSupport.listFeedback(req);
    }
    
    const adminFeedbackMatch = path.match(/^\/admin\/support\/feedback\/([^\/]+)$/);
    if (adminFeedbackMatch && method === 'DELETE') {
      return adminSupport.deleteFeedback(req, adminFeedbackMatch[1]);
    }

    // 404 - Not Found
    return errorResponse('Not found', 404);

  } catch (error) {
    console.error('Unhandled error:', error);
    return errorResponse('Internal server error', 500);
  }
}

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const webRequest = toWebRequest(req);
  const webResponse = await handleRequest(webRequest);
  await sendWebResponse(res, webResponse);
}
