#!/bin/bash


# Define sound files and their URLs
declare -A sounds=(
  ["bet.mp3"]="https://cdn.pixabay.com/download/audio/2023/06/13/coin-collect-retro-8-bit-sound-effect-145251.mp3"
  ["win.mp3"]="https://cdn.pixabay.com/download/audio/2023/06/04/win-game-bonus-144751.mp3"
  ["lose.mp3"]="https://cdn.pixabay.com/download/audio/2021/08/04/negative-beeps-6008.mp3"
  ["click.mp3"]="https://cdn.pixabay.com/download/audio/2023/03/05/click-button-140881.mp3"
  ["success.mp3"]="https://cdn.pixabay.com/download/audio/2021/08/04/success-1-6297.mp3"
  ["error.mp3"]="https://cdn.pixabay.com/download/audio/2022/03/10/error-126627.mp3"
)

# Download each sound file
for sound in "${!sounds[@]}"; do
  echo "Downloading $sound..."
  curl -L "${sounds[$sound]}" -o "frontend/public/sounds/$sound"
  if [ $? -eq 0 ]; then
    echo "✓ Downloaded $sound successfully"
  else
    echo "✗ Failed to download $sound"
  fi
done

echo "All sound files downloaded!" 