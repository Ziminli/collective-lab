# Architecture and model scope

The model curriculum adds 7 architecture blueprints, 18 operator pages and 24 model/checkpoint pages. It complements the existing communication, parallelism and optimization material. There is no model download, API call or inference engine: the browser renders explanatory SVG traces and small worked examples.

## Reading the views

- **Structure** follows a model's major subgraphs. Repeated blocks represent distinct learned weights; diffusion sampling iterations instead reuse the denoiser weights. Hidden-feature grids show a symbolic tensor layout, not fabricated checkpoint activations.
- **Operator chips** and the view selector control the same animation, formula, notation and steps. A model page chooses the appropriate reference variant, such as GELU for GPT-2, causal depthwise convolution for Mamba-2, or cross-attention for Stable Diffusion.
- **Training / Inference** distinguishes gradient computation from stateful forward execution. Image-model training samples noise/time targets; generation repeats the sampler. Autoregressive inference retains request-specific KV or recurrent state.
- Matrix sizes, router probabilities, filters, gates, n-gram row IDs and sample trajectories are explicit teaching examples. They are not checkpoint weights, kernel benchmarks or full implementations of the cited models.

## Sources and versioning

`model-sources.json` records successful official-source fetches checked on 2026-10-30, their exact URLs and SHA-256 fingerprints of the downloaded source snapshots. Page footers link the papers, author model cards, released configurations and code relevant to that topic. Config numbers identify particular checkpoints; they are not guarantees about every member of a model family. Source URLs using `main` can change after the recorded date.

DeepSeek V2/V3/V3.1/V3.2, V4 and V4.1 have distinct attention, expert and residual mechanisms. V4 Flash/Pro are compared explicitly. V4.1's 552B backbone and 196B conditional-memory table are reported separately, as are its phase-dependent active counts. Its 890 bytes/token figure concerns global KV in the documented FP4 format, not total serving memory.

Qwen's dense, MoE, recurrent-hybrid and multimodal releases are distinguished. Qwen3.8-27B is a dense native VLM; the separate 2.4T-A95B MoE release does not supply its expert counts. Published GPT-2, GPT-3 and gpt-oss architectures have concrete pages. GPT-4/4.1 internal layer/expert dimensions are not specified by the cited public API documentation and are not invented here.

## Numerical examples

Attention and FlashAttention use the same final query, keys and values. Online softmax retains a shared maximum/denominator across tiles; it does not average independently normalized tile outputs. MHA/GQA/MQA change head sharing; encoder/cross-attention change the mask and memory source. Gated attention adds an explicit toy output gate before projection.

Normalization uses population statistics and ignores tiny epsilon in displayed numeric values. MoE combines renormalized top-2 outputs with a shared expert under a clearly labeled toy routing rule. MLA, DSA, compressed attention, mHC and CSA2 diagrams explain different mechanisms and do not equate them with lossless attention kernels or network collectives.

Gated DeltaNet's key-by-value memory decays before prediction/error correction. The RWKV comparison uses a value-by-key state convention: RWKV-7 adds `(Sold a)bᵀ` from the old state; RWKV-6 omits it in the displayed core recurrence. Actual gates, readouts and projection details are release-specific. The Mamba scalar example illustrates dependencies and associative affine composition, rather than its full head/state structure.

The 2D convolution uses a 4×4 input and a diagonal 2×2 kernel. The depthwise 1D example uses independent channels, causal left padding and a length-3 kernel. DDPM shows oracle noise reconstruction and one reverse mean with the stochastic term explicitly omitted. Flow matching shows a constant-velocity Euler trajectory with a stated noise-to-data convention. Speculative decoding demonstrates greedy-prefix acceptance; exact sampling additionally needs acceptance/rejection and correction distributions.

All these views summarize logical dependencies. Full release code is the source of truth for exact tensor layouts, precision, gate parameterizations, cache management and execution schedules.
