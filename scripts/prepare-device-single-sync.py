import base64
import json
import sqlite3
import subprocess
import time
import urllib.request
from pathlib import Path

DB_PATH = Path("docs/device-noah-travel-2026-09-20.db")
PACKAGE = "com.noah.glassesjourney"
PHOTO_PATH = "/storage/emulated/0/Android/data/com.noah.glassesjourney/files/Noah/Photos/codex_community_sync_test.png"


def run(args, input_bytes=None, check=True, stdout=None, stderr=None):
    return subprocess.run(
        args,
        input=input_bytes,
        check=check,
        stdout=stdout,
        stderr=stderr,
    )


def escape_xml(value):
    return (
        str(value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


run(["adb", "shell", "am", "force-stop", PACKAGE])

con = sqlite3.connect(DB_PATH)
existing_ids = [row[0] for row in con.execute("select id from travel_moments").fetchall()]

test_moment_id = f"codex-test-{int(time.time() * 1000)}"
now = int(time.time() * 1000)
con.execute(
    """
    insert into travel_moments (
      id, tripId, captureTicketId, captureSource, capturedAt, mediaType,
      photoPath, videoPath, thumbnailPath, recordingEndedAt, durationMs,
      latitude, longitude, locationAccuracy, locationCapturedAt, placeName,
      city, address, weatherCode, weatherText, temperature, feelsLike,
      humidity, wind, activityCategoryId, categorySource, categoryConfidence,
      categoryLocked, note, reflectionStatus, reflectionWindowUntil,
      metadataStatus, errorMessage, createdAt, updatedAt
    ) values (
      ?, null, ?, 'CODEX_TEST', ?, 'PHOTO',
      ?, null, null, null, null,
      null, null, null, null, 'Codex App链路测试',
      '本地测试', '本地测试地址', null, null, null, null,
      null, null, 'unclassified', 'NONE', null,
      0, 'Codex 单条社区同步测试素材', 'NONE', null,
      'READY', null, ?, ?
    )
    """,
    (test_moment_id, f"ticket-{test_moment_id}", now, PHOTO_PATH, now, now),
)
con.commit()
con.close()

png = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)
Path("docs/codex_community_sync_test.png").write_bytes(png)
run(["adb", "push", "docs/codex_community_sync_test.png", PHOTO_PATH], stdout=subprocess.DEVNULL)

run(["adb", "shell", "run-as", PACKAGE, "rm", "databases/noah_travel.db-wal"], check=False)
run(["adb", "shell", "run-as", PACKAGE, "rm", "databases/noah_travel.db-shm"], check=False)
run(
    ["adb", "shell", "run-as", PACKAGE, "tee", "databases/noah_travel.db"],
    input_bytes=DB_PATH.read_bytes(),
    stdout=subprocess.DEVNULL,
)

username = f"app{str(int(time.time() * 1000))[-6:]}"
payload = json.dumps(
    {"username": username, "email": f"{username}@example.test", "password": "Test1234"}
).encode()
request = urllib.request.Request(
    "http://127.0.0.1:3001/api/auth/register",
    data=payload,
    headers={"content-type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(request) as response:
    body = json.loads(response.read().decode("utf-8"))

data = body["data"]
user = data["user"]
tokens = data["tokens"]

synced_items = "\n".join(f"<string>{escape_xml(item)}</string>" for item in existing_ids)
prefs = "\n".join(
    [
        "<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",
        "<map>",
        f'<string name="access_token">{escape_xml(tokens["accessToken"])}</string>',
        f'<string name="refresh_token">{escape_xml(tokens["refreshToken"])}</string>',
        f'<string name="account_id">{escape_xml(user["id"])}</string>',
        f'<string name="account_display">{escape_xml(user.get("displayName") or user["username"])}</string>',
        f'<string name="synced_account_id">{escape_xml(user["id"])}</string>',
        f'<set name="synced_moment_ids">{synced_items}</set>',
        "</map>",
        "",
    ]
).encode("utf-8")

run(["adb", "shell", "run-as", PACKAGE, "mkdir", "shared_prefs"], check=False)
run(
    ["adb", "shell", "run-as", PACKAGE, "tee", "shared_prefs/community_sync.xml"],
    input_bytes=prefs,
    stdout=subprocess.DEVNULL,
)

print(
    json.dumps(
        {
            "username": username,
            "originalMarkedSynced": len(existing_ids),
            "pendingTestMomentId": test_moment_id,
            "photoPath": PHOTO_PATH,
        },
        ensure_ascii=False,
    )
)
