# Pipeline animation model and provenance

The 13 selectable traces illustrate scheduling dependencies. They are not measured performance results or a production scheduler. Each uses three physical ranks; training uses six microbatches. The timeline scrolls through windows of twelve abstract ticks, with an overview of the full schedule below it.

## Training schedules

- **GPipe:** all forwards, then backwards. Synchronous update after the flush.
- **1F1B / PipeDream-Flush:** rank-dependent warmup, alternating forwards/backwards, then drain. Synchronous update. The baseline model completes both GPipe and 1F1B in 48 ticks, but peak saved activation records are [6,6,6] and [3,2,1]. Reduced activation lifetime does not automatically reduce ideal bubbles.
- **Interleaved 1F1B:** two virtual chunks per rank, cyclic placement, reference-derived local order.
- **Looped BFS:** the same placement, breadth-first grouping for chunk locality. This can amortize FSDP parameter gathers while retaining more activations.
- **ZB1P / ZB2P:** pedagogical greedy examples of split-backward scheduling under different activation budgets, not exact reproductions of the paper's schedule search. Ready input gradients have priority, then forwards within the budget, then weight gradients. The per-rank limits are p-r and 2(p-r).
- **ZBV:** two chunks per rank, V placement, reference-derived serialized F/I/W order.
- **DualPipe:** a principle illustration with opposite A/B streams and explicitly paired F/B overlap. This small mirrored example does not reproduce DeepSeek's complete production schedule. Combining mirrored gradients before consistent updates is required but not simulated.
- **DualPipeV:** two V-placed chunks per rank with reference-derived compound F/B actions and split-backward tails.
- **PipeDream:** historical asynchronous weight-stashing illustration. A local optimizer update follows each microbatch backward. Each backward reuses its matching forward's stashed version; later forwards can see newer versions. This differs from synchronous flushed 1F1B. It does not reproduce all production version-management details.

## Dependencies and timing

F requires the preceding logical stage's F. B/I requires its own F and the downstream B/I. W requires its own I. U requires its own B. Every modeled dependency completes before its consumer starts. Ordinary operations are exclusive on a physical rank; only explicit compound F/B actions overlap.

For one chunk per rank, F=2 and B=4 ticks. For two chunks, F=1 and B=2. Split backward uses I=W=F. Compound actions take ideal max(F,B); this requires custom overlap support and is not free generic concurrency. U=1 tick. Communication latency, contention, recomputation, reduction, optimizer barriers/checks, and kernel launch costs are omitted. Finite fill/drain and actual unequal kernels can leave bubbles, including in schedules named zero-bubble.

Saved counts include an activation record from F launch through B or W completion. They count chunk/microbatch records, not tensor bytes, and cannot be directly compared across different chunk sizes or mirrored model layouts. Inference does not display training activation-record counts. The model does not include KV cache size.

## Inference examples

Forward-only uses independent microbatches. Interleaved requests enforces feedback from each token's final stage to the next token's first stage. Chunked prefill plus decode respects per-layer causal prompt-chunk dependencies and starts the new request's decode after its final prompt chunk completes. The examples have different workloads and are not throughput comparisons. Token budgets, continuous batching, KV allocation, and fairness require additional serving policies.

## Sources

PyTorch contributes local operation order for Interleaved1F1B, LoopedBFS, ZBV and DualPipeV. The educational model assigns durations and schedules that order subject to the explicit dependency graph. Reference source snapshot retrieved 2026-10-30:

- https://raw.githubusercontent.com/pytorch/pytorch/main/torch/distributed/pipelining/schedules.py
- SHA256: `c0b7d3fd1f69474ff9272efefc00124d3c79e1570812dae9748339b62bafd973`
- https://docs.pytorch.org/docs/stable/distributed.pipelining.html#pipeline-schedules
- GPipe: https://arxiv.org/abs/1811.06965
- Megatron interleaving: https://arxiv.org/abs/2104.04473
- Zero Bubble / ZBV: https://arxiv.org/abs/2401.10241
- https://github.com/sail-sg/zero-bubble-pipeline-parallelism
- https://github.com/deepseek-ai/DualPipe
- https://www.microsoft.com/en-us/research/publication/pipedream-generalized-pipeline-parallelism-for-dnn-training/

No external library or reference source is executed by the webpage. It loads static generated trace data from pipeline-plans.js.
