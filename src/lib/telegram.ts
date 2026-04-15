const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined;

export const isTelegramReady = Boolean(BOT_TOKEN && CHAT_ID);

interface BookingPayload {
  name: string;
  phone: string;
  serviceName: string;
  masterName: string;
  date: string;
  time: string;
  comment?: string;
}

export async function sendBookingToTelegram(data: BookingPayload): Promise<void> {
  if (!isTelegramReady) {
    console.warn("[Telegram] Bot token or chat ID not configured.");
    return;
  }

  // Format date from YYYY-MM-DD → DD.MM.YYYY
  const dateParts = data.date.split("-");
  const formattedDate =
    dateParts.length === 3
      ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`
      : data.date;

  const lines = [
    `📋 <b>Новая заявка на запись</b>`,
    ``,
    `👤 <b>Имя:</b> ${data.name}`,
    `📞 <b>Телефон:</b> <a href="tel:${data.phone}">${data.phone}</a>`,
    `💅 <b>Услуга:</b> ${data.serviceName}`,
    `👩‍🎨 <b>Мастер:</b> ${data.masterName}`,
    `📅 <b>Дата:</b> ${formattedDate}`,
    `🕐 <b>Время:</b> ${data.time}`,
    ...(data.comment ? [`💬 <b>Комментарий:</b> ${data.comment}`] : []),
  ];

  const text = lines.join("\n");

  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Telegram API error: ${JSON.stringify(err)}`);
  }
}
