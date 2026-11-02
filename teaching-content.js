/* Bilingual input/action/result contracts and conceptual self-checks. */
Object.assign(ZH,{
  "Different workers contribute to one shared answer.": "不同工作进程共同计算同一个答案。",
  "Rank r holds (r+1) × [1,2,3,4], with r = 0,1,2,3.": "rank r 持有 (r+1) × [1,2,3,4]，r = 0、1、2、3。",
  "Add corresponding positions across ranks.": "跨 rank 对相同位置求和。",
  "Every rank has [10,20,30,40].": "每个 rank 均得到 [10,20,30,40]。",
  "Would concatenating the four input vectors implement AllReduce SUM?": "拼接四个输入向量是否实现 AllReduce SUM？",
  "No: matching positions must be added.": "否：必须对相同位置相加。",
  "Yes: it collects all inputs.": "是：它收集了所有输入。",
  "AllReduce preserves tensor shape and reduces each position. AllGather concatenates contributions instead.": "AllReduce 保持张量形状并逐位置归约；AllGather 则拼接各份贡献。",
  "Each worker needs a complete tensor that is currently sharded.": "每个进程都需要当前被分片的完整张量。",
  "Ranks own A, B, C and D respectively.": "各 rank 分别持有 A、B、C、D。",
  "Copy shards and concatenate in rank order.": "复制分片并按 rank 顺序拼接。",
  "Every rank owns [A,B,C,D].": "每个 rank 都持有 [A,B,C,D]。",
  "Are A, B, C and D added together?": "A、B、C、D 是否相加？",
  "No: they remain separate tensor positions.": "否：它们仍为不同张量位置。",
  "Yes: all collectives sum their inputs.": "是：所有集合通信都会对输入求和。",
  "AllGather copies values. The global tensor has P times the per-rank input size for equal shards.": "AllGather 复制数值；等分片时，完整张量大小为单 rank 输入的 P 倍。",
  "We need the global reduction, but each worker only needs a slice.": "需要全局归约，但每个进程只需要其中一片。",
  "Every rank contributes to all four positions.": "每个 rank 均对四个位置贡献数值。",
  "Sum globally, then divide the result into slices.": "全局求和，再将结果划分为片段。",
  "Ranks own [10], [20], [30], [40].": "各 rank 持有 [10]、[20]、[30]、[40]。",
  "Does every rank receive the entire reduced tensor?": "是否每个 rank 都收到完整归约张量？",
  "No: each receives its reduced slice.": "否：每个 rank 只收到自己的归约片段。",
  "Yes: scatter copies the full tensor.": "是：scatter 复制完整张量。",
  "The slices collectively form the global sum. AllReduce can be built from ReduceScatter followed by AllGather.": "各片段合起来构成全局和；ReduceScatter 后接 AllGather 可实现 AllReduce。",
  "One worker has information everybody else needs.": "一个进程持有所有其他进程需要的信息。",
  "Only root rank 0 supplies [A,B,C,D].": "只有根 rank 0 提供 [A,B,C,D]。",
  "Copy the root tensor to the group.": "将根张量复制到通信组。",
  "All ranks have the same root values.": "所有 rank 得到相同的根输入数值。",
  "Do non-root input values affect the answer?": "非根进程的输入数值是否影响结果？",
  "No: the root is the sole source.": "否：根进程是唯一来源。",
  "Yes: values are averaged across ranks.": "是：会跨 rank 对数值求平均。",
  "Broadcast has one input source and many recipients. It does not reduce contributions.": "Broadcast 有一个输入来源及多个接收者，不归约多方贡献。",
  "One designated worker needs the combined answer.": "一个指定进程需要组合后的答案。",
  "All ranks contribute matching tensor positions.": "全部 rank 对相同张量位置贡献数值。",
  "Apply a reduction and deliver it to the root.": "进行归约，并将结果交给根进程。",
  "Only root has a defined reduced output.": "只有根进程有已定义的归约输出。",
  "Can another rank use its buffer as the reduced result?": "其他 rank 能否把自身缓冲当作归约结果？",
  "No: only the root output is defined.": "不能：只有根输出有定义。",
  "Yes: Reduce is the same as AllReduce.": "能：Reduce 与 AllReduce 相同。",
  "AllReduce defines the result everywhere; Reduce defines it only at the designated root.": "AllReduce 在所有 rank 定义结果，Reduce 则只在指定根 rank 定义结果。",
  "A root holds a batch that should be divided among workers.": "根进程持有应分给各进程的批次。",
  "Root has [A,B,C,D].": "根持有 [A,B,C,D]。",
  "Send a different slice to each rank.": "给每个 rank 发送不同片段。",
  "Each rank owns one assigned slice.": "每个 rank 持有其分配的片段。",
  "Is Scatter a reduction?": "Scatter 是否为归约？",
  "No: it partitions and copies.": "否：它只划分并复制。",
  "Yes: it sums before splitting.": "是：它先求和再拆分。",
  "There is a single input source. ReduceScatter adds contributions from every rank before distributing slices.": "只有一个输入来源；ReduceScatter 则先把所有 rank 的贡献相加，再分发片段。",
  "A root needs a tensor assembled from worker-owned slices.": "根需要由各进程持有的片段拼成张量。",
  "Ranks hold distinct pieces A, B, C, D.": "各 rank 持有不同片段 A、B、C、D。",
  "Copy pieces into source-rank order at root.": "在根按源 rank 顺序复制片段。",
  "Root owns [A,B,C,D]; other outputs are undefined.": "根持有 [A,B,C,D]；其他输出未定义。",
  "Does Gather add values from different ranks?": "Gather 是否将不同 rank 的数值相加？",
  "No: it concatenates them.": "否：它将数值拼接。",
  "Yes: the root receives their sum.": "是：根收到它们的和。",
  "Gather collects distinct positions. Reduce combines contributions to matching positions.": "Gather 收集不同位置；Reduce 则组合对相同位置的贡献。",
  "Data must move from its current owner to its destination owner.": "数据需要从当前所有者转移到目标所有者。",
  "Each source has one bucket for every destination.": "每个源都有面向各个目的地的桶。",
  "Route bucket (source,destination) to destination.": "将 (源,目标) 桶路由到目标。",
  "Each destination has a bucket from every source.": "每个目标都得到来自各源的桶。",
  "Does a destination receive each source’s complete tensor?": "一个目标是否接收每个源的完整张量？",
  "No: only the bucket addressed to it.": "否：只收到发给自己的桶。",
  "Yes: every input is fully replicated.": "是：每个输入都完整复制。",
  "AllToAll transposes ownership. AllToAllv additionally allows different bucket sizes; peer send/receive counts must agree.": "AllToAll 转置数据所有权；AllToAllv 还允许不同桶大小，对端收发计数必须匹配。",
  "Two endpoints need an explicitly matched transfer.": "两个端点需要显式匹配的传输。",
  "Rank 0 has a buffer; rank 2 will receive it.": "rank 0 持有缓冲；rank 2 将接收它。",
  "Match source, destination, count and datatype.": "匹配源、目标、计数及数据类型。",
  "Rank 2 receives a copy; others do not participate.": "rank 2 收到副本；其他 rank 不参与。",
  "Must all ranks call Send/Recv for this one transfer?": "此次传输是否要求全部 rank 都调用 Send/Recv？",
  "No: only the matching endpoints.": "否：只需匹配的两个端点。",
  "Yes: it is a collective barrier.": "是：这是集合屏障。",
  "Explicit point-to-point transfers need compatible ordering and buffer lifetimes. They do not imply group-wide synchronization.": "显式点对点传输需要兼容的顺序与缓冲生命周期，不意味着全组同步。",
  "A phase cannot finish until every participant has arrived.": "只有全部参与者到达，一个阶段才能完成。",
  "Some ranks arrived; others are still working.": "部分 rank 已到达，其他还在工作。",
  "Wait until all ranks enter this barrier.": "等待全部 rank 进入本次屏障。",
  "Every participant may then complete.": "此后每个参与者都可以完成。",
  "Does Barrier make all ranks exit at the same physical instant?": "Barrier 是否使全部 rank 在同一物理时刻退出？",
  "No: it guarantees participation before completion.": "否：只保证完成前全部参与。",
  "Yes: exits are exactly simultaneous.": "是：退出完全同时。",
  "A barrier is a synchronization contract, not a tensor reduction or a synchronized physical clock.": "屏障是同步约定，不是张量归约，也不是物理时钟同步。",
  "Each worker needs a reduction of only the preceding ranks and itself.": "每个进程只需之前各 rank 与自身的归约。",
  "Rank-ordered inputs are 1,2,3,4.": "按 rank 顺序，输入为 1、2、3、4。",
  "Accumulate the ordered inclusive prefix.": "累积按序的包含自身前缀。",
  "Outputs are 1,3,6,10 respectively.": "各输出依次为 1、3、6、10。",
  "Does rank 1 include rank 3’s input?": "rank 1 是否包含 rank 3 的输入？",
  "No: its prefix is ranks 0 through 1.": "否：其前缀只包括 rank 0 到 1。",
  "Yes: every rank gets the global sum.": "是：每个 rank 得到全局和。",
  "Inclusive Scan includes the current rank; Exscan excludes it and has a different first-rank output contract.": "包含自身的 Scan 计入当前 rank；Exscan 不计入，并有不同的首 rank 输出约定。",
  "More examples should train the same model in less wall-clock time.": "让更多样本共同训练同一模型，缩短耗时。",
  "Each rank has full weights and a different local batch.": "每个 rank 持有完整权重及不同本地批次。",
  "Compute local gradients, then synchronize the global update.": "计算本地梯度，再同步全局更新。",
  "Replicas retain matching weights after the same update.": "副本执行相同更新后仍保持权重一致。",
  "Does data parallelism alone reduce parameter memory per rank?": "仅数据并行是否减少每个 rank 的参数内存？",
  "No: weights are replicated.": "否：权重被复制。",
  "Yes: each rank stores different layers.": "是：各 rank 保存不同层。",
  "Data parallelism splits examples. FSDP/ZeRO add state sharding; pipeline parallelism splits layers.": "数据并行划分样本；FSDP/ZeRO 另加入状态分片，流水线并行则划分层。",
  "One layer is too large or too slow for one accelerator.": "一层对一个加速器来说太大或太慢。",
  "A matrix product XW is divided across devices.": "矩阵乘法 XW 被分到多个设备。",
  "Shard weight rows or columns and match the activation layout.": "划分权重的行或列，并匹配激活布局。",
  "Local products combine into exactly the original XW.": "本地乘积组合成与原 XW 相同的结果。",
  "For row-parallel W, should partial outputs be concatenated?": "W 行并行时，是否应拼接部分输出？",
  "No: they contribute to the same output positions and must sum.": "否：它们贡献给相同输出位置，必须求和。",
  "Yes: every rank computes different output features.": "是：各 rank 计算不同输出特征。",
  "Row shards split the contracted dimension: XW=Σ XᵢWᵢ. Column shards compute different output features, which concatenate.": "行分片拆分收缩维度：XW=Σ XᵢWᵢ。列分片计算不同输出特征，因此应拼接。",
  "A deep model can be divided along its layer stack.": "深模型可沿层堆栈划分。",
  "Each GPU owns consecutive layers; a batch becomes microbatches.": "每个 GPU 持有连续层；批次划分为微批次。",
  "Move activations forward and gradients backward according to a schedule.": "按调度向前传激活、向后传梯度。",
  "Different microbatches overlap across stages.": "不同微批次在各阶段重叠执行。",
  "Does changing the schedule move every layer onto every GPU?": "改变调度是否会把每层都放到每个 GPU？",
  "No: placement and execution order are separate choices.": "否：放置与执行顺序是不同选择。",
  "Yes: scheduling replicates all weights.": "是：调度会复制全部权重。",
  "The timeline controls when a stage runs F, input-gradient B or weight-gradient W. Weight placement is shown separately.": "时间线决定阶段何时执行 F、输入梯度 B 或权重梯度 W；权重放置另行展示。",
  "Tokenwise operations do not need every token activation on every TP rank.": "逐 token 运算不需要每个 TP rank 都持有全部 token 激活。",
  "An activation has token rows and hidden-feature columns.": "激活具有 token 行与隐藏特征列。",
  "Keep different token rows around local norm/residual work.": "在本地归一化 / 残差运算周围保留不同 token 行。",
  "Gather or ReduceScatter at the relevant TP boundaries.": "在相应 TP 边界执行收集或归约分片。",
  "Does this automatically shard the entire attention history?": "这样是否自动把全部注意力历史分片？",
  "No: context/KV sharding is a separate layout.": "否：上下文 / KV 分片是另一种布局。",
  "Yes: no attention collectives are needed.": "是：不再需要注意力通信。",
  "This SP example shards tokenwise activations. Context parallelism controls how attention reaches global K/V.": "此 SP 示例划分逐 token 激活；上下文并行决定注意力如何访问全局 K/V。",
  "Long attention contexts make activations and KV history expensive.": "长注意力上下文使激活与 KV 历史开销很大。",
  "Each rank owns local query positions and a KV block.": "每个 rank 持有本地查询位置及一个 KV 块。",
  "Bring every valid KV contribution to each local query.": "让每个本地查询获得全部有效 KV 的贡献。",
  "Local outputs match full-context masked attention.": "本地输出匹配全上下文掩码注意力。",
  "Can independently normalized block outputs simply be averaged?": "独立归一化的各块输出是否能直接平均？",
  "No: merge maxima and exponential sums for one softmax.": "否：需合并最大值与指数和，形成统一 softmax。",
  "Yes: every block has the same number of tokens.": "是：每块 token 数相同。",
  "Each query needs one normalization over all visible keys. Online softmax rescales old accumulators when the maximum changes.": "每个查询需要覆盖全部可见键的统一归一化；在线 softmax 在最大值变化时重缩放旧累积量。",
  "Many experts can be stored without running all of them per token.": "保存许多专家，而无需每个 token 都执行全部专家。",
  "Expert weights live on different ranks.": "专家权重位于不同 rank。",
  "Route token copies to selected experts, then return their outputs.": "将 token 副本路由至选中专家，再返回输出。",
  "Restore token order and combine with router weights.": "恢复 token 顺序，并按路由权重组合。",
  "Does active parameter count equal total weight storage?": "激活参数量是否等于总权重存储量？",
  "No: unselected experts still have stored weights.": "否：未选中专家仍需保存权重。",
  "Yes: unused experts can be ignored in memory planning.": "是：内存规划可以忽略未使用专家。",
  "Routing sparsifies computation. Weight placement, dispatch/return traffic and expert imbalance remain real costs.": "路由使计算稀疏，但权重放置、分发 / 返回流量与专家负载不均衡仍有开销。",
  "Large systems need several independent ways of splitting work.": "大系统需要多种互相独立的工作划分方式。",
  "Example: 2 data replicas × 2 pipeline stages × 2 tensor shards.": "示例：2 数据副本 × 2 流水线阶段 × 2 张量分片。",
  "Build a different process group along each coordinate axis.": "沿各坐标轴建立不同通信组。",
  "Eight ranks cooperate within their matching DP, PP and TP groups.": "八个 rank 在各自匹配的 DP、PP、TP 组内协作。",
  "Is there one AllReduce group containing all eight ranks for every layer?": "每层是否都使用包含全部八个 rank 的同一个 AllReduce 组？",
  "No: each parallel axis has its own groups.": "否：每个并行轴有自己的组。",
  "Yes: all ranks do the same tensor shard.": "是：所有 rank 都计算同一张量分片。",
  "TP combines same-stage tensor shards; PP connects stages; DP synchronizes corresponding model shards across replicas.": "TP 组合相同阶段的张量分片，PP 连接阶段，DP 同步不同副本的对应模型分片。",
  "Independent requests can run on independent model instances.": "独立请求可在独立模型实例上执行。",
  "Each instance can hold and run a complete model.": "每个实例能持有并执行完整模型。",
  "Route requests by load, capacity and cache locality.": "根据负载、容量及缓存局部性路由请求。",
  "Instances generate and stream responses independently.": "各实例独立生成并流式返回响应。",
  "Must replicas synchronize gradients after each generated token?": "每生成一个 token，副本是否必须同步梯度？",
  "No: inference has no training gradient update.": "否：推理不执行训练梯度更新。",
  "Yes: it keeps generated text identical.": "是：这样保证生成文本相同。",
  "Serving replicas process different requests. A single instance may still use TP/PP internally.": "服务副本处理不同请求；单个实例内部仍可使用 TP/PP。",
  "Prompt processing and iterative decoding stress different resources.": "提示处理与迭代解码对资源的压力不同。",
  "One pool computes prompt states; another serves token steps.": "一个池计算提示状态，另一个池执行 token 步。",
  "Transfer prompt KV and request state between the pools.": "在两池间传输提示 KV 与请求状态。",
  "Decode reuses the transferred history and appends new state.": "解码复用转移的历史，并追加新状态。",
  "Can decode begin with an empty KV cache after prefill elsewhere?": "在别处预填充后，解码能否从空 KV 缓存开始？",
  "No: it needs the prompt history or must recompute it.": "否：需要提示历史，否则必须重算。",
  "Yes: model weights contain request history.": "是：模型权重包含请求历史。",
  "KV is request-specific intermediate state, separate from shared model weights. Handoff cost and layout conversion affect latency.": "KV 是请求特定中间状态，与共享模型权重不同；交接成本及布局转换影响延迟。",
  "Replicated model states waste memory as the model grows.": "模型增长时，复制模型状态消耗大量内存。",
  "Each rank persistently owns only a state shard.": "每个 rank 常驻只持有状态的一片。",
  "Gather module weights when needed; reshard after use.": "需要时收集模块权重，用后重新分片。",
  "ReduceScatter gradients to owners for the update.": "将梯度归约分片给所有者以执行更新。",
  "Is peak memory just the persistent local shard?": "峰值内存是否就是常驻本地分片？",
  "No: gathered weights, activations and buffers also count.": "否：还需计入收集的权重、激活与缓冲。",
  "Yes: every tensor stays sharded at every instant.": "是：所有张量始终都分片。",
  "FSDP trades communication and temporary materialization for lower persistent state memory.": "FSDP 以通信及临时实体化开销换取更低的常驻状态内存。",
  "Optimizer, gradients and weights can have different owners.": "优化器、梯度与权重可以采用不同所有权布局。",
  "Unsharded DP replicates parameters, gradients and optimizer states.": "未分片的 DP 复制参数、梯度及优化器状态。",
  "Stage 1 shards optimizer; stage 2 adds gradients; stage 3 adds weights.": "阶段 1 分片优化器，阶段 2 加入梯度，阶段 3 加入权重。",
  "Higher stages save more persistent memory and require more exchange.": "更高阶段节省更多常驻内存，也需要更多交换。",
  "Does ZeRO-1 shard model parameters?": "ZeRO-1 是否分片模型参数？",
  "No: it partitions optimizer states.": "否：它划分优化器状态。",
  "Yes: parameters are the first state to shard.": "是：参数是最先分片的状态。",
  "The sequence is optimizer → gradients → parameters. A stage number names what persists sharded, not peak memory.": "顺序为优化器 → 梯度 → 参数；阶段编号说明常驻分片对象，不代表峰值内存。",
  "A desired effective batch may not fit in one microbatch.": "所需有效批次可能无法放入一个微批次。",
  "Gradient buffers start at zero once per accumulation window.": "每个累积窗口开始时只清零一次梯度缓冲。",
  "Add scaled microbatch gradients without stepping the optimizer.": "累加缩放后的微批次梯度，不执行优化器更新。",
  "Synchronize as needed and update once for the whole window.": "按需同步，并对整个窗口只更新一次。",
  "Should the optimizer step after every microbatch?": "是否应在每个微批次后执行优化器更新？",
  "No: that changes the update being modeled.": "否：这样会改变这里建模的更新。",
  "Yes: accumulation only saves activations.": "是：累积只节省激活内存。",
  "Accumulation sums gradients at fixed weights within the window. Loss scaling, global batch size and synchronization must agree.": "累积窗口内在固定权重处求梯度和；损失缩放、全局批次及同步方式必须匹配。",
  "Backward needs intermediate activations that occupy memory.": "反向需要占用内存的中间激活。",
  "Ordinary training retains many forward intermediates.": "普通训练保存许多前向中间值。",
  "Save selected boundaries and recompute missing values in backward.": "保存选定边界，并在反向重算缺失值。",
  "Use less activation memory in exchange for extra computation.": "用额外计算换取更少激活内存。",
  "Are parameter weights discarded and learned again?": "是否丢弃参数权重并重新学习？",
  "No: forward intermediates are recomputed with the same weights.": "否：用相同权重重算前向中间值。",
  "Yes: checkpointing removes the model parameters.": "是：检查点会移除模型参数。",
  "Activation checkpointing is not saving a training checkpoint to disk. Randomness and stateful operations must replay correctly.": "激活检查点并非将训练检查点保存到磁盘；随机性与有状态运算必须正确重放。",
  "Some communication can progress while independent computation continues.": "独立计算继续执行时，部分通信也可推进。",
  "A producer makes a buffer ready before its consumer needs it.": "生产者在消费者需要前准备好缓冲。",
  "Launch transfer early, compute independent work, then wait at dependency.": "尽早启动传输，执行独立计算，再在依赖处等待。",
  "Hide only the portion that actually overlaps useful work.": "只隐藏实际与有效工作重叠的那部分耗时。",
  "Can a consumer read an in-flight receive buffer immediately?": "消费者能否立即读取仍在接收中的缓冲？",
  "No: it must wait for the transfer dependency.": "否：必须等待传输依赖满足。",
  "Yes: asynchronous means already finished.": "是：异步意味着已经完成。",
  "Asynchronous launch is not completion. Correct events, streams and buffer lifetimes are essential.": "异步启动不代表完成；正确的事件、流及缓冲生命周期不可缺少。",
  "Requests finish at different times during generation.": "生成请求在不同时间完成。",
  "A decode batch contains active requests with independent states.": "解码批次包含具有独立状态的活动请求。",
  "Remove completed requests and admit new work between iterations.": "在迭代间移除完成请求，并接纳新工作。",
  "Keep accelerator capacity useful without waiting for a whole batch.": "无需等待整个批次结束，即可持续利用加速器容量。",
  "Does a new request need to wait for every old request to finish?": "新请求是否必须等待所有旧请求完成？",
  "No: the scheduler can refill between iterations.": "否：调度器可在迭代间补入。",
  "Yes: batches are fixed for an entire generation.": "是：整个生成期间批次都固定。",
  "Each request still has causal token dependencies and its own KV state. Scheduling changes membership, not those dependencies.": "每个请求仍有因果 token 依赖及独立 KV 状态；调度改变成员关系，不改变这些依赖。",
  "Repeated decode should not recompute past keys and values.": "重复解码不应重算过去的键和值。",
  "The prompt creates per-layer K/V for each request.": "提示为每个请求创建逐层 K/V。",
  "Append the new token’s K/V and read the visible history.": "追加新 token 的 K/V，并读取可见历史。",
  "Save old projections while history storage grows.": "节省旧投影计算，但历史存储持续增长。",
  "Does KV caching remove the need to attend historical keys?": "KV 缓存是否消除了关注历史键的需要？",
  "No: full attention still reads the historical cache.": "否：完整注意力仍需读取历史缓存。",
  "Yes: only the newest token is ever used.": "是：始终只使用最新 token。",
  "Caching saves recomputation. Paging changes allocation and address mapping; it does not remove logical attention history.": "缓存节省重算；分页改变分配与地址映射，不会移除逻辑注意力历史。",
  "Gradient synchronization can be limited by communication volume.": "梯度同步可能受通信量限制。",
  "Workers hold full-precision local gradients.": "各进程持有全精度本地梯度。",
  "Encode smaller messages and reconstruct an approximate aggregate.": "编码为更小消息，并重构近似聚合。",
  "Reduce bytes while managing approximation and residual error.": "减少字节量，同时管理近似与残差误差。",
  "Is compressed synchronization always mathematically identical?": "压缩同步是否总在数学上完全相同？",
  "No: lossy encodings change values unless corrected exactly.": "否：有损编码会改变数值，除非精确修正。",
  "Yes: fewer bits never affect a gradient.": "是：更少位数不会影响梯度。",
  "Quantization, sparsification, metadata and error feedback have distinct costs and numerical consequences.": "量化、稀疏化、元数据及误差反馈具有不同成本与数值后果。",
  "Smaller numeric formats can reduce memory and data movement.": "更小的数值格式可减少内存及数据搬运。",
  "A tensor has a real-valued range and a target precision.": "张量有实际数值范围及目标精度。",
  "Map values to a smaller representation plus scales/metadata.": "将数值映射为更小表示，并附缩放 / 元数据。",
  "Use compatible kernels while controlling numerical error.": "在控制数值误差的同时使用兼容内核。",
  "Does an INT4 checkpoint mean every runtime tensor uses four bits?": "INT4 检查点是否意味着所有运行时张量都是四位？",
  "No: activations, cache and accumulation may use other formats.": "否：激活、缓存与累积可采用其他格式。",
  "Yes: the complete execution becomes four-bit.": "是：整个执行过程都变成四位。",
  "Weight format, activation format, accumulator precision and KV format are separate choices. Scale and packing overhead also matter.": "权重、激活、累积及 KV 格式是不同选择；缩放与打包开销也很重要。",
  "A token needs relevant information from other positions.": "一个 token 需要其他位置的相关信息。",
  "A query q, visible keys K and values V.": "一个查询 q、可见键 K 与值 V。",
  "Score q against keys; softmax once; form a weighted sum of values.": "用 q 对键评分，统一 softmax，再对值加权求和。",
  "One output vector per query head and query position.": "每个查询头、每个查询位置对应一个输出向量。",
  "Are attention weights multiplied by keys to form the output?": "注意力权重是否乘以键形成输出？",
  "No: scores use keys; the final weighted sum uses values.": "否：键用于评分，最终加权和使用值。",
  "Yes: values only build the causal mask.": "是：值只用来构造因果掩码。",
  "Q and K decide where to read; V contains what is read. The mask controls which positions can participate.": "Q 与 K 决定读取哪里，V 包含读取内容，掩码控制哪些位置可以参与。",
  "Dense attention can create a very large score matrix.": "稠密注意力可能产生非常大的评分矩阵。",
  "The same Q, K, V and mask as ordinary attention.": "与普通注意力相同的 Q、K、V 及掩码。",
  "Visit KV tiles while maintaining a shared running maximum and sums.": "遍历 KV 块，维护共享的在线最大值与累积和。",
  "The same attention output without writing the whole score matrix.": "不写回完整评分矩阵，得到相同注意力输出。",
  "Does FlashAttention skip low-score keys?": "FlashAttention 是否跳过低分键？",
  "No: it changes IO scheduling, not the attended set.": "否：它改变 IO 调度，不改变关注集合。",
  "Yes: it is a top-k sparse attention algorithm.": "是：它是 top-k 稀疏注意力算法。",
  "Dense and tiled views share the worked numbers. The online denominator covers all valid keys, not each tile independently.": "稠密与分块视图使用相同示例数值；在线分母覆盖全部有效键，而非每块独立归一化。",
  "Attention needs a way to distinguish relative positions.": "注意力需要区分相对位置。",
  "Pairs of query/key features and their token positions.": "查询 / 键特征对及各自 token 位置。",
  "Rotate each feature pair by a position-dependent angle.": "按依赖位置的角度旋转各特征对。",
  "Dot products sense relative offsets while pair lengths stay unchanged.": "点积感知相对位移，而特征对长度不变。",
  "Does standard RoPE rotate V in this attention equation?": "此注意力方程中的标准 RoPE 是否旋转 V？",
  "No: it rotates query and key pairs.": "否：它旋转查询与键的特征对。",
  "Yes: only values carry position.": "是：只有值携带位置。",
  "Applying the same rotation to both vectors preserves their dot product. Changing the relative rotation changes their comparison.": "对两个向量施加相同旋转保持点积；改变相对旋转会改变比较结果。",
  "Feature scales can drift as sublayers compose.": "子层组合时，特征尺度可能漂移。",
  "A single token’s features, or one sample’s channel groups.": "单 token 的特征，或单个样本的通道组。",
  "Compute the selected statistics, normalize, then apply learned affine factors.": "计算选定统计量，归一化，再应用学习仿射因子。",
  "A controlled feature scale without mixing unrelated requests.": "控制特征尺度，而不混合无关请求。",
  "Does RMSNorm subtract the feature mean?": "RMSNorm 是否减去特征均值？",
  "No: it divides by the root mean square.": "否：它除以均方根。",
  "Yes: RMSNorm and LayerNorm are identical.": "是：RMSNorm 与 LayerNorm 相同。",
  "LayerNorm centers and scales; RMSNorm scales without centering. GroupNorm chooses a different reduction grouping.": "LayerNorm 居中并缩放，RMSNorm 缩放但不居中，GroupNorm 则使用不同归约分组。",
  "Attention mixes positions; features also need nonlinear transformation.": "注意力混合位置，特征还需要非线性变换。",
  "Each token has its own D-dimensional feature vector.": "每个 token 有独立的 D 维特征向量。",
  "Expand D→F, apply the chosen activation/gate, then project F→D.": "从 D 扩展至 F，使用选定激活 / 门，再投影回 D。",
  "Token features change; token positions are not mixed by the dense FFN.": "token 特征发生变化，稠密 FFN 不混合 token 位置。",
  "Does the FFN softmax across historical tokens?": "FFN 是否对历史 token 做 softmax？",
  "No: it transforms features locally per token.": "否：它逐 token 本地变换特征。",
  "Yes: every nonlinear block is attention.": "是：所有非线性模块都是注意力。",
  "SwiGLU uses two branches and a featurewise product; GELU uses one activation branch. The selected lesson must match that choice.": "SwiGLU 使用双分支及逐特征乘积，GELU 使用单激活分支；所选课程必须匹配具体选择。",
  "A model can store many expert FFNs but execute a few per token.": "模型可保存许多专家 FFN，但每个 token 只执行少量。",
  "A token feature and a vector of expert scores.": "一个 token 特征与一组专家评分。",
  "Choose top-k experts, execute them and combine their weighted outputs.": "选择 top-k 专家，执行并加权组合输出。",
  "One combined token output, optionally including a shared expert.": "一个组合后的 token 输出，可包含共享专家贡献。",
  "Does top-2 mean only two experts exist in the model?": "top-2 是否意味着模型只有两个专家？",
  "No: two are selected from a larger stored set.": "否：从更大已存专家集合中选择两个。",
  "Yes: all other experts are deleted.": "是：其他专家被删除。",
  "The toy chooses experts 1 and 2 with weights 0.625 and 0.375. Different releases use different score and balancing rules.": "示例选择专家 1、2，权重为 0.625、0.375；不同发布采用不同评分及平衡规则。",
  "Expanded per-head KV history can dominate decode memory.": "各头展开的 KV 历史可能占据大量解码内存。",
  "Token features are projected into latent KV and a separate rotary key.": "token 特征投影为 KV 潜变量及独立旋转键。",
  "Cache the compact latent and absorb compatible projections when reading.": "缓存紧凑潜变量，并在读取时吸收兼容投影。",
  "Attention still distinguishes context positions using a smaller cache.": "用更小缓存计算注意力，仍区分各上下文位置。",
  "Does MLA eliminate the need to retain context state?": "MLA 是否消除了保留上下文状态的需要？",
  "No: it changes the cached representation.": "否：它改变缓存表示。",
  "Yes: it replaces attention with a stateless FFN.": "是：它以无状态 FFN 替代注意力。",
  "V3’s example stores 512 latent plus 64 rotary scalars per token per layer; this is a layout-specific count, not GQA head counting.": "V3 示例每 token 每层保存 512 个潜变量及 64 个旋转标量；这是特定布局计数，不能按 GQA 头数估算。",
  "The main attention need not read every historical position.": "主注意力不一定要读取每个历史位置。",
  "A query and cheap learned index scores over causal history.": "查询及因果历史上的廉价学习索引评分。",
  "Select positions with the indexer, then attend their actual K/V.": "用索引器选位置，再关注其实际 K/V。",
  "A sparse attention result over the selected set.": "在所选集合上计算的稀疏注意力结果。",
  "Must an indexer score equal the main attention score?": "索引器评分是否必须等于主注意力评分？",
  "No: selection and main attention serve different roles.": "否：选择与主注意力承担不同职责。",
  "Yes: otherwise FlashAttention is incorrect.": "是：否则 FlashAttention 不正确。",
  "DSA deliberately changes the attended set and is trained for that design. It is distinct from an exact dense-attention IO optimization.": "DSA 有意改变关注集合，并为此设计训练；它不同于保持精确稠密注意力的 IO 优化。",
  "Long-range context can be represented at lower resolution.": "远程上下文可用较低分辨率表示。",
  "A recent local window plus older history.": "近期局部窗口与更早历史。",
  "Learn compressed history entries; select or attend them with recent tokens.": "学习压缩历史项，再选择或关注它们及近期 token。",
  "Attention reads local detail and compressed long-range memory.": "注意力读取局部细节及压缩远程记忆。",
  "Is a compressed entry necessarily an arithmetic average?": "压缩项是否一定为算术平均？",
  "No: the released compressor is learned.": "否：发布的压缩器通过学习得到。",
  "Yes: all compression is lossless averaging.": "是：所有压缩都是无损平均。",
  "CSA adds selection over compressed entries; HCA uses more heavily compressed memory. Both change the model’s attention representation.": "CSA 对压缩项加入选择，HCA 使用更重压缩的记忆；两者都改变模型注意力表示。",
  "Residual information can flow through several streams inside a block.": "残差信息可在模型块内部通过多条流传播。",
  "Multiple hidden streams and learned mixing coefficients.": "多条隐藏流及学习混合系数。",
  "Merge into a sublayer, transform, then redistribute and add residuals.": "合并至子层、变换，再重新分配并加上残差。",
  "Several updated streams with constrained residual mixing.": "经过约束残差混合的多条更新流。",
  "Is mHC an AllReduce operation between GPUs?": "mHC 是否为 GPU 间的 AllReduce？",
  "No: these are residual streams inside the model.": "否：这些是模型内部残差流。",
  "Yes: each stream means one GPU process.": "是：每条流代表一个 GPU 进程。",
  "The toy Hres has each row and column summing to one. That constraint applies to residual mixing, not every gate.": "示例 Hres 每行每列和均为一；约束针对残差混合，并非所有门。",
  "Sequence information can be compressed into a recurrent state.": "序列信息可压入递归状态。",
  "Previous state and the current input.": "旧状态与当前输入。",
  "Select decay/input/readout factors and update the state.": "选择衰减 / 输入 / 读出因子并更新状态。",
  "A new output and fixed-size state for the next position.": "新输出及供下一位置使用的固定大小状态。",
  "Does fixed-size state imply perfect memory of any length?": "固定大小状态是否意味着任意长度的完美记忆？",
  "No: history is compressed into limited state.": "否：历史被压入有限状态。",
  "Yes: it stores every past key exactly.": "是：它精确保留每个历史键。",
  "Decay controls retention. Affine update composition can enable a parallel training scan while decode remains recurrent.": "衰减控制保留程度；仿射更新可结合的复合规则可支持并行训练扫描，而解码仍为递推。",
  "Matrix memory should correct an old prediction rather than blindly add values.": "矩阵记忆应修正旧预测，而非盲目累加数值。",
  "A key-by-value state matrix, a new key/value and gates.": "键维 × 值维状态矩阵、新键 / 值及门。",
  "Decay, predict kᵀS, then write βk(v−prediction)ᵀ.": "先衰减、预测 kᵀS，再写入 βk(v−预测)ᵀ。",
  "The memory is corrected; qᵀS reads the updated value features.": "记忆被修正，qᵀS 读取更新后的值特征。",
  "Is the complete value v added unchanged on every write?": "每次写入是否都原样加上完整值 v？",
  "No: the write uses the prediction error.": "否：写入使用预测误差。",
  "Yes: the old prediction is irrelevant.": "是：旧预测无关紧要。",
  "This error-correction term is the delta rule. Decay λ and write gate β control different effects.": "误差修正项是 delta rule；衰减 λ 与写入门 β 控制不同作用。",
  "A language model can carry recurrent matrix memory instead of a full KV list.": "语言模型可携带递归矩阵记忆，而非完整 KV 列表。",
  "Old state, decay and current token projections.": "旧状态、衰减及当前 token 投影。",
  "Decay state, apply the version-specific modifier, then write new KV.": "衰减状态、应用版本特定修改项，再写入新 KV。",
  "A readable updated state; separate channel mixing transforms features.": "可读的更新状态；独立通道混合变换特征。",
  "Is RWKV-7 just the same recurrence renamed RWKV-6?": "RWKV-7 是否只是 RWKV-6 的同一递推改名？",
  "No: the core includes an additional state-dependent modifier.": "否：核心包含附加的依状态变化的修改项。",
  "Yes: all RWKV versions share the exact update.": "是：所有 RWKV 版本更新完全相同。",
  "The displayed RWKV-7 term uses the OLD state as (Sold a)bᵀ. Actual readouts include further version-specific gates and terms.": "展示的 RWKV-7 项使用旧状态计算 (Sold a)bᵀ；真实读出还包含版本特定门与附加项。",
  "Local patterns can be detected with shared filters.": "共享滤波器可检测局部模式。",
  "An input neighborhood and a small learned kernel.": "输入邻域及小型学习卷积核。",
  "Multiply aligned entries, sum, then slide to the next position.": "对齐相乘、求和，再滑到下一位置。",
  "A spatial or temporal output map with shared kernel weights.": "使用共享卷积核权重的空间或时间输出图。",
  "Does a depthwise convolution mix all input channels?": "深度卷积是否混合所有输入通道？",
  "No: each channel has its own local filter.": "否：每个通道有独立局部滤波器。",
  "Yes: depthwise means summing every channel.": "是：depthwise 表示对所有通道求和。",
  "A full convolution sums across input channels; depthwise restricts that connection. Causal temporal filters use past/current positions only.": "完整卷积跨输入通道求和，深度卷积限制该连接；因果时间滤波仅使用过去 / 当前。",
  "Generation can gradually turn random noise into structured data.": "生成可逐步把随机噪声变成有结构的数据。",
  "A noisy sample, time and conditioning.": "含噪样本、时间与条件。",
  "Predict the trained target and apply a matching scheduler update.": "预测训练目标，并应用匹配的调度器更新。",
  "A less-noisy/new-time sample; repeat with the same network.": "更低噪声 / 新时间的样本，复用同一网络继续。",
  "Does one training loss require running the full generation chain?": "一次训练损失是否需要执行完整生成链？",
  "Usually no: sample a time/noise level and train its prediction.": "通常不需要：采样时间 / 噪声水平，训练对应预测。",
  "Yes: every loss must first finish a generated image.": "需要：每次损失必须先完成一张生成图。",
  "Objective, denoiser architecture and inference sampler are separate choices. Flow velocity and DDPM noise prediction use different updates.": "目标、去噪器架构及推理采样器是不同选择；流速度与 DDPM 噪声预测使用不同更新。",
  "Several layers can query a memory that is produced once.": "多层可查询只生成一次的记忆。",
  "Causal encoder output and decoder layers with static CSA2 roles.": "因果编码器输出及具有静态 CSA2 角色的解码层。",
  "Full builds state; Reindex refreshes selection; Reuse reuses indices too.": "Full 建状态，Reindex 更新选择，Reuse 还复用索引。",
  "Decoder layers share global KV with controlled indexing work.": "解码层共享全局 KV，并控制索引工作量。",
  "Does Reindex rebuild each decoder layer’s own global KV?": "Reindex 是否重建每个解码层自己的全局 KV？",
  "No: it refreshes selection while reusing main KV.": "否：它复用主 KV，只更新选择。",
  "Yes: only Reuse shares KV.": "是：只有 Reuse 共享 KV。",
  "Cross-layer KV sharing, index sharing and local sliding-window replay are separate cache mechanisms.": "跨层 KV 共享、索引共享及局部滑窗重放是不同缓存机制。",
  "Token patterns can address a large sparse learned memory table.": "token 模式可寻址大型稀疏学习记忆表。",
  "Recent token n-grams and learned table rows.": "近期 token n-gram 及学习记忆表行。",
  "Derive lookup IDs, fetch rows, then project and gate their features.": "派生查表编号、读取表行，再投影并门控特征。",
  "Retrieved learned features are fused with the hidden state.": "检索到的学习特征与隐藏状态融合。",
  "Is this request-specific history stored by the KV cache?": "这是否为 KV 缓存所存的请求特定历史？",
  "No: the table holds learned parameters.": "否：表中保存学习参数。",
  "Yes: it only stores the current prompt’s keys.": "是：它只保存当前提示的键。",
  "Engram is learned conditional memory, not document retrieval, expert FFN selection or request KV state.": "Engram 是学习条件记忆，不是文档检索、专家 FFN 选择，也不是请求 KV 状态。",
  "Several candidate tokens can be verified in one target-model pass.": "多个候选 token 可在一次目标模型执行中验证。",
  "A draft proposes A,B,C,D.": "草稿提出 A、B、C、D。",
  "The target agrees on A,B, then prefers X at the next position.": "目标同意 A、B，随后在下一位置选择 X。",
  "Commit A,B,X; discard incompatible later draft/cache entries.": "提交 A、B、X，丢弃不兼容的后续草稿 / 缓存。",
  "Does a draft token become output before verification?": "草稿 token 是否在验证前就成为输出？",
  "No: candidates are tentative.": "否：候选尚未提交。",
  "Yes: verification only measures speed.": "是：验证只用来测速度。",
  "The illustration is greedy verification. Exact sampling additionally requires acceptance/rejection and a correction distribution.": "图示为贪心验证；精确采样还需要接受 / 拒绝规则及修正分布。"
});
const TEACHING_GUIDES={
  "all-reduce": {
    "problem": "Different workers contribute to one shared answer.",
    "before": "Rank r holds (r+1) × [1,2,3,4], with r = 0,1,2,3.",
    "action": "Add corresponding positions across ranks.",
    "after": "Every rank has [10,20,30,40].",
    "question": "Would concatenating the four input vectors implement AllReduce SUM?",
    "answers": [
      "No: matching positions must be added.",
      "Yes: it collects all inputs."
    ],
    "why": "AllReduce preserves tensor shape and reduces each position. AllGather concatenates contributions instead."
  },
  "all-gather": {
    "problem": "Each worker needs a complete tensor that is currently sharded.",
    "before": "Ranks own A, B, C and D respectively.",
    "action": "Copy shards and concatenate in rank order.",
    "after": "Every rank owns [A,B,C,D].",
    "question": "Are A, B, C and D added together?",
    "answers": [
      "No: they remain separate tensor positions.",
      "Yes: all collectives sum their inputs."
    ],
    "why": "AllGather copies values. The global tensor has P times the per-rank input size for equal shards."
  },
  "reduce-scatter": {
    "problem": "We need the global reduction, but each worker only needs a slice.",
    "before": "Every rank contributes to all four positions.",
    "action": "Sum globally, then divide the result into slices.",
    "after": "Ranks own [10], [20], [30], [40].",
    "question": "Does every rank receive the entire reduced tensor?",
    "answers": [
      "No: each receives its reduced slice.",
      "Yes: scatter copies the full tensor."
    ],
    "why": "The slices collectively form the global sum. AllReduce can be built from ReduceScatter followed by AllGather."
  },
  "broadcast": {
    "problem": "One worker has information everybody else needs.",
    "before": "Only root rank 0 supplies [A,B,C,D].",
    "action": "Copy the root tensor to the group.",
    "after": "All ranks have the same root values.",
    "question": "Do non-root input values affect the answer?",
    "answers": [
      "No: the root is the sole source.",
      "Yes: values are averaged across ranks."
    ],
    "why": "Broadcast has one input source and many recipients. It does not reduce contributions."
  },
  "reduce": {
    "problem": "One designated worker needs the combined answer.",
    "before": "All ranks contribute matching tensor positions.",
    "action": "Apply a reduction and deliver it to the root.",
    "after": "Only root has a defined reduced output.",
    "question": "Can another rank use its buffer as the reduced result?",
    "answers": [
      "No: only the root output is defined.",
      "Yes: Reduce is the same as AllReduce."
    ],
    "why": "AllReduce defines the result everywhere; Reduce defines it only at the designated root."
  },
  "scatter": {
    "problem": "A root holds a batch that should be divided among workers.",
    "before": "Root has [A,B,C,D].",
    "action": "Send a different slice to each rank.",
    "after": "Each rank owns one assigned slice.",
    "question": "Is Scatter a reduction?",
    "answers": [
      "No: it partitions and copies.",
      "Yes: it sums before splitting."
    ],
    "why": "There is a single input source. ReduceScatter adds contributions from every rank before distributing slices."
  },
  "gather": {
    "problem": "A root needs a tensor assembled from worker-owned slices.",
    "before": "Ranks hold distinct pieces A, B, C, D.",
    "action": "Copy pieces into source-rank order at root.",
    "after": "Root owns [A,B,C,D]; other outputs are undefined.",
    "question": "Does Gather add values from different ranks?",
    "answers": [
      "No: it concatenates them.",
      "Yes: the root receives their sum."
    ],
    "why": "Gather collects distinct positions. Reduce combines contributions to matching positions."
  },
  "all-to-all": {
    "problem": "Data must move from its current owner to its destination owner.",
    "before": "Each source has one bucket for every destination.",
    "action": "Route bucket (source,destination) to destination.",
    "after": "Each destination has a bucket from every source.",
    "question": "Does a destination receive each source’s complete tensor?",
    "answers": [
      "No: only the bucket addressed to it.",
      "Yes: every input is fully replicated."
    ],
    "why": "AllToAll transposes ownership. AllToAllv additionally allows different bucket sizes; peer send/receive counts must agree."
  },
  "all-to-all-v": {
    "problem": "Data must move from its current owner to its destination owner.",
    "before": "Each source has one bucket for every destination.",
    "action": "Route bucket (source,destination) to destination.",
    "after": "Each destination has a bucket from every source.",
    "question": "Does a destination receive each source’s complete tensor?",
    "answers": [
      "No: only the bucket addressed to it.",
      "Yes: every input is fully replicated."
    ],
    "why": "AllToAll transposes ownership. AllToAllv additionally allows different bucket sizes; peer send/receive counts must agree."
  },
  "send-recv": {
    "problem": "Two endpoints need an explicitly matched transfer.",
    "before": "Rank 0 has a buffer; rank 2 will receive it.",
    "action": "Match source, destination, count and datatype.",
    "after": "Rank 2 receives a copy; others do not participate.",
    "question": "Must all ranks call Send/Recv for this one transfer?",
    "answers": [
      "No: only the matching endpoints.",
      "Yes: it is a collective barrier."
    ],
    "why": "Explicit point-to-point transfers need compatible ordering and buffer lifetimes. They do not imply group-wide synchronization."
  },
  "barrier": {
    "problem": "A phase cannot finish until every participant has arrived.",
    "before": "Some ranks arrived; others are still working.",
    "action": "Wait until all ranks enter this barrier.",
    "after": "Every participant may then complete.",
    "question": "Does Barrier make all ranks exit at the same physical instant?",
    "answers": [
      "No: it guarantees participation before completion.",
      "Yes: exits are exactly simultaneous."
    ],
    "why": "A barrier is a synchronization contract, not a tensor reduction or a synchronized physical clock."
  },
  "scan": {
    "problem": "Each worker needs a reduction of only the preceding ranks and itself.",
    "before": "Rank-ordered inputs are 1,2,3,4.",
    "action": "Accumulate the ordered inclusive prefix.",
    "after": "Outputs are 1,3,6,10 respectively.",
    "question": "Does rank 1 include rank 3’s input?",
    "answers": [
      "No: its prefix is ranks 0 through 1.",
      "Yes: every rank gets the global sum."
    ],
    "why": "Inclusive Scan includes the current rank; Exscan excludes it and has a different first-rank output contract."
  },
  "data-parallel": {
    "problem": "More examples should train the same model in less wall-clock time.",
    "before": "Each rank has full weights and a different local batch.",
    "action": "Compute local gradients, then synchronize the global update.",
    "after": "Replicas retain matching weights after the same update.",
    "question": "Does data parallelism alone reduce parameter memory per rank?",
    "answers": [
      "No: weights are replicated.",
      "Yes: each rank stores different layers."
    ],
    "why": "Data parallelism splits examples. FSDP/ZeRO add state sharding; pipeline parallelism splits layers."
  },
  "tensor-parallel": {
    "problem": "One layer is too large or too slow for one accelerator.",
    "before": "A matrix product XW is divided across devices.",
    "action": "Shard weight rows or columns and match the activation layout.",
    "after": "Local products combine into exactly the original XW.",
    "question": "For row-parallel W, should partial outputs be concatenated?",
    "answers": [
      "No: they contribute to the same output positions and must sum.",
      "Yes: every rank computes different output features."
    ],
    "why": "Row shards split the contracted dimension: XW=Σ XᵢWᵢ. Column shards compute different output features, which concatenate."
  },
  "pipeline-parallel": {
    "problem": "A deep model can be divided along its layer stack.",
    "before": "Each GPU owns consecutive layers; a batch becomes microbatches.",
    "action": "Move activations forward and gradients backward according to a schedule.",
    "after": "Different microbatches overlap across stages.",
    "question": "Does changing the schedule move every layer onto every GPU?",
    "answers": [
      "No: placement and execution order are separate choices.",
      "Yes: scheduling replicates all weights."
    ],
    "why": "The timeline controls when a stage runs F, input-gradient B or weight-gradient W. Weight placement is shown separately."
  },
  "sequence-parallel": {
    "problem": "Tokenwise operations do not need every token activation on every TP rank.",
    "before": "An activation has token rows and hidden-feature columns.",
    "action": "Keep different token rows around local norm/residual work.",
    "after": "Gather or ReduceScatter at the relevant TP boundaries.",
    "question": "Does this automatically shard the entire attention history?",
    "answers": [
      "No: context/KV sharding is a separate layout.",
      "Yes: no attention collectives are needed."
    ],
    "why": "This SP example shards tokenwise activations. Context parallelism controls how attention reaches global K/V."
  },
  "context-parallel": {
    "problem": "Long attention contexts make activations and KV history expensive.",
    "before": "Each rank owns local query positions and a KV block.",
    "action": "Bring every valid KV contribution to each local query.",
    "after": "Local outputs match full-context masked attention.",
    "question": "Can independently normalized block outputs simply be averaged?",
    "answers": [
      "No: merge maxima and exponential sums for one softmax.",
      "Yes: every block has the same number of tokens."
    ],
    "why": "Each query needs one normalization over all visible keys. Online softmax rescales old accumulators when the maximum changes."
  },
  "expert-parallel": {
    "problem": "Many experts can be stored without running all of them per token.",
    "before": "Expert weights live on different ranks.",
    "action": "Route token copies to selected experts, then return their outputs.",
    "after": "Restore token order and combine with router weights.",
    "question": "Does active parameter count equal total weight storage?",
    "answers": [
      "No: unselected experts still have stored weights.",
      "Yes: unused experts can be ignored in memory planning."
    ],
    "why": "Routing sparsifies computation. Weight placement, dispatch/return traffic and expert imbalance remain real costs."
  },
  "hybrid-parallel": {
    "problem": "Large systems need several independent ways of splitting work.",
    "before": "Example: 2 data replicas × 2 pipeline stages × 2 tensor shards.",
    "action": "Build a different process group along each coordinate axis.",
    "after": "Eight ranks cooperate within their matching DP, PP and TP groups.",
    "question": "Is there one AllReduce group containing all eight ranks for every layer?",
    "answers": [
      "No: each parallel axis has its own groups.",
      "Yes: all ranks do the same tensor shard."
    ],
    "why": "TP combines same-stage tensor shards; PP connects stages; DP synchronizes corresponding model shards across replicas."
  },
  "replica-serving": {
    "problem": "Independent requests can run on independent model instances.",
    "before": "Each instance can hold and run a complete model.",
    "action": "Route requests by load, capacity and cache locality.",
    "after": "Instances generate and stream responses independently.",
    "question": "Must replicas synchronize gradients after each generated token?",
    "answers": [
      "No: inference has no training gradient update.",
      "Yes: it keeps generated text identical."
    ],
    "why": "Serving replicas process different requests. A single instance may still use TP/PP internally."
  },
  "prefill-decode": {
    "problem": "Prompt processing and iterative decoding stress different resources.",
    "before": "One pool computes prompt states; another serves token steps.",
    "action": "Transfer prompt KV and request state between the pools.",
    "after": "Decode reuses the transferred history and appends new state.",
    "question": "Can decode begin with an empty KV cache after prefill elsewhere?",
    "answers": [
      "No: it needs the prompt history or must recompute it.",
      "Yes: model weights contain request history."
    ],
    "why": "KV is request-specific intermediate state, separate from shared model weights. Handoff cost and layout conversion affect latency."
  },
  "fsdp": {
    "problem": "Replicated model states waste memory as the model grows.",
    "before": "Each rank persistently owns only a state shard.",
    "action": "Gather module weights when needed; reshard after use.",
    "after": "ReduceScatter gradients to owners for the update.",
    "question": "Is peak memory just the persistent local shard?",
    "answers": [
      "No: gathered weights, activations and buffers also count.",
      "Yes: every tensor stays sharded at every instant."
    ],
    "why": "FSDP trades communication and temporary materialization for lower persistent state memory."
  },
  "zero": {
    "problem": "Optimizer, gradients and weights can have different owners.",
    "before": "Unsharded DP replicates parameters, gradients and optimizer states.",
    "action": "Stage 1 shards optimizer; stage 2 adds gradients; stage 3 adds weights.",
    "after": "Higher stages save more persistent memory and require more exchange.",
    "question": "Does ZeRO-1 shard model parameters?",
    "answers": [
      "No: it partitions optimizer states.",
      "Yes: parameters are the first state to shard."
    ],
    "why": "The sequence is optimizer → gradients → parameters. A stage number names what persists sharded, not peak memory."
  },
  "gradient-accumulation": {
    "problem": "A desired effective batch may not fit in one microbatch.",
    "before": "Gradient buffers start at zero once per accumulation window.",
    "action": "Add scaled microbatch gradients without stepping the optimizer.",
    "after": "Synchronize as needed and update once for the whole window.",
    "question": "Should the optimizer step after every microbatch?",
    "answers": [
      "No: that changes the update being modeled.",
      "Yes: accumulation only saves activations."
    ],
    "why": "Accumulation sums gradients at fixed weights within the window. Loss scaling, global batch size and synchronization must agree."
  },
  "activation-checkpointing": {
    "problem": "Backward needs intermediate activations that occupy memory.",
    "before": "Ordinary training retains many forward intermediates.",
    "action": "Save selected boundaries and recompute missing values in backward.",
    "after": "Use less activation memory in exchange for extra computation.",
    "question": "Are parameter weights discarded and learned again?",
    "answers": [
      "No: forward intermediates are recomputed with the same weights.",
      "Yes: checkpointing removes the model parameters."
    ],
    "why": "Activation checkpointing is not saving a training checkpoint to disk. Randomness and stateful operations must replay correctly."
  },
  "overlap": {
    "problem": "Some communication can progress while independent computation continues.",
    "before": "A producer makes a buffer ready before its consumer needs it.",
    "action": "Launch transfer early, compute independent work, then wait at dependency.",
    "after": "Hide only the portion that actually overlaps useful work.",
    "question": "Can a consumer read an in-flight receive buffer immediately?",
    "answers": [
      "No: it must wait for the transfer dependency.",
      "Yes: asynchronous means already finished."
    ],
    "why": "Asynchronous launch is not completion. Correct events, streams and buffer lifetimes are essential."
  },
  "continuous-batching": {
    "problem": "Requests finish at different times during generation.",
    "before": "A decode batch contains active requests with independent states.",
    "action": "Remove completed requests and admit new work between iterations.",
    "after": "Keep accelerator capacity useful without waiting for a whole batch.",
    "question": "Does a new request need to wait for every old request to finish?",
    "answers": [
      "No: the scheduler can refill between iterations.",
      "Yes: batches are fixed for an entire generation."
    ],
    "why": "Each request still has causal token dependencies and its own KV state. Scheduling changes membership, not those dependencies."
  },
  "kv-cache": {
    "problem": "Repeated decode should not recompute past keys and values.",
    "before": "The prompt creates per-layer K/V for each request.",
    "action": "Append the new token’s K/V and read the visible history.",
    "after": "Save old projections while history storage grows.",
    "question": "Does KV caching remove the need to attend historical keys?",
    "answers": [
      "No: full attention still reads the historical cache.",
      "Yes: only the newest token is ever used."
    ],
    "why": "Caching saves recomputation. Paging changes allocation and address mapping; it does not remove logical attention history."
  },
  "gradient-compression": {
    "problem": "Gradient synchronization can be limited by communication volume.",
    "before": "Workers hold full-precision local gradients.",
    "action": "Encode smaller messages and reconstruct an approximate aggregate.",
    "after": "Reduce bytes while managing approximation and residual error.",
    "question": "Is compressed synchronization always mathematically identical?",
    "answers": [
      "No: lossy encodings change values unless corrected exactly.",
      "Yes: fewer bits never affect a gradient."
    ],
    "why": "Quantization, sparsification, metadata and error feedback have distinct costs and numerical consequences."
  },
  "quantization": {
    "problem": "Smaller numeric formats can reduce memory and data movement.",
    "before": "A tensor has a real-valued range and a target precision.",
    "action": "Map values to a smaller representation plus scales/metadata.",
    "after": "Use compatible kernels while controlling numerical error.",
    "question": "Does an INT4 checkpoint mean every runtime tensor uses four bits?",
    "answers": [
      "No: activations, cache and accumulation may use other formats.",
      "Yes: the complete execution becomes four-bit."
    ],
    "why": "Weight format, activation format, accumulator precision and KV format are separate choices. Scale and packing overhead also matter."
  },
  "attention": {
    "problem": "A token needs relevant information from other positions.",
    "before": "A query q, visible keys K and values V.",
    "action": "Score q against keys; softmax once; form a weighted sum of values.",
    "after": "One output vector per query head and query position.",
    "question": "Are attention weights multiplied by keys to form the output?",
    "answers": [
      "No: scores use keys; the final weighted sum uses values.",
      "Yes: values only build the causal mask."
    ],
    "why": "Q and K decide where to read; V contains what is read. The mask controls which positions can participate."
  },
  "flash": {
    "problem": "Dense attention can create a very large score matrix.",
    "before": "The same Q, K, V and mask as ordinary attention.",
    "action": "Visit KV tiles while maintaining a shared running maximum and sums.",
    "after": "The same attention output without writing the whole score matrix.",
    "question": "Does FlashAttention skip low-score keys?",
    "answers": [
      "No: it changes IO scheduling, not the attended set.",
      "Yes: it is a top-k sparse attention algorithm."
    ],
    "why": "Dense and tiled views share the worked numbers. The online denominator covers all valid keys, not each tile independently."
  },
  "rope": {
    "problem": "Attention needs a way to distinguish relative positions.",
    "before": "Pairs of query/key features and their token positions.",
    "action": "Rotate each feature pair by a position-dependent angle.",
    "after": "Dot products sense relative offsets while pair lengths stay unchanged.",
    "question": "Does standard RoPE rotate V in this attention equation?",
    "answers": [
      "No: it rotates query and key pairs.",
      "Yes: only values carry position."
    ],
    "why": "Applying the same rotation to both vectors preserves their dot product. Changing the relative rotation changes their comparison."
  },
  "norm": {
    "problem": "Feature scales can drift as sublayers compose.",
    "before": "A single token’s features, or one sample’s channel groups.",
    "action": "Compute the selected statistics, normalize, then apply learned affine factors.",
    "after": "A controlled feature scale without mixing unrelated requests.",
    "question": "Does RMSNorm subtract the feature mean?",
    "answers": [
      "No: it divides by the root mean square.",
      "Yes: RMSNorm and LayerNorm are identical."
    ],
    "why": "LayerNorm centers and scales; RMSNorm scales without centering. GroupNorm chooses a different reduction grouping."
  },
  "ffn": {
    "problem": "Attention mixes positions; features also need nonlinear transformation.",
    "before": "Each token has its own D-dimensional feature vector.",
    "action": "Expand D→F, apply the chosen activation/gate, then project F→D.",
    "after": "Token features change; token positions are not mixed by the dense FFN.",
    "question": "Does the FFN softmax across historical tokens?",
    "answers": [
      "No: it transforms features locally per token.",
      "Yes: every nonlinear block is attention."
    ],
    "why": "SwiGLU uses two branches and a featurewise product; GELU uses one activation branch. The selected lesson must match that choice."
  },
  "routing": {
    "problem": "A model can store many expert FFNs but execute a few per token.",
    "before": "A token feature and a vector of expert scores.",
    "action": "Choose top-k experts, execute them and combine their weighted outputs.",
    "after": "One combined token output, optionally including a shared expert.",
    "question": "Does top-2 mean only two experts exist in the model?",
    "answers": [
      "No: two are selected from a larger stored set.",
      "Yes: all other experts are deleted."
    ],
    "why": "The toy chooses experts 1 and 2 with weights 0.625 and 0.375. Different releases use different score and balancing rules."
  },
  "mla": {
    "problem": "Expanded per-head KV history can dominate decode memory.",
    "before": "Token features are projected into latent KV and a separate rotary key.",
    "action": "Cache the compact latent and absorb compatible projections when reading.",
    "after": "Attention still distinguishes context positions using a smaller cache.",
    "question": "Does MLA eliminate the need to retain context state?",
    "answers": [
      "No: it changes the cached representation.",
      "Yes: it replaces attention with a stateless FFN."
    ],
    "why": "V3’s example stores 512 latent plus 64 rotary scalars per token per layer; this is a layout-specific count, not GQA head counting."
  },
  "sparse": {
    "problem": "The main attention need not read every historical position.",
    "before": "A query and cheap learned index scores over causal history.",
    "action": "Select positions with the indexer, then attend their actual K/V.",
    "after": "A sparse attention result over the selected set.",
    "question": "Must an indexer score equal the main attention score?",
    "answers": [
      "No: selection and main attention serve different roles.",
      "Yes: otherwise FlashAttention is incorrect."
    ],
    "why": "DSA deliberately changes the attended set and is trained for that design. It is distinct from an exact dense-attention IO optimization."
  },
  "compressed": {
    "problem": "Long-range context can be represented at lower resolution.",
    "before": "A recent local window plus older history.",
    "action": "Learn compressed history entries; select or attend them with recent tokens.",
    "after": "Attention reads local detail and compressed long-range memory.",
    "question": "Is a compressed entry necessarily an arithmetic average?",
    "answers": [
      "No: the released compressor is learned.",
      "Yes: all compression is lossless averaging."
    ],
    "why": "CSA adds selection over compressed entries; HCA uses more heavily compressed memory. Both change the model’s attention representation."
  },
  "hyper": {
    "problem": "Residual information can flow through several streams inside a block.",
    "before": "Multiple hidden streams and learned mixing coefficients.",
    "action": "Merge into a sublayer, transform, then redistribute and add residuals.",
    "after": "Several updated streams with constrained residual mixing.",
    "question": "Is mHC an AllReduce operation between GPUs?",
    "answers": [
      "No: these are residual streams inside the model.",
      "Yes: each stream means one GPU process."
    ],
    "why": "The toy Hres has each row and column summing to one. That constraint applies to residual mixing, not every gate."
  },
  "ssm": {
    "problem": "Sequence information can be compressed into a recurrent state.",
    "before": "Previous state and the current input.",
    "action": "Select decay/input/readout factors and update the state.",
    "after": "A new output and fixed-size state for the next position.",
    "question": "Does fixed-size state imply perfect memory of any length?",
    "answers": [
      "No: history is compressed into limited state.",
      "Yes: it stores every past key exactly."
    ],
    "why": "Decay controls retention. Affine update composition can enable a parallel training scan while decode remains recurrent."
  },
  "delta": {
    "problem": "Matrix memory should correct an old prediction rather than blindly add values.",
    "before": "A key-by-value state matrix, a new key/value and gates.",
    "action": "Decay, predict kᵀS, then write βk(v−prediction)ᵀ.",
    "after": "The memory is corrected; qᵀS reads the updated value features.",
    "question": "Is the complete value v added unchanged on every write?",
    "answers": [
      "No: the write uses the prediction error.",
      "Yes: the old prediction is irrelevant."
    ],
    "why": "This error-correction term is the delta rule. Decay λ and write gate β control different effects."
  },
  "rwkv": {
    "problem": "A language model can carry recurrent matrix memory instead of a full KV list.",
    "before": "Old state, decay and current token projections.",
    "action": "Decay state, apply the version-specific modifier, then write new KV.",
    "after": "A readable updated state; separate channel mixing transforms features.",
    "question": "Is RWKV-7 just the same recurrence renamed RWKV-6?",
    "answers": [
      "No: the core includes an additional state-dependent modifier.",
      "Yes: all RWKV versions share the exact update."
    ],
    "why": "The displayed RWKV-7 term uses the OLD state as (Sold a)bᵀ. Actual readouts include further version-specific gates and terms."
  },
  "conv": {
    "problem": "Local patterns can be detected with shared filters.",
    "before": "An input neighborhood and a small learned kernel.",
    "action": "Multiply aligned entries, sum, then slide to the next position.",
    "after": "A spatial or temporal output map with shared kernel weights.",
    "question": "Does a depthwise convolution mix all input channels?",
    "answers": [
      "No: each channel has its own local filter.",
      "Yes: depthwise means summing every channel."
    ],
    "why": "A full convolution sums across input channels; depthwise restricts that connection. Causal temporal filters use past/current positions only."
  },
  "diffusion": {
    "problem": "Generation can gradually turn random noise into structured data.",
    "before": "A noisy sample, time and conditioning.",
    "action": "Predict the trained target and apply a matching scheduler update.",
    "after": "A less-noisy/new-time sample; repeat with the same network.",
    "question": "Does one training loss require running the full generation chain?",
    "answers": [
      "Usually no: sample a time/noise level and train its prediction.",
      "Yes: every loss must first finish a generated image."
    ],
    "why": "Objective, denoiser architecture and inference sampler are separate choices. Flow velocity and DDPM noise prediction use different updates."
  },
  "crosskv": {
    "problem": "Several layers can query a memory that is produced once.",
    "before": "Causal encoder output and decoder layers with static CSA2 roles.",
    "action": "Full builds state; Reindex refreshes selection; Reuse reuses indices too.",
    "after": "Decoder layers share global KV with controlled indexing work.",
    "question": "Does Reindex rebuild each decoder layer’s own global KV?",
    "answers": [
      "No: it refreshes selection while reusing main KV.",
      "Yes: only Reuse shares KV."
    ],
    "why": "Cross-layer KV sharing, index sharing and local sliding-window replay are separate cache mechanisms."
  },
  "engram": {
    "problem": "Token patterns can address a large sparse learned memory table.",
    "before": "Recent token n-grams and learned table rows.",
    "action": "Derive lookup IDs, fetch rows, then project and gate their features.",
    "after": "Retrieved learned features are fused with the hidden state.",
    "question": "Is this request-specific history stored by the KV cache?",
    "answers": [
      "No: the table holds learned parameters.",
      "Yes: it only stores the current prompt’s keys."
    ],
    "why": "Engram is learned conditional memory, not document retrieval, expert FFN selection or request KV state."
  },
  "speculative": {
    "problem": "Several candidate tokens can be verified in one target-model pass.",
    "before": "A draft proposes A,B,C,D.",
    "action": "The target agrees on A,B, then prefers X at the next position.",
    "after": "Commit A,B,X; discard incompatible later draft/cache entries.",
    "question": "Does a draft token become output before verification?",
    "answers": [
      "No: candidates are tentative.",
      "Yes: verification only measures speed."
    ],
    "why": "The illustration is greedy verification. Exact sampling additionally requires acceptance/rejection and a correction distribution."
  }
};
