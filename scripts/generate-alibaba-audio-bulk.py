#!/usr/bin/env python3
import argparse
import concurrent.futures
import json
import os
import re
import threading
import time
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "src/data/words/categories"
ALIYUN_TTS_URL = "https://nls-gateway-cn-beijing.aliyuncs.com/stream/v1/tts"
CATEGORY_FILES = [
    "operations.json",
    "general-things.json",
    "picturable-things.json",
    "qualities.json",
    "opposites.json",
]


def slug(value):
    safe = re.sub(r"[^a-zA-Z0-9_-]+", "-", value.strip().lower())
    return safe.strip("-") or "audio"


def load_words(limit):
    words = []
    for name in CATEGORY_FILES:
        words.extend(json.loads((DATA_DIR / name).read_text()))
    return words[:limit]


def build_jobs(words, out_dir):
    jobs = []
    manifest = []

    for word in words:
        word_id = word["id"]
        entry = {
            "id": word_id,
            "word": word["word"],
            "definition": word.get("definition", ""),
            "example": word.get("example", ""),
            "synonyms": word.get("synonyms", []),
            "files": {},
        }

        def add(kind, text, path):
            if text:
                jobs.append({"id": word_id, "kind": kind, "text": text, "path": path})

        word_file = out_dir / "words" / f"{word_id}.mp3"
        entry["files"]["word"] = str(word_file)
        add("word", word["word"], word_file)

        definition_file = out_dir / "definitions" / f"{word_id}.mp3"
        entry["files"]["definition"] = str(definition_file)
        add("definition", word.get("definition", ""), definition_file)

        example_file = out_dir / "examples" / f"{word_id}.mp3"
        entry["files"]["example"] = str(example_file)
        add("example", word.get("example", ""), example_file)

        syn_files = {}
        syn_usage_files = {}
        for synonym in word.get("synonyms", []):
            synonym_file = out_dir / "synonyms" / word_id / f"{slug(synonym)}.mp3"
            syn_files[synonym] = str(synonym_file)
            add("synonym", synonym, synonym_file)

            detail = word.get("synDetail", {}).get(synonym, {})
            usage = detail.get("example")
            if usage:
                usage_file = out_dir / "syn-usages" / word_id / f"{slug(synonym)}.mp3"
                syn_usage_files[synonym] = str(usage_file)
                add("syn-usage", usage, usage_file)

        entry["files"]["synonyms"] = syn_files
        entry["files"]["synUsages"] = syn_usage_files
        manifest.append(entry)

    return jobs, manifest


def synth(text, appkey, token, voice):
    payload = {
        "appkey": appkey,
        "token": token,
        "text": text,
        "voice": voice,
        "format": "mp3",
        "sample_rate": 16000,
        "volume": 50,
        "speech_rate": 0,
        "pitch_rate": 0,
    }
    req = urllib.request.Request(
        ALIYUN_TTS_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = resp.read()
        content_type = resp.headers.get("Content-Type", "")

    if "audio/" not in content_type:
        raise RuntimeError(data.decode("utf-8", errors="replace"))

    return data


def run_job(job, appkey, token, voice, retries, force):
    path = Path(job["path"])
    if not force and path.exists() and path.stat().st_size > 0:
        return "skip"

    path.parent.mkdir(parents=True, exist_ok=True)

    for attempt in range(retries + 1):
        try:
            data = synth(job["text"], appkey, token, voice)
            temp_path = path.with_suffix(path.suffix + ".tmp")
            temp_path.write_bytes(data)
            temp_path.replace(path)
            return "done"
        except Exception as error:
            if attempt >= retries:
                raise RuntimeError(f"{job['id']} {job['kind']} {path}: {error}") from error
            time.sleep(0.6 * (attempt + 1))

    return "failed"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=850)
    parser.add_argument("--voice", required=True)
    parser.add_argument("--out-dir", required=True)
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument(
        "--only-kind",
        choices=["word", "definition", "example", "synonym", "syn-usage"],
        help="Only generate one audio kind.",
    )
    parser.add_argument("--force", action="store_true", help="Overwrite existing mp3 files.")
    args = parser.parse_args()

    appkey = os.environ["ALIYUN_TTS_APPKEY"]
    token = os.environ["ALIYUN_TTS_TOKEN"]
    out_dir = Path(args.out_dir)
    words = load_words(args.limit)
    jobs, manifest = build_jobs(words, out_dir)
    if args.only_kind:
        jobs = [job for job in jobs if job["kind"] == args.only_kind]
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    )

    total = len(jobs)
    completed = 0
    failed = []
    lock = threading.Lock()

    print(
        f"start jobs={total} voice={args.voice} workers={args.workers} only_kind={args.only_kind or 'all'} force={args.force}",
        flush=True,
    )
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        future_map = {
            executor.submit(run_job, job, appkey, token, args.voice, args.retries, args.force): job
            for job in jobs
        }
        for future in concurrent.futures.as_completed(future_map):
            job = future_map[future]
            try:
                status = future.result()
            except Exception as error:
                status = "error"
                failed.append({"job": job, "error": str(error)})

            with lock:
                completed += 1
                if completed % 100 == 0 or completed == total or status == "error":
                    print(
                        f"progress {completed}/{total} failed={len(failed)} last={job['id']}:{job['kind']}:{status}",
                        flush=True,
                    )

    if failed:
        (out_dir / "failed.json").write_text(
            json.dumps(failed, ensure_ascii=False, indent=2) + "\n"
        )
        raise SystemExit(f"failed {len(failed)} jobs; see {out_dir / 'failed.json'}")

    print(f"done {out_dir}", flush=True)


if __name__ == "__main__":
    main()
