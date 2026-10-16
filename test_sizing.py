import unittest

from sizing import Tier, monthly_requests, tier_rows, totals


class SizingTests(unittest.TestCase):
    def test_request_volume(self):
        self.assertEqual(monthly_requests(), 1_760_000)
        self.assertEqual(sum(r["monthly_requests"] for r in tier_rows()), 1_760_000)

    def test_model_calls_and_billable_tokens(self):
        data = totals()
        self.assertEqual(data["monthly_model_calls"], 2_376_000)
        self.assertEqual(data["billable_input_tokens"], 9_636_000_000)
        self.assertEqual(data["billable_output_tokens"], 1_452_000_000)

    def test_image_and_sandbox_are_separate(self):
        data = totals()
        self.assertEqual(data["images_month"], 90_000)
        self.assertEqual(data["sandbox_task_hours"], 400_000 * 30 / 3_600)
        self.assertNotIn("images_month", {"monthly_model_calls", "billable_input_tokens"})

    def test_changed_model_calls_update_totals(self):
        baseline = totals()
        changed = totals([
            Tier("Cấp 1", 0.45, 3_000, 400, 2.0),
            Tier("Cấp 2", 0.25, 4_000, 600, 1.0),
            Tier("Cấp 3", 0.15, 4_500, 700, 2.0),
            Tier("Cấp 4", 0.10, 5_000, 800, 3.0),
            Tier("Cấp 5", 0.05, 5_500, 900, 1.0),
        ])
        self.assertGreater(changed["monthly_model_calls"], baseline["monthly_model_calls"])
        self.assertGreater(changed["billable_input_tokens"], baseline["billable_input_tokens"])

    def test_negative_and_bad_share_inputs_fail(self):
        with self.assertRaises(ValueError):
            totals([Tier("bad", 0.9, -1, 1, 1.0)])
        with self.assertRaises(ValueError):
            totals([Tier("bad", 0.5, 1, 1, 1.0)])


if __name__ == "__main__":
    unittest.main()
