/**
 * 发送飞书 webhook 通知
 * @param webhookUrl 飞书 webhook URL
 * @param content 消息内容
 */
async function sendLarkWebhook(
  webhookUrl: string,
  content: string,
): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      msg_type: "text",
      content: {
        text: content,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Lark webhook failed: ${response.status} ${response.statusText}`,
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
