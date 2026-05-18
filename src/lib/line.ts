export async function sendLineNotification(message: string) {
  const token = process.env.LINE_NOTIFY_TOKEN;
  if (!token) {
    console.log("LINE Notify Token not set. Skipping notification.");
    return;
  }

  try {
    const res = await fetch("https://notify-api.line.me/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${token}`,
      },
      body: new URLSearchParams({ message }).toString(),
    });
    
    if (!res.ok) {
      console.error("LINE Notify failed with status", res.status);
    } else {
      console.log("LINE Notification sent successfully!");
    }
  } catch (err) {
    console.error("Error sending LINE Notify:", err);
  }
}
