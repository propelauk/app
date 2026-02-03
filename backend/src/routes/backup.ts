import { supabaseAdmin } from '../lib/supabase';
import { authMiddleware, jsonResponse, errorResponse, handleCors } from '../middleware/auth';

// POST /backup/metadata - Store backup metadata (not actual data)
export async function updateBackupMetadata(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const body = await request.json() as {
      backup_version: number;
    };

    const { backup_version } = body;

    if (typeof backup_version !== 'number' || backup_version < 0) {
      return errorResponse('Invalid backup version');
    }

    // Upsert backup metadata
    const { data, error } = await supabaseAdmin
      .from('backups')
      .upsert({
        user_id: user.id,
        last_backup_at: new Date().toISOString(),
        backup_version,
      })
      .select()
      .single();

    if (error) {
      console.error('Update backup metadata error:', error);
      return errorResponse('Failed to update backup metadata', 500);
    }

    return jsonResponse({
      message: 'Backup metadata updated',
      lastBackupAt: data.last_backup_at,
      backupVersion: data.backup_version,
    });
  } catch (error) {
    console.error('Update backup metadata exception:', error);
    return errorResponse('Failed to update backup metadata', 500);
  }
}

// GET /backup/metadata - Get backup metadata
export async function getBackupMetadata(request: Request): Promise<Response> {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const authResult = await authMiddleware(request);
  if (authResult instanceof Response) return authResult;
  const { user } = authResult;

  try {
    const { data, error } = await supabaseAdmin
      .from('backups')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Get backup metadata error:', error);
      return errorResponse('Failed to get backup metadata', 500);
    }

    if (!data) {
      return jsonResponse({
        lastBackupAt: null,
        backupVersion: 0,
      });
    }

    return jsonResponse({
      lastBackupAt: data.last_backup_at,
      backupVersion: data.backup_version,
    });
  } catch (error) {
    console.error('Get backup metadata exception:', error);
    return errorResponse('Failed to get backup metadata', 500);
  }
}
