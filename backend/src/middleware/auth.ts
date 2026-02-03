import { getUserFromToken } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user: User;
}

// Extract Bearer token from Authorization header
function extractToken(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

// Auth middleware - validates JWT and attaches user to request
export async function authMiddleware(
  request: Request
): Promise<{ user: User } | Response> {
  const token = extractToken(request);
  
  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  const user = await getUserFromToken(token);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Invalid or expired token' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return { user };
}

// Optional auth - returns user if token present, null otherwise
export async function optionalAuth(
  request: Request
): Promise<{ user: User | null }> {
  const token = extractToken(request);
  
  if (!token) {
    return { user: null };
  }
  
  const user = await getUserFromToken(token);
  return { user };
}

// Response helpers
export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export function corsHeaders(): Headers {
  return new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
  return null;
}
