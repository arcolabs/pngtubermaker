/**
 * 发送飞书 webhook 通知（纯文本）
 */
async function sendLarkWebhook(
  webhookUrl: string,
  content: string,
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "text",
      content: { text: content },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Lark webhook failed: ${response.status} ${response.statusText}`,
    );
  }
}

/**
 * 发送飞书消息卡片
 */
async function sendLarkCard(
  webhookUrl: string,
  card: Record<string, unknown>,
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      msg_type: "interactive",
      card,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Lark card webhook failed: ${response.status} ${response.statusText}`,
    );
  }
}

function getLarkWebhookUrl(): string | null {
  const url = process.env.LARK_WEBHOOK_URL;
  if (!url) {
    console.warn(
      "[Lark] LARK_WEBHOOK_URL not configured, skipping notification",
    );
    return null;
  }
  return url;
}

// Keep sendLarkWebhook available for potential future plain-text use
void sendLarkWebhook;

// ============================================================================
// User Signup
// ============================================================================

interface UserSignupData {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * 发送新用户注册通知到飞书（消息卡片）
 */
export async function notifyUserSignup(
  user: UserSignupData,
  oauthSource: string,
): Promise<void> {
  const webhookUrl = getLarkWebhookUrl();
  if (!webhookUrl) return;

  const providerLabels: Record<string, string> = {
    google: "Google",
    github: "GitHub",
    discord: "Discord",
    twitch: "Twitch",
  };

  try {
    const card = {
      header: {
        title: { tag: "plain_text", content: "👤 New User Registered" },
        template: "blue",
      },
      elements: [
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Name**\n${user.name || "—"}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Email**\n${user.email}`,
              },
            },
          ],
        },
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**OAuth**\n${providerLabels[oauthSource] || oauthSource}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Plan**\nFree`,
              },
            },
          ],
        },
        { tag: "hr" },
        {
          tag: "note",
          elements: [
            { tag: "plain_text", content: "PNGTuber Maker — User Signup" },
          ],
        },
      ],
    };

    await sendLarkCard(webhookUrl, card);
    console.log(`[Lark] User signup notification sent for ${user.email}`);
  } catch (error) {
    console.error("[Lark] Failed to send user signup notification:", error);
  }
}

// ============================================================================
// Subscription
// ============================================================================

interface SubscriptionData {
  userId: string;
  email: string;
  name?: string | null;
  tier: string;
  cycle: string;
  monthlyCredits: number;
  amount: string;
}

/**
 * 发送新订阅通知到飞书（消息卡片）
 */
export async function notifyNewSubscription(
  data: SubscriptionData,
): Promise<void> {
  const webhookUrl = getLarkWebhookUrl();
  if (!webhookUrl) return;

  const tierDisplay = data.tier.charAt(0).toUpperCase() + data.tier.slice(1);
  const cycleDisplay = data.cycle === "yearly" ? "Yearly" : "Monthly";

  try {
    const card = {
      header: {
        title: { tag: "plain_text", content: "💰 New Subscription" },
        template: "green",
      },
      elements: [
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Customer**\n${data.name || "Unknown"}\n${data.email}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Plan**\n${tierDisplay} (${cycleDisplay})\n${data.amount}`,
              },
            },
          ],
        },
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Credits**\n${data.monthlyCredits.toLocaleString()}/month`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**User ID**\n${data.userId}`,
              },
            },
          ],
        },
        { tag: "hr" },
        {
          tag: "note",
          elements: [
            {
              tag: "plain_text",
              content: "PNGTuber Maker — Subscription Event",
            },
          ],
        },
      ],
    };

    await sendLarkCard(webhookUrl, card);
    console.log(`[Lark] Subscription notification sent for ${data.email}`);
  } catch (error) {
    console.error("[Lark] Failed to send subscription notification:", error);
  }
}

// ============================================================================
// Top-up
// ============================================================================

interface TopupData {
  userId: string;
  email: string;
  name?: string | null;
  packageName: string;
  creditsGranted: number;
  amountPaid: string;
}

/**
 * 发送充值通知到飞书（消息卡片）
 */
export async function notifyTopup(data: TopupData): Promise<void> {
  const webhookUrl = getLarkWebhookUrl();
  if (!webhookUrl) return;

  try {
    const card = {
      header: {
        title: { tag: "plain_text", content: "🪙 Credit Top-up" },
        template: "orange",
      },
      elements: [
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Customer**\n${data.name || "Unknown"}\n${data.email}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Package**\n${data.packageName}\n${data.amountPaid}`,
              },
            },
          ],
        },
        {
          tag: "div",
          fields: [
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**Credits Granted**\n${data.creditsGranted.toLocaleString()}`,
              },
            },
            {
              is_short: true,
              text: {
                tag: "lark_md",
                content: `**User ID**\n${data.userId}`,
              },
            },
          ],
        },
        { tag: "hr" },
        {
          tag: "note",
          elements: [
            { tag: "plain_text", content: "PNGTuber Maker — Top-up Event" },
          ],
        },
      ],
    };

    await sendLarkCard(webhookUrl, card);
    console.log(`[Lark] Top-up notification sent for ${data.email}`);
  } catch (error) {
    console.error("[Lark] Failed to send top-up notification:", error);
  }
}
