export default function handler(req, res) {
  const now = new Date();
  const belgiumTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Brussels"}));
  
  res.status(200).json({ 
    success: true,
    message: "AI News Bot is working!",
    serverTime: now.toISOString(),
    belgiumTime: belgiumTime.toLocaleString(),
    nextRun: "Tomorrow at 5:00 AM Belgium time"
  });
}