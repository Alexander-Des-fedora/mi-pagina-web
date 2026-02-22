import logging
import os
import asyncio
import threading
from flask import Flask
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, CallbackQueryHandler, filters
from telegram.request import HTTPXRequest
import yt_dlp
from dotenv import load_dotenv

# --- Configuración de Flask (Para Render) ---
web_app = Flask(__name__)

@web_app.route('/')
def health_check():
    return "Bot en funcionamiento 🚀", 200

def run_flask():
    # Render asigna un puerto automáticamente en la variable PORT
    port = int(os.environ.get("PORT", 10000))
    web_app.run(host='0.0.0.0', port=port)

# --- Configuración de Logging ---
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# --- Cargar configuración ---
load_dotenv()
TOKEN = os.getenv("TELEGRAM_TOKEN")

if not TOKEN:
    logger.critical("❌ Error: Falta la variable de entorno TELEGRAM_TOKEN.")
    exit(1)

# --- Funciones de Descarga ---
def descargar_config(es_audio=False):
    nombre_archivo = "audio.mp3" if es_audio else "video.mp4"
    opts = {
        'outtmpl': nombre_archivo,
        'quiet': True,
        'no_warnings': True,
        'ignoreerrors': True,
    }
    if es_audio:
        opts.update({
            'format': 'bestaudio/best',
            'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'mp3','preferredquality': '192'}],
        })
    else:
        opts.update({
            'format': 'best[ext=mp4]/best',
        })
    return nombre_archivo, opts

def descargar_media(url, es_audio=False):
    nombre_archivo, opts = descargar_config(es_audio)
    if os.path.exists(nombre_archivo):
        try: os.remove(nombre_archivo)
        except OSError: pass

    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            ydl.download([url])
        return nombre_archivo if os.path.exists(nombre_archivo) else None
    except Exception as e:
        logger.error(f"Error descarga: {e}")
        return None

# --- Handlers del Bot ---
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message: return
    context.user_data.clear()
    keyboard = [[InlineKeyboardButton("📸 Instagram", callback_data='instagram'), InlineKeyboardButton("🎵 TikTok", callback_data='tiktok')]]
    await update.message.reply_text("👋 ¡Bienvenido!\nSelecciona plataforma o envía un enlace:", reply_markup=InlineKeyboardMarkup(keyboard), parse_mode='Markdown')

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not update.message: return
    texto = update.message.text.strip()
    if any(x in texto.lower() for x in ["tiktok.com", "instagram.com"]):
        context.user_data['url_pendiente'] = texto
        keyboard = [[InlineKeyboardButton("🎵 Audio (MP3)", callback_data="formato_mp3"), InlineKeyboardButton("🎬 Video (MP4)", callback_data="formato_mp4")]]
        await update.message.reply_text("¿Formato?", reply_markup=InlineKeyboardMarkup(keyboard))
    else:
        await update.message.reply_text("❗ Envía un enlace válido de Instagram o TikTok.")

async def handle_formato(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    url = context.user_data.pop('url_pendiente', None)
    if not url:
        await query.edit_message_text("❗ Enlace expirado.")
        return

    es_audio = (query.data == "formato_mp3")
    await query.edit_message_text(f"🔄 Descargando {'audio' if es_audio else 'video'}...")

    loop = asyncio.get_running_loop()
    archivo = await loop.run_in_executor(None, descargar_media, url, es_audio)

    if archivo:
        await query.edit_message_text("📤 Subiendo...")
        with open(archivo, "rb") as f:
            if es_audio: await query.message.reply_audio(audio=f)
            else: await query.message.reply_video(video=f)
        os.remove(archivo)
    else:
        await query.edit_message_text("❌ Error en la descarga.")

async def handle_button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.callback_query.answer()
    await update.callback_query.edit_message_text("Envía el enlace de la plataforma elegida.")

# --- MAIN ---
if __name__ == "__main__":
    # 1. Iniciar Flask en segundo plano para Render
    threading.Thread(target=run_flask, daemon=True).start()

    # 2. Configurar Bot
    request = HTTPXRequest(connect_timeout=60, read_timeout=60)
    app = ApplicationBuilder().token(TOKEN).request(request).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(handle_button_callback, pattern="^(instagram|tiktok)$"))
    app.add_handler(CallbackQueryHandler(handle_formato, pattern="^formato_"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    logger.info("🚀 Bot e interfaz Web iniciados...")
    app.run_polling()