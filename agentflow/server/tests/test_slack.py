"""Tests for the Slack agent integration."""

import json
import os
import sys
from unittest import mock
from io import BytesIO

import pytest

# Add server dir to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from crew.tools import _slack_send_message


# ---------------------------------------------------------------------------
# Unit tests (mocked — no real Slack calls)
# ---------------------------------------------------------------------------

class TestSlackSendMessageUnit:
    """Unit tests for _slack_send_message with mocked HTTP."""

    def _mock_response(self, body: dict, status=200):
        resp = mock.MagicMock()
        resp.read.return_value = json.dumps(body).encode()
        resp.__enter__ = mock.Mock(return_value=resp)
        resp.__exit__ = mock.Mock(return_value=False)
        return resp

    def test_missing_token(self):
        with mock.patch.dict(os.environ, {}, clear=True):
            result = _slack_send_message("#general", "hello")
            assert "not configured" in result.lower()

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_successful_send(self, mock_urlopen):
        mock_urlopen.return_value = self._mock_response({"ok": True})
        with mock.patch.dict(os.environ, {"SLACK_BOT_TOKEN": "xoxb-fake"}):
            result = _slack_send_message("#general", "hello")
        assert "Message sent" in result
        assert "#general" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_api_error(self, mock_urlopen):
        mock_urlopen.return_value = self._mock_response(
            {"ok": False, "error": "channel_not_found"}
        )
        with mock.patch.dict(os.environ, {"SLACK_BOT_TOKEN": "xoxb-fake"}):
            result = _slack_send_message("#nonexistent", "hello")
        assert "channel_not_found" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_network_error(self, mock_urlopen):
        mock_urlopen.side_effect = Exception("Connection refused")
        with mock.patch.dict(os.environ, {"SLACK_BOT_TOKEN": "xoxb-fake"}):
            result = _slack_send_message("#general", "hello")
        assert "Slack send failed" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_request_payload(self, mock_urlopen):
        """Verify the correct payload and headers are sent."""
        mock_urlopen.return_value = self._mock_response({"ok": True})
        with mock.patch.dict(os.environ, {"SLACK_BOT_TOKEN": "xoxb-test-token"}):
            _slack_send_message("#dev", "test message")

        call_args = mock_urlopen.call_args
        req = call_args[0][0]
        assert req.get_full_url() == "https://slack.com/api/chat.postMessage"
        assert req.get_header("Authorization") == "Bearer xoxb-test-token"
        assert "charset=utf-8" in req.get_header("Content-type")
        body = json.loads(req.data.decode())
        assert body["channel"] == "#dev"
        assert body["text"] == "test message"


# ---------------------------------------------------------------------------
# Integration test (live Slack — only runs when SLACK_BOT_TOKEN is set)
# ---------------------------------------------------------------------------

@pytest.mark.skipif(
    not os.environ.get("SLACK_BOT_TOKEN"),
    reason="SLACK_BOT_TOKEN not set — skipping live Slack test",
)
class TestSlackSendMessageLive:
    """Live integration tests — actually sends to Slack."""

    def test_send_to_general(self):
        result = _slack_send_message("#general", "Integration test from pytest")
        assert "Message sent" in result
        assert "#general" in result

    def test_invalid_channel(self):
        result = _slack_send_message("#this-channel-does-not-exist-xyz", "test")
        assert "Slack API error" in result
