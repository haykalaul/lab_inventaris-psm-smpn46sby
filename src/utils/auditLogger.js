// src/utils/auditLogger.js
import { supabase } from '../lib/supabase'; // Sesuaikan path client Anda

export const logActivity = async (actionType, details = {}, tableName = 'SYSTEM') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return; // Jangan log jika tidak ada user (atau log sebagai anonymous)

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action_type: actionType, // Contoh: 'DOWNLOAD_REPORT', 'VIEW_SENSITIVE_DATA'
        table_name: tableName,
        new_data: details, // Simpan detail aktivitas di sini
        user_agent: navigator.userAgent // Info browser user
      });

    if (error) console.error('Audit Log Error:', error);
  } catch (err) {
    console.error('Audit Log System Fail:', err);
  }
};