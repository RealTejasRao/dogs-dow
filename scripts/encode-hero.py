"""Encode the original hero offline; preserve source timestamps and remove audio."""
import argparse
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ffmpeg', help='Path to a full FFmpeg executable')
args = parser.parse_args()
bundled = list((ROOT / '.tools/python/imageio_ffmpeg/binaries').glob('ffmpeg*.exe'))
ffmpeg = args.ffmpeg or shutil.which('ffmpeg') or (str(bundled[0]) if bundled else None)
if not ffmpeg:
    parser.error('Install FFmpeg or run: python -m pip install --target .tools/python imageio-ffmpeg')

source = ROOT / 'public/videos/vid2.mp4'
if not source.is_file():
    parser.error(f'Missing original source: {source}')

for filename, width, quality, peak in [('hero-day-hd.mp4', 1920, 20, 5000), ('hero-day-mobile.mp4', 1280, 21, 2500)]:
    output = ROOT / 'public/videos' / filename
    temporary = output.with_name(f'{output.stem}.encoding.mp4')
    subprocess.run([
        ffmpeg, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
        '-threads', '4', '-i', str(source), '-map', '0:v:0', '-an',
        '-vf', f'scale={width}:-2:flags=lanczos', '-c:v', 'libx264',
        '-preset', 'medium', '-crf', str(quality), '-pix_fmt', 'yuv420p',
        '-maxrate', f'{peak}k', '-bufsize', f'{peak * 2}k',
        '-fps_mode', 'passthrough', '-video_track_timescale', '24000',
        '-movflags', '+faststart', '-threads', '4', str(temporary),
    ], check=True)
    temporary.replace(output)
    print(f'{filename}: {output.stat().st_size / 1024 / 1024:.1f} MiB', flush=True)

subprocess.run([
    ffmpeg, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
    '-ss', '2', '-i', str(source), '-frames:v', '1',
    '-vf', 'scale=1920:-2:flags=lanczos', '-q:v', '2',
    str(ROOT / 'public/images/hero-day-poster.jpg'),
], check=True)
print('Poster regenerated directly from the source.', flush=True)
