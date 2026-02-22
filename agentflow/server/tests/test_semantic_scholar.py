"""Tests for the Semantic Scholar agent integration."""

import json
import os
import sys
from unittest import mock

import pytest

# Add server dir to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from crew.tools import _semantic_scholar_search, _semantic_scholar_cite


# ---------------------------------------------------------------------------
# Unit tests (mocked — no real API calls)
# ---------------------------------------------------------------------------

class TestSemanticScholarSearchUnit:
    """Unit tests for _semantic_scholar_search with mocked HTTP."""

    def _mock_response(self, body: dict, status=200):
        resp = mock.MagicMock()
        resp.read.return_value = json.dumps(body).encode()
        resp.__enter__ = mock.Mock(return_value=resp)
        resp.__exit__ = mock.Mock(return_value=False)
        return resp

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_successful_search(self, mock_urlopen):
        mock_urlopen.return_value = self._mock_response({
            "data": [
                {
                    "paperId": "abc123",
                    "title": "Attention Is All You Need",
                    "year": 2017,
                    "citationCount": 90000,
                    "influentialCitationCount": 12000,
                    "authors": [{"name": "A. Vaswani"}, {"name": "N. Shazeer"}],
                    "url": "https://www.semanticscholar.org/paper/abc123",
                    "abstract": "We propose a new architecture based solely on attention mechanisms.",
                },
            ]
        })
        result = _semantic_scholar_search("attention mechanisms")
        assert "Attention Is All You Need" in result
        assert "90000" in result
        assert "12000" in result
        assert "A. Vaswani" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_empty_results(self, mock_urlopen):
        mock_urlopen.return_value = self._mock_response({"data": []})
        result = _semantic_scholar_search("xyznonexistenttopic123")
        assert "No papers found" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_api_error(self, mock_urlopen):
        mock_urlopen.side_effect = Exception("Connection refused")
        result = _semantic_scholar_search("attention")
        assert "Semantic Scholar search failed" in result


class TestSemanticScholarCiteUnit:
    """Unit tests for _semantic_scholar_cite with mocked HTTP."""

    def _mock_response(self, body: dict, status=200):
        resp = mock.MagicMock()
        resp.read.return_value = json.dumps(body).encode()
        resp.__enter__ = mock.Mock(return_value=resp)
        resp.__exit__ = mock.Mock(return_value=False)
        return resp

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_successful_cite(self, mock_urlopen):
        mock_urlopen.return_value = self._mock_response({
            "paperId": "abc123",
            "title": "Attention Is All You Need",
            "year": 2017,
            "citationCount": 90000,
            "influentialCitationCount": 12000,
            "referenceCount": 42,
            "authors": [{"name": "A. Vaswani"}],
            "url": "https://www.semanticscholar.org/paper/abc123",
        })
        result = _semantic_scholar_cite("abc123")
        assert "Attention Is All You Need" in result
        assert "90000" in result
        assert "References: 42" in result

    @mock.patch("crew.tools.urllib.request.urlopen")
    def test_paper_not_found(self, mock_urlopen):
        error = urllib_http_error(404)
        mock_urlopen.side_effect = error
        result = _semantic_scholar_cite("nonexistent-id")
        assert "Paper not found" in result


def urllib_http_error(code):
    """Helper to create a urllib HTTPError with the given status code."""
    import urllib.error
    return urllib.error.HTTPError(
        url="https://api.semanticscholar.org/graph/v1/paper/nonexistent-id",
        code=code,
        msg="Not Found",
        hdrs={},
        fp=None,
    )


# ---------------------------------------------------------------------------
# Integration tests (live API — only run when explicitly requested)
# ---------------------------------------------------------------------------

@pytest.mark.skipif(
    not os.environ.get("SEMANTIC_SCHOLAR_LIVE"),
    reason="SEMANTIC_SCHOLAR_LIVE not set — skipping live API tests",
)
class TestSemanticScholarLive:
    """Live integration tests — actually calls the Semantic Scholar API."""

    def test_live_search(self):
        result = _semantic_scholar_search("attention mechanisms", max_results=3)
        assert "Found" in result
        assert "Citations:" in result

    def test_live_cite(self):
        # "Attention Is All You Need" — well-known paper ID
        result = _semantic_scholar_cite("ARXIV:1706.03762")
        assert "Attention" in result
        assert "Citations:" in result
