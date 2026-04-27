import subprocess
import sys
import os
import time


def run_job(script, input_file, output_file, env_vars=None):
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)
    start = time.time()
    with open(output_file, "w") as f:
        result = subprocess.run(
            ["python3", script, input_file, "-r", "local"],
            stdout=f,
            stderr=subprocess.PIPE,
            env=env
        )
    elapsed = time.time() - start
    lines = sum(1 for _ in open(output_file))
    print(f"  {script}: {lines:,} lines in {elapsed:.1f}s")
    if result.returncode != 0:
        print(result.stderr.decode())
        raise RuntimeError(f"{script} failed")
    return output_file


if __name__ == "__main__":
    # python3 pipeline.py 0.55 0.15 0.10 0.15 0.05
    weights = {}
    if len(sys.argv) == 6:
        for name, val in zip(["W1","W2","W3","W4","W5"], sys.argv[1:]):
            weights[name] = val
        print(f"Custom weights: {weights}")

    input_data = "data/unified_flights.csv"
    print(f"\nRunning pipeline on {input_data}...")
    start_total = time.time()

    run_job("jobs/job1_clean.py",  input_data,           "output/job1_out.txt")
    run_job("jobs/job2_score.py",  "output/job1_out.txt","output/job2_out.txt", weights)
    run_job("jobs/job3_topk.py",   "output/job2_out.txt","output/job3_out.txt")

    total = time.time() - start_total
    print(f"\nPipeline complete in {total:.1f}s")
    print("Results in output/job3_out.txt")
