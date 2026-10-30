# Collective Lab

[Open the live website](https://ziminli.github.io/collective-lab/) · [中文 / English](https://ziminli.github.io/collective-lab/#/communication/all-reduce)

An illustrated, technically detailed field guide to distributed deep learning. Open **index.html** in a modern browser, or serve this directory:

```sh
python3 serve.py
```

Then open http://localhost:8847. On Windows, `python serve.py` or `py serve.py` also works if Python is installed. No build, package manager, API key, or application dependencies are required.

## What's inside

Each communication page first animates its abstract input/output contract, then presents a separate implementation trace. Costs, formulas, and step explanations follow the selected algorithm. Symbols and units are introduced on the page.

**Communication (12):** AllReduce, AllGather, ReduceScatter, Broadcast, Reduce, Scatter, Gather, AllToAll, AllToAllv, Send/Recv, Barrier, and prefix Scan. Where applicable, switch between ring, tree, recursive doubling/halving, direct, or pairwise examples.

**Parallelism (10):** data, tensor, pipeline, sequence, context, expert, hybrid 3D, replica serving, prefill/decode disaggregation, and fully sharded data parallelism. Topics shared by training and inference have a mode selector. Tensor parallelism compares row-parallel, column-parallel, and a paired column→row MLP with a consistent two-rank matrix example and forward/backward details.

**Techniques (8):** ZeRO stages 1–3, gradient accumulation, activation checkpointing, communication overlap, continuous batching, KV cache/paging, gradient compression, and inference quantization.

## Controls

- Top-right **EN / 中文** switches the complete guide, diagram labels, and accessible controls between English and Simplified Chinese. Both languages are searchable.
- The adjacent sun/moon button switches **light / neutral charcoal dark** appearance. Theme initially follows the system. Choices are remembered locally; switching preserves the current topic, layout, mode, and animation step.
- Separate logical-example and implementation playback controls. Logical autoplay runs once; implementation playback starts when requested on communication pages.
- Play/pause, previous/next, restart, scrubbers, and 0.5×–2× implementation playback.
- Space: play/pause. Left/right arrows: step. `/`: search topics. Escape: close the guide or mobile menu.
- Search spans all three sections. Each topic has a shareable hash URL.
- Symbols and model assumptions appear beside equations. Comparison tables and worked examples add detail on every page.
- “The field guide” also explains rank, shard colors, and notation.
- On phones, collective diagrams reflow to a compact layout. Wider strategy diagrams can be swiped horizontally.
- System reduced-motion preference disables autoplay. Background tabs stop the playback timer.

## Technical scope

Animations illustrate logical dependencies and buffer ownership, not measured performance or literal packet timings. Four ranks keep collective examples legible; TP uses two ranks to compare the same matrix under both decompositions. Pipeline has animated selectors for 10 training schedules (GPipe, 1F1B, interleaved 1F1B, Looped BFS, ZB1P, ZB2P, ZBV, DualPipe, DualPipeV, and PipeDream) and 3 inference examples (forward-only, interleaved requests, chunked prefill plus decode). Each selection synchronizes placement, timeline, explanation, and comparison. See pipeline-notes.md for precise illustrative assumptions and source provenance. Context parallelism shows a K/V ring for prefill/training, with decode differences explained in text. AllToAllv bucket widths are symbolic. ZeRO diagrams show persistent state, not peak memory.

Matrix views show numeric row/column TP products and their backward gradients, SP token-row layouts before/after collectives, and CP's causal attention mask while K/V blocks circulate. Colors consistently identify the rank owning each feature or token block.

The α–β cost models define P, α, β, and N on each communication page and omit contention, local compute, protocol details, and topology. Source links point to official MPI/NCCL/PyTorch documentation or original papers. The tree AllReduce cost describes the illustrated full-tensor reduce/broadcast baseline, not an optimized chunked/double-tree implementation. Exact library algorithm selection is version- and topology-dependent.

The site works without network access, including both languages and themes. Google Fonts is an optional enhancement; built-in system fallbacks apply when unavailable. Documentation links require internet access. Language and theme preferences use localStorage when available. No analytics, accounts, cookies, or backend services are used.

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
- `semantics.js`: abstract input/output traces and logical animations.
- `app.js`: routing, playback, search, and interaction.
- `zh.js`: Chinese explanations, controls, and animation translations.
- `preferences.js`: language/theme controls, preference persistence, and SVG contrast handling.
- `serve.py`: optional local static server, bound to localhost.
- `verification.json`: completed browser verification results.

## Verification

Chrome checks cover all 30 topics, 63 algorithm/layout/mode configurations, both languages and themes (252 presentations), 2,876 implementation-frame presentations, and 240 logical-frame presentations. All topics were checked at widths 1920, 1440, 1024, 768, 700, 390, and 320 pixels in each language/theme combination. Preference persistence, state preservation, Chinese search, accessible labels, direct-file use, blocked-storage fallback, and matrix arithmetic were verified. See `verification.json`.

## GitHub Pages deployment

The site supports GitHub Pages project URLs without a build framework or base-path configuration. Navigation uses hash routes, and all runtime assets use relative URLs.

In the repository's **Settings → Pages**, choose **GitHub Actions** as the source. The included workflow validates and deploys the site on every push to `main`. Pull requests run validation without publishing. No personal access token or repository secret is needed for deployment; GitHub provides a scoped workflow token.

To build the same deployable artifact locally:

```sh
python3 scripts/build-site.py
```

The `_site/` directory contains only public webpage assets. Source notes are included; Git metadata, local server scripts, verification reports, and repository tooling are excluded from deployment. The full source remains in the repository.

For future changes, edit the source files at the repository root, commit, and push to `main`. Check the **Actions** tab for the deployment status.
