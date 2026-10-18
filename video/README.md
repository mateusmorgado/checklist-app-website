Put the 45-second ad here as `ad-720p.mp4` (1280 x 720, H.264 + AAC, under about 25 MB).
Quick export with ffmpeg:

    ffmpeg -i source.mov -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart ad-720p.mp4
