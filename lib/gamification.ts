import { createClient } from '@supabase/supabase-js';

/**
 * The reward result returned by Leapter after processing a user's activity.
 */
export interface LeapterRewardResult {
  /** Freshly calculated points total for this user (absolute, not a delta) */
  calculatedTotalPoints: number;
  /** Badge name awarded (e.g. "First Post") or "None" if nothing new */
  awardedBadge: string;
  /** Points earned during this recalculation */
  pointsEarned: number;
}

/**
 * Recalculates points and checks for a new badge for a given user by calling
 * the Leapter MCP via our server-side proxy route (/api/leapter).
 *
 * How it works:
 * 1. Reads the user's post count, reply count, and has_used_new_tool flag from Supabase
 * 2. Reads all active users' total_points for the percentile context Leapter needs
 * 3. Calls /api/leapter (which forwards to Leapter with the secret API key)
 * 4. Writes the updated total_points and (if awarded) adds a row to the badges table
 *
 * @param userId - The Supabase auth user ID
 * @param toolUsed - The tool name the user just used in their post (used to flag first-ever new tool)
 * @returns The Leapter reward result, or null if the call could not be made
 */
export async function recalculateRewards(
  userId: string,
  toolUsed?: string
): Promise<LeapterRewardResult | null> {
  // Use the public Supabase client from the browser environment.
  // We only need read access here; writes use service-level anon key RLS policies.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // --- 1. Gather the user's current activity counts ---
  const [postsResult, repliesResult, profileResult, allPointsResult] = await Promise.all([
    // Count of top-level posts (no parent_id) authored by this user
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .is('parent_id', null),

    // Count of "Try It" replies (has a parent_id) authored by this user
    supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .not('parent_id', 'is', null),

    // Current profile (to check has_used_new_tool flag and previous points)
    supabase
      .from('profiles')
      .select('has_used_new_tool, total_points')
      .eq('id', userId)
      .single(),

    // All users' total_points (for Leapter's community-wide percentile calculation)
    supabase
      .from('profiles')
      .select('total_points'),
  ]);

  if (postsResult.error) {
    console.error('[Gamification] Error counting posts:', postsResult.error.message);
    return null;
  }
  if (repliesResult.error) {
    console.error('[Gamification] Error counting replies:', repliesResult.error.message);
    return null;
  }
  if (profileResult.error) {
    console.error('[Gamification] Error reading profile:', profileResult.error.message);
    return null;
  }
  if (allPointsResult.error) {
    console.error('[Gamification] Error reading all points:', allPointsResult.error.message);
    return null;
  }

  const numberOfNewPosts = postsResult.count ?? 0;
  const numberOfReplies = repliesResult.count ?? 0;
  const currentHasUsedNewTool: boolean = profileResult.data?.has_used_new_tool ?? false;
  const previousTotalPoints: number = profileResult.data?.total_points ?? 0;
  const allActiveUserScores: number[] = (allPointsResult.data ?? []).map(
    (row: { total_points: number }) => row.total_points ?? 0
  );

  // Determine if this action is the first time the user selected a custom (non-predefined) tool.
  // PREDEFINED_TOOLS must stay in sync with components/NewPostModal.tsx
  const PREDEFINED_TOOLS = [
    'ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity', 'NotebookLM',
    'Midjourney', 'Adobe Firefly', 'Photoshop AI', 'DALL-E 3',
    'Runway', 'Pika Labs', 'Veras', 'Finch 3D', 'Stable Diffusion',
  ];

  const isNewTool =
    !!toolUsed && !PREDEFINED_TOOLS.includes(toolUsed) && !currentHasUsedNewTool;

  const hasUsedNewAIToolForFirstTime = currentHasUsedNewTool || isNewTool;

  // --- 2. Call our Leapter proxy ---
  let result: LeapterRewardResult;
  try {
    const response = await fetch('/api/leapter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tool: 'learning_platform_rewards_a_shifting_landscape',
        arguments: {
          numberOfNewPosts,
          numberOfReplies,
          hasUsedNewAIToolForFirstTime,
          allActiveUserScores,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[Gamification] Leapter API error:', err);
      return null;
    }

    result = await response.json();
  } catch (err) {
    console.error('[Gamification] Network error calling /api/leapter:', err);
    return null;
  }

  // Calculate points earned from this action
  result.pointsEarned = result.calculatedTotalPoints - previousTotalPoints;

  // --- 3. Write results back to Supabase ---
  // Update total_points and has_used_new_tool flag on the user's profile
  const profileUpdate: Record<string, unknown> = {
    total_points: result.calculatedTotalPoints,
  };
  if (isNewTool) {
    profileUpdate.has_used_new_tool = true;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId);

  if (updateError) {
    console.error('[Gamification] Failed to update profile points:', updateError.message);
    // Non-fatal — still return the result so the UI can reflect it
  }

  // Insert a badge row if Leapter awarded one (and it's not "None")
  if (result.awardedBadge && result.awardedBadge !== 'None') {
    const { error: badgeError } = await supabase.from('badges').insert([
      {
        profile_id: userId,
        title: result.awardedBadge,
        description: `Awarded for reaching the "${result.awardedBadge}" milestone.`,
      },
    ]);

    if (badgeError) {
      console.error('[Gamification] Failed to insert badge:', badgeError.message);
    }
  }

  return result;
}
