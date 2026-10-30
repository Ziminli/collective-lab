/* Pipeline scheduling lessons and views. All examples share explicit dependency graphs. */
function pipeText(en,zh){ZH[en]=zh;return en;}
const PT=pipeText;
const PIPELINE_TRAINING=['GPipe','1F1B','Interleaved 1F1B','Looped BFS','ZB1P','ZB2P','ZBV','DualPipe','DualPipeV','PipeDream'];
const PIPELINE_INFERENCE=['Forward-only','Interleaved requests','Chunked prefill + decode'];
PT('Interleaved 1F1B','交错 1F1B');PT('Looped BFS','循环广度优先 BFS');PT('Forward-only','仅前向');PT('Interleaved requests','请求交错');PT('Chunked prefill + decode','分块预填充 + 解码');
const PIPELINE_COPY={
 GPipe:{
  formula:'Uideal = m / (m + p − 1)',
  idea:PT('Fill every forward, then drain backward.','先填充全部前向，再排空反向。'),
  trade:PT('Simple synchronous baseline; many saved activations.','简单的同步基线；保存的激活较多。'),
  memory:PT('All m microbatches can remain live on each stage.','每阶段可能同时保存全部 m 个微批次激活。'),
  limit:PT('Warmup and drain bubbles; all microbatches use one weight version.','预热与排空气泡；全部微批次使用同一权重版本。'),
  steps:[[PT('Fill the forward wave','填充前向波'),PT('Run F1…F6 through the stages. The last stage completes all forward microbatches before starting backward.','让 F1…F6 依次经过各阶段。最后阶段完成全部前向微批次后，才开始反向。')],[PT('Drain the backward wave','排空反向波'),PT('Send activation gradients toward earlier stages. A backward operation needs its own saved forward and the next stage’s gradient.','向更早阶段发送激活梯度。反向需要自身保存的前向激活，以及下一阶段返回的梯度。')],[PT('Update after the flush','排空后更新'),PT('Accumulate all microbatch gradients, finish required reductions and clipping, then update once. This is synchronous training.','累积全部微批次梯度，完成必要归约和裁剪后统一更新一次；这是同步训练。')]],
  details:[[PT('Why so many activations?','为什么保存这么多激活？'),PT('The forward wave gets ahead of backward. In this six-microbatch example, each rank retains six stage/microbatch activation records at peak. Checkpointing can reduce their byte size.','前向波领先于反向。这个六微批次示例中，每个 rank 最多保留六份“阶段 / 微批次”激活记录；检查点可减少每份的字节大小。')]]
 },
 '1F1B':{
  formula:'warmupᵣ = min(p − r − 1, m); then (F, B)',
  idea:PT('Warm up, alternate one forward and one backward, then drain.','先预热，再交替一次前向、一次反向，最后排空。'),
  trade:PT('PipeDream-Flush / synchronous 1F1B reduces activation lifetime.','PipeDream-Flush / 同步 1F1B 缩短激活生命周期。'),
  memory:PT('Bounded in-flight activations; no weight stashing in the flushed form.','限制在途激活；排空式版本无需保存多个权重版本。'),
  limit:PT('Usually improves memory, not the ideal bubble fraction by itself.','主要改善内存，本身通常不降低理想气泡比例。'),
  steps:[[PT('Warm up by distance','按距离预热'),PT('Earlier ranks launch more forwards because their first gradient must travel farther back. Rank r warms up with p−r−1 forwards.','较早 rank 的首个梯度返回距离更远，因此先执行更多前向；rank r 预热 p−r−1 次前向。')],[PT('Alternate F and B','交替 F 与 B'),PT('After warmup, run a new forward and the oldest ready backward. Release that microbatch’s saved activations after backward.','预热后，执行一个新前向和最早就绪的反向；反向完成后释放该微批次的保存激活。')],[PT('Flush before updating','更新前排空'),PT('Drain outstanding backwards and update once per accumulated batch. Do not confuse this synchronous schedule with historical asynchronous PipeDream.','排空尚未完成的反向，每个累积批次统一更新一次。它与历史上的异步 PipeDream 不同。')]],
  details:[[PT('Same ideal bubbles, smaller live set','理想气泡相同，存活集合更小'),PT('Under this balanced model GPipe and 1F1B both finish in 48 ticks, but peak activation records change from [6,6,6] to [3,2,1]. The counts illustrate lifetime, not tensor bytes.','在这个均衡模型中，GPipe 和 1F1B 都用 48 拍完成，但峰值激活记录由 [6,6,6] 变成 [3,2,1]；记录数表示生命周期，不等于张量字节数。')]]
 },
 'Interleaved 1F1B':{
  formula:'logical stages = p × v; v = 2 chunks / rank',
  idea:PT('Alternate work from multiple virtual stages on each rank.','每个 rank 交错执行多个虚拟阶段的工作。'),
  trade:PT('Smaller chunks can shorten bubbles, with more boundary transfers.','更小的模型块可缩短气泡，但增加边界传输。'),
  memory:PT('Two model chunks per rank; activations tracked per chunk.','每 rank 两个模型块；激活按块记录。'),
  limit:PT('More P2P messages; microbatch grouping and balance matter.','点对点消息更多；微批次分组和负载均衡很重要。'),
  steps:[[PT('Place virtual stages cyclically','循环放置虚拟阶段'),PT('C0→C1→…→C5 maps to ranks 0→1→2→0→1→2. Both chunks on one rank share its compute resource.','C0→C1→…→C5 映射到 rank 0→1→2→0→1→2。同一 rank 上的两块共享计算资源。')],[PT('Interleave local chunks','交错本地模型块'),PT('Use the interleaved 1F1B local ordering: warm up, then alternate forward and backward while cycling through chunk/microbatch groups.','采用交错 1F1B 的本地顺序：预热后交替前向和反向，并在模型块 / 微批次组之间轮换。')],[PT('Pay for extra boundaries','计入额外边界成本'),PT('The wrap C2→C3 crosses from rank 2 back to rank 0. Smaller compute chunks help only if the additional transfers and launches remain affordable.','C2→C3 从 rank 2 返回 rank 0。只有新增传输与启动成本足够低，更小的计算块才有收益。')]],
  details:[[PT('Virtual stages are not extra GPUs','虚拟阶段不是额外 GPU'),PT('There are six logical stages but three physical ranks. The timeline has one compute lane per physical rank, so it never runs two ordinary chunks simultaneously on one GPU.','这里是六个逻辑阶段、三个物理 rank。时间线按物理 rank 分行，因此同一 GPU 上不会同时运行两个普通计算块。')]]
 },
 'Looped BFS':{
  formula:'rank r owns Cᵣ and Cᵣ₊ₚ; process microbatches breadth-first',
  idea:PT('Run a group of microbatches on one local chunk before the next.','先在一个本地模型块上处理一组微批次，再切换到下一块。'),
  trade:PT('Breadth-first locality can amortize parameter gathers.','广度优先提高局部性，可摊薄参数收集成本。'),
  memory:PT('Often keeps more activations than depth-first interleaving.','通常比深度优先交错保留更多激活。'),
  limit:PT('Useful with sharded parameters; memory and chunk granularity matter.','适合与参数分片配合；需考虑内存和分块粒度。'),
  steps:[[PT('Use a looped placement','采用循环布局'),PT('Use the same C0…C5 cyclic placement as interleaved 1F1B, so placement is held fixed while local scheduling changes.','沿用交错 1F1B 的 C0…C5 循环布局，只改变本地调度，便于比较。')],[PT('Prefer the earlier chunk','优先较早模型块'),PT('Run all available forwards for the earlier local chunk, then the later chunk. Drain backwards in the corresponding reverse chunk order.','先执行较早本地块的可用前向，再处理较晚块；反向按相反模型块顺序排空。')],[PT('Trade liveness for locality','以激活存活换局部性'),PT('Reusing an unsharded chunk across microbatches can amortize FSDP gathers, but many forward records stay live. This is not the same ordering as interleaved 1F1B.','跨微批次复用已收集的模型块可摊薄 FSDP AllGather，但会延长较多前向记录的存活时间；其顺序不同于交错 1F1B。')]],
  details:[[PT('BFS versus interleaved 1F1B','BFS 与交错 1F1B'),PT('Both examples use two chunks per rank. BFS groups work by chunk; interleaved 1F1B prioritizes progress through alternating forwards/backwards. Identical modeled completion times do not imply identical memory or communication behavior.','两种示例均为每 rank 两块。BFS 按块聚合工作，交错 1F1B 优先交替推进前后向。模型完成时间相同，不代表内存或通信行为相同。')]]
 },
 ZB1P:{
  formula:'B = I + W; send dX after I, defer W',
  idea:PT('Prioritize input gradients; fill idle gaps with weight gradients.','优先传播输入梯度，用权重梯度填补空闲。'),
  trade:PT('Split backward with a 1F1B-sized activation budget.','拆分反向，激活预算保持在 1F1B 量级。'),
  memory:PT('Bound pending activation records to p−r in this example.','本例将待处理激活记录限制为 p−r。'),
  limit:PT('Usually leaves residual bubbles; splitting backward has overhead.','通常仍有剩余气泡；拆分反向本身有开销。'),
  steps:[[PT('Split the backward computation','拆分反向计算'),PT('I computes dX for the previous stage; W computes dW for the local optimizer. Upstream I depends on downstream I, not on downstream W.','I 计算前一阶段需要的 dX，W 计算本地优化器需要的 dW。上游 I 依赖下游 I，不依赖下游 W。')],[PT('Keep critical work moving','优先推进关键工作'),PT('The illustrative scheduler prioritizes ready I, then F within its memory budget, then pending W. A forward record is kept until W completes.','示意调度器优先执行就绪 I，再在内存预算内执行 F，最后安排待处理 W。前向记录要保留到 W 完成。')],[PT('Complete every weight gradient','完成全部权重梯度'),PT('Deferred W must still finish before the synchronous optimizer step. ZB1P reduces bubbles without promising a completely bubble-free finite batch.','推迟的 W 仍须在同步优化器更新前完成。ZB1P 减少气泡，但不保证有限批次完全无气泡。')]],
  details:[[PT('What this zero-bubble trace models','零气泡示例模拟了什么'),PT('This is a dependency-correct greedy illustration of the ZB1P memory regime, not a reproduction of a production scheduler’s search result. Real systems profile F/I/W and optimize under memory and communication constraints.','这是符合依赖的贪心示意，展示 ZB1P 的内存预算，并非生产调度器搜索结果的逐项复现。实际系统会测量 F/I/W，在内存和通信约束下优化。')]]
 },
 ZB2P:{
  formula:'B = I + W; larger pending-activation budget',
  idea:PT('Allow more in-flight work so deferred W can fill more gaps.','允许更多在途工作，让延后的 W 填补更多空隙。'),
  trade:PT('More activation buffering buys scheduling freedom.','更多激活缓冲换取更大调度空间。'),
  memory:PT('Twice the ZB1P record budget in this illustration.','本示例的记录预算是 ZB1P 的两倍。'),
  limit:PT('Ideal zero-bubble claims assume balanced F/I/W and enough work.','理想零气泡结论依赖均衡 F/I/W 与足够工作量。'),
  steps:[[PT('Increase the activation budget','增加激活预算'),PT('Use the same F/I/W dependencies as ZB1P, but allow twice as many pending forward records on each rank.','使用与 ZB1P 相同的 F/I/W 依赖，但每 rank 允许两倍的待处理前向记录。')],[PT('Launch further ahead','让前向推进更远'),PT('Additional ready forwards keep later stages supplied while noncritical weight gradients wait for useful gaps.','更多就绪前向为后续阶段持续供料，非关键的权重梯度等待合适空隙。')],[PT('Drain W and validate','排空 W 并验证'),PT('Finish all deferred gradients and numerical checks before updating. Finite-batch fill/drain and unequal kernels can still leave bubbles.','更新前完成所有延后梯度与数值检查。有限批次的填充 / 排空及内核不均衡仍可能留下气泡。')]],
  details:[[PT('ZB1P versus ZB2P','ZB1P 与 ZB2P'),PT('The model keeps the graph and operation durations fixed; only the memory budget changes. The greedy examples finish in 44 versus 42 ticks. These are illustrative schedules, not the paper’s theoretical zero-bubble limit or measured speedups.','模型固定计算图与操作时长，只改变内存预算。两个贪心示例分别用 44、42 拍完成；这是调度示意，不是论文的理论零气泡极限或实测加速。')]]
 },
 ZBV:{
  formula:'C0→C1→C2→C3→C4→C5 maps to R0→R1→R2→R2→R1→R0',
  idea:PT('Fold the stage path into a V and split backward into I/W.','将阶段路径折成 V 形，并把反向拆成 I / W。'),
  trade:PT('Two chunks per rank balance opposite sides of the folded path.','每 rank 两块，均衡折叠路径的两侧工作。'),
  memory:PT('V-shaped ownership; two chunks, with deferred weight gradients.','V 形归属；每 rank 两块，并推迟权重梯度。'),
  limit:PT('Equal F/I/W is an idealization; real timing can leave bubbles.','F / I / W 等时只是理想假设；实际仍可能有气泡。'),
  steps:[[PT('Fold the model across ranks','跨 rank 折叠模型'),PT('Rank 0 owns the first and last chunks; rank 1 owns the next pair; rank 2 owns the middle pair. The C2→C3 boundary is local.','rank 0 拥有首尾块，rank 1 拥有次外侧两块，rank 2 拥有中间两块；C2→C3 是本地边界。')],[PT('Interleave the two sides','交错 V 形两侧'),PT('Warm up and alternate work on the paired chunks, prioritizing input-gradient progress and placing weight-gradient work in available gaps.','预热后在配对模型块间交错工作，优先推进输入梯度，并在可用空隙安排权重梯度。')],[PT('Respect all gradient dependencies','遵守全部梯度依赖'),PT('Every chunk needs its forward before I and I before W. The displayed local order follows PyTorch’s ZBV implementation; communication delay is omitted.','每块先前向再 I，再执行 W。图中本地顺序参考 PyTorch ZBV 实现；未计通信延迟。')]],
  details:[[PT('A placement change as well as a schedule change','既改变布局，也改变调度'),PT('ZBV uses V-shaped placement rather than the cyclic placement of interleaved 1F1B. Compare the mapping strip above the timeline before comparing the execution order.','ZBV 使用 V 形布局，而非交错 1F1B 的循环布局。比较执行顺序前，请先看时间线上方的映射条。')]]
 },
 DualPipe:{
  formula:'two directions + custom overlapped F/B execution',
  idea:PT('Feed work from both ends and overlap compatible F/B phases.','从两端供给工作，重叠兼容的前后向阶段。'),
  trade:PT('Bidirectional work and overlap need extra state and custom kernels.','双向工作与重叠需要额外状态和定制内核。'),
  memory:PT('Mirrored placement can increase parameter and activation memory.','镜像布局可能增加参数与激活内存。'),
  limit:PT('Principle illustration; actual overlap is hardware and kernel dependent.','原理示意；实际重叠依赖硬件与内核。'),
  steps:[[PT('Feed opposite directions','从相反方向供料'),PT('The A stream flows rank 0→1→2 and the B stream rank 2→1→0. This small mirrored example illustrates bidirectional work, rather than reproducing DeepSeek’s complete schedule.','A 流沿 rank 0→1→2，B 流沿 rank 2→1→0。这个小型镜像示例解释双向工作，不逐项复现 DeepSeek 的完整调度。')],[PT('Pair compatible forward and backward','配对兼容的前向与反向'),PT('When opposite streams have ready F and B on one rank, the timeline draws them together in two half-height bands. This requires an explicitly implemented overlapped execution path.','同一 rank 上，相反流的 F 与 B 同时就绪时，时间线用上下半条表示重叠；这需要显式实现的重叠执行路径。')],[PT('Complete matching updates safely','安全完成对应更新'),PT('Matching mirrored parameter gradients must be combined before a consistent update. Communication, reduction, and optimizer details are outside this principle animation.','一致更新前需要合并对应镜像参数的梯度。通信、归约和优化器细节不在这个原理动画中展开。')]],
  details:[[PT('Overlap is an assumption, not a free second GPU','重叠是假设，不是多出一块 GPU'),PT('Compound F/B blocks use an ideal max(F,B) duration here. Real DualPipe overlaps fine-grained computation and communication with custom kernels; it does not guarantee arbitrary whole forwards and backwards execute for free together.','复合 F/B 块在此按理想 max(F,B) 时长绘制。真实 DualPipe 用定制内核重叠细粒度计算和通信，不保证任意完整前后向可以无成本并行。')]]
 },
 DualPipeV:{
  formula:'V-shaped placement + overlapped (F,B) compound actions',
  idea:PT('Combine a folded V path with scheduled F/B overlap.','将折叠 V 形路径与前后向重叠结合。'),
  trade:PT('A V-shaped derivative of DualPipe with two chunks per rank.','DualPipe 的 V 形派生调度，每 rank 两块。'),
  memory:PT('Paired chunks and saved states for custom overlapping execution.','配对模型块及用于定制重叠执行的保存状态。'),
  limit:PT('Overlap efficiency and fine-grained kernel support determine benefit.','收益取决于重叠效率与细粒度内核支持。'),
  steps:[[PT('Use the folded V placement','使用折叠 V 形布局'),PT('Place six chunks on three ranks in order 0→1→2→2→1→0. Each rank owns two different portions of the same model.','六块按 0→1→2→2→1→0 放在三个 rank 上；各 rank 拥有同一模型的两个不同部分。')],[PT('Execute compound F/B actions','执行复合 F / B 操作'),PT('The local action order follows PyTorch’s DualPipeV schedule. Some steps pair a ready forward with a ready full backward from the other local chunk.','本地操作顺序参考 PyTorch DualPipeV 调度；部分步骤将就绪前向与另一块的完整反向配对。')],[PT('Finish split backward tails','完成拆分反向尾部'),PT('Other steps split I and W to place remaining weight gradients into the drain. All dependencies complete before a synchronous update.','其他步骤拆分 I、W，将剩余权重梯度安排到排空阶段；同步更新前完成全部依赖。')]],
  details:[[PT('ZBV versus DualPipeV','ZBV 与 DualPipeV'),PT('Both use two V-placed chunks per rank. ZBV uses ordinary serialized F/I/W actions; DualPipeV additionally includes explicitly overlapped F/B compound actions. The ideal overlap duration in this animation is not a measured kernel time.','两者都采用每 rank 两块的 V 形布局。ZBV 使用串行 F/I/W，DualPipeV 还包含显式重叠的 F/B 复合操作；动画中的理想重叠时长不是实测内核时间。')]]
 },
 PipeDream:{
  formula:'Fⱼ uses version vⱼ; Bⱼ reuses vⱼ; updates may occur before flush',
  idea:PT('Keep the pipeline moving with stashed weight versions.','保存历史权重版本，让流水线持续推进。'),
  trade:PT('Historical asynchronous training changes optimizer semantics.','历史异步训练方案，会改变优化器语义。'),
  memory:PT('Stores weight versions in addition to saved activations.','除保存激活外，还需保存多个权重版本。'),
  limit:PT('Stale gradients; distinct from synchronous 1F1B / PipeDream-Flush.','存在陈旧梯度；不同于同步 1F1B / PipeDream-Flush。'),
  steps:[[PT('Stash the forward version','保存前向权重版本'),PT('When F starts, record that stage’s current weight version. The matching B must use the same stashed weights, even if newer updates already exist.','F 开始时记录该阶段当前权重版本；对应 B 必须复用该版本，即便已经有更新权重。')],[PT('Update without a global flush','不等全局排空就更新'),PT('U marks a local update after a microbatch backward. Later forwards can see newer weights while earlier microbatches remain in flight.','U 表示微批次反向后的本地更新。较晚前向可看到新权重，而较早微批次仍在途。')],[PT('Account for staleness','考虑梯度陈旧性'),PT('Weight stashing makes local F/B consistent; it does not restore synchronous minibatch SGD. PipeDream-2BW uses a related double-buffered, delayed-update design.','权重暂存保证本地 F/B 一致，但不能恢复同步小批次 SGD 语义。相关的 PipeDream-2BW 采用双缓冲、延迟更新设计。')]],
  details:[[PT('Read the version tags','读懂版本标签'),PT('F and B carry their matched v tag; U increments the current local version. The example updates per microbatch to expose staleness. Production asynchronous schedules also manage version retirement and consistent communication.','F、B 标注匹配的 v 版本；U 递增本地当前版本。示例按微批次更新以展示陈旧性；实际异步调度还需管理旧版本回收与一致通信。')]]
 },
 'Forward-only':{
  formula:'request batch → stage 0 → … → stage p−1',
  idea:PT('Pipeline independent forward microbatches; there is no backward.','流水处理独立前向微批次，没有反向。'),
  trade:PT('Static forward wave for independent request work.','独立请求工作的静态前向波。'),
  memory:PT('Each stage owns its layers’ weights and KV state.','各阶段持有自身层的权重和 KV 状态。'),
  limit:PT('One autoregressive request still waits for its previous token.','单个自回归请求仍需等待前一 token。'),
  steps:[[PT('Partition the model','划分模型'),PT('Each rank owns consecutive layers. Six independent request microbatches supply the forward wave in this example.','各 rank 拥有连续层；本例用六个独立请求微批次形成前向波。')],[PT('Forward activations downstream','向下游传递激活'),PT('A stage executes only after the preceding stage produces its input. Different ranks can process different microbatches concurrently.','前一阶段生成输入后，当前阶段才能执行；不同 rank 可同时处理不同微批次。')],[PT('Return each result','分别返回结果'),PT('After the last stage finishes, return logits or sample a token. There are no backward gradients or optimizer updates.','最后阶段完成后返回 logits 或采样 token；没有反向梯度或优化器更新。')]],
  details:[[PT('A wave is not an autoregressive shortcut','前向波不跳过自回归依赖'),PT('The six microbatches represent independent request work. This picture does not let one request generate six dependent tokens at once.','六个微批次表示独立请求工作，不能让单个请求一次生成六个相互依赖的 token。')]]
 },
 'Interleaved requests':{
  formula:'F(request, token+1, stage0) waits for token output at stage p−1',
  idea:PT('Use other requests while one request waits for its token result.','某请求等待 token 结果时，让其他请求填补空隙。'),
  trade:PT('Token feedback plus request-level concurrency.','token 反馈依赖，加上请求级并发。'),
  memory:PT('Independent per-request KV state on each layer-owning stage.','各层所属阶段保存独立请求 KV 状态。'),
  limit:PT('Scheduling and batching affect both throughput and token latency.','调度和批处理同时影响吞吐与 token 延迟。'),
  steps:[[PT('Admit independent requests','接纳独立请求'),PT('Requests A, B, and C enter the distributed instance with their own caches and stopping lengths.','请求 A、B、C 进入分布式实例，各有自己的缓存与停止长度。')],[PT('Interleave token paths','交错 token 路径'),PT('Each token traverses all three stages. Only after the last stage finishes may that same request start its next token at stage 0.','每个 token 都经过三个阶段；同一请求只有在最后阶段完成后，才能在阶段 0 启动下一 token。')],[PT('Retire independently','独立结束'),PT('B stops after two tokens while A and C continue. Continuous batching can admit new ready work at safe scheduling boundaries.','B 在两个 token 后停止，A、C 继续。连续批处理可在安全调度边界接纳新的就绪工作。')]],
  details:[[PT('Why multiple requests help','多请求为什么有效'),PT('The timeline explicitly enforces the last-stage-to-first-stage token dependency. Other requests provide parallel work during this wait; PP alone does not eliminate autoregressive latency.','时间线显式遵守“最后阶段到首阶段”的 token 依赖。等待期间由其他请求提供并行工作；PP 本身不会消除自回归延迟。')]]
 },
 'Chunked prefill + decode':{
  formula:'bounded prompt chunks + ready decode tokens share the pipeline',
  idea:PT('Interleave prompt chunks with ongoing decode work.','将提示词分块，与已有解码工作交错。'),
  trade:PT('Limit prompt work so long prefills do not monopolize the pipeline.','限制提示词工作量，避免长预填充独占流水线。'),
  memory:PT('Prompt chunks extend layer-local KV; decode reuses that history.','提示词块扩展各层本地 KV，解码复用历史。'),
  limit:PT('Protecting decode can delay the new prompt’s first token.','保护解码延迟，可能推迟新提示词的首 token。'),
  steps:[[PT('Keep existing decodes moving','持续推进已有解码'),PT('Requests A and B already decode. Request C contributes prompt chunks P1, P2, P3 instead of one long uninterruptible prefill.','A、B 已在解码；C 将提示词拆成 P1、P2、P3，而非一次不可打断的长预填充。')],[PT('Respect causal chunk dependencies','遵守因果分块依赖'),PT('Each layer needs the earlier prompt chunk’s KV before its next chunk. Stages may pipeline different chunks once their local dependencies are ready.','各层处理下一提示词块前，须先有前一块的 KV；本地依赖就绪后，不同阶段可流水处理不同块。')],[PT('Start C decode after prefill','预填充后启动 C 解码'),PT('C’s first decode input waits for its final prompt chunk to finish the full pipeline. Token and KV budgets still constrain admission.','C 的首个解码输入需等最后提示词块完成整个流水线；接纳仍受 token 与 KV 预算约束。')]],
  details:[[PT('P and D are both forward computation','P、D 都是前向计算'),PT('P labels a prompt chunk; D labels one decode token. The example favors ready D work, then fills gaps with P. Real serving engines tune token budgets, chunk size, batching and fairness together.','P 表示提示词块，D 表示解码 token。本例优先就绪 D，再用 P 填空；实际服务引擎会联合调节 token 预算、块大小、批处理和公平性。')]]
 }
};
const PIPELINE_SHARED=PT('Model ticks omit network delay, contention and optimizer barriers. One-chunk stages use F=2 and full B=4; two-chunk stages use F=1 and B=2. Split I=W=F. Compound F/B uses ideal max(F,B); U uses 1 tick. Different serving examples have different work. These are scheduling illustrations, not performance measurements.','模型节拍忽略网络延迟、竞争与优化器屏障。单块阶段 F=2、完整 B=4；双块阶段 F=1、B=2；拆分 I=W=F。复合 F/B 取理想 max(F,B)，U 为 1 拍。不同服务示例工作量不同。它们是调度示意，不是性能测量。');
const pipelineTopic=topics.find(t=>t.id==='pipeline-parallel');
pipelineTopic.scheduleOptions={Training:PIPELINE_TRAINING,Inference:PIPELINE_INFERENCE};
pipelineTopic.variantDetails={};
pipelineTopic.training=PT('Choose a training schedule to compare its actual operation order, activation lifetime, placement, and weight-update semantics.','选择训练调度，比较实际操作顺序、激活生命周期、布局和权重更新语义。');
pipelineTopic.inference=PT('Choose static forward waves, token paths from interleaved requests, or chunked prefill alongside decode. Every token keeps its causal dependencies.','可选静态前向波、交错请求的 token 路径，或预填充分块与解码交错；每个 token 都遵守因果依赖。');
pipelineTopic.caveat=PT('“Zero bubble” and ideal F/B overlap depend on timing, memory, communication, and optimizer coordination. A synchronous flush and asynchronous weight stashing have different optimization semantics.','“零气泡”和理想 F/B 重叠取决于时长、内存、通信及优化器协调。同步排空与异步权重暂存具有不同优化语义。');
const pipeNotation=[['r, Uideal',PT('zero-based rank index and ideal compute utilization; the GPipe formula assumes balanced stages','从零开始的 rank 索引与理想计算利用率；GPipe 公式假设阶段均衡')],['p, m, v',PT('physical ranks, microbatches, and virtual chunks per rank; the example uses p=3 and m=6 unless request/token labels are shown','物理 rank 数、微批次数、每 rank 虚拟块数；除请求 / token 示例外，此处 p=3、m=6')],['C, R',PT('logical model chunk and physical rank; the mapping strip shows ownership','逻辑模型块与物理 rank；映射条显示归属')],['F, B',PT('forward and full backward; the number identifies the microbatch','前向与完整反向；数字标识微批次')],['I, W, U',PT('input-gradient backward, weight-gradient backward, and optimizer update','输入梯度反向、权重梯度反向、优化器更新')],['vₖ, P, D',PT('stashed weight version, prompt-chunk forward, and decode-token forward','暂存权重版本、提示词块前向、解码 token 前向')],['tick, records',PT('abstract model time and saved chunk/microbatch activation records; records are not bytes','抽象模型时间与保存的“块 / 微批次”激活记录；记录数不是字节数')]];
for(const name of [...PIPELINE_TRAINING,...PIPELINE_INFERENCE]){
 const c=PIPELINE_COPY[name],mode=PIPELINE_TRAINING.includes(name)?'Training':'Inference',names=pipelineTopic.scheduleOptions[mode];
 pipelineTopic.variantDetails[name]={formula:c.formula,cost:c.trade,costNote:c.limit,steps:c.steps,notation:mode==='Training'?pipeNotation:[pipeNotation[1],pipeNotation[2],['A / B / C',PT('independent requests; each token number follows that request’s own sequence','独立请求；token 编号按各请求自己的序列递增')],['F, P, D',PT('independent forward microbatch, prompt-chunk forward, decode-token forward; all are forward computations','独立前向微批次、提示词块前向、解码 token 前向；它们都是前向计算')],['tick',PT('abstract model time; prompt/decode durations are illustrative, not measured','抽象模型时间；提示词 / 解码时长仅为示意，不是实测')]],details:[...c.details,[PT('Read this selected trace','读懂所选时间线'),PT(c.memory+' '+PIPELINE_SHARED,ZH[c.memory]+' '+ZH[PIPELINE_SHARED])]],comparisons:{headers:[PT('Schedule','调度'),PT('Core ordering','核心顺序'),PT('Memory / state','内存 / 状态'),PT('Main caveat','主要取舍')],rows:names.map(n=>[n,PIPELINE_COPY[n].idea,PIPELINE_COPY[n].memory,PIPELINE_COPY[n].limit])}};
}
Object.assign(SOURCES,{pipeSchedules:['PyTorch pipeline schedules','https://docs.pytorch.org/docs/stable/distributed.pipelining.html#pipeline-schedules'],pipeInterleave:['Megatron interleaved pipeline','https://arxiv.org/abs/2104.04473'],pipeZero:['Zero Bubble / ZBV','https://arxiv.org/abs/2401.10241'],pipeDual:['DualPipe / DualPipeV','https://github.com/deepseek-ai/DualPipe'],pipeDream:['PipeDream weight stashing','https://www.microsoft.com/en-us/research/publication/pipedream-generalized-pipeline-parallelism-for-dnn-training/']});
pipelineTopic.sources=['pp','pipeSchedules','pipeInterleave','pipeZero','pipeDual','pipeDream'];
PT('PyTorch pipeline schedules','PyTorch 流水线调度');PT('Megatron interleaved pipeline','Megatron 交错流水线');PT('PipeDream weight stashing','PipeDream 权重暂存');
PT('SCHEDULE','调度');PT('Pipeline schedule','流水线调度');PT('LAYER PATH','层路径');PT('MODEL TIME','模型时间');PT('OVERVIEW','全局概览');PT('F forward · B backward · I input grad · W weight grad · U update','F 前向 · B 反向 · I 输入梯度 · W 权重梯度 · U 更新');
PT('Dashed: backward · hatched: W · paired bands: ideal F/B overlap','虚线：反向 · 斜纹：W · 上下半条：理想 F/B 重叠');
PT('Microbatch color · C = chunk · R = rank','颜色表示微批次 · C = 模型块 · R = rank');
PT('A/B streams flow in opposite directions','A / B 流沿相反方向流动');
function pipelineFrames(option,mode){
 const name=pipelineTopic.scheduleOptions[mode].includes(option)?option:pipelineTopic.scheduleOptions[mode][0],plan=PIPELINE_PLANS[name],copy=PIPELINE_COPY[name];
 const startTitle=PT('Inspect placement and operation dependencies','查看布局与操作依赖'),doneTitle=PT('Finish the selected schedule','所选调度完成');
 return Array.from({length:plan.total+1},(_,tick)=>{
  let title,text;if(!tick){title=startTitle;text=PT(copy.idea+' '+copy.memory,ZH[copy.idea]+' '+ZH[copy.memory]);}
  else if(tick===plan.total){title=doneTitle;text=PT(copy.limit+' '+copy.steps[2][1],ZH[copy.limit]+' '+ZH[copy.steps[2][1]]);}
  else{
   title=PT(name+' · model tick '+tick,(ZH[name]||name)+' · 模型第 '+tick+' 拍');
   const actions=plan.events.filter(e=>e.start<tick&&e.end>=tick).map(e=>`R${e.rank}: ${pipelineEventLabel(e,name)} C${e.stage}`);
   text=PT('Active work: '+actions.join('; ')+'. Completed dependencies unlock the next operations.','当前工作：'+actions.join('；')+'。依赖完成后，才能启动后续操作。');
  }
  return {kind:'pipeline-schedule',title,text,stage:tick,tick,mode,variant:name,plan};
 });
}
function pipelineEventLabel(e,name){
 if(e.request!==undefined)return e.phase+String.fromCharCode(65+e.request)+(e.token+1);
 return e.kind+(name==='DualPipe'?(e.stream?'B':'A'):'')+(e.mb+1);
}
function pipelineMetadata(f){const p=f.plan;return PT(`${p.ranks} RANKS · ${f.mode==='Inference'&&f.variant!=='Forward-only'?'REQUEST / TOKEN PATHS':p.microbatches+' MICROBATCHES'} · ${p.local} CHUNKS/RANK`,`${p.ranks} 个 RANK · ${f.mode==='Inference'&&f.variant!=='Forward-only'?'请求 / TOKEN 路径':p.microbatches+' 个微批次'} · 每 RANK ${p.local} 块`);}
function renderPipeline(f){
 const p=f.plan,tick=f.tick,windowSize=12,first=Math.min(Math.floor(Math.max(0,tick-1)/windowSize)*windowSize,Math.floor((p.total-1)/windowSize)*windowSize),count=Math.min(windowSize,p.total-first),x0=87,cw=51,y0=112,row=57;let s='';
 s+=label(360,23,f.variant);
 s+=textSVG(22,56,'LAYER PATH','class="diagram-label" style="font-size:8px"');
 if(f.variant==='DualPipe')s+=textSVG(390,56,'A: R0 → R1 → R2     B: R2 → R1 → R0','text-anchor="middle" class="mono" style="font-size:11px"');
 else for(let c=0;c<p.ranks*p.local;c++){
  const n=p.ranks*p.local,w=n===6?78:135,gap=n===6?12:35,x=112+c*(w+gap),r=p.style==='v'?Math.min(c,p.ranks*p.local-1-c):c%p.ranks;
  s+=rectSVG(x,38,w,29,'#fff','class="node-shell"')+textSVG(x+w/2,57,`C${c} → R${r}`,'text-anchor="middle" class="mono" style="font-size:10px"');
 }
 s+=textSVG(22,94,'MODEL TIME','class="diagram-label" style="font-size:8px"');
 for(let c=0;c<count;c++)s+=textSVG(x0+c*cw+cw/2,94,first+c+1,'text-anchor="middle" class="mono" style="font-size:9px"');
 for(let r=0;r<p.ranks;r++){
  const y=y0+r*row;s+=textSVG(69,y+21,'RANK '+r,'text-anchor="end" class="mono" style="font-size:10px"');
  const saved=p.events.filter(e=>e.rank===r&&e.kind==='F'&&e.start<tick&&!p.events.some(b=>['B','W'].includes(b.kind)&&b.stage===e.stage&&b.mb===e.mb&&b.stream===e.stream&&b.end<=tick)).length;
  if(f.mode==='Training')s+=textSVG(69,y+36,PT('saved '+saved,'保存 '+saved),'text-anchor="end" class="subtext" style="font-size:8px"');
  for(let c=0;c<count;c++)s+=rectSVG(x0+c*cw,y,cw-3,43,'#f0f3e9','class="pipeline-slot"');
 }
 for(const e of p.events){
  if(e.end<=first||e.start>=first+count)continue;
  const a=Math.max(e.start,first),b=Math.min(e.end,first+count),x=x0+(a-first)*cw,y=y0+e.rank*row+(e.overlap&&e.kind!=='F'?22:0),w=(b-a)*cw-3,h=e.overlap?19:43,active=e.start<tick&&e.end>=tick,opacity=active?1:e.end<tick?.76:.15;
  const colors=[...PALETTE,'#d2e8ed','#e7dfc9'],color=colors[(e.request??(f.variant==='DualPipe'?e.mb+e.stream*3:e.mb))%6];
  s+=`<g class="pipeline-operation" data-id="${esc(e.id)}" data-start="${e.start}" data-end="${e.end}" opacity="${opacity}">`+rectSVG(x,y,w,h,color,`class="pipeline-task ${e.kind==='B'||e.kind==='I'?'pipeline-backward':''}" ${active?'stroke="#536c8b" stroke-width="2"':''}`);
  if(e.kind==='W')s+=rectSVG(x,y,w,h,'url(#pipeline-hatch)','class="weight-hatch"');
  let label=pipelineEventLabel(e,f.variant);if(!e.overlap)label+=' C'+e.stage;
  if(f.variant==='PipeDream')label+=' v'+e.version;
  s+=textSVG(x+w/2,y+(e.overlap?13:25),label,'text-anchor="middle" class="mono on-data" style="font-size:9px"')+'</g>';
 }
 const cursor=x0+(Math.min(Math.max(tick-first,0),count))*cw-1;
 if(tick)s+=`<path d="M ${cursor} 103 V 280" class="pipeline-cursor" stroke="#536c8b" stroke-width="1.2" stroke-dasharray="3 3"/>`;
 s+=textSVG(360,306,PT(`Window ${first+1}–${first+count} / ${p.total} model ticks`,`窗口 ${first+1}–${first+count} / 共 ${p.total} 模型拍`),'text-anchor="middle" class="subtext" style="font-size:10px"');
 s+=textSVG(22,333,'OVERVIEW','class="diagram-label" style="font-size:8px"');
 for(const e of p.events){const xx=x0+e.start*612/p.total,yy=320+e.rank*8+(e.overlap&&e.kind!=='F'?3:0);s+=rectSVG(xx,yy,Math.max(2,(e.end-e.start)*612/p.total-1),e.overlap?3:6,e.end<=tick?'#9ba8b7':'#d5dce3','class="pipeline-overview"');}
 s+=`<rect x="${x0+first*612/p.total}" y="317" width="${count*612/p.total}" height="28" fill="none" class="pipeline-window" stroke="#7b8b9e" stroke-width="1"/>`;
 s+=textSVG(360,370,f.mode==='Training'?'F forward · B backward · I input grad · W weight grad · U update':f.variant==='Forward-only'?PT('F forward · number = independent microbatch','F 前向 · 数字 = 独立微批次'):PT('A / B / C = requests · number = token or prompt chunk','A / B / C = 请求 · 数字 = token 或提示词块'),'text-anchor="middle" class="subtext" style="font-size:9px"');
 s+=textSVG(360,390,f.mode==='Training'?'Dashed: backward · hatched: W · paired bands: ideal F/B overlap':PT('P = prompt-chunk forward · D = decode forward · token feedback is required','P = 提示词块前向 · D = 解码前向 · 必须遵守 token 反馈依赖'),'text-anchor="middle" class="subtext" style="font-size:8px"');
 return s;
}
function pipelineSVG(f){return `<svg class="scene concept-scene pipeline-scene" viewBox="0 0 720 410" role="img" aria-labelledby="scene-title scene-desc" xmlns="http://www.w3.org/2000/svg"><title id="scene-title">${esc(f.title)}</title><desc id="scene-desc">${esc(f.text)}</desc><defs><pattern id="pipeline-hatch" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M-1 1L1-1M0 5L5 0M4 6L6 4" stroke="#566675" stroke-width=".6" opacity=".5"/></pattern></defs>${renderPipeline(f)}</svg>`;}

// Keep descriptive equation text bilingual, while preserving conventional math symbols.
PT('Uideal = m / (m + p − 1)','Uideal = m / (m + p − 1)');
PT('warmupᵣ = min(p − r − 1, m); then (F, B)','预热次数ᵣ = min(p − r − 1, m)；随后交替 (F, B)');
PT('logical stages = p × v; v = 2 chunks / rank','逻辑阶段数 = p × v；v = 每 rank 2 块');
PT('rank r owns Cᵣ and Cᵣ₊ₚ; process microbatches breadth-first','rank r 持有 Cᵣ 与 Cᵣ₊ₚ；按广度优先处理微批次');
PT('B = I + W; send dX after I, defer W','B = I + W；I 后发送 dX，推迟 W');
PT('B = I + W; larger pending-activation budget','B = I + W；增大待处理激活预算');
PT('C0→C1→C2→C3→C4→C5 maps to R0→R1→R2→R2→R1→R0','C0→C1→C2→C3→C4→C5 映射为 R0→R1→R2→R2→R1→R0');
PT('two directions + custom overlapped F/B execution','双向工作 + 定制 F/B 重叠执行');
PT('V-shaped placement + overlapped (F,B) compound actions','V 形布局 + 重叠 (F,B) 复合操作');
PT('Fⱼ uses version vⱼ; Bⱼ reuses vⱼ; updates may occur before flush','Fⱼ 使用版本 vⱼ；Bⱼ 复用 vⱼ；排空前即可更新');
PT('request batch → stage 0 → … → stage p−1','请求批次 → 阶段 0 → … → 阶段 p−1');
PT('F(request, token+1, stage0) waits for token output at stage p−1','F(请求, token+1, 阶段0) 等待阶段 p−1 的 token 输出');
PT('bounded prompt chunks + ready decode tokens share the pipeline','有限大小的提示词块 + 就绪解码 token 共享流水线');
PT('tick, records','节拍，记录数');

PT('tick','节拍');
