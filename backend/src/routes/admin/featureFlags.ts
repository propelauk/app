import { supabaseAdmin } from '../../lib/supabase';
import { adminMiddleware } from '../../middleware/admin';
import { jsonResponse, errorResponse, handleCors } from '../../middleware/auth';

// GET /admin/feature-flags - List all feature flags
export async function listFeatureFlags(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { data: flags, error } = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .order('flag_name');

    if (error) {
      console.error('List feature flags error:', error);
      return errorResponse('Failed to fetch feature flags', 500);
    }

    return jsonResponse({
      flags: flags?.map(f => ({
        name: f.flag_name,
        enabled: f.enabled,
        description: f.description,
      })) || [],
    });
  } catch (error) {
    console.error('List feature flags exception:', error);
    return errorResponse('Failed to fetch feature flags', 500);
  }
}

// GET /admin/feature-flags/:name - Get single feature flag
export async function getFeatureFlag(request: Request, flagName: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  // No auth required for feature flag checks (public endpoint)
  try {
    const { data: flag, error } = await supabaseAdmin
      .from('feature_flags')
      .select('*')
      .eq('flag_name', flagName)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Get feature flag error:', error);
      return errorResponse('Failed to fetch feature flag', 500);
    }

    if (!flag) {
      // Return disabled by default if flag doesn't exist
      return jsonResponse({
        name: flagName,
        enabled: false,
        description: null,
      });
    }

    return jsonResponse({
      name: flag.flag_name,
      enabled: flag.enabled,
      description: flag.description,
    });
  } catch (error) {
    console.error('Get feature flag exception:', error);
    return errorResponse('Failed to fetch feature flag', 500);
  }
}

// PUT /admin/feature-flags/:name - Update feature flag
export async function updateFeatureFlag(request: Request, flagName: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as {
      enabled?: boolean;
      description?: string;
    };

    // Upsert the flag
    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .upsert({
        flag_name: flagName,
        enabled: body.enabled ?? false,
        description: body.description,
      })
      .select()
      .single();

    if (error) {
      console.error('Update feature flag error:', error);
      return errorResponse('Failed to update feature flag', 500);
    }

    return jsonResponse({
      message: 'Feature flag updated successfully',
      flag: {
        name: data.flag_name,
        enabled: data.enabled,
        description: data.description,
      },
    });
  } catch (error) {
    console.error('Update feature flag exception:', error);
    return errorResponse('Failed to update feature flag', 500);
  }
}

// POST /admin/feature-flags - Create new feature flag
export async function createFeatureFlag(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const body = await request.json() as {
      name: string;
      enabled?: boolean;
      description?: string;
    };

    if (!body.name || body.name.trim().length === 0) {
      return errorResponse('Flag name is required');
    }

    // Validate flag name format (snake_case)
    const validName = /^[a-z][a-z0-9_]*$/.test(body.name);
    if (!validName) {
      return errorResponse('Flag name must be snake_case (e.g., my_feature_flag)');
    }

    const { data, error } = await supabaseAdmin
      .from('feature_flags')
      .insert({
        flag_name: body.name,
        enabled: body.enabled ?? false,
        description: body.description,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return errorResponse('Feature flag already exists', 409);
      }
      console.error('Create feature flag error:', error);
      return errorResponse('Failed to create feature flag', 500);
    }

    return jsonResponse({
      message: 'Feature flag created successfully',
      flag: {
        name: data.flag_name,
        enabled: data.enabled,
        description: data.description,
      },
    }, 201);
  } catch (error) {
    console.error('Create feature flag exception:', error);
    return errorResponse('Failed to create feature flag', 500);
  }
}

// DELETE /admin/feature-flags/:name - Delete feature flag
export async function deleteFeatureFlag(request: Request, flagName: string): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await adminMiddleware(request);
  if (authResult instanceof Response) return authResult;

  try {
    const { error } = await supabaseAdmin
      .from('feature_flags')
      .delete()
      .eq('flag_name', flagName);

    if (error) {
      console.error('Delete feature flag error:', error);
      return errorResponse('Failed to delete feature flag', 500);
    }

    return jsonResponse({ message: 'Feature flag deleted successfully' });
  } catch (error) {
    console.error('Delete feature flag exception:', error);
    return errorResponse('Failed to delete feature flag', 500);
  }
}

// GET /feature-flags/all - Public endpoint to get all enabled flags
export async function getAllEnabledFlags(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { data: flags, error } = await supabaseAdmin
      .from('feature_flags')
      .select('flag_name, enabled')
      .eq('enabled', true);

    if (error) {
      console.error('Get enabled flags error:', error);
      return errorResponse('Failed to fetch feature flags', 500);
    }

    // Return as a simple object for easy client-side use
    const flagsObject: Record<string, boolean> = {};
    flags?.forEach(f => {
      flagsObject[f.flag_name] = f.enabled;
    });

    return jsonResponse({ flags: flagsObject });
  } catch (error) {
    console.error('Get enabled flags exception:', error);
    return errorResponse('Failed to fetch feature flags', 500);
  }
}
