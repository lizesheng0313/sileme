# Basic 850 Audio Scripts

`generate-alibaba-audio-bulk.py` is the production audio generator for Basic 850.

It reads word data from `src/data/words/categories` and writes mp3 files into:

- `audio-samples/uk`
- `audio-samples/us`

Use Aliyun TTS credentials through environment variables. Do not commit tokens.

```bash
env ALIYUN_TTS_APPKEY='your_appkey' ALIYUN_TTS_TOKEN='your_token' \
python3 scripts/generate-alibaba-audio-bulk.py \
--limit 850 --voice luna --out-dir audio-samples/uk --workers 2
```

```bash
env ALIYUN_TTS_APPKEY='your_appkey' ALIYUN_TTS_TOKEN='your_token' \
python3 scripts/generate-alibaba-audio-bulk.py \
--limit 850 --voice eva --out-dir audio-samples/us --workers 2
```

Regenerate only synonym example audio when `synDetail.*.example` changes:

```bash
env ALIYUN_TTS_APPKEY='your_appkey' ALIYUN_TTS_TOKEN='your_token' \
python3 scripts/generate-alibaba-audio-bulk.py \
--limit 850 --voice luna --out-dir audio-samples/uk --workers 2 --only-kind syn-usage --force
```

```bash
env ALIYUN_TTS_APPKEY='your_appkey' ALIYUN_TTS_TOKEN='your_token' \
python3 scripts/generate-alibaba-audio-bulk.py \
--limit 850 --voice eva --out-dir audio-samples/us --workers 2 --only-kind syn-usage --force
```
