# Writes subs-en/de .srt and .vtt for the Alex story (same line start times as mix.py).
import json, sys
dur = json.load(open(sys.argv[1]))
T = {'r1': 0.7, 'a1': 4.1, 'a2': 7.6, 'a3': 10.75, 'a4': 13.5, 'a5': 15.95, 'r2': 19.55, 'r3': 30.3}
TXT = {
 'en': {'r1': 'Alex is a quite distracted person.', 'a1': 'Oh no, I forgot the towel.', 'a2': 'Oh... did I close all the windows?', 'a3': 'Oh, my passport!', 'a4': 'Oh, a butterfly.', 'a5': 'Whoaaaa!',
        'r2': ['Now he has Checklist Pro!', 'No more missing items, things done three times faster,\nand routine under control.'], 'r3': 'Done, done, and done!'},
 'de': {'r1': 'Alex ist ein ziemlich zerstreuter Mensch.', 'a1': 'Oh nein, ich hab das Handtuch vergessen.', 'a2': 'Oh... hab ich alle Fenster zugemacht?', 'a3': 'Oh, mein Reisepass!', 'a4': 'Oh, ein Schmetterling.', 'a5': 'Waaaaah!',
        'r2': ['Jetzt hat er Checklist Pro!', 'Nichts wird mehr vergessen, alles geht dreimal schneller,\nund die Routine sitzt.'], 'r3': 'Erledigt, erledigt und erledigt!'}}
def ts(x, sep):
    h, m, s = int(x // 3600), int(x % 3600 // 60), x % 60
    return f'{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)):03d}'
for lang in ('en', 'de'):
    cues = []
    for k, t in T.items():
        end = t + max(dur[f'{k}_{lang}'] + .25, 1.2)
        if isinstance(TXT[lang][k], list):
            cues += [(t, t + 1.85, TXT[lang][k][0]), (t + 1.85, end, TXT[lang][k][1])]
        else: cues.append((t, end, TXT[lang][k]))
    open(f'subs-{lang}.srt', 'w').write(''.join(f'{i + 1}\n{ts(a, ",")} --> {ts(b, ",")}\n{x}\n\n' for i, (a, b, x) in enumerate(cues)))
    open(f'subs-{lang}.vtt', 'w').write('WEBVTT\n\n' + ''.join(f'{ts(a, ".")} --> {ts(b, ".")}\n{x}\n\n' for a, b, x in cues))
