import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://mqnjltqakcvrhytmvttz.supabase.co";

const secretKey = process.env.SUPABASE_SECRET_KEY;
const newPassword = process.env.NEW_ADMIN_PASSWORD;

const userId =
  "10fcb8dc-9cde-4be6-be6d-d85284f32265";

if (!secretKey || !newPassword) {
  throw new Error(
    "SUPABASE_SECRET_KEY and NEW_ADMIN_PASSWORD are required.",
  );
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const { data: existingUser, error: readError } =
  await supabase.auth.admin.getUserById(userId);

if (readError) {
  throw new Error(`Could not read user: ${readError.message}`);
}

console.log("User found:", existingUser.user.email);

const { error: updateError } =
  await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
    email_confirm: true,
  });

if (updateError) {
  throw new Error(
    `Password update failed: ${updateError.message}`,
  );
}

console.log("Password updated successfully.");