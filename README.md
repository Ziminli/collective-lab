# Collective Lab

[Open the live website](https://ziminli.github.io/collective-lab/) · [中文 / English](https://ziminli.github.io/collective-lab/#/communication/all-reduce)

An illustrated, technically detailed field guide to distributed deep learning. Open **index.html** in a modern browser, or serve this directory:

```sh
python3 serve.py
```

Then open http://localhost:8847. On Windows, `python serve.py` or `py serve.py` also works if Python is installed. No build, package manager, API key, or dependency installation is required. Three.js is bundled locally with its MIT license.

## What's inside

Each communication page first animates its abstract input/output contract, then presents a separate implementation trace. Costs, formulas, and step explanations follow the selected algorithm. Symbols and units are introduced on the page.

**Communication (12):** AllReduce, AllGather, ReduceScatter, Broadcast, Reduce, Scatter, Gather, AllToAll, AllToAllv, Send/Recv, Barrier, and prefix Scan. Where applicable, switch between ring, tree, recursive doubling/halving, direct, or pairwise examples.

**Parallelism (10):** data, tensor, pipeline, sequence, context, expert, hybrid 3D, replica serving, prefill/decode disaggregation, and fully sharded data parallelism. Topics shared by training and inference have a mode selector. Tensor parallelism compares row-parallel, column-parallel, and a paired column→row MLP with a consistent two-rank matrix example and forward/backward details.

**Techniques (8):** ZeRO stages 1–3, gradient accumulation, activation checkpointing, communication overlap, continuous batching, KV cache/paging, gradient compression, and inference quantization.

**Architectures (25):** 7 blueprints (Transformer, MoE, RWKV, state-space/Mamba, diffusion/flow, CNN and ViT) plus 18 key-operator pages. Transformer views compare decoder-only, encoder-only and encoder-decoder layouts. Numerical walkthroughs cover attention and head sharing, cross-attention, gated attention, FlashAttention, RoPE, normalization, FFNs, routing, MLA, sparse/compressed attention, mHC, SSMs, DeltaNet, RWKV state, convolution, diffusion updates, cross-layer KV reuse, Engram and speculative decoding.

**Models (24):** DeepSeek V2/V3/V3.1/V3.2/V4/V4.1/R1; Qwen2.5/3 dense/3 MoE/3-Next/3.5/3.8; Llama 2/3.1/4; GPT-2/3/gpt-oss and documented hosted-GPT scope; RWKV-7, Mamba-2, Stable Diffusion v1.5 and FLUX.1. Model pages show reference-checkpoint dimensions, family comparisons, operator chips and training/inference differences. Undisclosed hosted-model internals are identified explicitly.

## Mathematical architecture theater

Architecture and model structure views use a mathematical blackboard with front-facing tensor planes, stable feature/query/key/value colors, and explicit numerical transformations. Select any output cell to highlight its source coordinates, watch operands form a running result, and see the result arrive in that cell. Matrix labels show the two displayed axes; batch is B=1. Displayed entries round to two decimals; calculations retain full precision.

Thirty disclosed architecture/model profiles have executable miniatures. The lessons carry actual values through a representative block: embedding, normalization, per-head attention, residuals, feature mixing and a prediction/loss head. GQA shows distinct queries sharing KV; MLA separates content/position caches and scores, then demonstrates key-projection absorption. Hybrid Qwen models offer a DeltaNet/GQA mixer switch. RWKV and Mamba illustrate fixed-size state, while compressed/cross-layer memory, CNN windows, ViT patches and diffusion/flow updates have their own lessons. The anatomy ribbon and expandable published topology keep the full released structure separate from the miniature. Hosted models with undisclosed internals retain a documented-interface view.

Use **3D / 2D** to compare tensor planes with a flat presentation. Drag gently in 3D, reset the camera, replay a calculation or advance one arithmetic step. Chapter playback starts only when requested; the selected calculation animates once. Reduced-motion mode uses manual arithmetic steps, and WebGL failure automatically selects the complete flat view.

These examples teach representative mathematics, not complete checkpoint execution. Mamba isolates the state-space core; compressed attention uses a clearly marked pooling surrogate; MoE uses explicit small expert functions; diffusion supplies an oracle scheduler prediction. Model-specific gates, conditioning, layer patterns and other operators remain documented in their dedicated tabs and source notes.

## Visual learning studio

Every topic starts with an input → change → result explanation and ends with a conceptual self-check. Read the idea, follow the data one step at a time, then predict what changes when an input changes.

- **Arithmetic before algorithms:** choose a tensor position and watch individual values form a running sum, then copy the finished result to its owners. Inputs and output buffers stay separate. The same example has 2D and 3D views; implementation views carry numbered payloads and show receiver arithmetic.
- **Explicit operator contracts:** every operator shows input/output shapes, intermediate/state shapes, an equation, and a replayable numerical calculation. Select a result cell to follow its multiply–accumulate terms. Playback waits for the calculation.
- **MLA end to end:** ten stages derive content/query compression, separate RoPE features, persistent cache tensors, per-head scores, matrix absorption, softmax, latent readout and output projection. Choose either head and compare compact versus expanded cache accounting.
- **Continuous motion:** matrix transitions and moving numerical terms connect successive states. Playback leaves time to read each explanation.
- **Step navigator:** select a named stage directly, scrub the trace, or expand the canvas. Escape closes the expanded view.
- **Tensor inspection:** click a matrix/buffer cell, or focus it and press Enter, to read its coordinates, value and meaning.
- **Live calculations:** communication, tensor parallelism and all 18 key operators have parameter experiments. Change a contribution, query feature, norm offset, recurrent gate or other input; the example recomputes its output.
- **GPU & tensor space:** an optional Three.js view on 18 topics shows actual buffer/shard ownership, current numerical values and transfer directions. Drag to rotate, zoom, reset, select a tile, or open its text data inventory. The detailed 2D view remains available.
- **Consistent presentation:** larger canvases, blue accents, neutral/navy dark appearance, bilingual explanations and mobile layouts.

Three.js 0.160.0 is pinned in `vendor/`; the site makes no runtime CDN request. If WebGL is unavailable, the complete 2D view remains usable. Animation respects reduced motion and stops in background tabs. The spatial view illustrates ownership and dependencies, not real GPU placement or measured timing.

## Controls

- Top-right **EN / 中文** switches the complete guide, diagram labels, and accessible controls between English and Simplified Chinese. Both languages are searchable.
- The adjacent sun/moon button switches **light / neutral charcoal dark** appearance. Theme initially follows the system. Choices are remembered locally; switching preserves the current topic, layout, mode, and animation step.
- Separate logical-example and implementation playback controls. Logical autoplay runs once; implementation playback starts when requested on communication pages.
- Play/pause, previous/next, restart, scrubbers, and 0.5×–2× implementation playback.
- Space: play/pause. Left/right arrows: step. `/`: search topics. Escape: close the guide or mobile menu.
- Search spans all five sections. Each topic has a shareable hash URL.
- Symbols and model assumptions appear beside equations. Comparison tables and worked examples add detail on every page.
- “The field guide” also explains rank, shard colors, and notation.
- On phones, collective diagrams reflow to a compact layout. Wider strategy diagrams can be swiped horizontally.
- System reduced-motion preference disables autoplay. Background tabs stop the playback timer.

## Technical scope

Animations illustrate logical dependencies and buffer ownership, not measured performance or literal packet timings. Four ranks keep collective examples legible; TP uses two ranks to compare the same matrix under both decompositions. Pipeline has animated selectors for 10 training schedules (GPipe, 1F1B, interleaved 1F1B, Looped BFS, ZB1P, ZB2P, ZBV, DualPipe, DualPipeV, and PipeDream) and 3 inference examples (forward-only, interleaved requests, chunked prefill plus decode). Each selection synchronizes placement, timeline, explanation, and comparison. See pipeline-notes.md for precise illustrative assumptions and source provenance. Context parallelism shows a K/V ring for prefill/training, with decode differences explained in text. AllToAllv bucket widths are symbolic. ZeRO diagrams show persistent state, not peak memory.

Matrix views show numeric row/column TP products and their backward gradients, SP token-row layouts before/after collectives, and CP's causal attention mask while K/V blocks circulate. Colors consistently identify the rank owning each feature or token block.

The α–β cost models define P, α, β, and N on each communication page and omit contention, local compute, protocol details, and topology. Source links point to official MPI/NCCL/PyTorch documentation or original papers. The tree AllReduce cost describes the illustrated full-tensor reduce/broadcast baseline, not an optimized chunked/double-tree implementation. Exact library algorithm selection is version- and topology-dependent.

The site works without network access, including both languages and themes. Google Fonts is an optional enhancement; built-in system fallbacks apply when unavailable. Documentation links require internet access. Language and theme preferences use localStorage when available. No analytics, accounts, cookies, or backend services are used.

For model-specific source and example conventions, see [model-notes.md](model-notes.md) and [model-sources.json](model-sources.json). Model facts are dated snapshots of published releases; the small matrices are teaching examples.

## Files

- `index.html`: document, navigation shell, notation dialog.
- `styles.css`: responsive design and print/reduced-motion styles.
- `content.js`: topic explanations, references, and relationships.
- `lessons.js`: algorithm-specific costs, notation, comparisons, and expanded page explanations.
- `animations.js`: implementation traces and strategy SVG diagrams.
- `pipeline.js`: bilingual schedule-specific lessons and timeline rendering.
- `pipeline-plans.js`: generated dependency-checked example traces.
- `pipeline-notes.md`: schedule model, limitations, and reference provenance.
- `tensor-views.js`: numerical TP matrices, SP activation layouts, and CP attention masks.
- `semantics.js`: entry-by-entry arithmetic/copy contracts and logical animations.
- `operator-workbench.js`: executable MLA example, operator shape/equation contracts and numerical replays.
- `calculus.css`: computation panels, desktop side-by-side explanations and responsive MLA presentation.
- `scripts/verify-calculations.cjs`: dependency-free collective/operator numerical assertions, also run in CI.
- `architecture-content.js`: executable miniature models, chapter equations and cell-level source traces.
- `architecture-studio.js`: Three.js tensor planes, moving numerical operands, calculation controls and flat fallback.
- `architecture.css`: mathematical stage, anatomy ribbon and responsive matrix presentation.
- `scripts/verify-architecture.cjs`: miniature tensor, arithmetic and model-profile checks, also run in CI.
- `architecture-browser-verification.json`: this revision’s route, chapter, interaction and presentation audit.
- `app.js`: routing, playback, search, and interaction.
- `zh.js`: Chinese explanations, controls, and animation translations.
- `preferences.js`: language/theme controls, preference persistence, and SVG contrast handling.
- `serve.py`: optional local static server, bound to localhost.
- `model-content.js`: bilingual model curriculum, checkpoint facts and source links.
- `model-views.js`: architecture/operator view selection and numerical SVG traces.
- `model.css`: model navigation, fact strips and diagrams.
- `studio.css`: shared visual studio layout and responsive/theme styles.
- `teaching-content.js`: bilingual input/action/result contracts and self-checks.
- `teaching.js`: step navigation, concept questions, canvas controls and data inspection.
- `motion.js`: SVG state transitions and moving computation indicators.
- `experiments.js`: live numerical parameter experiments.
- `spatial.js`: disposable Three.js tensor/buffer views and camera interaction.
- `vendor/three.min.js`, `vendor/three.LICENSE`: pinned local Three.js runtime and license.
- `studio-verification.json`, `visual-verification.json`: visual studio interaction and layout checks.
- `model-notes.md`: example conventions, checkpoint scope and technical limits.
- `model-sources.json`: dated source URLs and downloaded-source fingerprints.
- `verification.json`: completed browser verification results.

## Verification

Run `node scripts/verify-architecture.cjs` to check the new miniature lessons across training/inference and both hybrid mixers, including every displayed output cell, source references, matrix products, probability normalization and independent convolution fixtures. The browser report records the new theater separately from earlier audits.

The previous computation revision is checked in `calculus-verification.json`, `calculus-layout-verification.json` and `calculus-motion-verification.json`. It checks all 79 routes, 2,196 model/operator frames, 266 logical collective frames, independently specified MLA outputs and the algebraic equivalence of both attention paths. Run `node scripts/verify-calculations.cjs` for 461 dependency-free assertions covering all 12 collectives and 18 operators. Earlier studio audits below describe their own revision; the calculus reports cover the changed views.

The visual studio is checked separately for all-topic teaching contracts, selected-view explanations, numerical experiments, matrix inspection, camera controls, expanded views, reduced motion and WebGL fallback. Its responsive audit covers all 79 topics in both languages and themes at seven widths. Numerical operator checks independently compare attention gradients, recurrence and other worked calculations. See `studio-verification.json` and `visual-verification.json` for the current measured counts.


The original distributed curriculum checks cover all 30 original topics, 63 algorithm/layout/mode configurations, both languages and themes (252 presentations), 2,876 implementation-frame presentations, and 240 logical-frame presentations. All topics were checked at widths 1920, 1440, 1024, 768, 700, 390, and 320 pixels in each language/theme combination. Preference persistence, state preservation, Chinese search, accessible labels, direct-file use, blocked-storage fallback, and matrix arithmetic were verified. The expanded 79-topic curriculum passed 1,700 view/language/theme presentations, 11,372 implementation-frame presentations and all 28 language/theme/width combinations. Independent numerical checks cover attention and gradients, RoPE, normalization, routing, mHC, DeltaNet/RWKV state, convolutions, diffusion updates and conditional memory. Mode-specific structure graphs and the GitHub Pages project path were also verified. See `verification.json`.

## GitHub Pages deployment

The site supports GitHub Pages project URLs without a build framework or base-path configuration. Navigation uses hash routes, and all runtime assets use relative URLs.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the source. The included workflow validates and deploys the site on every push to `main`. Pull requests run validation without publishing. No personal access token or repository secret is needed for deployment; GitHub provides a scoped workflow token.

To build the same deployable artifact locally:

```sh
python3 scripts/build-site.py
```

The `_site/` directory contains only public webpage assets. Source notes are included; Git metadata, local server scripts, verification reports, and repository tooling are excluded from deployment. The full source remains in the repository.

For future changes, edit the source files at the repository root, commit, and push to `main`. Check the **Actions** tab for the deployment status.
