import logging
from datetime import datetime

import httpx

from app.core.config import get_settings
from app.schemas.opportunity import OpportunityRead


TELEGRAM_API_BASE = "https://api.telegram.org"
logger = logging.getLogger(__name__)


class TelegramNotifier:
    async def send_opportunity(self, opportunity: OpportunityRead) -> None:
        await self.send_message(format_priority_message(opportunity))

    async def send_digest(self, opportunities: tuple[OpportunityRead, ...]) -> None:
        message = "\n\n".join(format_digest_line(opportunity) for opportunity in opportunities)
        await self.send_message(f"🌍 to the world — Digest quotidien\n\n{message}")

    async def send_message(self, message: str) -> None:
        settings = get_settings()

        if settings.telegram_bot_token is None or settings.telegram_chat_id is None:
            logger.warning("TelegramNotifier: Ignoré car TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID est absent")
            return

        token = settings.telegram_bot_token.get_secret_value()
        endpoint = f"{TELEGRAM_API_BASE}/bot{token}/sendMessage"
        payload = {"chat_id": settings.telegram_chat_id, "text": message, "disable_web_page_preview": False}

        try:
            async with httpx.AsyncClient(timeout=20) as client:
                response = await client.post(endpoint, json=payload)
                response.raise_for_status()
            logger.info("TelegramNotifier: Message envoyé avec succès")
        except httpx.HTTPError as error:
            logger.error(f"TelegramNotifier: Échec de l'envoi du message - {error}")
            raise


def format_priority_message(opportunity: OpportunityRead) -> str:
    return "\n".join(
        (
            "🌍 to the world — Nouvelle opportunité prioritaire",
            f"📌 {opportunity.title}",
            f"🏛️ {opportunity.organization}",
            f"📍 {opportunity.destination_country or 'À vérifier'}",
            f"🏷️ {opportunity.type.value}",
            f"💰 {funding_summary(opportunity)}",
            f"📅 Deadline : {deadline_label(opportunity.deadline, opportunity.deadline_confirmed)}",
            f"⭐ Score : {opportunity.score}/100",
            f"✅ {top_advantages(opportunity)}",
            f"⚠️ {opportunity.risks or 'Aucun risque bloquant identifié'}",
            f"👉 Postuler directement: {opportunity.official_url}",
        )
    )


def format_digest_line(opportunity: OpportunityRead) -> str:
    return f"⭐ {opportunity.score}/100 — {opportunity.title} — {opportunity.official_url}"


def funding_summary(opportunity: OpportunityRead) -> str:
    if opportunity.monthly_stipend is not None and opportunity.monthly_stipend > 0:
        return f"{opportunity.funding_type.value}, {opportunity.monthly_stipend:g} {opportunity.monthly_stipend_currency}/mois"

    return opportunity.funding_type.value


def deadline_label(deadline: datetime | None, confirmed: bool) -> str:
    if deadline is None or confirmed is False:
        return "À vérifier"

    return deadline.strftime("%Y-%m-%d")


def top_advantages(opportunity: OpportunityRead) -> str:
    advantages = (
        ("Allocation mensuelle", opportunity.monthly_stipend is not None and opportunity.monthly_stipend > 0),
        ("Billet aller-retour", opportunity.travel_covered is True),
        ("Logement", opportunity.housing_covered is True),
        ("Frais de scolarité", opportunity.tuition_covered is True),
        ("Assurance", opportunity.insurance_covered is True),
    )
    confirmed_advantages = tuple(label for label, enabled in advantages if enabled)

    if not confirmed_advantages:
        return "Avantages à vérifier"

    return ", ".join(confirmed_advantages[:3])
