Put the 45-second ad here as `ad-720p.mp4` (1280 x 720, H.264 + AAC, under about 25 MB).
Quick export with ffmpeg:

    ffmpeg -i source.mov -vf scale=1280:720 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart ad-720p.mp4

`alex-story-en.mp4` / `alex-story-de.mp4` (+ `.vtt` captions) are the animated story under the hero. The site picks the one that matches the page language. Sources and render steps are in `alex-story/`.
