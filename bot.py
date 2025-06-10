from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup  # type: ignore
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes, MessageHandler, CallbackQueryHandler, filters  # type: ignore
import yt_dlp  # type: ignore
import os
import instaloader  # type: ignore
from TikTokApi import TikTokApi  # type: ignore
import shutil

# Diccionario temporal: user_id -> url
url_pendiente = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("📺 YouTube", callback_data='youtube')],
        [InlineKeyboardButton("📸 Instagram", callback_data='instagram')],
        [InlineKeyboardButton("🕊️ twitter", callback_data='tiktok')],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "¡Hola! 👋 Bienvenido/a *MiBotMágico* ✨\n\n"
        "Soy un bot que puede ayudarte a descargar videos de:\n"
        "\n📺 *YouTube*\n📸 *Instagram*\n❌ *Twitter*\n\n"
        "Elige una plataforma o mándame el enlace directamente:",
        reply_markup=reply_markup,
        parse_mode='Markdown'
    )

def descargar_ytdlp(url):
    nombre_archivo = "video.mp4"
    ydl_opts = {
        'format': 'best[ext=mp4]',
        'outtmpl': nombre_archivo,
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return nombre_archivo

def descargar_audio_ytdlp(url):
    nombre_archivo = "audio.mp3"
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': nombre_archivo,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return nombre_archivo

def descargar_instagram(url):
    L = instaloader.Instaloader(download_videos=True, quiet=True)
    shortcode = url.split("/")[-2]
    L.download_post(instaloader.Post.from_shortcode(L.context, shortcode), target='instagram_post')

    carpeta = "instagram_post"
    for archivo in os.listdir(carpeta):
        if archivo.endswith(".mp4"):
            return os.path.join(carpeta, archivo)
    raise Exception("No se encontró el video descargado")

def descargar_tiktok(url):
    with TikTokApi() as api:
        video = api.video(url=url)
        video_data = video.bytes()
        nombre_archivo = "tiktok_video.mp4"
        with open(nombre_archivo, "wb") as f:
            f.write(video_data)
    return nombre_archivo

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    texto = update.message.text.strip()
    user_id = update.message.from_user.id

    if texto.startswith("http://") or texto.startswith("https://"):
        url_pendiente[user_id] = texto

        keyboard = [
            [
                InlineKeyboardButton("🎵 MP3 (audio)", callback_data="formato_mp3"),
                InlineKeyboardButton("🎬 MP4 (video)", callback_data="formato_mp4")
            ]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text("¿En qué formato deseas descargar el contenido?", reply_markup=reply_markup)
    else:
        await update.message.reply_text("❗ Envíame un enlace válido para descargar el video.")

async def handle_formato(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    user_id = query.from_user.id

    if user_id not in url_pendiente:
        await query.edit_message_text("❗ No se encontró un enlace asociado. Por favor, envía el enlace nuevamente.")
        return

    url = url_pendiente.pop(user_id)
    formato = query.data

    await query.edit_message_text("🔄 Descargando...")

    try:
        if any(domain in url for domain in ["youtube.com", "youtu.be", "twitter.com", "x.com", "facebook.com", "fb.watch"]):
            if formato == "formato_mp3":
                archivo = descargar_audio_ytdlp(url)
            else:
                archivo = descargar_ytdlp(url)
        elif "instagram.com" in url:
            if formato == "formato_mp3":
                await query.edit_message_text("⚠️ Instagram solo permite descarga en video por ahora.")
                archivo = descargar_instagram(url)
            else:
                archivo = descargar_instagram(url)
        elif "tiktok.com" in url:
            if formato == "formato_mp3":
                await query.edit_message_text("⚠️ TikTok solo permite descarga en video por ahora.")
                archivo = descargar_tiktok(url)
            else:
                archivo = descargar_tiktok(url)
        else:
            await query.edit_message_text("⚠️ Plataforma no soportada aún.")
            return

        if archivo.endswith(".mp3"):
            await query.message.reply_audio(audio=open(archivo, 'rb'))
        else:
            await query.message.reply_video(video=open(archivo, 'rb'))

        os.remove(archivo)
        if "instagram.com" in url:
            shutil.rmtree("instagram_post", ignore_errors=True)

    except Exception as e:
        await query.message.reply_text(f"❌ Error al descargar:\n{str(e)}")

async def handle_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    plataforma = query.data

    if plataforma == "youtube":
        await query.edit_message_text("🔗 Envía ahora un enlace de *YouTube*", parse_mode='Markdown')
    elif plataforma == "instagram":
        await query.edit_message_text("📸 Envía ahora un enlace de *Instagram*", parse_mode='Markdown')
    elif plataforma == "tiktok":
        await query.edit_message_text("🎵 Envía ahora un enlace de *TikTok*", parse_mode='Markdown')

if __name__ == "__main__":
    TOKEN = "7894527875:AAGrqOxwh7G8OxIvHR2kvw3Zt-MUA-N6G2A"
    app = ApplicationBuilder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), handle_message))
    app.add_handler(CallbackQueryHandler(handle_button, pattern="^(youtube|instagram|tiktok)$"))
    app.add_handler(CallbackQueryHandler(handle_formato, pattern="^formato_"))

    print("✅ Bot corriendo...")
    app.run_polling()
