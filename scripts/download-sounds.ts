import fs from 'fs'
import https from 'https'
import path from 'path'

const sounds = {
  bet: 'https://cdn.pixabay.com/download/audio/2023/06/13/coin-collect-retro-8-bit-sound-effect-145251.mp3',
  win: 'https://cdn.pixabay.com/download/audio/2023/06/04/win-game-bonus-144751.mp3',
  lose: 'https://cdn.pixabay.com/download/audio/2021/08/04/negative-beeps-6008.mp3',
  click: 'https://cdn.pixabay.com/download/audio/2023/03/05/click-button-140881.mp3',
  success: 'https://cdn.pixabay.com/download/audio/2021/08/04/success-1-6297.mp3',
  error: 'https://cdn.pixabay.com/download/audio/2022/03/10/error-126627.mp3'
}

const downloadSound = (url: string, filename: string) => {
  const filepath = path.join(process.cwd(), 'frontend', 'public', 'sounds', filename)
  const file = fs.createWriteStream(filepath)

  https.get(url, (response) => {
    response.pipe(file)
    file.on('finish', () => {
      file.close()
      console.log(`Downloaded ${filename}`)
    })
  }).on('error', (err) => {
    fs.unlink(filepath, () => {})
    console.error(`Error downloading ${filename}:`, err.message)
  })
}

// Create sounds directory if it doesn't exist
const soundsDir = path.join(process.cwd(), 'frontend', 'public', 'sounds')
if (!fs.existsSync(soundsDir)) {
  fs.mkdirSync(soundsDir, { recursive: true })
}

// Download all sounds
Object.entries(sounds).forEach(([name, url]) => {
  downloadSound(url, `${name}.mp3`)
})

console.log('Starting sound downloads...') 