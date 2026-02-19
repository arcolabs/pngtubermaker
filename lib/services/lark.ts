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

interface UserSignupData {
  id: string;
  email: string;
  name?: string | null;
}

/**
 * 发送新用户注册通知到飞书
 * @param user 用户数据
 * @param oauthSource OAuth 来源 (google/github/discord/twitch)
 */
export async function notifyUserSignup(
  user: UserSignupData,
  oauthSource: string,
): Promise<void> {
  const webhookUrl = process.env.LARK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "[Lark] LARK_WEBHOOK_URL not configured, skipping notification",
    );
    return;
  }

  try {
    const message = `PNGTuber Maker
━━━━━━━━━━━━━━
New User Registered
[user.signup] Email: ${user.email}
User ID: ${user.id}
OAuth Source: ${oauthSource}
Plan: free`;

    await sendLarkWebhook(webhookUrl, message);
    console.log(`[Lark] User signup notification sent for ${user.email}`);
  } catch (error) {
    console.error("[Lark] Failed to send user signup notification:", error);
  }
}

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
  const webhookUrl = process.env.LARK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "[Lark] LARK_WEBHOOK_URL not configured, skipping notification",
    );
    return;
  }

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
