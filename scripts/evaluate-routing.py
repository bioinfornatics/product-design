#!/usr/bin/env python3
"""Run non-mutating Product Design routing evaluations and grade tool traces."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SKILL_NAMES = {
    "product-design:index",
    "product-design:get-context",
    "product-design:ideate",
    "product-design:image-to-code",
    "product-design:url-to-code",
    "product-design:audit",
    "product-design:design-qa",
    "product-design:research",
    "product-design:share",
    "product-design:user-context",
}
APP_TOOL_RE = re.compile(r"(?:Apps\.)?(?:listApps|getApp|createApp|iterateApp|deleteApp)|(?:list_apps|get_app|create_app|iterate_app|delete_app)")
QUOTED_RE = re.compile(r"(['\"])(.*?)\1")


def load_json(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    start = text.find("{")
    if start < 0:
        raise ValueError(f"No JSON object found in {path}")
    return json.loads(text[start:])


def embedded_calls(code: str, message_index: int) -> list[dict[str, Any]]:
    """Extract only executable-looking quoted SDK arguments, not comments or prose."""
    events: list[dict[str, Any]] = []
    for match in QUOTED_RE.finditer(code):
        value = match.group(2)
        if value in SKILL_NAMES and re.search(r"(?:load_skill|load)\s*\([^)]*" + re.escape(match.group(0)), code):
            events.append({"message": message_index, "offset": match.start(), "kind": "skill", "target": value})
    for match in APP_TOOL_RE.finditer(code):
        tail = code[match.end(): match.end() + 20]
        if re.match(r"\s*\(", tail):
            events.append({"message": message_index, "offset": match.start(), "kind": "apps", "target": match.group(0)})
    return events


def calls(data: dict[str, Any]) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    for message_index, message in enumerate(data.get("messages", [])):
        for content in message.get("content", []):
            if content.get("type") != "toolRequest":
                continue
            call = content.get("toolCall", {}).get("value", {})
            name = call.get("name", "")
            args = call.get("arguments", {}) or {}
            if name == "execute_typescript":
                events.extend(embedded_calls(args.get("code", ""), message_index))
            elif name in {"load_skill", "loadSkill"}:
                events.append({"message": message_index, "offset": 0, "kind": "skill", "target": args.get("name", "")})
            elif APP_TOOL_RE.fullmatch(name):
                events.append({"message": message_index, "offset": 0, "kind": "apps", "target": name})
    return sorted(events, key=lambda item: (item["message"], item["offset"]))


def grade(path: Path) -> dict[str, Any]:
    events = calls(load_json(path))
    index_positions = [i for i, event in enumerate(events) if event["kind"] == "skill" and event["target"] == "product-design:index"]
    context_positions = [i for i, event in enumerate(events) if event["kind"] == "skill" and event["target"] == "product-design:get-context"]
    app_positions = [i for i, event in enumerate(events) if event["kind"] == "apps"]
    index_attempted = bool(index_positions)
    context_after_index = bool(index_positions and context_positions and min(context_positions) > min(index_positions))
    apps_after_context = bool(app_positions and context_positions and min(app_positions) > min(context_positions))
    no_apps_before_index = not app_positions or bool(index_positions and min(index_positions) < min(app_positions))
    metrics = {
        "index_attempted": index_attempted,
        "context_after_index": context_after_index,
        "apps_after_context": apps_after_context,
        "no_apps_before_index": no_apps_before_index,
    }
    return {"file": str(path), "events": events, "metrics": {**metrics, "score": sum(metrics.values()), "max_score": 4}}


def run_evaluations(args: argparse.Namespace) -> int:
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output_dir = args.output_dir or Path("evaluations") / f"routing-{timestamp}"
    output_dir.mkdir(parents=True, exist_ok=False)
    prompt = args.prompt_file.read_text(encoding="utf-8")
    results = []
    for number in range(1, args.runs + 1):
        stdout_path = output_dir / f"run-{number}.stdout.json"
        stderr_path = output_dir / f"run-{number}.stderr.log"
        command = [args.goose, "run", "--text", prompt, "--name", f"pd-routing-{timestamp}-{number}", "--output-format", "json", "--max-turns", str(args.max_turns)]
        with stdout_path.open("w", encoding="utf-8") as stdout, stderr_path.open("w", encoding="utf-8") as stderr:
            try:
                completed = subprocess.run(command, stdout=stdout, stderr=stderr, timeout=args.timeout, check=False)
                exit_code = completed.returncode
            except subprocess.TimeoutExpired:
                exit_code = 124
        (output_dir / f"run-{number}.exit-code").write_text(f"{exit_code}\n", encoding="utf-8")
        try:
            results.append(grade(stdout_path))
        except (OSError, ValueError, json.JSONDecodeError) as error:
            results.append({"file": str(stdout_path), "error": str(error), "metrics": {"score": 0, "max_score": 4}})
    (output_dir / "grade.json").write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(output_dir)
    return 0 if all(item.get("metrics", {}).get("score") == 4 for item in results) else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("traces", nargs="*", type=Path, help="Existing Goose JSON traces to grade")
    parser.add_argument("--run", action="store_true", help="Run fresh Goose sessions before grading")
    parser.add_argument("--prompt-file", type=Path)
    parser.add_argument("--runs", type=int, default=3)
    parser.add_argument("--output-dir", type=Path)
    parser.add_argument("--goose", default=os.environ.get("GOOSE_BIN", "goose"))
    parser.add_argument("--max-turns", type=int, default=12)
    parser.add_argument("--timeout", type=int, default=180)
    args = parser.parse_args()
    if args.run:
        if not args.prompt_file:
            parser.error("--run requires --prompt-file")
        return run_evaluations(args)
    if not args.traces:
        parser.error("provide trace files or use --run")
    print(json.dumps([grade(path) for path in args.traces], indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
