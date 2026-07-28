import logging
import asyncio
import os
import urllib.request
import json
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class NotificationService:
    """
    Extensible Notification Dispatcher Service.
    Dispatches alerts via Telegram Bot, with extensible interfaces for SMS and Email.
    """
    def __init__(self):
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "789123456:AAFx_MOCK_TELEGRAM_BOT_TOKEN")
        self.telegram_chat_id = os.getenv("TELEGRAM_CHAT_ID", "-100123456789")

    async def send_telegram_alert(self, incident_type: str, severity: str, camera_id: str, timestamp: str, description: str) -> bool:
        """
        Sends formatted emergency incident alert message to Telegram channel/group.
        """
        text = (
            f"🚨 <b>EMERGENCY COMMAND CENTER ALERT</b> 🚨\n\n"
            f"<b>Incident:</b> {incident_type}\n"
            f"<b>Severity:</b> {severity}\n"
            f"<b>Camera:</b> {camera_id}\n"
            f"<b>Timestamp:</b> {timestamp}\n"
            f"<b>Description:</b> {description}\n\n"
            f"⚡ <i>Immediate operator action required.</i>"
        )
        
        logger.info(f"[NOTIF_TELEGRAM] Dispatching alert for {incident_type} on {camera_id}...")
        
        # If real token provided, attempt HTTP POST request
        if "MOCK" not in self.telegram_bot_token:
            try:
                url = f"https://api.telegram.org/bot{self.telegram_bot_token}/sendMessage"
                payload = json.dumps({
                    "chat_id": self.telegram_chat_id,
                    "text": text,
                    "parse_mode": "HTML"
                }).encode('utf-8')
                req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
                with urllib.request.urlopen(req, timeout=5) as response:
                    return response.status == 200
            except Exception as e:
                logger.error(f"[NOTIF_TELEGRAM_ERROR] Failed to send Telegram message: {e}")
                return False
        
        # Mock delivery success
        await asyncio.sleep(0.1)
        logger.info(f"[NOTIF_TELEGRAM_MOCK_SUCCESS] Telegram alert delivered to chat {self.telegram_chat_id}.")
        return True

    async def send_sms_alert(self, phone_number: str, message: str) -> bool:
        """Extensible hook for SMS gateway (e.g. Twilio)."""
        logger.info(f"[NOTIF_SMS_HOOK] SMS dispatch request to {phone_number}: {message}")
        return True

    async def send_email_alert(self, recipient_email: str, subject: str, body: str) -> bool:
        """Extensible hook for Email dispatcher (SMTP/SendGrid)."""
        logger.info(f"[NOTIF_EMAIL_HOOK] Email dispatch request to {recipient_email}: {subject}")
        return True

notification_service = NotificationService()
