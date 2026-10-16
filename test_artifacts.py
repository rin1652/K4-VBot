import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class ArtifactConsistencyTests(unittest.TestCase):
    def test_markdown_and_slide_use_same_total_and_sizing(self):
        markdown = (ROOT / "G03.md").read_text()
        deck_builder = (ROOT / "build_deck.mjs").read_text()
        total = re.search(r"^TOTAL\t.*\t([0-9]+\.[0-9]{2})\t", markdown, re.MULTILINE).group(1)
        self.assertEqual(total, "10174.36")
        self.assertIn("TOTAL                             $10,174.36", deck_builder)
        self.assertIn("9.636B input", deck_builder)
        self.assertIn("1.452B output", deck_builder)

    def test_markdown_table_has_five_tsv_columns(self):
        markdown = (ROOT / "G03.md").read_text()
        block = markdown.split("```tsv", 1)[1].split("```", 1)[0]
        rows = [line for line in block.splitlines() if line.strip()]
        self.assertTrue(all(len(row.split("\t")) == 5 for row in rows))


if __name__ == "__main__":
    unittest.main()
