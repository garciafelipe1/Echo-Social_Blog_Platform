"""Tests for blog utils (string sanitization used in repositories)."""

from django.test import TestCase

from utils.string_utils import sanitize_string, sanitize_html


class TestSanitizeString(TestCase):
    """Tests for sanitize_string."""

    def test_removes_html_tags(self):
        """HTML tags should be stripped (content inside may remain)."""
        result = sanitize_string("<script>alert(1)</script>hello")
        self.assertNotIn("<", result)
        self.assertNotIn(">", result)
        self.assertIn("hello", result)

    def test_handles_empty_string(self):
        """Empty string should return empty string."""
        self.assertEqual(sanitize_string(""), "")
        self.assertEqual(sanitize_string(None), "")

    def test_preserves_plain_text(self):
        """Plain text should be preserved."""
        self.assertEqual(sanitize_string("Hello World"), "Hello World")


class TestSanitizeHtml(TestCase):
    """Tests for sanitize_html."""

    def test_allows_safe_tags(self):
        """Safe HTML tags like p, strong should be allowed."""
        result = sanitize_html("<p>Hello <strong>world</strong></p>")
        self.assertIn("Hello", result)
        self.assertIn("world", result)

    def test_removes_script_tags(self):
        """Script tags should be removed."""
        result = sanitize_html("<p>OK</p><script>alert(1)</script>")
        self.assertNotIn("script", result.lower())
        self.assertIn("OK", result)
