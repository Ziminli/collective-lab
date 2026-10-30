/* Sourced bilingual model curriculum. Numeric examples are illustrative; config facts name their checkpoint. */
Object.assign(ZH,{
  "Project Q, K and V": "投影 Q、K、V",
  "For X ∈ ℝᵀˣᴰ, linear projections create query, key and value heads. The toy query is [1,1]; keys are [1,0], [0,1], [1,1], [−1,1].": "对 X ∈ ℝᵀˣᴰ 做线性投影，形成查询、键和值的各个头。示例查询为 [1,1]，键为 [1,0]、[0,1]、[1,1]、[−1,1]。",
  "Score and mask": "评分与掩码",
  "Dot products divided by √2 give [0.707,0.707,1.414,0]. A causal mask sets future positions to −∞ before normalization.": "点积除以 √2 得 [0.707,0.707,1.414,0]。因果掩码在归一化之前把未来位置设为 −∞。",
  "Normalize one query row": "逐查询行归一化",
  "Subtract the row maximum before exponentiating. For the final query, all four keys are visible and weights sum to one. Earlier queries cannot see later tokens.": "求指数前先减去行最大值。最后一个查询能看到全部四个键，权重之和为一；较早查询不能看到后续 token。",
  "Mix values, then heads": "先混合值，再合并各头",
  "Multiply the weights by V, concatenate distinct query-head outputs, then apply Wₒ. Sharing KV heads changes storage, not the number of query outputs.": "权重乘以 V，拼接各查询头的输出，再乘 Wₒ。共享 KV 头改变存储量，不改变查询头输出数量。",
  "MHA vs GQA vs MQA": "MHA、GQA、MQA 对比",
  "MHA has Hkv=Hq; GQA shares each KV head across a group of query heads; MQA uses Hkv=1. KV-cache payload scales with Hkv, while attention still has Hq query heads.": "MHA 的 Hkv=Hq；GQA 在一组查询头间共享 KV 头；MQA 的 Hkv=1。KV 缓存量随 Hkv 变化，但仍计算 Hq 个查询头。",
  "Prefill vs decode": "预填充与解码",
  "Prefill computes many query rows; cached decode usually computes one new row per request. Historical K/V remain necessary for full attention. Dense score work scales as Tq×Tk×d.": "预填充同时计算多行查询；缓存解码通常每请求只新增一行。完整注意力仍需要历史 K/V，稠密评分工作量为 Tq×Tk×d。",
  "Attention": "注意力",
  "Compare a query with keys; mix the corresponding values.": "将查询与键比较，再混合相应的值。",
  "Tile Q, K and V": "对 Q、K、V 分块",
  "Bring a query tile and one K/V tile into fast memory. The score tile is temporary; an entire T×T attention matrix is not stored in HBM.": "把查询块和一块 K/V 载入高速存储。评分块只临时存在，不在 HBM 中保存完整 T×T 注意力矩阵。",
  "Update a running softmax": "更新在线 softmax",
  "Maintain row maximum m, exponential sum ℓ and unnormalized weighted sum u. Rescale previous accumulators whenever a larger maximum arrives.": "维护行最大值 m、指数和 ℓ、未归一化加权和 u；出现更大最大值时，重新缩放原累积量。",
  "Merge the next block": "合并下一块",
  "Visit every valid K/V block, preserving causal masks. Normalize once as O=u/ℓ after the final block. The animation uses the same numbers as Attention.": "访问每个有效 K/V 块并保留因果掩码；最后只归一化一次，O=u/ℓ。动画使用与“注意力”相同的数值。",
  "Recompute for backward": "反向时重算",
  "Backward can recompute score tiles using saved output and row statistics. This trades some computation for less memory traffic.": "反向可用保存的输出和行统计量重算评分块，以额外计算换取更少显存流量。",
  "Exact vs sparse": "精确计算与稀疏计算",
  "Tiling changes memory access, not which keys participate. FlashAttention is mathematically dense attention; DSA and CSA deliberately change the attended set or representation. Floating-point orders can still differ.": "分块改变访存，不改变参与计算的键。FlashAttention 数学上仍是稠密注意力；DSA、CSA 则改变注意力集合或表示，浮点计算顺序也可能不同。",
  "FlashAttention": "FlashAttention",
  "Compute exact attention without writing the full score matrix.": "不把完整评分矩阵写回显存，也能计算精确注意力。",
  "Pair the features": "将特征配对",
  "Split the rotary subspace into 2D pairs. Each pair has its own frequency θⱼ; p is the token position.": "把旋转子空间拆成二维特征对，每对有自己的频率 θⱼ；p 为 token 位置。",
  "Rotate Q and K": "旋转 Q 与 K",
  "Multiply each pair by a rotation matrix. A quarter-turn maps [1,0] to [0,1]. Standard RoPE rotates Q and K, not V.": "每对乘一个旋转矩阵。旋转四分之一圈可把 [1,0] 变为 [0,1]。标准 RoPE 旋转 Q、K，不旋转 V。",
  "Compare relative positions": "比较相对位置",
  "The identity (R(p)q)ᵀ(R(s)k)=qᵀR(s−p)k makes the dot product depend on the relative offset.": "恒等式 (R(p)q)ᵀ(R(s)k)=qᵀR(s−p)k 使点积依赖相对位置差。",
  "Keep cache conventions consistent": "保持缓存约定一致",
  "Position IDs, rotary dimensions and scaling must match between prefill and decode. Extending the context is not simply increasing an allocation limit.": "预填充与解码的位置编号、旋转维度、缩放规则必须一致。扩展上下文不只是增大内存分配上限。",
  "RoPE is not added to X": "RoPE 不是加到 X 上的向量",
  "Learned absolute embeddings are added to token embeddings; RoPE rotates projected query/key pairs. Partial rotary dimensions and long-context scaling are model-specific.": "学习式绝对位置向量与 token 嵌入相加；RoPE 则旋转投影后的查询 / 键特征对。部分旋转维度和长上下文缩放由模型决定。",
  "Rotary position embeddings": "旋转位置编码",
  "Rotate feature pairs so attention can sense relative position.": "旋转成对特征，让注意力感知相对位置。",
  "Choose the reduction axis": "选择归约维度",
  "For X with shape [batch,tokens,features], these norms reduce over features of each token, not over unrelated requests. The toy vector is [1,2,3,4].": "对形状 [批次,token,特征] 的 X，这两种归一化沿单个 token 的特征维归约，而不跨独立请求。示例向量为 [1,2,3,4]。",
  "Compute the statistic": "计算统计量",
  "RMSNorm uses mean square 7.5. LayerNorm subtracts mean 2.5 and uses variance 1.25. ε prevents division by zero.": "RMSNorm 使用均方 7.5；LayerNorm 减去均值 2.5，并使用方差 1.25。ε 防止除零。",
  "Scale and optionally shift": "缩放并按需平移",
  "With γ=1 and b=0, RMSNorm gives [0.365,0.730,1.095,1.461]; LayerNorm gives [−1.342,−0.447,0.447,1.342], ignoring tiny ε.": "令 γ=1、b=0，忽略很小的 ε，RMSNorm 得 [0.365,0.730,1.095,1.461]；LayerNorm 得 [−1.342,−0.447,0.447,1.342]。",
  "Place it relative to the residual": "确定与残差的相对位置",
  "A pre-norm block applies F(norm(x)) before adding x. Norm placement and accumulation precision affect stability; RMSNorm and LayerNorm are not interchangeable checkpoints.": "前置归一化块先计算 F(norm(x))，再加上 x。归一化位置和累积精度影响稳定性；RMSNorm 与 LayerNorm 不能随意替换。",
  "A memory-bound operator": "常受显存带宽限制的算子",
  "The arithmetic is small compared with large GEMMs. Implementations often fuse residual addition, statistics and affine scaling, while retaining numerically safe accumulation.": "与大型 GEMM 相比，其算术量较小。实现常融合残差相加、统计量和仿射缩放，同时保持稳定的累积精度。",
  "Normalization": "归一化",
  "Rescale each token’s feature vector before the next sublayer.": "在下一子层前，重新缩放每个 token 的特征向量。",
  "Expand in two branches": "双分支扩展",
  "For x=[1,2], choose illustrative projections g=[1,2] and u=[3,−1]. In a real block both are learned D→F matrix multiplications.": "令 x=[1,2]，示意投影为 g=[1,2]、u=[3,−1]。真实网络中，两者都是学习得到的 D→F 矩阵乘法。",
  "Apply a nonlinear gate": "施加非线性门控",
  "SiLU(z)=z·sigmoid(z). The gate becomes about [0.731,1.762]. GELU FFNs instead use a single expanded activation branch.": "SiLU(z)=z·sigmoid(z)，门值约为 [0.731,1.762]。GELU FFN 则只用一个扩展激活分支。",
  "Multiply elementwise": "逐元素相乘",
  "The SwiGLU hidden vector is [2.193,−1.762]. This multiplication is local to each hidden feature; it is not an attention matrix.": "SwiGLU 隐藏向量为 [2.193,−1.762]。这里沿隐藏特征逐元素相乘，不是注意力矩阵。",
  "Project back to the residual width": "投影回残差宽度",
  "Wd maps F features back to D. Column-parallel expansion and row-parallel contraction can keep the intermediate features sharded.": "Wd 把 F 维特征映回 D 维；列并行扩展和行并行收缩可让中间特征一直保持分片。",
  "Dense FFN vs experts": "稠密 FFN 与专家",
  "A dense FFN processes every token with the same weights. MoE replaces some FFNs with multiple parameter sets and a token-dependent router; an expert is usually an FFN, not a complete language model.": "稠密 FFN 对所有 token 使用同一套权重。MoE 把部分 FFN 换成多套参数和依 token 变化的路由器；一个专家通常是 FFN，而非完整语言模型。",
  "Feed-forward networks": "前馈网络",
  "Expand features, gate locally, then project back.": "扩展特征，执行本地门控，再投影回原维度。",
  "Score experts per token": "逐 token 评分专家",
  "A router projects token features to E expert scores. The toy probabilities [0.1,0.5,0.3,0.1] favor experts 1 and 2.": "路由器将 token 特征投影为 E 个专家评分。示例概率 [0.1,0.5,0.3,0.1] 优先选择专家 1、2。",
  "Choose top-k and pack": "选择 top-k 并打包",
  "Select two experts and renormalize their combine weights to [0.625,0.375] in this toy rule. Dispatch carries token IDs so outputs can be restored.": "选择两个专家，在本例规则中将组合权重归一化为 [0.625,0.375]。分发携带 token 编号，以便恢复输出顺序。",
  "Run expert matrix products": "执行专家矩阵乘法",
  "If their outputs are [4,0] and [0,8], combine them into [2.5,3]. An always-on shared expert returning [1,1] changes the result to [3.5,4].": "若两个专家输出 [4,0]、[0,8]，加权结果为 [2.5,3]；若常驻共享专家另输出 [1,1]，总结果为 [3.5,4]。",
  "Return and combine": "返回并组合",
  "Expert parallelism adds dispatch and return exchanges. Active parameter counts describe selected computation, not total weight storage or total serving memory.": "专家并行增加分发与返回交换。激活参数量描述被选中的计算，不等于总权重存储量或服务总内存。",
  "Routing rules are model-specific": "路由规则随模型变化",
  "DeepSeek can separate selection bias from the combine weights, use group limits or hash-routed early layers. Shared experts, capacity constraints and score transforms differ; the four-expert example is not a literal production router.": "DeepSeek 可把选择偏置与组合权重分离，并使用组约束或早期层哈希路由。共享专家、容量约束、评分变换也各不相同；四专家示例不是生产路由器的逐项复现。",
  "MoE routing": "MoE 路由",
  "Select a few experts, execute their FFNs, then combine outputs.": "选择少量专家，执行各自 FFN，再合并输出。",
  "Compress the token features": "压缩 token 特征",
  "A down-projection maps x into a shared KV latent. The toy shrinks eight features to two; DeepSeek-V3 uses a 512-dimensional KV latent.": "下投影把 x 映射为共享 KV 潜变量。示例将八维缩为二维；DeepSeek-V3 的 KV 潜变量维度为 512。",
  "Separate positional information": "分离位置信息",
  "A separate rotary key component preserves position. DeepSeek-V3 caches the 512 latent values plus 64 rotary-key values per token per layer, before metadata or quantization.": "另设旋转键分量保留位置。DeepSeek-V3 每层每 token 缓存 512 个潜变量值及 64 个旋转键值，尚未计元数据或量化。",
  "Attend through latent projections": "通过潜变量投影计算注意力",
  "Conceptually up-project content keys and values for each head. Optimized decode absorbs compatible matrices into query/output projections and avoids materializing all expanded history.": "概念上为每头上投影内容键和值；优化解码可把兼容矩阵吸收到查询 / 输出投影中，避免展开全部历史。",
  "Produce the head outputs": "生成各头输出",
  "Softmax weights still distinguish context positions. Latent caching changes the representation and memory cost; it does not eliminate attention or make it identical to GQA.": "softmax 权重仍区分上下文位置。潜变量缓存改变表示和内存成本，并不消除注意力，也不等同于 GQA。",
  "A precise cache comparison": "精确定义缓存比较",
  "For V3, a conceptual expanded head has 192 key components (128 content + 64 rotary) and 128 value components across 128 heads. Some rotary information is shared, so compare actual layouts and scalar counts rather than equating num_key_value_heads with cache size.": "V3 概念上的展开头有 192 个键分量（128 内容 + 64 旋转）、128 个值分量，共 128 头。部分旋转信息共享，因此应比较实际布局与标量数，而不能直接用 num_key_value_heads 推算 MLA 缓存量。",
  "Multi-head Latent Attention": "多头潜在注意力",
  "Cache a compact latent instead of expanded K/V for every head.": "缓存紧凑潜变量，而非每个头展开后的 K/V。",
  "Score with a lightweight indexer": "用轻量索引器评分",
  "The indexer uses a cheaper learned representation than main attention. Only causal positions can become candidates.": "索引器使用比主注意力更便宜的学习表示；只有因果可见位置能进入候选集合。",
  "Select context positions": "选择上下文位置",
  "For toy scores [0.1,0.8,0.2,0.7,0.4,0.9], top-2 chooses positions 1 and 5. Real V3.2 uses a much larger configured top-k.": "示例评分 [0.1,0.8,0.2,0.7,0.4,0.9] 的 top-2 为位置 1、5；真实 V3.2 使用更大的配置 top-k。",
  "Gather selected latent KV": "收集选中的潜变量 KV",
  "Fetch selected entries from the MLA cache and compute main attention over that set. The main score and indexer score have different roles.": "从 MLA 缓存读取选中项，并在该集合上计算主注意力。主注意力评分与索引器评分承担不同职责。",
  "Normalize only the selected set": "只在选中集合上归一化",
  "The resulting softmax is over selected causal entries. Sparsity reduces main attention work but adds indexing, selection and gather costs.": "softmax 只覆盖选中的因果项。稀疏化减少主注意力工作，但增加索引、选择和收集成本。",
  "Not the same as FlashAttention": "与 FlashAttention 不同",
  "DSA changes the participating key set and is trained for that architecture. FlashAttention preserves dense semantics while changing IO scheduling.": "DSA 改变参与的键集合，并为此架构专门训练；FlashAttention 保持稠密语义，只改变 IO 调度。",
  "DeepSeek Sparse Attention": "DeepSeek 稀疏注意力",
  "A lightweight indexer chooses the context positions to attend.": "轻量索引器选择需要关注的上下文位置。",
  "Keep recent tokens locally": "保留近期局部 token",
  "DeepSeek-V4 combines a 128-token sliding window with layer-dependent compressed history. The small diagram uses shorter groups for legibility.": "DeepSeek-V4 将 128-token 滑动窗口与按层配置的压缩历史结合；小图用更短分组以方便观察。",
  "Compress groups into memory entries": "将分组压成记忆项",
  "Learned compression summarizes past groups before attention. V4 configs include compression ratios 4 and 128; the representation is not a simple arithmetic mean.": "学习式压缩在注意力前汇总历史分组。V4 配置包含 4、128 两类压缩比；其表示不是简单算术平均。",
  "Select or attend compressed history": "选择或关注压缩历史",
  "CSA uses an indexer to select compressed entries; HCA attends a more heavily compressed history. Each path is combined with the local window according to the layer.": "CSA 用索引器选择压缩项；HCA 关注压缩程度更高的历史。各层按其配置与局部窗口结合。",
  "Preserve causal visibility": "保持因果可见性",
  "A compressed entry must be available before use and must not leak future tokens. Compression changes the model, rather than acting as a lossless dense-attention kernel.": "压缩项必须在使用前就绪，且不能泄露未来 token。压缩改变模型本身，而不是无损的稠密注意力内核优化。",
  "V4 vs V4.1": "V4 与 V4.1",
  "V4 combines CSA/HCA. V4.1 adds CSA2 cross-layer KV and index reuse, a hierarchical candidate pool, and a causal encoder-decoder split. These are distinct mechanisms and receive their own walkthrough.": "V4 组合 CSA/HCA；V4.1 又增加 CSA2 跨层 KV / 索引复用、分层候选池以及因果编码器-解码器划分。这些机制不同，另有专门动画。",
  "Compressed attention": "压缩注意力",
  "Mix a recent local window with compressed long-range memory.": "把近期局部窗口与压缩的远程记忆结合。",
  "Expand the residual streams": "扩展残差流",
  "Instead of one D-dimensional stream, maintain several streams. DeepSeek-V4 config uses hc_mult=4; the illustration shows two.": "不再只有一条 D 维残差流，而是维护多条。DeepSeek-V4 配置 hc_mult=4；图中展示两条。",
  "Mix into the sublayer": "混合后送入子层",
  "Hpre combines streams into the input of F, such as attention or an MoE. Hpost routes the sublayer result back into the streams.": "Hpre 将多流混成 F 的输入，F 可以是注意力或 MoE；Hpost 再将子层结果分配回多流。",
  "Constrain the residual mixing": "约束残差混合",
  "Sinkhorn-style row/column normalization constrains Hres toward a doubly stochastic matrix. The toy [[0.8,0.2],[0.2,0.8]] has row and column sums of one.": "Sinkhorn 式行列归一化使 Hres 逼近双随机矩阵。示例 [[0.8,0.2],[0.2,0.8]] 的每行、每列之和均为一。",
  "Combine both paths": "组合两条路径",
  "Add the mixed residual path and the redistributed sublayer output. The doubly stochastic constraint concerns Hres; it does not require every gate matrix to have that property.": "将混合残差路径与重新分配的子层输出相加。双随机约束针对 Hres，并非所有门矩阵都要求具有这一性质。",
  "Architecture, not a network collective": "架构机制，不是网络集合通信",
  "Residual streams live inside a model block. mHC is not AllReduce across GPUs. V4.1 introduces a revised Single-Pass mHC implementation; the figure explains the common mixing principle.": "残差流存在于模型块内部，mHC 不是 GPU 之间的 AllReduce。V4.1 引入改进的 Single-Pass mHC 实现；图示解释共同的混合原理。",
  "Hyper-connections · mHC": "超连接 · mHC",
  "Carry several residual streams and constrain how they mix.": "维护多条残差流，并约束它们的混合方式。",
  "Project the current input": "投影当前输入",
  "Mamba generates input-dependent step sizes and B/C parameters, with a short convolution and gates around the state-space core.": "Mamba 根据输入生成步长与 B/C 参数，并在状态空间核心前后使用短卷积和门控。",
  "Discretize the dynamics": "离散化状态动力学",
  "The continuous A and selected step Δ determine Ā, typically exp(ΔA). The input contribution B̄ must use the implementation’s matching discretization.": "连续系统 A 与选定步长 Δ 决定 Ā，通常为 exp(ΔA)；输入项 B̄ 必须使用实现中匹配的离散化规则。",
  "Update the state": "更新状态",
  "The scalar illustration uses x=[2,1,3], Ā=[0.5,0.8,0.2], B̄=1 and h₀=0, producing states 2, 2.6 and 3.52.": "标量示例取 x=[2,1,3]、Ā=[0.5,0.8,0.2]、B̄=1、h₀=0，依次得到状态 2、2.6、3.52。",
  "Scan in training; recur at decode": "训练时扫描，解码时递推",
  "Associative affine-map composition enables parallel/chunked training algorithms. Decode updates a fixed-size state instead of appending a full attention KV history.": "仿射映射可结合的复合规则支持并行 / 分块训练；解码更新固定大小状态，而不追加完整注意力 KV 历史。",
  "Mamba-1 vs Mamba-2": "Mamba-1 与 Mamba-2",
  "Mamba-2 uses structured state-space duality and a restricted state structure for efficient matrix-multiply-based algorithms. A scalar recurrence illustrates dependence, not all model projections or head structure.": "Mamba-2 使用结构化状态空间对偶与受限状态结构，以支持高效矩阵乘法算法。标量递推仅说明依赖，并不包含全部模型投影或头结构。",
  "Selective state spaces": "选择性状态空间",
  "Summarize sequence history in an input-dependent recurrent state.": "用依输入变化的递归状态汇总序列历史。",
  "Build Q/K/V and gates": "生成 Q/K/V 与门控",
  "Hybrid Qwen models use projections, short convolution and normalized keys around a recurrent linear-attention core. λ controls forgetting and β controls the write strength.": "混合 Qwen 在递归线性注意力核心周围使用投影、短卷积和键归一化。λ 控制遗忘，β 控制写入强度。",
  "Decay and predict": "衰减并预测",
  "Start from a 2×2 zero memory. Decay the old state and read its prediction for the new key as kᵀS̄.": "从 2×2 零记忆开始。先衰减旧状态，再用新键读出预测 kᵀS̄。",
  "Write the error, not the full value": "写入误差，而非整个值",
  "With k=[1,0], v=[2,1] and β=0.5, the first row becomes [1,0.5]. A later write to the same key corrects that row rather than blindly accumulating v.": "取 k=[1,0]、v=[2,1]、β=0.5，首行变为 [1,0.5]。同一键的后续写入会修正该行，而非盲目累加 v。",
  "Read from the updated memory": "读取更新后的记忆",
  "The query reads qᵀSₜ, followed by model-specific output normalization and gates. Fixed recurrent state does not mean unlimited exact recall of all tokens.": "查询读取 qᵀSₜ，之后还有模型特定的输出归一化与门控。固定递归状态不代表能无限、精确地回忆全部 token。",
  "Why hybrids retain full attention": "为什么混合模型仍保留完整注意力",
  "Qwen3-Next and the cited Qwen3.5/3.8 configs insert full attention periodically. Linear layers keep recurrent/conv states, while full-attention layers still grow their KV caches with context length.": "Qwen3-Next 及所引 Qwen3.5/3.8 配置周期性插入完整注意力。线性层保存递归 / 卷积状态，完整注意力层的 KV 缓存仍随上下文增长。",
  "Gated DeltaNet": "门控 DeltaNet",
  "Decay memory, predict a value, then write only the residual error.": "衰减记忆、预测值，再仅写入预测误差。",
  "Mix neighboring token features": "混合邻近 token 特征",
  "Time-mixing forms receptance, decay, key and value features using the current input and token-shift information. Channel mixing supplies a separate tokenwise nonlinear block.": "时间混合利用当前输入和 token 位移信息，形成接纳、衰减、键和值特征；通道混合提供独立的逐 token 非线性块。",
  "Decay the matrix state": "衰减矩阵状态",
  "Apply learned decay w to the previous matrix state. RWKV-6 uses a related decay-plus-KV state update; RWKV-7 adds a state-dependent rank-one term.": "对旧矩阵状态施加学习到的衰减 w。RWKV-6 使用相关的衰减加 KV 更新；RWKV-7 另加入依状态变化的秩一项。",
  "Modify and write memory": "修改并写入记忆",
  "The RWKV-7 term (Sa)bᵀ modifies existing associations, then vkᵀ writes new content. The diagram separates these terms with 2×2 illustrative matrices.": "RWKV-7 的 (Sa)bᵀ 修改已有联结，再由 vkᵀ 写入新内容。图中用 2×2 示意矩阵分别展示这些项。",
  "Read, gate and project": "读取、门控与投影",
  "A receptance/query-like vector reads the state; normalization, extra terms and output gates complete the actual block. Decode carries the state between tokens without a Transformer-style history KV cache.": "接纳 / 类查询向量读取状态，再由归一化、附加项和输出门完成真实模型块。解码跨 token 携带状态，无需 Transformer 式历史 KV 缓存。",
  "A family with real version changes": "版本间存在真实架构差异",
  "RWKV-7 is not simply a renamed RWKV-6 recurrence. The displayed equation explains the core generalized delta-rule form; the cited implementation also contains low-rank parameterizations, value residuals and channel-mixing details.": "RWKV-7 不是改名后的 RWKV-6 递推。展示的方程说明广义 delta-rule 核心；所引实现还包括低秩参数化、值残差、通道混合等细节。",
  "RWKV state update": "RWKV 状态更新",
  "Combine token-shift features, a recurrent matrix memory, and channel mixing.": "结合 token 位移特征、递归矩阵记忆与通道混合。",
  "Choose a receptive field": "选定感受野",
  "The toy input is a 4×4 grid containing 1…16. A 2×2 filter [[1,0],[0,1]], stride 1 and no padding produce a 3×3 output.": "示例输入是包含 1…16 的 4×4 网格。卷积核 [[1,0],[0,1]]、步幅 1、无填充，输出为 3×3。",
  "Multiply and sum locally": "局部相乘并求和",
  "The first window gives 1+6=7. Slide right for 2+7=9, then continue over the image. The weights are shared at every location.": "首窗口为 1+6=7；右移后为 2+7=9，再遍历图像。每个位置共享同一卷积核权重。",
  "Accumulate channels and filters": "累积通道与不同卷积核",
  "A full convolution sums across input channels and uses different filters for output channels. Depthwise convolution restricts this connectivity.": "完整卷积跨输入通道求和，并用不同卷积核生成输出通道；深度卷积则限制通道连接关系。",
  "Implement as efficient kernels": "实现为高效内核",
  "Libraries may use implicit GEMM, direct convolution or transformed algorithms. Padding, stride and dilation determine output shape and boundary behavior.": "库可使用隐式 GEMM、直接卷积或变换算法。填充、步幅、膨胀率决定输出形状和边界行为。",
  "Locality vs attention": "局部性与注意力",
  "Convolution has a local receptive field and shared spatial weights. Attention uses content-dependent mixing; stacking layers or using dilation expands a CNN’s effective receptive field.": "卷积具有局部感受野及空间共享权重；注意力按内容混合。堆叠层或使用膨胀卷积可扩大 CNN 的有效感受野。",
  "Convolution": "卷积",
  "Slide shared filters over local neighborhoods.": "用共享卷积核滑过局部邻域。",
  "Construct a training example": "构造训练样本",
  "DDPM samples a time t and noise ε to corrupt a clean image/latent. Rectified-flow examples interpolate between noise z and data and predict a velocity.": "DDPM 采样时间 t 和噪声 ε，扰动干净图像 / 潜变量。整流流示例在噪声 z 与数据之间插值，并预测速度。",
  "Predict the chosen target": "预测选定目标",
  "The target can be ε, velocity v, or another parameterization. Conditioning and the time embedding are inputs to the denoiser.": "目标可以是 ε、速度 v 或其他参数化；条件与时间嵌入一起输入去噪网络。",
  "Take one scheduler step": "执行一次调度器更新",
  "For flow’s noise→data convention, Euler gives xₜ₊Δ=xₜ+Δvθ(xₜ,t). DDPM uses its corresponding reverse-process mean and optional noise; these are not the same update.": "在流的“噪声→数据”约定下，欧拉步为 xₜ₊Δ=xₜ+Δvθ(xₜ,t)。DDPM 使用相应逆过程均值及可选噪声；二者更新规则不同。",
  "Reuse weights across steps": "跨步复用权重",
  "Repeat the denoiser with updated t and x; do not confuse the number of sampling steps with network depth. Decode a latent image with a VAE when needed.": "更新 t、x 后重复使用同一去噪网络，不要把采样步数当作网络深度；潜空间图像最后按需用 VAE 解码。",
  "Classifier-free guidance": "无分类器引导",
  "A common form is prediction_uncond+s·(prediction_cond−prediction_uncond). Some distilled models instead consume a guidance embedding and need a different sampler configuration.": "常见形式为 prediction_uncond+s·(prediction_cond−prediction_uncond)。部分蒸馏模型改为输入引导嵌入，采样器配置也相应不同。",
  "Diffusion & flow updates": "扩散与流更新",
  "Learn how to remove noise, then reuse the network across time steps.": "学习如何去除噪声，再跨时间步复用同一网络。",
  "Encode the prompt causally": "因果编码提示词",
  "V4.1-Flash has a 20-layer causal encoder followed by a 20-layer decoder. This is not a bidirectional encoder reading future tokens.": "V4.1-Flash 由 20 层因果编码器及 20 层解码器构成；编码器并非能看到未来 token 的双向编码器。",
  "Project shared decoder memory": "投影共享解码器记忆",
  "Decoder global KV is projected from final encoder hidden states rather than each decoder layer’s own hidden states. Prefill can prepare this memory without running the full decoder path for every input position.": "解码器全局 KV 由最终编码器隐藏状态投影而来，而非由每层解码器自身隐藏状态生成；预填充可据此准备记忆，不必为每个输入位置执行完整解码器路径。",
  "Use Full, Reindex or Reuse mode": "使用 Full、Reindex、Reuse 模式",
  "A Full layer creates main KV and indexer state; Reindex layers reuse main KV while refreshing sparse selection; Reuse layers also reuse selected indices. Actual source-layer IDs are fixed by the released configuration.": "Full 层生成主 KV 与索引器状态；Reindex 层复用主 KV 并刷新稀疏选择；Reuse 层还复用已选索引。实际源层编号由发布配置确定。",
  "Bound later indexer work": "约束后续索引工作量",
  "A hierarchical decoder indexer restricts deeper selection to an earlier candidate pool. Global FP4 KV, local sliding-window replay and cross-layer reuse are separate cache mechanisms.": "分层解码索引器把更深层的选择限制在较早候选池内。全局 FP4 KV、局部滑窗重放及跨层复用是不同的缓存机制。",
  "Read reported cache numbers carefully": "准确理解报告中的缓存数字",
  "The card reports 890 bytes/token for global KV under its FP4 format. That is not total model memory: local states, indices, buffers, metadata, weights and batch concurrency also matter.": "模型卡在其 FP4 格式下报告全局 KV 为 890 字节 / token；这不是模型总内存，还需计局部状态、索引、缓冲、元数据、权重和批次并发。",
  "Cross-layer KV reuse · CSA2": "跨层 KV 复用 · CSA2",
  "Separate producing memory from repeatedly querying it.": "把生成记忆与重复查询记忆分开。",
  "Build token-history keys": "生成 token 历史键",
  "Use local token n-grams to determine lookup IDs. This is conditional memory indexed by token history, not semantic document retrieval.": "用局部 token n-gram 决定查找编号。这是按 token 历史索引的条件记忆，不是语义文档检索。",
  "Fetch sparse memory rows": "读取稀疏记忆行",
  "Only selected embedding rows are read for each token. Large total table capacity can coexist with sparse per-token access.": "每个 token 只读取选中的嵌入表行；很大的总表容量可与稀疏的逐 token 访问并存。",
  "Project and gate retrieved features": "投影并门控检索特征",
  "The implementation projects and gates the retrieved features before fusing them with the model hidden state. The toy hashes and row values are illustrative, not the production hash.": "实现先投影、门控检索特征，再与模型隐藏状态融合。示例哈希和表值仅作示意，并非生产哈希函数。",
  "Place memory at selected layers": "在选定层使用记忆",
  "V4.1 config lists Engram at layers 1 and 14 (zero-based). Its model card reports 196B conditional-memory parameters separately from 552B backbone parameters.": "V4.1 配置将 Engram 放在第 1、14 层（从零开始）；模型卡另行报告 196B 条件记忆参数及 552B 主干参数。",
  "Not MoE routing or a KV cache": "不同于 MoE 路由与 KV 缓存",
  "MoE selects computed FFNs; Engram retrieves learned table rows. A KV cache stores request-specific attention history. These mechanisms use different keys and store different state.": "MoE 选择要计算的 FFN；Engram 检索学习得到的表行；KV 缓存保存请求特定的注意力历史。三者的键和保存的状态都不同。",
  "Engram conditional memory": "Engram 条件记忆",
  "Retrieve sparse learned memory using token-derived lookup keys.": "用 token 派生的查找键读取稀疏学习记忆。",
  "Propose draft tokens": "提出草稿 token",
  "A cheaper model, prediction head, or semi-autoregressive drafter proposes several future tokens. Drafts are hypotheses, not yet committed output.": "廉价模型、预测头或半自回归草稿器提出多个未来 token；草稿只是候选，尚未成为正式输出。",
  "Verify with the target": "用目标模型验证",
  "The target evaluates the candidate positions in a batch while preserving causal dependencies. The toy candidate A,B,C,D matches target A,B,X at its first mismatch.": "目标模型在保持因果依赖的同时批量评估候选位置。示例草稿 A,B,C,D 与目标 A,B,X 在第三位置首次不符。",
  "Commit a prefix and repair": "提交前缀并修正",
  "In the greedy illustration accept A,B, append X, and discard the remaining draft. Exact sampling needs an acceptance/rejection rule and correction distribution, not just greedy equality.": "贪心示例接受 A,B，追加 X，并丢弃剩余草稿。精确采样需要接受 / 拒绝规则及修正分布，不能只比较贪心结果。",
  "Manage cache lifetimes": "管理缓存生命周期",
  "Tentative KV entries after the rejected position must be discarded or rolled back. DSpark adds a specific semi-autoregressive draft and confidence-scheduled verification design; this animation explains the common verification principle.": "被拒位置之后的临时 KV 项必须丢弃或回滚。DSpark 另有特定半自回归草稿及置信度调度验证设计；动画解释共同的验证原理。",
  "More draft tokens do not guarantee speedup": "草稿更多不保证更快",
  "Benefit depends on acceptance, draft cost, verification efficiency and memory bandwidth. MTP training, a generic speculative algorithm, and a particular DSpark implementation are related but distinct.": "收益取决于接受率、草稿成本、验证效率和显存带宽。MTP 训练、通用推测算法、具体 DSpark 实现相关，但并非同一件事。",
  "Speculative decoding": "推测解码",
  "Draft several tokens, verify them together, keep a valid prefix.": "草拟多个 token，批量验证，并保留有效前缀。",
  "Token IDs": "Token 编号",
  "Tokenize the sequence": "对序列分词",
  "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate.": "Token 编号选择嵌入表中的行；填充与注意力掩码描述参与计算的位置。",
  "Embedding": "词嵌入",
  "Build token representations": "生成 token 表示",
  "Embed tokens into width D; this blueprint uses position embeddings positional handling. Vocabulary size and hidden width are separate dimensions.": "将 token 嵌入 D 维；此蓝图使用 position embeddings 位置处理。词表大小与隐藏宽度是不同维度。",
  "LayerNorm": "LayerNorm",
  "Normalize the attention input": "归一化注意力输入",
  "A pre-norm sublayer transforms the normalized input while preserving a residual path.": "前置归一化子层变换归一化输入，同时保留残差路径。",
  "MHA": "MHA",
  "Mix information across positions": "跨位置混合信息",
  "The MHA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "MHA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "+ residual": "+ 残差",
  "Add the attention residual": "加上注意力残差",
  "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference.": "将注意力结果加到输入残差流；mHC 模型改为混合多条残差流，另有专门视图解释区别。",
  "Normalize for channel mixing": "为通道混合归一化",
  "The next pre-norm prepares token features for a dense FFN or selected expert FFNs.": "下一次前置归一化为稠密 FFN 或选中专家 FFN 准备 token 特征。",
  "GELU": "GELU",
  "Transform token features": "变换 token 特征",
  "GELU expands and contracts feature dimensions; add its output through the model’s residual rule.": "GELU 扩展、收缩特征维度，并按模型的残差规则加入输出。",
  "Repeat blocks": "重复模型块",
  "Repeat the layer stack": "重复层堆栈",
  "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps.": "每层有自己的学习权重；重复堆栈不同于跨采样步复用同一个扩散去噪器。",
  "Norm + LM head": "归一化 + 词表头",
  "Project to vocabulary logits": "投影为词表 logits",
  "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific.": "最终归一化和词表投影将隐藏特征映为下一 token 评分；是否共享嵌入 / 输出权重由模型决定。",
  "Next token": "下一 token",
  "Generate or evaluate a token": "生成或评估 token",
  "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing.": "推理采样或选择下一 token；训练与移位标签比较 logits。在 teacher forcing 中，不会把提示词逐 token 重新生成。",
  "Three layouts": "三种布局",
  "Decoder-only uses causal self-attention for generation. Encoder-only uses bidirectional attention for representations. Encoder-decoder uses an encoder and a causal decoder with cross-attention to encoder outputs.": "仅解码器用因果自注意力生成；仅编码器用双向注意力提取表示；编码器-解码器由编码器及可交叉关注编码输出的因果解码器组成。",
  "The diagram’s scope": "图示范围",
  "The animated blueprint is a pre-norm decoder example, not a claim that the original 2017 encoder-decoder used this exact norm placement. Model pages specify the actual family.": "动画展示前置归一化解码器示例，并非声称 2017 年原始编码器-解码器采用完全相同的归一化位置；各模型页另行说明实际家族。",
  "Transformer": "Transformer",
  "Attention mixes positions; FFNs mix features.": "注意力混合位置，FFN 混合特征。",
  "A reusable block combines attention, a tokenwise feed-forward network, normalization and residual paths. Decoder-only, encoder-only and encoder-decoder layouts differ in masks and cross-attention.": "可复用模型块组合注意力、逐 token 前馈网络、归一化与残差路径。仅解码器、仅编码器和编码器-解码器布局的掩码与交叉注意力不同。",
  "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions.": "将 token 嵌入 D 维；此蓝图使用 RoPE 位置处理。词表大小与隐藏宽度是不同维度。",
  "RMSNorm": "RMSNorm",
  "The Attention block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "Attention 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "Routed + shared FFNs": "Routed + shared FFNs",
  "Routed + shared FFNs expands and contracts feature dimensions; add its output through the model’s residual rule.": "Routed + shared FFNs 扩展、收缩特征维度，并按模型的残差规则加入输出。",
  "Active is not resident": "激活量不等于常驻量",
  "Activating 37B parameters does not mean a 671B model fits in 37B-parameter storage. The entire required expert set must be placed in some memory tier, with routing and communication overhead.": "激活 37B 参数不意味着 671B 模型只需 37B 参数的存储。所需专家全集仍要放在某种存储层，并承担路由与通信开销。",
  "Link to distributed execution": "连接分布式执行",
  "Expert parallelism distributes expert weights; tensor parallelism can split each expert’s matrix products. These execution strategies do not redefine the MoE architecture.": "专家并行分布专家权重，张量并行可拆分每个专家的矩阵乘法；这些执行策略并不重新定义 MoE 架构。",
  "Mixture of Experts": "混合专家",
  "Many stored experts. A small selected computation.": "保存许多专家，每次只计算少量选中专家。",
  "MoE is usually a replacement for selected FFN blocks inside a larger backbone. A router selects experts per token; shared experts may run for every token.": "MoE 通常替换更大主干内的部分 FFN 块。路由器逐 token 选择专家；共享专家可对所有 token 运行。",
  "Read the sequence": "读取序列",
  "Inputs are token IDs during language modeling. The state starts at zero or a previous request checkpoint.": "语言建模的输入是 token 编号；状态从零或该请求保存的检查点开始。",
  "Embed each token": "嵌入每个 token",
  "Learned token embeddings produce the features consumed by the first recurrent block.": "学习得到的 token 嵌入生成首个递归块的输入特征。",
  "Norm + mix": "归一化 + 混合",
  "Prepare gated features": "准备门控特征",
  "Input projections, normalization and short-range mixing prepare keys, values or state-space parameters.": "输入投影、归一化与短程混合准备键、值或状态空间参数。",
  "RWKV-7": "RWKV-7",
  "Update the sequence state": "更新序列状态",
  "RWKV-7 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys.": "RWKV-7 跨位置传播紧凑状态，并非对全部历史键列表执行 softmax。",
  "Read + gate": "读取 + 门控",
  "Read the current state": "读取当前状态",
  "A learned readout and output gate convert memory into token features, then return to the residual stream.": "学习得到的读出与输出门把记忆转成 token 特征，再返回残差流。",
  "Channel mix": "通道混合",
  "Mix feature channels": "混合特征通道",
  "Version-specific nonlinear blocks transform each token independently of the sequence-state update.": "按版本配置的非线性块独立变换各 token 特征，与序列状态更新相区分。",
  "Repeat + head": "重复 + 词表头",
  "Run the stack and output head": "执行堆栈与输出头",
  "Repeat the learned blocks and map the final features to vocabulary scores.": "重复学习到的模型块，并将最终特征映射为词表评分。",
  "Token + state": "Token + 状态",
  "Carry state to the next token": "向下一 token 传递状态",
  "Each request keeps its own recurrent state. Training can use parallel/chunked kernels while preserving the recurrence.": "每个请求保留独立递归状态；训练可使用并行 / 分块内核，同时保持递推关系。",
  "Training vs inference": "训练与推理",
  "Parallel/chunked training kernels can evaluate the recurrence efficiently. Tokenwise inference reuses the previous state; constant sequence-state size does not imply zero temporary workspace or unbounded exact recall.": "并行 / 分块训练内核可高效计算递推；逐 token 推理复用旧状态。序列状态大小固定，不代表没有临时工作区，也不代表无限精确回忆。",
  "RWKV": "RWKV",
  "A recurrent matrix memory with Transformer-style training opportunities.": "递归矩阵记忆，也可使用并行化训练。",
  "RWKV separates time mixing from channel mixing. It carries request-specific recurrent state instead of the full Transformer-style KV history; its recurrence changes across versions.": "RWKV 将时间混合与通道混合分开，携带请求特定的递归状态，而非完整 Transformer 式 KV 历史；不同版本递推不同。",
  "Mamba-2": "Mamba-2",
  "Mamba-2 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys.": "Mamba-2 跨位置传播紧凑状态，并非对全部历史键列表执行 softmax。",
  "Related, not interchangeable": "相关，但不等同",
  "A selective SSM, Gated DeltaNet and RWKV all carry recurrent state, but their update equations and parameterizations differ. Hybrid models may combine such blocks with full attention.": "选择性 SSM、门控 DeltaNet、RWKV 都携带递归状态，但更新方程和参数化不同；混合模型可把这些块与完整注意力结合。",
  "State-space models · Mamba": "状态空间模型 · Mamba",
  "Select what to remember, forget and read.": "选择要记住、遗忘与读取的信息。",
  "Selective state-space models make parts of the dynamics depend on the input. Mamba combines short convolution, gating and an efficient state-space core.": "选择性状态空间模型使部分状态动力学依赖输入。Mamba 组合短卷积、门控与高效状态空间核心。",
  "Text / condition": "文本 / 条件",
  "Encode the condition": "编码条件",
  "A text encoder or another conditioning network produces features that guide generation.": "文本编码器或其他条件网络生成引导生成过程的特征。",
  "Noise latent": "噪声潜变量",
  "Initialize a latent sample": "初始化潜空间样本",
  "Start from sampled noise for generation; latent models operate at reduced spatial resolution.": "生成时从采样噪声开始；潜空间模型在较低空间分辨率下工作。",
  "Time embedding": "时间嵌入",
  "Tell the network the noise level": "告知网络噪声水平",
  "A time/noise embedding changes the denoiser’s computation at each sampling step.": "时间 / 噪声嵌入在各采样步调节去噪网络计算。",
  "U-Net / DiT": "U-Net / DiT",
  "Predict noise or velocity": "预测噪声或速度",
  "The U-Net / DiT mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers.": "U-Net / DiT 混合空间信息与条件。U-Net 与扩散 Transformer 是不同主干，并非相同层。",
  "Scheduler": "采样调度器",
  "Update the noisy sample": "更新含噪样本",
  "Apply the sampler rule matching the model target and time convention. The operator view contrasts DDPM with flow matching.": "应用与模型目标及时间约定匹配的采样规则；算子视图对比 DDPM 与流匹配。",
  "Repeat steps": "重复采样步",
  "Reuse the denoiser": "复用去噪器",
  "Run the same network weights at the next time value. More steps trade compute and latency for the sampler’s behavior.": "在下一时间值复用同一网络权重；更多步数在计算、延迟与采样器行为间取舍。",
  "VAE decoder": "VAE 解码器",
  "Decode the final image": "解码最终图像",
  "A learned VAE decoder converts the final latent to pixels in latent-diffusion and latent-flow systems.": "潜空间扩散 / 流系统用学习得到的 VAE 解码器将最终潜变量转为像素。",
  "Image": "图像",
  "Return the generated image": "返回生成图像",
  "The output is an image, not vocabulary logits. Denoising-step parallelism differs from autoregressive token dependencies.": "输出是图像，而非词表 logits；去噪步的并行性也不同于自回归 token 依赖。",
  "Objective, backbone and sampler": "目标、主干与采样器",
  "The diffusion/flow objective, U-Net/DiT network, and DDPM/ODE sampler are separate choices. A Transformer backbone does not make image generation autoregressive language modeling.": "扩散 / 流目标、U-Net / DiT 网络、DDPM / ODE 采样器是不同选择。使用 Transformer 主干，不代表图像生成变成自回归语言建模。",
  "Diffusion & flow models": "扩散与流模型",
  "A learned vector field turns noise into structured data.": "学习到的向量场把噪声转为有结构的数据。",
  "A network learns a noise-removal or velocity target across time. Generation repeatedly updates a noisy sample; U-Nets and diffusion Transformers are common backbones.": "网络学习跨时间的去噪或速度目标；生成时反复更新含噪样本。U-Net 与扩散 Transformer 是常见主干。",
  "Start from pixels": "从像素开始",
  "Input channels and spatial axes are explicit.": "输入包含明确的通道与空间轴。",
  "Conv + activation": "卷积 + 激活",
  "Extract local patterns": "提取局部模式",
  "Shared filters detect local features across the image.": "共享卷积核在图像各处提取局部特征。",
  "Downsample": "下采样",
  "Increase the receptive field": "扩大感受野",
  "Stride or pooling reduces spatial size; channels often increase.": "步幅或池化减小空间尺寸，通道数常相应增加。",
  "Residual blocks": "残差块",
  "Build hierarchical features": "构建层次特征",
  "Residual CNN blocks can preserve an identity path while learning transformations.": "残差 CNN 块在学习变换的同时保留恒等路径。",
  "Pool / decoder": "池化 / 解码器",
  "Choose the task head": "选择任务头",
  "Global pooling suits classification; spatial decoders suit dense prediction.": "全局池化适合分类，空间解码器适合密集预测。",
  "Output": "输出",
  "Return task predictions": "返回任务预测",
  "Architecture and output shape depend on classification, segmentation or generation.": "架构与输出形状由分类、分割或生成任务决定。",
  "Shape accounting": "形状计算",
  "For kernel k, padding p, dilation d and stride s, output size is floor((n+2p−d(k−1)−1)/s)+1 on each spatial axis.": "每个空间轴上，卷积核 k、填充 p、膨胀 d、步幅 s 的输出尺寸为 floor((n+2p−d(k−1)−1)/s)+1。",
  "Convolutional networks": "卷积神经网络",
  "Local filters, shared weights, hierarchical features.": "局部卷积核、共享权重、层次特征。",
  "CNNs exploit spatial locality and translation-related weight sharing. A U-Net adds down/up paths and skip features for spatial prediction.": "CNN 利用空间局部性及平移相关的权重共享；U-Net 另加入下采样 / 上采样路径和跳连特征以进行空间预测。",
  "Read an image": "读取图像",
  "The image is a spatial tensor, not token IDs.": "图像是空间张量，而非 token 编号。",
  "Patchify": "图像分块",
  "Turn patches into a sequence": "将图像块变成序列",
  "Split non-overlapping patches; N=(H/P)(W/P) before special tokens.": "划分不重叠图像块；加入特殊 token 前 N=(H/P)(W/P)。",
  "Linear projection": "线性投影",
  "Embed each patch": "嵌入每个图像块",
  "Flatten and project patches to hidden features, or use an equivalent patch convolution.": "将图像块展平并投影为隐藏特征，或使用等效的分块卷积。",
  "Position + blocks": "位置 + 模型块",
  "Mix spatial token features": "混合空间 token 特征",
  "Position information distinguishes patches; attention mixes tokens across the image.": "位置信息区分图像块，注意力跨图像混合 token。",
  "Pool / projector": "池化 / 投影器",
  "Connect to the downstream task": "连接下游任务",
  "Classification may use a special token; a VLM projects visual tokens into its language-model width.": "分类可使用特殊 token；视觉语言模型则把视觉 token 投影为语言模型宽度。",
  "Prediction / tokens": "预测 / Token",
  "Return representations": "返回表示",
  "A vision encoder and a language decoder are separate components even when trained jointly.": "视觉编码器与语言解码器即便联合训练，也仍是不同组件。",
  "Token count drives cost": "视觉 token 数影响成本",
  "Smaller patches or higher resolution increase token count and dense attention work. Model-specific pooling, merging and dynamic-resolution rules change the final visual-token budget.": "更小图像块或更高分辨率会增加 token 数和稠密注意力工作量；模型特定的池化、合并、动态分辨率规则会改变最终视觉 token 预算。",
  "Vision Transformer · ViT": "视觉 Transformer · ViT",
  "Convert patches to tokens, then mix them with attention.": "将图像块转为 token，再通过注意力混合。",
  "ViT applies a Transformer to visual tokens. Vision-language models add projectors or mergers to integrate these features with text.": "ViT 对视觉 token 使用 Transformer；视觉语言模型另用投影器或合并器将这些特征与文本结合。",
  "A specific checkpoint": "具体检查点",
  "The cited main model has 60 layers, width 5120, 160 routed experts with 6 selected, and 2 shared experts; the first FFN layer is dense. Do not apply these numbers to V2-Lite.": "所引主模型有 60 层、宽度 5120、160 个路由专家中选 6 个，以及 2 个共享专家；首个 FFN 层为稠密。不可把这些数字套用到 V2-Lite。",
  "Parameters": "参数",
  "Layers × width": "层数 × 宽度",
  "Query / KV heads": "查询 / KV 头",
  "Routed experts / selected": "路由专家 / 选中数量",
  "MLA and fine-grained experts establish the design.": "MLA 与细粒度专家奠定设计。",
  "V2 combines compressed latent KV with routed and shared expert FFNs. The released main configuration differs materially from the smaller Lite model.": "V2 结合压缩潜变量 KV 与路由 / 共享专家 FFN。发布的主模型配置与较小的 Lite 模型存在实质差异。",
  "MLA": "MLA",
  "The MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "MLA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "MoE": "MoE",
  "MoE expands and contracts feature dimensions; add its output through the model’s residual rule.": "MoE 扩展、收缩特征维度，并按模型的残差规则加入输出。",
  "Architecture vs training techniques": "架构与训练技术",
  "61 layers and 256 routed experts with top-8 plus 1 shared expert describe the backbone. FP8 training, DualPipe scheduling and MTP are different aspects of its training system; MTP is not mandatory multi-token sampling at serving time.": "61 层、256 个路由专家中选 8 个及 1 个共享专家描述主干；FP8 训练、DualPipe 调度、MTP 则是训练系统的不同方面。MTP 并不意味着服务时必须多 token 采样。",
  "Dense early layers": "早期稠密层",
  "The first three FFN layers are dense before the routed-expert layers. Model and operator diagrams are compressed blueprints, not one drawn box per physical layer.": "前三个 FFN 层为稠密层，之后才是路由专家层。图示是压缩蓝图，不会为每个实际层各画一个框。",
  "Keep MLA; scale experts and change the training recipe.": "保留 MLA，扩展专家并改变训练配方。",
  "V3 is a 671B MoE with 37B active parameters. It retains MLA, introduces auxiliary-loss-free load balancing, and adds a multi-token prediction training objective.": "V3 是总参数 671B、激活 37B 的 MoE，保留 MLA，引入无辅助损失负载均衡及多 token 预测训练目标。",
  "Compare config fields": "比较配置字段",
  "The cited V3 and V3.1 share width 7168, 256 routed experts, top-8 and a 512-dimensional KV latent. Checkpoint behavior, tokenizer/prompt conventions and training changes still matter.": "所引 V3 与 V3.1 均为宽度 7168、256 个路由专家、top-8、512 维 KV 潜变量；检查点行为、分词 / 提示格式及训练变化仍很重要。",
  "A new behavior recipe does not imply a new block layout.": "行为配方升级，不一定改变模型块布局。",
  "The cited V3.1 configuration retains the 61-layer MLA-plus-MoE skeleton. Thinking and non-thinking operation are post-training/usage modes, not separate attention architectures.": "所引 V3.1 配置保留 61 层 MLA+MoE 主干。思考 / 非思考是后训练及使用模式，而非两种注意力架构。",
  "What changes from V3.1": "相对 V3.1 改变了什么",
  "The learned lightweight indexer selects context entries; main MLA attends the selected set. Width and expert counts alone cannot reveal this change, so both model type and implementation matter.": "学习得到的轻量索引器选择上下文项，主 MLA 关注选中集合。仅看宽度和专家数量无法发现这一变化，因此模型类型与实现都要核对。",
  "Index the long context before doing main attention.": "先索引长上下文，再计算主注意力。",
  "V3.2 adds DeepSeek Sparse Attention on top of the MLA/MoE backbone. The original Exp release and later V3.2 are distinct checkpoints; this page cites the later model card and config.": "V3.2 在 MLA/MoE 主干上加入 DeepSeek 稀疏注意力。早期 Exp 与后来的 V3.2 是不同检查点；本页引用后者模型卡与配置。",
  "DSA + MLA": "DSA + MLA",
  "The DSA + MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "DSA + MLA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "CSA / HCA": "CSA / HCA",
  "The CSA / HCA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "CSA / HCA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "4 residual streams": "4 条残差流",
  "Mix residual streams with the constrained mHC residual matrix and the sublayer output path.": "用受约束的 mHC 残差矩阵及子层输出路径混合多条残差流。",
  "Run routed/shared experts, then return through another mHC mixing step. Early routing rules differ from later learned routing.": "运行路由 / 共享专家后，再经一次 mHC 混合返回；早期路由规则与后续学习路由不同。",
  "Flash vs Pro": "Flash 与 Pro",
  "The Flash config has 43 layers, width 4096, 256 routed experts and top-6; Pro has 61 layers, width 7168, 384 routed experts and top-6. Both have one shared expert and hc_mult=4.": "Flash 配置为 43 层、宽度 4096、256 个路由专家、top-6；Pro 为 61 层、宽度 7168、384 个路由专家、top-6。两者均有 1 个共享专家及 hc_mult=4。",
  "Precision and cache are separate": "精度与缓存分开理解",
  "Released instruct weights mix FP4 experts with other FP8 weights. This does not mean every activation, buffer or KV cache is FP4. The card’s efficiency comparisons are vendor-reported, not measurements made by this guide.": "发布的指令权重混合 FP4 专家与其他 FP8 权重，不代表所有激活、缓冲或 KV 缓存都是 FP4。模型卡效率比较为厂商报告，并非本指南实测。",
  "Compressed history and multiple residual streams.": "压缩历史与多条残差流。",
  "V4 changes both attention and residual connectivity: CSA/HCA mix compressed history with a local window, while mHC carries multiple residual streams. Flash and Pro have different widths and expert counts.": "V4 同时改变注意力与残差连接：CSA/HCA 把压缩历史与局部窗口结合，mHC 携带多条残差流。Flash、Pro 的宽度和专家数不同。",
  "Text + images": "文本 + 图像",
  "Read multimodal input": "读取多模态输入",
  "Text tokens and optional image features enter one language backbone.": "文本 token 与可选图像特征进入同一语言主干。",
  "Embed / ViT": "嵌入 / ViT",
  "Project images and text": "投影图像与文本",
  "DeepSeek-ViT and an MLP projector prepare image embeddings; text uses token embeddings.": "DeepSeek-ViT 与 MLP 投影器准备图像嵌入；文本使用 token 嵌入。",
  "Causal encoder": "因果编码器",
  "Encode prompt history": "编码提示历史",
  "The encoder is causal. Selected layers also use Engram conditional memory; attention and MoE blocks use the released mHC design.": "编码器是因果模型。部分层还使用 Engram 条件记忆，注意力与 MoE 块使用发布的 mHC 设计。",
  "Encoder states": "编码器状态",
  "Produce reusable representations": "生成可复用表示",
  "Final encoder hidden states are the source for decoder global KV projection.": "最终编码器隐藏状态是解码器全局 KV 投影的来源。",
  "Shared KV": "共享 KV",
  "Build cross-layer memory": "构建跨层记忆",
  "CSA2 shares main KV/indexer state and selected indices according to Full, Reindex and Reuse layer roles.": "CSA2 按 Full、Reindex、Reuse 各层角色共享主 KV / 索引器状态和选中索引。",
  "Causal decoder": "因果解码器",
  "Query shared history": "查询共享历史",
  "The decoder queries encoder-derived global memory. Its local sliding-window state and replay are separate from global KV.": "解码器查询编码器派生的全局记忆；局部滑窗状态及重放与全局 KV 不同。",
  "Vocabulary head": "词表输出头",
  "Produce target logits": "生成目标 logits",
  "The target network scores output tokens; prefill and decode activate different portions of the backbone.": "目标网络为输出 token 评分；预填充与解码激活的主干部分不同。",
  "DSpark option": "可选 DSpark",
  "Optionally draft and verify": "按需草拟并验证",
  "DSpark has a dedicated draft path and confidence scheduling. Verification must preserve target generation semantics.": "DSpark 有专门草稿路径和置信度调度，验证必须保持目标生成语义。",
  "Commit generated text": "提交生成文本",
  "The next token continues the causal generation loop with shared memory and request-specific state.": "下一 token 通过共享记忆与请求特定状态继续因果生成循环。",
  "Do not add unlike parameter counts": "不要混加不同参数口径",
  "The card reports 552B backbone and separately 196B Engram memory. It reports 8B active parameters/token during prefill and 16B during decode. Those phase-dependent numbers are not a uniform per-token weight footprint.": "模型卡报告 552B 主干，并另列 196B Engram 记忆；预填充每 token 激活 8B，解码激活 16B。分阶段数字并非统一的逐 token 权重占用。",
  "Not the original Transformer encoder-decoder": "不同于原始 Transformer 编码器-解码器",
  "Both halves are causal. Shared decoder KV comes from encoder output; the prefill/decode asymmetry and bounded sliding-window replay are central to this design.": "两部分均是因果模型。共享解码器 KV 来自编码器输出；预填充 / 解码的不对称性及有界滑窗重放是核心设计。",
  "A causal encoder-decoder shares global memory across layers.": "因果编码器-解码器跨层共享全局记忆。",
  "V4.1-Flash combines a 20+20 causal encoder-decoder, CSA2 cross-layer KV/index reuse, Single-Pass mHC, Engram lookup memory, multimodal input and DSpark drafting.": "V4.1-Flash 结合 20+20 因果编码器-解码器、CSA2 跨层 KV / 索引复用、Single-Pass mHC、Engram 查表记忆、多模态输入与 DSpark 草稿。",
  "A model name is not a block diagram": "模型名称不等于模型块图",
  "Do not assign full R1’s 671B architecture to R1-Distill-Qwen-7B or R1-Distill-Llama variants. Distillation transfers behavior through training, not by copying every teacher layer.": "不可把完整 R1 的 671B 架构套给 R1-Distill-Qwen-7B 或蒸馏 Llama。蒸馏通过训练迁移行为，不是复制教师的每一层。",
  "Reasoning training on a V3-family backbone.": "在 V3 家族主干上训练推理能力。",
  "The full R1 model retains V3-style MLA and MoE blocks. Its reasoning-focused post-training is a recipe change; R1-distilled Qwen/Llama checkpoints have their own backbones.": "完整 R1 保留 V3 式 MLA 和 MoE 块。面向推理的后训练是配方变化；R1 蒸馏的 Qwen / Llama 检查点保留各自主干。",
  "Read dimensions from the actual checkpoint": "从实际检查点读取维度",
  "Qwen2.5-7B has 28 layers, width 3584 and 28 query heads sharing 4 KV heads. One KV head serves seven query heads in this checkpoint.": "Qwen2.5-7B 为 28 层、宽度 3584，28 个查询头共享 4 个 KV 头；此检查点中每个 KV 头服务 7 个查询头。",
  "A dense decoder with GQA and gated FFNs.": "使用 GQA 与门控 FFN 的稠密解码器。",
  "The 7B checkpoint used here combines RMSNorm, RoPE, grouped-query attention and SwiGLU-style FFNs. Family sizes change head counts and layer dimensions.": "此处采用的 7B 检查点结合 RMSNorm、RoPE、分组查询注意力与 SwiGLU 式 FFN。不同家族尺寸的头数、层维度会变化。",
  "GQA": "GQA",
  "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "GQA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "SwiGLU": "SwiGLU",
  "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule.": "SwiGLU 扩展、收缩特征维度，并按模型的残差规则加入输出。",
  "What changes from Qwen2.5": "相对 Qwen2.5 的变化",
  "The 8B example has 36 layers, width 4096, 32 query heads and 8 KV heads. Qwen3 adds query/key head normalization; thinking behavior is not another attention-head layout.": "8B 示例有 36 层、宽度 4096、32 个查询头、8 个 KV 头。Qwen3 增加查询 / 键头归一化；思考行为不是另一种头布局。",
  "QK normalization and dense feed-forward blocks.": "QK 归一化与稠密前馈块。",
  "Qwen3 includes dense and MoE releases. This page uses the dense 8B configuration; the separate MoE page explains the 235B-A22B checkpoint.": "Qwen3 包括稠密与 MoE 发布。本页采用稠密 8B 配置，另一个 MoE 页解释 235B-A22B 检查点。",
  "Sparse computation, full weight placement": "稀疏计算，完整权重放置",
  "The config has 128 experts with 8 selected per token, 64 query heads and 4 KV heads. About 22B active parameters does not make the complete weight set a 22B model.": "配置有 128 个专家，每 token 选 8 个，64 个查询头及 4 个 KV 头。约 22B 激活参数并不意味着完整权重只有 22B。",
  "The same family also has a routed-expert backbone.": "同一家族也有路由专家主干。",
  "The cited 235B-A22B checkpoint is a 94-layer MoE with GQA. Its expert structure is distinct from Qwen3’s dense checkpoints.": "所引 235B-A22B 检查点是 94 层 GQA MoE，与 Qwen3 稠密检查点的专家结构不同。",
  "Read the layer pattern": "理解层模式",
  "The cited config has full_attention_interval=4, 48 layers, 512 experts and top-10. Linear-attention key/value-head dimensions are separate from full-attention Q/KV heads.": "所引配置 full_attention_interval=4，共 48 层、512 个专家、top-10。线性注意力的键 / 值头维度，与完整注意力 Q/KV 头不同。",
  "Three recurrent blocks, then one full-attention block.": "三个递归块之后，接一个完整注意力块。",
  "Qwen3-Next-80B-A3B alternates Gated DeltaNet and full attention, with sparse expert FFNs. It keeps both recurrent state and attention-layer KV history.": "Qwen3-Next-80B-A3B 交替使用门控 DeltaNet 和完整注意力，配合稀疏专家 FFN；它同时保存递归状态与注意力层 KV 历史。",
  "DeltaNet / GQA": "DeltaNet / GQA",
  "The DeltaNet / GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "DeltaNet / GQA 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "Vision and language are separate components": "视觉与语言是不同组件",
  "The model config contains a text_config and a vision_config. The displayed layer/head counts describe the text backbone, not the combined vision-language system.": "模型配置包含 text_config 与 vision_config；展示的层数 / 头数描述文本主干，而非整个视觉语言系统。",
  "Not every Qwen3.5 is MoE": "并非所有 Qwen3.5 都是 MoE",
  "The family contains different sizes and dense variants. This page names the 397B-A17B checkpoint so expert counts are not silently generalized to every Qwen3.5 release.": "该家族有不同尺寸和稠密变体。本页明确使用 397B-A17B 检查点，不把专家数默认为所有 Qwen3.5 发布都相同。",
  "Hybrid sequence mixing with native visual input.": "混合序列混合器，支持原生视觉输入。",
  "The 397B-A17B example combines a vision encoder with a 60-layer hybrid language backbone: three Gated DeltaNet blocks per full-attention block, plus MoE FFNs.": "397B-A17B 示例把视觉编码器与 60 层混合语言主干结合：每三个门控 DeltaNet 块之后接一个完整注意力块，并使用 MoE FFN。",
  "The concrete 27B layout": "具体的 27B 布局",
  "The card/config give width 5120, 24 full-attention query heads and 4 KV heads; DeltaNet has 16 QK heads and 48 V heads, each dimension 128. These are two different head systems.": "模型卡 / 配置给出宽度 5120，完整注意力有 24 个查询头及 4 个 KV 头；DeltaNet 有 16 个 QK 头、48 个 V 头，维度均为 128。这是两套不同的头系统。",
  "A larger release is not the same graph size": "更大发布并非相同尺寸",
  "The separately cited 2.4T-A95B config is a 92-layer MoE with 512 experts and top-10. Do not copy those expert counts into the dense 27B model.": "另引 2.4T-A95B 配置是 92 层 MoE，512 个专家中选 10 个；不可把专家数套到稠密 27B 模型。",
  "Keep the hybrid foundation; distinguish dense and MoE releases.": "保留混合架构基础，区分稠密与 MoE 发布。",
  "Qwen3.8-27B is a native vision-language dense model built on the Qwen3.5 architecture. Its 64-layer text backbone repeats three Gated DeltaNet blocks and one gated-attention block.": "Qwen3.8-27B 是基于 Qwen3.5 架构的原生视觉语言稠密模型。其 64 层文本主干重复三个门控 DeltaNet 块及一个门控注意力块。",
  "Do not generalize the largest checkpoint": "不要把最大检查点泛化到全系列",
  "GQA is a concrete per-checkpoint property. Model size, layer count and context support must be tied to a specific card rather than inferred from the family name.": "GQA 是具体检查点的属性。尺寸、层数、上下文支持必须对应具体模型卡，不能仅从家族名称推断。",
  "A dense RoPE/SwiGLU decoder; GQA depends on size.": "稠密 RoPE/SwiGLU 解码器；是否使用 GQA 取决于尺寸。",
  "Llama 2 uses pre-normalization, RoPE and gated FFNs. The 70B model uses GQA, while the 7B and 13B variants have different KV-head layouts.": "Llama 2 使用前置归一化、RoPE 和门控 FFN。70B 使用 GQA，7B、13B 则有不同的 KV 头布局。",
  "GQA (70B)": "GQA (70B)",
  "The GQA (70B) block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "GQA (70B) 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "Context extension vs exact recall": "上下文扩展与精确记忆",
  "Long-context positional scaling and training determine usable context behavior. A larger advertised context does not remove KV-cache cost or guarantee perfect retrieval at every position.": "长上下文位置缩放与训练共同决定可用上下文行为；更大的标称上下文不会消除 KV 缓存成本，也不保证每个位置都能完美检索。",
  "A dense GQA backbone with a larger vocabulary and long-context recipe.": "稠密 GQA 主干，更大词表与长上下文配方。",
  "Llama 3.1 retains RMSNorm, RoPE, GQA and SwiGLU-style FFNs. The published family contains 8B, 70B and 405B sizes; it is not an MoE model family.": "Llama 3.1 保留 RMSNorm、RoPE、GQA、SwiGLU 式 FFN。公开家族包含 8B、70B、405B，不是 MoE 家族。",
  "Scout vs Maverick": "Scout 与 Maverick",
  "The card reports Scout at 109B total/17B active with 16 experts, and Maverick at 400B total/17B active with 128 experts. Reported context windows and training mixtures also differ.": "模型卡报告 Scout 为总参数 109B / 激活 17B、16 个专家；Maverick 为总参数 400B / 激活 17B、128 个专家。报告的上下文窗口与训练混合也不同。",
  "Multimodal early fusion": "多模态早期融合",
  "A vision encoder supplies image features to the shared autoregressive backbone. The generic attention/expert diagrams explain operator principles and do not imply every Llama 4 layer is identical.": "视觉编码器向共享自回归主干提供图像特征。通用注意力 / 专家图解释算子原理，并不意味着每个 Llama 4 层完全相同。",
  "Move from dense text models to multimodal experts.": "从稠密文本模型转向多模态专家。",
  "Llama 4 Scout and Maverick use an autoregressive MoE architecture with early fusion of visual and text features. They are not merely scaled Llama 3.1 dense models.": "Llama 4 Scout、Maverick 使用自回归 MoE，并早期融合视觉与文本特征；它们并非仅仅放大 Llama 3.1 稠密模型。",
  "A useful historical baseline": "有用的历史基线",
  "The public small model has 12 layers, width 768 and 12 attention heads. The model.py function named conv1d implements a learned linear projection here, not a spatial CNN convolution.": "公开小模型有 12 层、宽度 768、12 个注意力头。model.py 中名为 conv1d 的函数在此实现学习线性投影，并非空间 CNN 卷积。",
  "Embed tokens into width D; this blueprint uses learned absolute embeddings positional handling. Vocabulary size and hidden width are separate dimensions.": "将 token 嵌入 D 维；此蓝图使用 learned absolute embeddings 位置处理。词表大小与隐藏宽度是不同维度。",
  "A published decoder with learned absolute positions.": "采用学习式绝对位置的公开解码器。",
  "GPT-2’s released implementation uses learned token and position embeddings, pre-LayerNorm attention/MLP blocks, GELU, and a tied vocabulary projection. It does not use RoPE or SwiGLU.": "GPT-2 发布的实现使用学习式 token / 位置嵌入、前置 LayerNorm 注意力 / MLP、GELU、共享词表投影；不使用 RoPE 或 SwiGLU。",
  "Published does not mean open weights": "公开论文不等于开放权重",
  "The paper supplies architectural details, but the original full GPT-3 checkpoints were not released like GPT-2. Do not infer later GPT architectures from GPT-3’s published dimensions.": "论文公开了架构细节，但原始完整 GPT-3 检查点并未像 GPT-2 一样发布。不可从 GPT-3 的公开维度推断后续 GPT 架构。",
  "Embed tokens into width D; this blueprint uses learned positions positional handling. Vocabulary size and hidden width are separate dimensions.": "将 token 嵌入 D 维；此蓝图使用 learned positions 位置处理。词表大小与隐藏宽度是不同维度。",
  "Dense / local sparse": "Dense / local sparse",
  "The Dense / local sparse block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "Dense / local sparse 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "Scale a decoder while keeping a documented attention pattern.": "扩展解码器，同时保留可核查的注意力模式。",
  "The GPT-3 paper describes a GPT-2-style autoregressive architecture with alternating dense and locally banded sparse attention. Its 175B model has 96 layers and hidden width 12288.": "GPT-3 论文描述 GPT-2 式自回归架构，交替采用稠密与局部带状稀疏注意力；175B 模型有 96 层、隐藏宽度 12288。",
  "Read explicit head dimensions": "读取显式头维度",
  "The config has hidden width 2880, 64 query heads and head_dim=64. Do not assume head_dim=hidden_size/num_attention_heads: the query projection can expand to a different width.": "配置隐藏宽度 2880、64 个查询头、head_dim=64。不能假定 head_dim=hidden_size/num_attention_heads；查询投影可扩展到不同宽度。",
  "Precision is selective": "精度是有选择的",
  "The config uses MXFP4 quantization for expert weights while excluding attention, router, token embeddings and output head. This does not make every model tensor four-bit.": "配置对专家权重使用 MXFP4，但排除注意力、路由器、token 嵌入及输出头；并非全部张量都是四位。",
  "An open-weight GPT with MoE and alternating attention windows.": "采用 MoE 及交替注意力窗口的开放权重 GPT。",
  "The 120b checkpoint uses routed expert FFNs, GQA and alternating sliding/full attention. Its released configuration and weights allow a concrete explanation, unlike undisclosed hosted GPT internals.": "120b 检查点采用路由专家 FFN、GQA 以及交替的滑动 / 完整注意力；发布的配置和权重支持具体解释，而非猜测托管 GPT 的未公开内部结构。",
  "GQA + local/full": "GQA + local/full",
  "The GQA + local/full block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior.": "GQA + local/full 模块结合因果序列信息；切换其算子视图可查看评分、缓存或递归状态。",
  "Text / images": "文本 / 图像",
  "Read the documented interface": "读取公开接口",
  "The API documents supported inputs and output modalities. Interface support does not disclose an internal block layout.": "API 文档说明支持的输入、输出模态；接口能力不等于内部模型块布局。",
  "Hosted model": "托管模型",
  "Keep unknown internals unknown": "保留未公开内部结构",
  "The cited GPT-4.1 documentation does not specify layer count, expert topology, hidden width or KV-head dimensions.": "所引 GPT-4.1 文档未给出层数、专家拓扑、隐藏宽度或 KV 头维度。",
  "Generated text": "生成文本",
  "Read the supported outputs": "读取支持的输出",
  "Published capabilities and limits are distinct from architectural specifications. Use GPT-2, GPT-3 or gpt-oss for concrete published operator layouts.": "公开能力与限制不同于架构规格；具体公开算子布局可参阅 GPT-2、GPT-3 或 gpt-oss。",
  "What can be explained": "可以解释什么",
  "Autoregressive generation, attention and MoE are useful general concepts, but applying a specific block diagram to an undisclosed model would be speculation. Follow the published GPT model pages for concrete examples.": "自回归生成、注意力、MoE 都是有用概念，但把某个具体块图套到未公开模型上属于猜测。具体例子请看公开 GPT 模型页。",
  "Backbone": "主干",
  "Scope": "范围",
  "Published architecture": "已公开架构",
  "Documented capabilities; undisclosed internal architecture.": "有公开能力文档，内部架构未公开。",
  "This page deliberately separates public interface information from internal architecture. The linked GPT-4.1 documentation is not evidence for a particular MoE count, attention layout or parameter total.": "本页区分公开接口信息与内部架构。所链 GPT-4.1 文档不能证明某个 MoE 数量、注意力布局或总参数量。",
  "A versioned recurrence": "有版本差异的递推",
  "The state-update operator compares RWKV-6 and RWKV-7. The core equation omits some projection, normalization and value-residual details that are present in the cited implementation.": "状态更新算子对比 RWKV-6 / RWKV-7；核心方程省略了所引实现中的部分投影、归一化及值残差细节。",
  "Dynamic state evolution with a generalized delta rule.": "使用广义 delta rule 进行动态状态演化。",
  "RWKV-7 updates a matrix state with decay, a state-dependent rank-one term and a new KV write. Time mixing and channel mixing remain separate blocks.": "RWKV-7 用衰减、依状态变化的秩一项和新 KV 写入更新矩阵状态；时间混合与通道混合仍为不同块。",
  "State dimension is a real design choice": "状态维度是真实设计参数",
  "Fixed sequence-state size is determined by head/state dimensions and layer count. Efficient chunked kernels and recurrent decoding are two execution paths for the same model dependencies.": "固定的序列状态大小取决于头 / 状态维度及层数。高效分块内核与递归解码，是同一模型依赖的两种执行路径。",
  "A structured state-space core designed around efficient matrix operations.": "围绕高效矩阵运算设计的结构化状态空间核心。",
  "Mamba-2 reformulates selective state spaces through structured state-space duality. It uses a constrained recurrence structure rather than a full dense causal attention matrix.": "Mamba-2 通过结构化状态空间对偶重新表述选择性状态空间，使用受约束递推结构，而非完整稠密因果注意力矩阵。",
  "Down path, bottleneck, up path": "下采样、瓶颈、上采样",
  "The U-Net changes spatial resolution while skip connections restore local detail. Text cross-attention uses image features as queries and text features as keys/values. This differs from causal language self-attention.": "U-Net 改变空间分辨率，跳连恢复局部细节。文本交叉注意力以图像特征为查询、文本特征为键 / 值，不同于因果语言自注意力。",
  "Training is not a full sampling chain": "训练不必执行完整采样链",
  "A typical noise-prediction training step samples a time and predicts noise from one corrupted latent. Generation instead runs many successive scheduler steps.": "典型噪声预测训练步采样一个时间，并从一个扰动潜变量预测噪声；生成则连续执行许多调度器步。",
  "U-Net": "U-Net",
  "The U-Net mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers.": "U-Net 混合空间信息与条件。U-Net 与扩散 Transformer 是不同主干，并非相同层。",
  "A text-conditioned U-Net denoises a compact image latent.": "文本条件 U-Net 对紧凑图像潜变量去噪。",
  "Stable Diffusion v1.5 combines a text encoder, latent-space U-Net with cross-attention, a noise scheduler, and an autoencoder decoder. Later SDXL and SD3 releases use different components.": "Stable Diffusion v1.5 结合文本编码器、带交叉注意力的潜空间 U-Net、噪声调度器及自编码器解码器。后续 SDXL、SD3 使用不同组件。",
  "Keep the sampler matched to the release": "采样器必须匹配具体发布",
  "Dev and distilled variants can use different guidance/sampling conventions. The flow animation uses an explicit noise→data time convention and a toy Euler step; it does not claim to reproduce every FLUX sampler.": "Dev 与蒸馏变体可能使用不同引导 / 采样约定。流动画明确采用“噪声→数据”时间约定及示意欧拉步，不声称逐项复现所有 FLUX 采样器。",
  "Dual / single-stream DiT": "Dual / single-stream DiT",
  "The Dual / single-stream DiT mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers.": "Dual / single-stream DiT 混合空间信息与条件。U-Net 与扩散 Transformer 是不同主干，并非相同层。",
  "A latent flow model with a Transformer denoiser.": "使用 Transformer 去噪器的潜空间流模型。",
  "FLUX.1 uses a flow-based generation process with a Transformer backbone and text conditioning. Its dual-stream/single-stream structure differs from Stable Diffusion v1.5’s convolutional U-Net.": "FLUX.1 采用基于流的生成过程、Transformer 主干及文本条件；其双流 / 单流结构不同于 Stable Diffusion v1.5 的卷积 U-Net。",
  "Embed + vision": "嵌入 + 视觉",
  "Text token embeddings and projected visual features form the input sequence. The displayed layer dimensions refer to the text backbone.": "文本 token 嵌入与投影后的视觉特征形成输入序列；展示的层维度指文本主干。",
  "Architecture details": "架构细节",
  "Not publicly specified": "未公开指定",
  "Evidence": "证据",
  "Official API documentation": "官方 API 文档",
  "Pure Mamba block": "纯 Mamba 模型块",
  "The illustrated pure Mamba-2 stack uses input projection, causal depthwise convolution, state-space mixing, gated normalization and output projection. It does not insert a separate Transformer FFN after every SSM. Hybrid backbones can make other choices.": "图示纯 Mamba-2 堆栈使用输入投影、因果深度卷积、状态空间混合、门控归一化与输出投影；不会在每个 SSM 后另插一个 Transformer FFN，混合主干可采用不同设计。",
  "Hybrid mixer": "混合序列模块",
  "Each layer uses either Gated DeltaNet or full gated attention. The released stack repeats three DeltaNet layers followed by one full-attention layer; the FFN follows the selected mixer.": "每层使用门控 DeltaNet 或完整门控注意力；发布堆栈重复三个 DeltaNet 层及一个完整注意力层，FFN 接在该层所选混合模块之后。",
  "Full-attention Q / KV heads": "完整注意力 Q / KV 头",
  "DeepSeek-V3 · released config": "DeepSeek-V3 · 发布配置",
  "DeepSeek-V2 · released config": "DeepSeek-V2 · 发布配置",
  "DeepSeek-V3.1 · released config": "DeepSeek-V3.1 · 发布配置",
  "DeepSeek-R1 · released config": "DeepSeek-R1 · 发布配置",
  "Qwen3-235B-A22B · released config": "Qwen3-235B-A22B · 发布配置",
  "Qwen2.5 · released config": "Qwen2.5 · 发布配置",
  "Qwen3 · released config": "Qwen3 · 发布配置",
  "ds-v32 · released config": "ds-v32 · 发布配置",
  "Qwen3.5 · reference code": "Qwen3.5 · 参考代码",
  "gpt-oss · released config": "gpt-oss · 发布配置",
  "Qwen3.8-27B · released config": "Qwen3.8-27B · 发布配置",
  "Qwen3-Next · released config": "Qwen3-Next · 发布配置",
  "Qwen3.5 · released config": "Qwen3.5 · 发布配置",
  "rwkv7 · reference code": "rwkv7 · 参考代码",
  "ds-dsa · reference code": "ds-dsa · 参考代码",
  "DeepSeek-V4-Pro · released config": "DeepSeek-V4-Pro · 发布配置",
  "DeepSeek-V4.1 · released config": "DeepSeek-V4.1 · 发布配置",
  "DeepSeek-V4-Flash · released config": "DeepSeek-V4-Flash · 发布配置",
  "qwen38-big · released config": "qwen38-big · 发布配置",
  "DeepSeek-V3.2 · released config": "DeepSeek-V3.2 · 发布配置",
  "gpt-oss-120b · model card": "gpt-oss-120b · 模型卡",
  "GPT-2 · reference code": "GPT-2 · 参考代码",
  "Llama 3 · model card": "Llama 3 · 模型卡",
  "gpt-oss-120b · released config": "gpt-oss-120b · 发布配置",
  "Stable Diffusion · model card": "Stable Diffusion · 模型卡",
  "DeepSeek-V4 · reference code": "DeepSeek-V4 · 参考代码",
  "Llama 2 · released config": "Llama 2 · 发布配置",
  "DeepSeek-V4.1 · reference code": "DeepSeek-V4.1 · 参考代码",
  "openai models": "openai models",
  "openai gpt oss": "openai gpt oss",
  "openai gpt41": "openai gpt41",
  "ds v32": "ds v32",
  "ds v3": "ds v3",
  "deepseek repos": "deepseek repos",
  "qwen repos": "qwen repos",
  "qwen35": "qwen35",
  "qwen3": "qwen3",
  "qwen38": "qwen38",
  "mamba": "mamba",
  "llama4": "llama4",
  "rwkv7": "rwkv7",
  "FLUX reference repository": "FLUX reference repository",
  "hf qwen list": "hf qwen list",
  "hf deepseek list": "hf deepseek list",
  "DeepSeek-V4.1 model card": "DeepSeek-V4.1 model card",
  "DeepSeek-V4 model card": "DeepSeek-V4 model card",
  "DeepSeek-V3.2 model card": "DeepSeek-V3.2 model card",
  "OpenAI gpt-oss documentation": "OpenAI gpt-oss documentation",
  "Qwen3.8-27B model card": "Qwen3.8-27B model card",
  "OpenAI GPT-4.1 documentation": "OpenAI GPT-4.1 documentation",
  "qwen delta doc": "qwen delta doc",
  "DDPM paper": "DDPM paper",
  "Mamba paper": "Mamba paper",
  "Attention Is All You Need": "Attention Is All You Need",
  "Mamba-2 / SSD paper": "Mamba-2 / SSD paper",
  "Vision Transformer paper": "Vision Transformer paper",
  "GPT-3 paper": "GPT-3 paper",
  "RoFormer / RoPE paper": "RoFormer / RoPE paper",
  "RWKV-7 paper": "RWKV-7 paper",
  "FlashAttention paper": "FlashAttention paper",
  "Architectures": "模型架构",
  "Models": "具体模型",
  "Blueprints": "架构蓝图",
  "Operators": "关键算子",
  "Recurrent models": "递归模型",
  "Image models": "图像模型",
  "Structure": "模型结构",
  "VIEW": "视图",
  "Model view": "模型视图",
  "Operator view": "算子视图",
  "MODEL STRUCTURE": "模型结构",
  "04 / THE ARCHITECTURES": "04 / 模型架构",
  "05 / THE MODELS": "05 / 具体模型",
  "Qwen3 · dense": "Qwen3 · 稠密",
  "Qwen3 · MoE": "Qwen3 · MoE",
  "GPT-4 / 4.1 · public scope": "GPT-4 / 4.1 · 公开范围",
  "Published configuration": "公开配置",
  "Verified source snapshot · 30 Oct 2026": "来源核验快照 · 2026 年 10 月 30 日",
  "Explore the structure and operators": "探索模型结构与算子",
  "Follow the model, then inspect its core operations.": "先理解模型，再深入关键运算。",
  "Model family": "模型家族",
  "Scope & evidence": "范围与依据",
  "Key operators": "关键算子",
  "Architecture blueprint": "架构蓝图",
  "Operator walkthrough": "算子详解",
  "Named checkpoint": "具体检查点",
  "Conceptual dimensions · not a weight dump": "概念维度 · 非实际权重展示",
  "model / operator": "模型 / 算子",
  "Related architectures and execution": "相关架构与执行策略",
  "token count, hidden width, FFN inner width, and vocabulary size": "token 数、隐藏宽度、FFN 中间宽度、词表大小",
  "query, key and value tensors; key-head dimension (V in equations is distinguished by context)": "查询、键、值张量；键头维度（方程中的 V 由上下文区分）",
  "query-head count, KV-head count, and attention mask (0 or −∞)": "查询头数、KV 头数、注意力掩码（0 或 −∞）",
  "elementwise multiplication, summation, and small numerical stabilizer": "逐元素乘法、求和、很小的数值稳定项",
  "running maximum, exponential sum and unnormalized weighted-value sum for one query row": "单个查询行的在线最大值、指数和、未归一化加权值和",
  "position, frequency for feature pair j, and a 2D rotation matrix": "位置、第 j 对特征的频率、二维旋转矩阵",
  "feature mean, variance, learned scale and learned bias": "特征均值、方差、学习缩放、学习偏置",
  "gate, expansion and contraction projection matrices; SiLU(z)=z·sigmoid(z)": "门、扩展、收缩投影矩阵；SiLU(z)=z·sigmoid(z)",
  "number of routed experts, selected expert count and output combine weight": "路由专家总数、选中专家数、输出组合权重",
  "cached KV latent; down-projection and key/value up-projections": "缓存 KV 潜变量；下投影、键 / 值上投影",
  "selected causal positions at time t, and selection of the largest k indexer scores": "时间 t 选中的因果位置，以及最大 k 个索引器评分选择",
  "Compressed Sparse Attention and Heavily Compressed Attention; groups are illustrative": "压缩稀疏注意力、重度压缩注意力；分组仅作示意",
  "input-stream merge, residual-stream mixing, and sublayer-output distribution matrices": "输入流合并、残差流混合、子层输出分配矩阵",
  "state, discretized transition/input maps, readout and selected time step": "状态、离散转移 / 输入映射、读出、选定时间步长",
  "matrix memory, decay, write strength, query, key and value; toy q/k scale is 1": "矩阵记忆、衰减、写入强度、查询、键、值；示例 q/k 缩放为 1",
  "matrix state, vector decay, rank-one modifier vectors and state read vector": "矩阵状态、向量衰减、秩一修改向量、状态读取向量",
  "stride, filter-row/column indices, input channel and output channel": "步幅、核行 / 列索引、输入通道、输出通道",
  "clean data, noisy data, Gaussian noise, cumulative noise schedule, initial noise, time and predicted velocity": "干净数据、含噪数据、高斯噪声、累积噪声调度、初始噪声、时间、预测速度",
  "shared attention memory and three static CSA2 layer roles; layer IDs are zero-based": "共享注意力记忆及三种静态 CSA2 层角色；层编号从零开始",
  "a short contiguous token sequence and its deterministic memory-row lookup identifier": "短连续 token 序列及其确定性记忆表行编号",
  "candidate generator, verifier model, and consecutive accepted tokens before the first rejection": "候选生成器、验证模型、首次拒绝前连续接受的 token"
});
const MODEL_OPERATORS={
  "attention": {
    "id": "attention",
    "name": "Attention",
    "scene": "attention",
    "lede": "Compare a query with keys; mix the corresponding values.",
    "formula": "A = softmax(QKᵀ / √dₖ + M); O = AV",
    "steps": [
      [
        "Project Q, K and V",
        "For X ∈ ℝᵀˣᴰ, linear projections create query, key and value heads. The toy query is [1,1]; keys are [1,0], [0,1], [1,1], [−1,1]."
      ],
      [
        "Score and mask",
        "Dot products divided by √2 give [0.707,0.707,1.414,0]. A causal mask sets future positions to −∞ before normalization."
      ],
      [
        "Normalize one query row",
        "Subtract the row maximum before exponentiating. For the final query, all four keys are visible and weights sum to one. Earlier queries cannot see later tokens."
      ],
      [
        "Mix values, then heads",
        "Multiply the weights by V, concatenate distinct query-head outputs, then apply Wₒ. Sharing KV heads changes storage, not the number of query outputs."
      ]
    ],
    "details": [
      [
        "MHA vs GQA vs MQA",
        "MHA has Hkv=Hq; GQA shares each KV head across a group of query heads; MQA uses Hkv=1. KV-cache payload scales with Hkv, while attention still has Hq query heads."
      ],
      [
        "Prefill vs decode",
        "Prefill computes many query rows; cached decode usually computes one new row per request. Historical K/V remain necessary for full attention. Dense score work scales as Tq×Tk×d."
      ]
    ],
    "refs": [
      "transformer-paper"
    ],
    "variants": [
      "MHA",
      "GQA",
      "MQA",
      "Gated GQA",
      "Bidirectional",
      "Cross-attention"
    ]
  },
  "flash-attention": {
    "id": "flash-attention",
    "name": "FlashAttention",
    "scene": "flash",
    "lede": "Compute exact attention without writing the full score matrix.",
    "formula": "m′=max(m,max s); ℓ′=eᵐ⁻ᵐ′ℓ+Σeˢ⁻ᵐ′; u′=eᵐ⁻ᵐ′u+Σeˢ⁻ᵐ′v",
    "steps": [
      [
        "Tile Q, K and V",
        "Bring a query tile and one K/V tile into fast memory. The score tile is temporary; an entire T×T attention matrix is not stored in HBM."
      ],
      [
        "Update a running softmax",
        "Maintain row maximum m, exponential sum ℓ and unnormalized weighted sum u. Rescale previous accumulators whenever a larger maximum arrives."
      ],
      [
        "Merge the next block",
        "Visit every valid K/V block, preserving causal masks. Normalize once as O=u/ℓ after the final block. The animation uses the same numbers as Attention."
      ],
      [
        "Recompute for backward",
        "Backward can recompute score tiles using saved output and row statistics. This trades some computation for less memory traffic."
      ]
    ],
    "details": [
      [
        "Exact vs sparse",
        "Tiling changes memory access, not which keys participate. FlashAttention is mathematically dense attention; DSA and CSA deliberately change the attended set or representation. Floating-point orders can still differ."
      ]
    ],
    "refs": [
      "flash-paper"
    ],
    "variants": [
      "FlashAttention"
    ]
  },
  "rope": {
    "id": "rope",
    "name": "Rotary position embeddings",
    "scene": "rope",
    "lede": "Rotate feature pairs so attention can sense relative position.",
    "formula": "[q₂ⱼ′,q₂ⱼ₊₁′] = R(pθⱼ)[q₂ⱼ,q₂ⱼ₊₁]",
    "steps": [
      [
        "Pair the features",
        "Split the rotary subspace into 2D pairs. Each pair has its own frequency θⱼ; p is the token position."
      ],
      [
        "Rotate Q and K",
        "Multiply each pair by a rotation matrix. A quarter-turn maps [1,0] to [0,1]. Standard RoPE rotates Q and K, not V."
      ],
      [
        "Compare relative positions",
        "The identity (R(p)q)ᵀ(R(s)k)=qᵀR(s−p)k makes the dot product depend on the relative offset."
      ],
      [
        "Keep cache conventions consistent",
        "Position IDs, rotary dimensions and scaling must match between prefill and decode. Extending the context is not simply increasing an allocation limit."
      ]
    ],
    "details": [
      [
        "RoPE is not added to X",
        "Learned absolute embeddings are added to token embeddings; RoPE rotates projected query/key pairs. Partial rotary dimensions and long-context scaling are model-specific."
      ]
    ],
    "refs": [
      "rope-paper"
    ],
    "variants": [
      "Rotary position embeddings"
    ]
  },
  "normalization": {
    "id": "normalization",
    "name": "Normalization",
    "scene": "norm",
    "lede": "Rescale each token’s feature vector before the next sublayer.",
    "formula": "RMSNorm(x)=γ⊙x/√(mean(x²)+ε); LN(x)=γ⊙(x−μ)/√(σ²+ε)+b",
    "steps": [
      [
        "Choose the reduction axis",
        "For X with shape [batch,tokens,features], these norms reduce over features of each token, not over unrelated requests. The toy vector is [1,2,3,4]."
      ],
      [
        "Compute the statistic",
        "RMSNorm uses mean square 7.5. LayerNorm subtracts mean 2.5 and uses variance 1.25. ε prevents division by zero."
      ],
      [
        "Scale and optionally shift",
        "With γ=1 and b=0, RMSNorm gives [0.365,0.730,1.095,1.461]; LayerNorm gives [−1.342,−0.447,0.447,1.342], ignoring tiny ε."
      ],
      [
        "Place it relative to the residual",
        "A pre-norm block applies F(norm(x)) before adding x. Norm placement and accumulation precision affect stability; RMSNorm and LayerNorm are not interchangeable checkpoints."
      ]
    ],
    "details": [
      [
        "A memory-bound operator",
        "The arithmetic is small compared with large GEMMs. Implementations often fuse residual addition, statistics and affine scaling, while retaining numerically safe accumulation."
      ]
    ],
    "refs": [
      "qwen3-config",
      "gpt2-code"
    ],
    "variants": [
      "RMSNorm",
      "LayerNorm"
    ]
  },
  "feed-forward": {
    "id": "feed-forward",
    "name": "Feed-forward networks",
    "scene": "ffn",
    "lede": "Expand features, gate locally, then project back.",
    "formula": "SwiGLU(x) = [SiLU(xWg) ⊙ (xWu)]Wd",
    "steps": [
      [
        "Expand in two branches",
        "For x=[1,2], choose illustrative projections g=[1,2] and u=[3,−1]. In a real block both are learned D→F matrix multiplications."
      ],
      [
        "Apply a nonlinear gate",
        "SiLU(z)=z·sigmoid(z). The gate becomes about [0.731,1.762]. GELU FFNs instead use a single expanded activation branch."
      ],
      [
        "Multiply elementwise",
        "The SwiGLU hidden vector is [2.193,−1.762]. This multiplication is local to each hidden feature; it is not an attention matrix."
      ],
      [
        "Project back to the residual width",
        "Wd maps F features back to D. Column-parallel expansion and row-parallel contraction can keep the intermediate features sharded."
      ]
    ],
    "details": [
      [
        "Dense FFN vs experts",
        "A dense FFN processes every token with the same weights. MoE replaces some FFNs with multiple parameter sets and a token-dependent router; an expert is usually an FFN, not a complete language model."
      ]
    ],
    "refs": [
      "qwen3-config",
      "gpt2-code"
    ],
    "variants": [
      "SwiGLU",
      "GELU"
    ]
  },
  "moe-routing": {
    "id": "moe-routing",
    "name": "MoE routing",
    "scene": "routing",
    "lede": "Select a few experts, execute their FFNs, then combine outputs.",
    "formula": "y = Σe∈topk gₑ(x)·FFNₑ(x) + shared(x)",
    "steps": [
      [
        "Score experts per token",
        "A router projects token features to E expert scores. The toy probabilities [0.1,0.5,0.3,0.1] favor experts 1 and 2."
      ],
      [
        "Choose top-k and pack",
        "Select two experts and renormalize their combine weights to [0.625,0.375] in this toy rule. Dispatch carries token IDs so outputs can be restored."
      ],
      [
        "Run expert matrix products",
        "If their outputs are [4,0] and [0,8], combine them into [2.5,3]. An always-on shared expert returning [1,1] changes the result to [3.5,4]."
      ],
      [
        "Return and combine",
        "Expert parallelism adds dispatch and return exchanges. Active parameter counts describe selected computation, not total weight storage or total serving memory."
      ]
    ],
    "details": [
      [
        "Routing rules are model-specific",
        "DeepSeek can separate selection bias from the combine weights, use group limits or hash-routed early layers. Shared experts, capacity constraints and score transforms differ; the four-expert example is not a literal production router."
      ]
    ],
    "refs": [
      "ds-v3",
      "ds-v4-flash-config"
    ],
    "variants": [
      "MoE routing"
    ]
  },
  "mla": {
    "id": "mla",
    "name": "Multi-head Latent Attention",
    "scene": "mla",
    "lede": "Cache a compact latent instead of expanded K/V for every head.",
    "formula": "cKV = xWDKV; Kᶜ=cKV·WUK; V=cKV·WUV; cache=(cKV,kRoPE)",
    "steps": [
      [
        "Compress the token features",
        "A down-projection maps x into a shared KV latent. The toy shrinks eight features to two; DeepSeek-V3 uses a 512-dimensional KV latent."
      ],
      [
        "Separate positional information",
        "A separate rotary key component preserves position. DeepSeek-V3 caches the 512 latent values plus 64 rotary-key values per token per layer, before metadata or quantization."
      ],
      [
        "Attend through latent projections",
        "Conceptually up-project content keys and values for each head. Optimized decode absorbs compatible matrices into query/output projections and avoids materializing all expanded history."
      ],
      [
        "Produce the head outputs",
        "Softmax weights still distinguish context positions. Latent caching changes the representation and memory cost; it does not eliminate attention or make it identical to GQA."
      ]
    ],
    "details": [
      [
        "A precise cache comparison",
        "For V3, a conceptual expanded head has 192 key components (128 content + 64 rotary) and 128 value components across 128 heads. Some rotary information is shared, so compare actual layouts and scalar counts rather than equating num_key_value_heads with cache size."
      ]
    ],
    "refs": [
      "ds-v3-config",
      "ds-v3"
    ],
    "variants": [
      "Multi-head Latent Attention"
    ]
  },
  "sparse-attention": {
    "id": "sparse-attention",
    "name": "DeepSeek Sparse Attention",
    "scene": "sparse",
    "lede": "A lightweight indexer chooses the context positions to attend.",
    "formula": "Jₜ = TopK(indexer(qₜ,K)); oₜ = Attention(qₜ,K[Jₜ],V[Jₜ])",
    "steps": [
      [
        "Score with a lightweight indexer",
        "The indexer uses a cheaper learned representation than main attention. Only causal positions can become candidates."
      ],
      [
        "Select context positions",
        "For toy scores [0.1,0.8,0.2,0.7,0.4,0.9], top-2 chooses positions 1 and 5. Real V3.2 uses a much larger configured top-k."
      ],
      [
        "Gather selected latent KV",
        "Fetch selected entries from the MLA cache and compute main attention over that set. The main score and indexer score have different roles."
      ],
      [
        "Normalize only the selected set",
        "The resulting softmax is over selected causal entries. Sparsity reduces main attention work but adds indexing, selection and gather costs."
      ]
    ],
    "details": [
      [
        "Not the same as FlashAttention",
        "DSA changes the participating key set and is trained for that architecture. FlashAttention preserves dense semantics while changing IO scheduling."
      ]
    ],
    "refs": [
      "ds-v32-final-config",
      "ds-dsa-code"
    ],
    "variants": [
      "DeepSeek Sparse Attention"
    ]
  },
  "compressed-attention": {
    "id": "compressed-attention",
    "name": "Compressed attention",
    "scene": "compressed",
    "lede": "Mix a recent local window with compressed long-range memory.",
    "formula": "context = recent window ∪ compressed history; CSA selects, HCA compresses further",
    "steps": [
      [
        "Keep recent tokens locally",
        "DeepSeek-V4 combines a 128-token sliding window with layer-dependent compressed history. The small diagram uses shorter groups for legibility."
      ],
      [
        "Compress groups into memory entries",
        "Learned compression summarizes past groups before attention. V4 configs include compression ratios 4 and 128; the representation is not a simple arithmetic mean."
      ],
      [
        "Select or attend compressed history",
        "CSA uses an indexer to select compressed entries; HCA attends a more heavily compressed history. Each path is combined with the local window according to the layer."
      ],
      [
        "Preserve causal visibility",
        "A compressed entry must be available before use and must not leak future tokens. Compression changes the model, rather than acting as a lossless dense-attention kernel."
      ]
    ],
    "details": [
      [
        "V4 vs V4.1",
        "V4 combines CSA/HCA. V4.1 adds CSA2 cross-layer KV and index reuse, a hierarchical candidate pool, and a causal encoder-decoder split. These are distinct mechanisms and receive their own walkthrough."
      ]
    ],
    "refs": [
      "ds-v4-card",
      "ds-v4-flash-config"
    ],
    "variants": [
      "CSA",
      "HCA"
    ]
  },
  "hyper-connections": {
    "id": "hyper-connections",
    "name": "Hyper-connections · mHC",
    "scene": "hyper",
    "lede": "Carry several residual streams and constrain how they mix.",
    "formula": "X′ = Hres·X + Hpost·F(Hpre·X)",
    "steps": [
      [
        "Expand the residual streams",
        "Instead of one D-dimensional stream, maintain several streams. DeepSeek-V4 config uses hc_mult=4; the illustration shows two."
      ],
      [
        "Mix into the sublayer",
        "Hpre combines streams into the input of F, such as attention or an MoE. Hpost routes the sublayer result back into the streams."
      ],
      [
        "Constrain the residual mixing",
        "Sinkhorn-style row/column normalization constrains Hres toward a doubly stochastic matrix. The toy [[0.8,0.2],[0.2,0.8]] has row and column sums of one."
      ],
      [
        "Combine both paths",
        "Add the mixed residual path and the redistributed sublayer output. The doubly stochastic constraint concerns Hres; it does not require every gate matrix to have that property."
      ]
    ],
    "details": [
      [
        "Architecture, not a network collective",
        "Residual streams live inside a model block. mHC is not AllReduce across GPUs. V4.1 introduces a revised Single-Pass mHC implementation; the figure explains the common mixing principle."
      ]
    ],
    "refs": [
      "ds-v4-card",
      "ds-v4-code",
      "ds-v41-card"
    ],
    "variants": [
      "Hyper-connections · mHC"
    ]
  },
  "state-space": {
    "id": "state-space",
    "name": "Selective state spaces",
    "scene": "ssm",
    "lede": "Summarize sequence history in an input-dependent recurrent state.",
    "formula": "hₜ = Āₜhₜ₋₁ + B̄ₜxₜ; yₜ = Cₜhₜ + Dxₜ",
    "steps": [
      [
        "Project the current input",
        "Mamba generates input-dependent step sizes and B/C parameters, with a short convolution and gates around the state-space core."
      ],
      [
        "Discretize the dynamics",
        "The continuous A and selected step Δ determine Ā, typically exp(ΔA). The input contribution B̄ must use the implementation’s matching discretization."
      ],
      [
        "Update the state",
        "The scalar illustration uses x=[2,1,3], Ā=[0.5,0.8,0.2], B̄=1 and h₀=0, producing states 2, 2.6 and 3.52."
      ],
      [
        "Scan in training; recur at decode",
        "Associative affine-map composition enables parallel/chunked training algorithms. Decode updates a fixed-size state instead of appending a full attention KV history."
      ]
    ],
    "details": [
      [
        "Mamba-1 vs Mamba-2",
        "Mamba-2 uses structured state-space duality and a restricted state structure for efficient matrix-multiply-based algorithms. A scalar recurrence illustrates dependence, not all model projections or head structure."
      ]
    ],
    "refs": [
      "mamba-paper",
      "mamba2-paper",
      "mamba"
    ],
    "variants": [
      "Selective state spaces"
    ]
  },
  "gated-delta": {
    "id": "gated-delta",
    "name": "Gated DeltaNet",
    "scene": "delta",
    "lede": "Decay memory, predict a value, then write only the residual error.",
    "formula": "S̄=λₜSₜ₋₁; Sₜ=S̄+βₜkₜ(vₜ−kₜᵀS̄)ᵀ; oₜ=qₜᵀSₜ",
    "steps": [
      [
        "Build Q/K/V and gates",
        "Hybrid Qwen models use projections, short convolution and normalized keys around a recurrent linear-attention core. λ controls forgetting and β controls the write strength."
      ],
      [
        "Decay and predict",
        "Start from a 2×2 zero memory. Decay the old state and read its prediction for the new key as kᵀS̄."
      ],
      [
        "Write the error, not the full value",
        "With k=[1,0], v=[2,1] and β=0.5, the first row becomes [1,0.5]. A later write to the same key corrects that row rather than blindly accumulating v."
      ],
      [
        "Read from the updated memory",
        "The query reads qᵀSₜ, followed by model-specific output normalization and gates. Fixed recurrent state does not mean unlimited exact recall of all tokens."
      ]
    ],
    "details": [
      [
        "Why hybrids retain full attention",
        "Qwen3-Next and the cited Qwen3.5/3.8 configs insert full attention periodically. Linear layers keep recurrent/conv states, while full-attention layers still grow their KV caches with context length."
      ]
    ],
    "refs": [
      "qwen-delta-doc",
      "qwen-next-config",
      "qwen38-config"
    ],
    "variants": [
      "Gated DeltaNet"
    ]
  },
  "rwkv-state": {
    "id": "rwkv-state",
    "name": "RWKV state update",
    "scene": "rwkv",
    "lede": "Combine token-shift features, a recurrent matrix memory, and channel mixing.",
    "formula": "RWKV-7 core: Sₜ=Sₜ₋₁diag(wₜ)+(Sₜ₋₁aₜ)bₜᵀ+vₜkₜᵀ",
    "steps": [
      [
        "Mix neighboring token features",
        "Time-mixing forms receptance, decay, key and value features using the current input and token-shift information. Channel mixing supplies a separate tokenwise nonlinear block."
      ],
      [
        "Decay the matrix state",
        "Apply learned decay w to the previous matrix state. RWKV-6 uses a related decay-plus-KV state update; RWKV-7 adds a state-dependent rank-one term."
      ],
      [
        "Modify and write memory",
        "The RWKV-7 term (Sa)bᵀ modifies existing associations, then vkᵀ writes new content. The diagram separates these terms with 2×2 illustrative matrices."
      ],
      [
        "Read, gate and project",
        "A receptance/query-like vector reads the state; normalization, extra terms and output gates complete the actual block. Decode carries the state between tokens without a Transformer-style history KV cache."
      ]
    ],
    "details": [
      [
        "A family with real version changes",
        "RWKV-7 is not simply a renamed RWKV-6 recurrence. The displayed equation explains the core generalized delta-rule form; the cited implementation also contains low-rank parameterizations, value residuals and channel-mixing details."
      ]
    ],
    "refs": [
      "rwkv7-code",
      "rwkv-paper"
    ],
    "variants": [
      "RWKV-6",
      "RWKV-7"
    ]
  },
  "convolution": {
    "id": "convolution",
    "name": "Convolution",
    "scene": "conv",
    "lede": "Slide shared filters over local neighborhoods.",
    "formula": "Y[o,i,j] = Σc,u,v W[o,c,u,v]·X[c,i·s+u,j·s+v] + b[o]",
    "steps": [
      [
        "Choose a receptive field",
        "The toy input is a 4×4 grid containing 1…16. A 2×2 filter [[1,0],[0,1]], stride 1 and no padding produce a 3×3 output."
      ],
      [
        "Multiply and sum locally",
        "The first window gives 1+6=7. Slide right for 2+7=9, then continue over the image. The weights are shared at every location."
      ],
      [
        "Accumulate channels and filters",
        "A full convolution sums across input channels and uses different filters for output channels. Depthwise convolution restricts this connectivity."
      ],
      [
        "Implement as efficient kernels",
        "Libraries may use implicit GEMM, direct convolution or transformed algorithms. Padding, stride and dilation determine output shape and boundary behavior."
      ]
    ],
    "details": [
      [
        "Locality vs attention",
        "Convolution has a local receptive field and shared spatial weights. Attention uses content-dependent mixing; stacking layers or using dilation expands a CNN’s effective receptive field."
      ]
    ],
    "refs": [
      "sd-card",
      "mamba"
    ],
    "variants": [
      "2D spatial",
      "1D depthwise"
    ]
  },
  "diffusion-step": {
    "id": "diffusion-step",
    "name": "Diffusion & flow updates",
    "scene": "diffusion",
    "lede": "Learn how to remove noise, then reuse the network across time steps.",
    "formula": "DDPM: xₜ=√ᾱₜx₀+√(1−ᾱₜ)ε; flow: xₜ=(1−t)z+t·xdata",
    "steps": [
      [
        "Construct a training example",
        "DDPM samples a time t and noise ε to corrupt a clean image/latent. Rectified-flow examples interpolate between noise z and data and predict a velocity."
      ],
      [
        "Predict the chosen target",
        "The target can be ε, velocity v, or another parameterization. Conditioning and the time embedding are inputs to the denoiser."
      ],
      [
        "Take one scheduler step",
        "For flow’s noise→data convention, Euler gives xₜ₊Δ=xₜ+Δvθ(xₜ,t). DDPM uses its corresponding reverse-process mean and optional noise; these are not the same update."
      ],
      [
        "Reuse weights across steps",
        "Repeat the denoiser with updated t and x; do not confuse the number of sampling steps with network depth. Decode a latent image with a VAE when needed."
      ]
    ],
    "details": [
      [
        "Classifier-free guidance",
        "A common form is prediction_uncond+s·(prediction_cond−prediction_uncond). Some distilled models instead consume a guidance embedding and need a different sampler configuration."
      ]
    ],
    "refs": [
      "diffusion-paper",
      "sd-card",
      "flux"
    ],
    "variants": [
      "DDPM",
      "Flow matching"
    ]
  },
  "cross-layer-kv": {
    "id": "cross-layer-kv",
    "name": "Cross-layer KV reuse · CSA2",
    "scene": "crosskv",
    "lede": "Separate producing memory from repeatedly querying it.",
    "formula": "Full: build KV + index; Reindex: reuse KV; Reuse: reuse KV + selected indices",
    "steps": [
      [
        "Encode the prompt causally",
        "V4.1-Flash has a 20-layer causal encoder followed by a 20-layer decoder. This is not a bidirectional encoder reading future tokens."
      ],
      [
        "Project shared decoder memory",
        "Decoder global KV is projected from final encoder hidden states rather than each decoder layer’s own hidden states. Prefill can prepare this memory without running the full decoder path for every input position."
      ],
      [
        "Use Full, Reindex or Reuse mode",
        "A Full layer creates main KV and indexer state; Reindex layers reuse main KV while refreshing sparse selection; Reuse layers also reuse selected indices. Actual source-layer IDs are fixed by the released configuration."
      ],
      [
        "Bound later indexer work",
        "A hierarchical decoder indexer restricts deeper selection to an earlier candidate pool. Global FP4 KV, local sliding-window replay and cross-layer reuse are separate cache mechanisms."
      ]
    ],
    "details": [
      [
        "Read reported cache numbers carefully",
        "The card reports 890 bytes/token for global KV under its FP4 format. That is not total model memory: local states, indices, buffers, metadata, weights and batch concurrency also matter."
      ]
    ],
    "refs": [
      "ds-v41-card",
      "ds-v41-config",
      "ds-v41-code"
    ],
    "variants": [
      "Cross-layer KV reuse · CSA2"
    ]
  },
  "engram": {
    "id": "engram",
    "name": "Engram conditional memory",
    "scene": "engram",
    "lede": "Retrieve sparse learned memory using token-derived lookup keys.",
    "formula": "token n-grams → deterministic lookup IDs → embeddings → gated fusion",
    "steps": [
      [
        "Build token-history keys",
        "Use local token n-grams to determine lookup IDs. This is conditional memory indexed by token history, not semantic document retrieval."
      ],
      [
        "Fetch sparse memory rows",
        "Only selected embedding rows are read for each token. Large total table capacity can coexist with sparse per-token access."
      ],
      [
        "Project and gate retrieved features",
        "The implementation projects and gates the retrieved features before fusing them with the model hidden state. The toy hashes and row values are illustrative, not the production hash."
      ],
      [
        "Place memory at selected layers",
        "V4.1 config lists Engram at layers 1 and 14 (zero-based). Its model card reports 196B conditional-memory parameters separately from 552B backbone parameters."
      ]
    ],
    "details": [
      [
        "Not MoE routing or a KV cache",
        "MoE selects computed FFNs; Engram retrieves learned table rows. A KV cache stores request-specific attention history. These mechanisms use different keys and store different state."
      ]
    ],
    "refs": [
      "ds-v41-card",
      "ds-v41-config",
      "ds-v41-code"
    ],
    "variants": [
      "Engram conditional memory"
    ]
  },
  "speculative-decoding": {
    "id": "speculative-decoding",
    "name": "Speculative decoding",
    "scene": "speculative",
    "lede": "Draft several tokens, verify them together, keep a valid prefix.",
    "formula": "draft candidates → target verification → accepted prefix + correction",
    "steps": [
      [
        "Propose draft tokens",
        "A cheaper model, prediction head, or semi-autoregressive drafter proposes several future tokens. Drafts are hypotheses, not yet committed output."
      ],
      [
        "Verify with the target",
        "The target evaluates the candidate positions in a batch while preserving causal dependencies. The toy candidate A,B,C,D matches target A,B,X at its first mismatch."
      ],
      [
        "Commit a prefix and repair",
        "In the greedy illustration accept A,B, append X, and discard the remaining draft. Exact sampling needs an acceptance/rejection rule and correction distribution, not just greedy equality."
      ],
      [
        "Manage cache lifetimes",
        "Tentative KV entries after the rejected position must be discarded or rolled back. DSpark adds a specific semi-autoregressive draft and confidence-scheduled verification design; this animation explains the common verification principle."
      ]
    ],
    "details": [
      [
        "More draft tokens do not guarantee speedup",
        "Benefit depends on acceptance, draft cost, verification efficiency and memory bandwidth. MTP training, a generic speculative algorithm, and a particular DSpark implementation are related but distinct."
      ]
    ],
    "refs": [
      "ds-v41-card",
      "ds-v3"
    ],
    "variants": [
      "Speculative decoding"
    ]
  }
};
const MODEL_ARCHITECTURES=[
  {
    "id": "transformer",
    "name": "Transformer",
    "kind": "transformer",
    "lede": "Attention mixes positions; FFNs mix features.",
    "description": "A reusable block combines attention, a tokenwise feed-forward network, normalization and residual paths. Decoder-only, encoder-only and encoder-decoder layouts differ in masks and cross-attention.",
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses position embeddings positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MHA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MHA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "GELU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "GELU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = L",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "operators": [
      "attention",
      "flash-attention",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Three layouts",
        "Decoder-only uses causal self-attention for generation. Encoder-only uses bidirectional attention for representations. Encoder-decoder uses an encoder and a causal decoder with cross-attention to encoder outputs."
      ],
      [
        "The diagram’s scope",
        "The animated blueprint is a pre-norm decoder example, not a claim that the original 2017 encoder-decoder used this exact norm placement. Model pages specify the actual family."
      ]
    ],
    "refs": [
      "transformer-paper"
    ],
    "family": "Blueprints"
  },
  {
    "id": "mixture-of-experts",
    "name": "Mixture of Experts",
    "kind": "moe",
    "lede": "Many stored experts. A small selected computation.",
    "description": "MoE is usually a replacement for selected FFN blocks inside a larger backbone. A router selects experts per token; shared experts may run for every token.",
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "Attention",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The Attention block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "Routed + shared FFNs",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "Routed + shared FFNs expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = L",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "operators": [
      "moe-routing",
      "feed-forward",
      "attention"
    ],
    "details": [
      [
        "Active is not resident",
        "Activating 37B parameters does not mean a 671B model fits in 37B-parameter storage. The entire required expert set must be placed in some memory tier, with routing and communication overhead."
      ],
      [
        "Link to distributed execution",
        "Expert parallelism distributes expert weights; tensor parallelism can split each expert’s matrix products. These execution strategies do not redefine the MoE architecture."
      ]
    ],
    "refs": [
      "ds-v3",
      "qwen3-moe-config"
    ],
    "family": "Blueprints"
  },
  {
    "id": "rwkv",
    "name": "RWKV",
    "kind": "rwkv",
    "lede": "A recurrent matrix memory with Transformer-style training opportunities.",
    "description": "RWKV separates time mixing from channel mixing. It carries request-specific recurrent state instead of the full Transformer-style KV history; its recurrence changes across versions.",
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Read the sequence",
        "text": "Inputs are token IDs during language modeling. The state starts at zero or a previous request checkpoint."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Embed each token",
        "text": "Learned token embeddings produce the features consumed by the first recurrent block."
      },
      {
        "label": "Norm + mix",
        "shape": "T × D",
        "title": "Prepare gated features",
        "text": "Input projections, normalization and short-range mixing prepare keys, values or state-space parameters."
      },
      {
        "label": "RWKV-7",
        "shape": "state S",
        "title": "Update the sequence state",
        "text": "RWKV-7 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys."
      },
      {
        "label": "Read + gate",
        "shape": "T × D",
        "title": "Read the current state",
        "text": "A learned readout and output gate convert memory into token features, then return to the residual stream."
      },
      {
        "label": "Channel mix",
        "shape": "D → F → D",
        "title": "Mix feature channels",
        "text": "Version-specific nonlinear blocks transform each token independently of the sequence-state update."
      },
      {
        "label": "Repeat + head",
        "shape": "L blocks",
        "title": "Run the stack and output head",
        "text": "Repeat the learned blocks and map the final features to vocabulary scores."
      },
      {
        "label": "Token + state",
        "shape": "state carried",
        "title": "Carry state to the next token",
        "text": "Each request keeps its own recurrent state. Training can use parallel/chunked kernels while preserving the recurrence."
      }
    ],
    "operators": [
      "rwkv-state",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Training vs inference",
        "Parallel/chunked training kernels can evaluate the recurrence efficiently. Tokenwise inference reuses the previous state; constant sequence-state size does not imply zero temporary workspace or unbounded exact recall."
      ]
    ],
    "refs": [
      "rwkv-paper",
      "rwkv7"
    ],
    "family": "Blueprints"
  },
  {
    "id": "state-space-models",
    "name": "State-space models · Mamba",
    "kind": "ssm",
    "lede": "Select what to remember, forget and read.",
    "description": "Selective state-space models make parts of the dynamics depend on the input. Mamba combines short convolution, gating and an efficient state-space core.",
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Read the sequence",
        "text": "Inputs are token IDs during language modeling. The state starts at zero or a previous request checkpoint."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Embed each token",
        "text": "Learned token embeddings produce the features consumed by the first recurrent block."
      },
      {
        "label": "Norm + mix",
        "shape": "T × D",
        "title": "Prepare gated features",
        "text": "Input projections, normalization and short-range mixing prepare keys, values or state-space parameters."
      },
      {
        "label": "Mamba-2",
        "shape": "state S",
        "title": "Update the sequence state",
        "text": "Mamba-2 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys."
      },
      {
        "label": "Read + gate",
        "shape": "T × D",
        "title": "Read the current state",
        "text": "A learned readout and output gate convert memory into token features, then return to the residual stream."
      },
      {
        "label": "Repeat + head",
        "shape": "L blocks",
        "title": "Run the stack and output head",
        "text": "Repeat the learned blocks and map the final features to vocabulary scores."
      },
      {
        "label": "Token + state",
        "shape": "state carried",
        "title": "Carry state to the next token",
        "text": "Each request keeps its own recurrent state. Training can use parallel/chunked kernels while preserving the recurrence."
      }
    ],
    "operators": [
      "state-space",
      "gated-delta",
      "convolution"
    ],
    "details": [
      [
        "Related, not interchangeable",
        "A selective SSM, Gated DeltaNet and RWKV all carry recurrent state, but their update equations and parameterizations differ. Hybrid models may combine such blocks with full attention."
      ],
      [
        "Pure Mamba block",
        "The illustrated pure Mamba-2 stack uses input projection, causal depthwise convolution, state-space mixing, gated normalization and output projection. It does not insert a separate Transformer FFN after every SSM. Hybrid backbones can make other choices."
      ]
    ],
    "refs": [
      "mamba-paper",
      "mamba2-paper"
    ],
    "family": "Blueprints"
  },
  {
    "id": "diffusion",
    "name": "Diffusion & flow models",
    "kind": "diffusion",
    "lede": "A learned vector field turns noise into structured data.",
    "description": "A network learns a noise-removal or velocity target across time. Generation repeatedly updates a noisy sample; U-Nets and diffusion Transformers are common backbones.",
    "flow": [
      {
        "label": "Text / condition",
        "shape": "conditioning",
        "title": "Encode the condition",
        "text": "A text encoder or another conditioning network produces features that guide generation."
      },
      {
        "label": "Noise latent",
        "shape": "C × H × W",
        "title": "Initialize a latent sample",
        "text": "Start from sampled noise for generation; latent models operate at reduced spatial resolution."
      },
      {
        "label": "Time embedding",
        "shape": "t → D",
        "title": "Tell the network the noise level",
        "text": "A time/noise embedding changes the denoiser’s computation at each sampling step."
      },
      {
        "label": "U-Net / DiT",
        "shape": "latent → latent",
        "title": "Predict noise or velocity",
        "text": "The U-Net / DiT mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers."
      },
      {
        "label": "Scheduler",
        "shape": "xₜ → xnext",
        "title": "Update the noisy sample",
        "text": "Apply the sampler rule matching the model target and time convention. The operator view contrasts DDPM with flow matching."
      },
      {
        "label": "Repeat steps",
        "shape": "same weights",
        "title": "Reuse the denoiser",
        "text": "Run the same network weights at the next time value. More steps trade compute and latency for the sampler’s behavior."
      },
      {
        "label": "VAE decoder",
        "shape": "latent → RGB",
        "title": "Decode the final image",
        "text": "A learned VAE decoder converts the final latent to pixels in latent-diffusion and latent-flow systems."
      },
      {
        "label": "Image",
        "shape": "H × W × 3",
        "title": "Return the generated image",
        "text": "The output is an image, not vocabulary logits. Denoising-step parallelism differs from autoregressive token dependencies."
      }
    ],
    "operators": [
      "diffusion-step",
      "convolution",
      "attention"
    ],
    "details": [
      [
        "Objective, backbone and sampler",
        "The diffusion/flow objective, U-Net/DiT network, and DDPM/ODE sampler are separate choices. A Transformer backbone does not make image generation autoregressive language modeling."
      ]
    ],
    "refs": [
      "diffusion-paper",
      "sd-card",
      "flux"
    ],
    "family": "Blueprints"
  },
  {
    "id": "convolutional-networks",
    "name": "Convolutional networks",
    "kind": "cnn",
    "lede": "Local filters, shared weights, hierarchical features.",
    "description": "CNNs exploit spatial locality and translation-related weight sharing. A U-Net adds down/up paths and skip features for spatial prediction.",
    "flow": [
      {
        "label": "Image",
        "shape": "C × H × W",
        "title": "Start from pixels",
        "text": "Input channels and spatial axes are explicit."
      },
      {
        "label": "Conv + activation",
        "shape": "C₁ × H × W",
        "title": "Extract local patterns",
        "text": "Shared filters detect local features across the image."
      },
      {
        "label": "Downsample",
        "shape": "C₂ × H/2 × W/2",
        "title": "Increase the receptive field",
        "text": "Stride or pooling reduces spatial size; channels often increase."
      },
      {
        "label": "Residual blocks",
        "shape": "feature maps",
        "title": "Build hierarchical features",
        "text": "Residual CNN blocks can preserve an identity path while learning transformations."
      },
      {
        "label": "Pool / decoder",
        "shape": "task-specific",
        "title": "Choose the task head",
        "text": "Global pooling suits classification; spatial decoders suit dense prediction."
      },
      {
        "label": "Output",
        "shape": "classes / pixels",
        "title": "Return task predictions",
        "text": "Architecture and output shape depend on classification, segmentation or generation."
      }
    ],
    "operators": [
      "convolution",
      "normalization"
    ],
    "details": [
      [
        "Shape accounting",
        "For kernel k, padding p, dilation d and stride s, output size is floor((n+2p−d(k−1)−1)/s)+1 on each spatial axis."
      ]
    ],
    "refs": [
      "sd-card"
    ],
    "family": "Blueprints"
  },
  {
    "id": "vision-transformer",
    "name": "Vision Transformer · ViT",
    "kind": "vit",
    "lede": "Convert patches to tokens, then mix them with attention.",
    "description": "ViT applies a Transformer to visual tokens. Vision-language models add projectors or mergers to integrate these features with text.",
    "flow": [
      {
        "label": "Image",
        "shape": "H × W × C",
        "title": "Read an image",
        "text": "The image is a spatial tensor, not token IDs."
      },
      {
        "label": "Patchify",
        "shape": "N × P²C",
        "title": "Turn patches into a sequence",
        "text": "Split non-overlapping patches; N=(H/P)(W/P) before special tokens."
      },
      {
        "label": "Linear projection",
        "shape": "N × D",
        "title": "Embed each patch",
        "text": "Flatten and project patches to hidden features, or use an equivalent patch convolution."
      },
      {
        "label": "Position + blocks",
        "shape": "N × D",
        "title": "Mix spatial token features",
        "text": "Position information distinguishes patches; attention mixes tokens across the image."
      },
      {
        "label": "Pool / projector",
        "shape": "N → task",
        "title": "Connect to the downstream task",
        "text": "Classification may use a special token; a VLM projects visual tokens into its language-model width."
      },
      {
        "label": "Prediction / tokens",
        "shape": "classes / N × D",
        "title": "Return representations",
        "text": "A vision encoder and a language decoder are separate components even when trained jointly."
      }
    ],
    "operators": [
      "attention",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Token count drives cost",
        "Smaller patches or higher resolution increase token count and dense attention work. Model-specific pooling, merging and dynamic-resolution rules change the final visual-token budget."
      ]
    ],
    "refs": [
      "vit-paper",
      "ds-v41-card"
    ],
    "family": "Blueprints"
  }
];
const NAMED_MODELS=[
  {
    "id": "deepseek-v2",
    "name": "DeepSeek-V2",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "MLA and fine-grained experts establish the design.",
    "description": "V2 combines compressed latent KV with routed and shared expert FFNs. The released main configuration differs materially from the smaller Lite model.",
    "operators": [
      "mla",
      "moe-routing",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "A specific checkpoint",
        "The cited main model has 60 layers, width 5120, 160 routed experts with 6 selected, and 2 shared experts; the first FFN layer is dense. Do not apply these numbers to V2-Lite."
      ]
    ],
    "refs": [
      "ds-v2-config",
      "ds-v3"
    ],
    "facts": [
      [
        "Parameters",
        "236B / 21B active"
      ],
      [
        "Layers × width",
        "60 × 5,120"
      ],
      [
        "Query / KV heads",
        "128 / 128"
      ],
      [
        "Routed experts / selected",
        "160 / 6"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MLA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 60",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "MLA",
    "pattern": [],
    "config": "ds-v2-config"
  },
  {
    "id": "deepseek-v3",
    "name": "DeepSeek-V3",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "Keep MLA; scale experts and change the training recipe.",
    "description": "V3 is a 671B MoE with 37B active parameters. It retains MLA, introduces auxiliary-loss-free load balancing, and adds a multi-token prediction training objective.",
    "operators": [
      "mla",
      "moe-routing",
      "feed-forward",
      "rope",
      "speculative-decoding"
    ],
    "details": [
      [
        "Architecture vs training techniques",
        "61 layers and 256 routed experts with top-8 plus 1 shared expert describe the backbone. FP8 training, DualPipe scheduling and MTP are different aspects of its training system; MTP is not mandatory multi-token sampling at serving time."
      ],
      [
        "Dense early layers",
        "The first three FFN layers are dense before the routed-expert layers. Model and operator diagrams are compressed blueprints, not one drawn box per physical layer."
      ]
    ],
    "refs": [
      "ds-v3",
      "ds-v3-config"
    ],
    "facts": [
      [
        "Parameters",
        "671B / 37B active"
      ],
      [
        "Layers × width",
        "61 × 7,168"
      ],
      [
        "Query / KV heads",
        "128 / 128"
      ],
      [
        "Routed experts / selected",
        "256 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MLA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 61",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "MLA",
    "pattern": [],
    "config": "ds-v3-config"
  },
  {
    "id": "deepseek-v31",
    "name": "DeepSeek-V3.1",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "A new behavior recipe does not imply a new block layout.",
    "description": "The cited V3.1 configuration retains the 61-layer MLA-plus-MoE skeleton. Thinking and non-thinking operation are post-training/usage modes, not separate attention architectures.",
    "operators": [
      "mla",
      "moe-routing",
      "feed-forward",
      "normalization"
    ],
    "details": [
      [
        "Compare config fields",
        "The cited V3 and V3.1 share width 7168, 256 routed experts, top-8 and a 512-dimensional KV latent. Checkpoint behavior, tokenizer/prompt conventions and training changes still matter."
      ]
    ],
    "refs": [
      "ds-v31-config",
      "ds-v3-config"
    ],
    "facts": [
      [
        "Parameters",
        "671B / 37B active"
      ],
      [
        "Layers × width",
        "61 × 7,168"
      ],
      [
        "Query / KV heads",
        "128 / 128"
      ],
      [
        "Routed experts / selected",
        "256 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MLA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 61",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "MLA",
    "pattern": [],
    "config": "ds-v31-config"
  },
  {
    "id": "deepseek-v32",
    "name": "DeepSeek-V3.2",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "Index the long context before doing main attention.",
    "description": "V3.2 adds DeepSeek Sparse Attention on top of the MLA/MoE backbone. The original Exp release and later V3.2 are distinct checkpoints; this page cites the later model card and config.",
    "operators": [
      "sparse-attention",
      "mla",
      "moe-routing",
      "rope"
    ],
    "details": [
      [
        "What changes from V3.1",
        "The learned lightweight indexer selects context entries; main MLA attends the selected set. Width and expert counts alone cannot reveal this change, so both model type and implementation matter."
      ]
    ],
    "refs": [
      "ds-v32-final-card",
      "ds-v32-final-config",
      "ds-dsa-code"
    ],
    "facts": [
      [
        "Parameters",
        "671B / 37B active"
      ],
      [
        "Layers × width",
        "61 × 7,168"
      ],
      [
        "Query / KV heads",
        "128 / 128"
      ],
      [
        "Routed experts / selected",
        "256 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "DSA + MLA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The DSA + MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 61",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "DSA + MLA",
    "pattern": [],
    "config": "ds-v32-final-config"
  },
  {
    "id": "deepseek-v4",
    "name": "DeepSeek-V4",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "Compressed history and multiple residual streams.",
    "description": "V4 changes both attention and residual connectivity: CSA/HCA mix compressed history with a local window, while mHC carries multiple residual streams. Flash and Pro have different widths and expert counts.",
    "operators": [
      "compressed-attention",
      "hyper-connections",
      "moe-routing",
      "feed-forward",
      "rope"
    ],
    "details": [
      [
        "Flash vs Pro",
        "The Flash config has 43 layers, width 4096, 256 routed experts and top-6; Pro has 61 layers, width 7168, 384 routed experts and top-6. Both have one shared expert and hc_mult=4."
      ],
      [
        "Precision and cache are separate",
        "Released instruct weights mix FP4 experts with other FP8 weights. This does not mean every activation, buffer or KV cache is FP4. The card’s efficiency comparisons are vendor-reported, not measurements made by this guide."
      ]
    ],
    "refs": [
      "ds-v4-card",
      "ds-v4-flash-config",
      "ds-v4-pro-config",
      "ds-v4-code"
    ],
    "facts": [
      [
        "Parameters",
        "Flash: 284B / 13B active"
      ],
      [
        "Layers × width",
        "43 × 4,096"
      ],
      [
        "Query / KV heads",
        "64 / 1"
      ],
      [
        "Routed experts / selected",
        "256 / 6"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "4 residual streams",
        "shape": "4 × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "CSA / HCA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The CSA / HCA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "mHC",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Mix residual streams with the constrained mHC residual matrix and the sublayer output path."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "Run routed/shared experts, then return through another mHC mixing step. Early routing rules differ from later learned routing."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 43 Flash / 61 Pro",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "CSA / HCA",
    "pattern": [],
    "config": "ds-v4-flash-config"
  },
  {
    "id": "deepseek-v41",
    "name": "DeepSeek-V4.1-Flash",
    "kind": "ced",
    "family": "DeepSeek",
    "lede": "A causal encoder-decoder shares global memory across layers.",
    "description": "V4.1-Flash combines a 20+20 causal encoder-decoder, CSA2 cross-layer KV/index reuse, Single-Pass mHC, Engram lookup memory, multimodal input and DSpark drafting.",
    "operators": [
      "cross-layer-kv",
      "compressed-attention",
      "hyper-connections",
      "engram",
      "speculative-decoding",
      "moe-routing"
    ],
    "details": [
      [
        "Do not add unlike parameter counts",
        "The card reports 552B backbone and separately 196B Engram memory. It reports 8B active parameters/token during prefill and 16B during decode. Those phase-dependent numbers are not a uniform per-token weight footprint."
      ],
      [
        "Not the original Transformer encoder-decoder",
        "Both halves are causal. Shared decoder KV comes from encoder output; the prefill/decode asymmetry and bounded sliding-window replay are central to this design."
      ]
    ],
    "refs": [
      "ds-v41-card",
      "ds-v41-config",
      "ds-v41-code"
    ],
    "facts": [
      [
        "Parameters",
        "552B backbone + 196B Engram"
      ],
      [
        "Layers × width",
        "40 × 5,120"
      ],
      [
        "Query / KV heads",
        "64 / 1"
      ],
      [
        "Routed experts / selected",
        "384 / 6"
      ]
    ],
    "flow": [
      {
        "label": "Text + images",
        "shape": "input",
        "title": "Read multimodal input",
        "text": "Text tokens and optional image features enter one language backbone."
      },
      {
        "label": "Embed / ViT",
        "shape": "T × D",
        "title": "Project images and text",
        "text": "DeepSeek-ViT and an MLP projector prepare image embeddings; text uses token embeddings."
      },
      {
        "label": "Causal encoder",
        "shape": "20 layers",
        "title": "Encode prompt history",
        "text": "The encoder is causal. Selected layers also use Engram conditional memory; attention and MoE blocks use the released mHC design."
      },
      {
        "label": "Encoder states",
        "shape": "T × 5120",
        "title": "Produce reusable representations",
        "text": "Final encoder hidden states are the source for decoder global KV projection."
      },
      {
        "label": "Shared KV",
        "shape": "CSA2",
        "title": "Build cross-layer memory",
        "text": "CSA2 shares main KV/indexer state and selected indices according to Full, Reindex and Reuse layer roles."
      },
      {
        "label": "Causal decoder",
        "shape": "20 layers",
        "title": "Query shared history",
        "text": "The decoder queries encoder-derived global memory. Its local sliding-window state and replay are separate from global KV."
      },
      {
        "label": "Vocabulary head",
        "shape": "D → V",
        "title": "Produce target logits",
        "text": "The target network scores output tokens; prefill and decode activate different portions of the backbone."
      },
      {
        "label": "DSpark option",
        "shape": "draft + verify",
        "title": "Optionally draft and verify",
        "text": "DSpark has a dedicated draft path and confidence scheduling. Verification must preserve target generation semantics."
      },
      {
        "label": "Next token",
        "shape": "output",
        "title": "Commit generated text",
        "text": "The next token continues the causal generation loop with shared memory and request-specific state."
      }
    ],
    "attention": "CSA2",
    "pattern": [],
    "config": "ds-v41-config"
  },
  {
    "id": "deepseek-r1",
    "name": "DeepSeek-R1",
    "kind": "transformer",
    "family": "DeepSeek",
    "lede": "Reasoning training on a V3-family backbone.",
    "description": "The full R1 model retains V3-style MLA and MoE blocks. Its reasoning-focused post-training is a recipe change; R1-distilled Qwen/Llama checkpoints have their own backbones.",
    "operators": [
      "mla",
      "moe-routing",
      "feed-forward"
    ],
    "details": [
      [
        "A model name is not a block diagram",
        "Do not assign full R1’s 671B architecture to R1-Distill-Qwen-7B or R1-Distill-Llama variants. Distillation transfers behavior through training, not by copying every teacher layer."
      ]
    ],
    "refs": [
      "ds-r1-config",
      "ds-v3"
    ],
    "facts": [
      [
        "Parameters",
        "671B / 37B active"
      ],
      [
        "Layers × width",
        "61 × 7,168"
      ],
      [
        "Query / KV heads",
        "128 / 128"
      ],
      [
        "Routed experts / selected",
        "256 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MLA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MLA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 61",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "MLA",
    "pattern": [],
    "config": "ds-r1-config"
  },
  {
    "id": "qwen25",
    "name": "Qwen2.5",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "A dense decoder with GQA and gated FFNs.",
    "description": "The 7B checkpoint used here combines RMSNorm, RoPE, grouped-query attention and SwiGLU-style FFNs. Family sizes change head counts and layer dimensions.",
    "operators": [
      "attention",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Read dimensions from the actual checkpoint",
        "Qwen2.5-7B has 28 layers, width 3584 and 28 query heads sharing 4 KV heads. One KV head serves seven query heads in this checkpoint."
      ]
    ],
    "refs": [
      "qwen25-config"
    ],
    "facts": [
      [
        "Parameters",
        "7B example"
      ],
      [
        "Layers × width",
        "28 × 3,584"
      ],
      [
        "Query / KV heads",
        "28 / 4"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "SwiGLU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 28",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": "qwen25-config"
  },
  {
    "id": "qwen3",
    "name": "Qwen3 · dense",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "QK normalization and dense feed-forward blocks.",
    "description": "Qwen3 includes dense and MoE releases. This page uses the dense 8B configuration; the separate MoE page explains the 235B-A22B checkpoint.",
    "operators": [
      "attention",
      "normalization",
      "rope",
      "feed-forward"
    ],
    "details": [
      [
        "What changes from Qwen2.5",
        "The 8B example has 36 layers, width 4096, 32 query heads and 8 KV heads. Qwen3 adds query/key head normalization; thinking behavior is not another attention-head layout."
      ]
    ],
    "refs": [
      "qwen3",
      "qwen3-config"
    ],
    "facts": [
      [
        "Parameters",
        "8B example"
      ],
      [
        "Layers × width",
        "36 × 4,096"
      ],
      [
        "Query / KV heads",
        "32 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "SwiGLU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 36",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": "qwen3-config"
  },
  {
    "id": "qwen3-moe",
    "name": "Qwen3 · MoE",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "The same family also has a routed-expert backbone.",
    "description": "The cited 235B-A22B checkpoint is a 94-layer MoE with GQA. Its expert structure is distinct from Qwen3’s dense checkpoints.",
    "operators": [
      "moe-routing",
      "attention",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Sparse computation, full weight placement",
        "The config has 128 experts with 8 selected per token, 64 query heads and 4 KV heads. About 22B active parameters does not make the complete weight set a 22B model."
      ]
    ],
    "refs": [
      "qwen3-moe-config",
      "qwen3"
    ],
    "facts": [
      [
        "Parameters",
        "235B / 22B active"
      ],
      [
        "Layers × width",
        "94 × 4,096"
      ],
      [
        "Query / KV heads",
        "64 / 4"
      ],
      [
        "Routed experts / selected",
        "128 / 8"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 94",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": "qwen3-moe-config"
  },
  {
    "id": "qwen3-next",
    "name": "Qwen3-Next",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "Three recurrent blocks, then one full-attention block.",
    "description": "Qwen3-Next-80B-A3B alternates Gated DeltaNet and full attention, with sparse expert FFNs. It keeps both recurrent state and attention-layer KV history.",
    "operators": [
      "gated-delta",
      "attention",
      "moe-routing",
      "normalization"
    ],
    "details": [
      [
        "Read the layer pattern",
        "The cited config has full_attention_interval=4, 48 layers, 512 experts and top-10. Linear-attention key/value-head dimensions are separate from full-attention Q/KV heads."
      ]
    ],
    "refs": [
      "qwen-next-config",
      "qwen35-code"
    ],
    "facts": [
      [
        "Parameters",
        "80B / 3B active"
      ],
      [
        "Layers × width",
        "48 × 2,048"
      ],
      [
        "Full-attention Q / KV heads",
        "16 / 2"
      ],
      [
        "Routed experts / selected",
        "512 / 10"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "Hybrid mixer",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "Each layer uses either Gated DeltaNet or full gated attention. The released stack repeats three DeltaNet layers followed by one full-attention layer; the FFN follows the selected mixer."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 48",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "DeltaNet / GQA",
    "pattern": [
      "Δ",
      "Δ",
      "Δ",
      "A"
    ],
    "config": "qwen-next-config"
  },
  {
    "id": "qwen35",
    "name": "Qwen3.5",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "Hybrid sequence mixing with native visual input.",
    "description": "The 397B-A17B example combines a vision encoder with a 60-layer hybrid language backbone: three Gated DeltaNet blocks per full-attention block, plus MoE FFNs.",
    "operators": [
      "gated-delta",
      "attention",
      "moe-routing",
      "rope",
      "normalization"
    ],
    "details": [
      [
        "Vision and language are separate components",
        "The model config contains a text_config and a vision_config. The displayed layer/head counts describe the text backbone, not the combined vision-language system."
      ],
      [
        "Not every Qwen3.5 is MoE",
        "The family contains different sizes and dense variants. This page names the 397B-A17B checkpoint so expert counts are not silently generalized to every Qwen3.5 release."
      ]
    ],
    "refs": [
      "qwen35-config",
      "qwen35-code",
      "qwen38"
    ],
    "facts": [
      [
        "Parameters",
        "397B / 17B active"
      ],
      [
        "Layers × width",
        "60 × 4,096"
      ],
      [
        "Full-attention Q / KV heads",
        "32 / 2"
      ],
      [
        "Routed experts / selected",
        "512 / 10"
      ]
    ],
    "flow": [
      {
        "label": "Text + images",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embed + vision",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Text token embeddings and projected visual features form the input sequence. The displayed layer dimensions refer to the text backbone."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "Hybrid mixer",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "Each layer uses either Gated DeltaNet or full gated attention. The released stack repeats three DeltaNet layers followed by one full-attention layer; the FFN follows the selected mixer."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 60",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "DeltaNet / GQA",
    "pattern": [
      "Δ",
      "Δ",
      "Δ",
      "A"
    ],
    "config": "qwen35-config"
  },
  {
    "id": "qwen38",
    "name": "Qwen3.8",
    "kind": "transformer",
    "family": "Qwen",
    "lede": "Keep the hybrid foundation; distinguish dense and MoE releases.",
    "description": "Qwen3.8-27B is a native vision-language dense model built on the Qwen3.5 architecture. Its 64-layer text backbone repeats three Gated DeltaNet blocks and one gated-attention block.",
    "operators": [
      "gated-delta",
      "attention",
      "feed-forward",
      "rope",
      "normalization"
    ],
    "details": [
      [
        "The concrete 27B layout",
        "The card/config give width 5120, 24 full-attention query heads and 4 KV heads; DeltaNet has 16 QK heads and 48 V heads, each dimension 128. These are two different head systems."
      ],
      [
        "A larger release is not the same graph size",
        "The separately cited 2.4T-A95B config is a 92-layer MoE with 512 experts and top-10. Do not copy those expert counts into the dense 27B model."
      ]
    ],
    "refs": [
      "qwen38-card",
      "qwen38-config",
      "qwen38-big-config"
    ],
    "facts": [
      [
        "Parameters",
        "27B dense example"
      ],
      [
        "Layers × width",
        "64 × 5,120"
      ],
      [
        "Full-attention Q / KV heads",
        "24 / 4"
      ]
    ],
    "flow": [
      {
        "label": "Text + images",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embed + vision",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Text token embeddings and projected visual features form the input sequence. The displayed layer dimensions refer to the text backbone."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "Hybrid mixer",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "Each layer uses either Gated DeltaNet or full gated attention. The released stack repeats three DeltaNet layers followed by one full-attention layer; the FFN follows the selected mixer."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "SwiGLU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 64",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "DeltaNet / GQA",
    "pattern": [
      "Δ",
      "Δ",
      "Δ",
      "A"
    ],
    "config": "qwen38-config"
  },
  {
    "id": "llama2",
    "name": "Llama 2",
    "kind": "transformer",
    "family": "Llama",
    "lede": "A dense RoPE/SwiGLU decoder; GQA depends on size.",
    "description": "Llama 2 uses pre-normalization, RoPE and gated FFNs. The 70B model uses GQA, while the 7B and 13B variants have different KV-head layouts.",
    "operators": [
      "attention",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Do not generalize the largest checkpoint",
        "GQA is a concrete per-checkpoint property. Model size, layer count and context support must be tied to a specific card rather than inferred from the family name."
      ]
    ],
    "refs": [
      "llama2-config"
    ],
    "facts": [
      [
        "Parameters",
        "7B / 13B / 70B"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA (70B)",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA (70B) block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "SwiGLU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = L",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA (70B)",
    "pattern": [],
    "config": null
  },
  {
    "id": "llama31",
    "name": "Llama 3.1",
    "kind": "transformer",
    "family": "Llama",
    "lede": "A dense GQA backbone with a larger vocabulary and long-context recipe.",
    "description": "Llama 3.1 retains RMSNorm, RoPE, GQA and SwiGLU-style FFNs. The published family contains 8B, 70B and 405B sizes; it is not an MoE model family.",
    "operators": [
      "attention",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Context extension vs exact recall",
        "Long-context positional scaling and training determine usable context behavior. A larger advertised context does not remove KV-cache cost or guarantee perfect retrieval at every position."
      ]
    ],
    "refs": [
      "llama3-card"
    ],
    "facts": [
      [
        "Parameters",
        "8B / 70B / 405B"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "SwiGLU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "SwiGLU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = L",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "llama4",
    "name": "Llama 4",
    "kind": "transformer",
    "family": "Llama",
    "lede": "Move from dense text models to multimodal experts.",
    "description": "Llama 4 Scout and Maverick use an autoregressive MoE architecture with early fusion of visual and text features. They are not merely scaled Llama 3.1 dense models.",
    "operators": [
      "moe-routing",
      "attention",
      "rope",
      "feed-forward"
    ],
    "details": [
      [
        "Scout vs Maverick",
        "The card reports Scout at 109B total/17B active with 16 experts, and Maverick at 400B total/17B active with 128 experts. Reported context windows and training mixtures also differ."
      ],
      [
        "Multimodal early fusion",
        "A vision encoder supplies image features to the shared autoregressive backbone. The generic attention/expert diagrams explain operator principles and do not imply every Llama 4 layer is identical."
      ]
    ],
    "refs": [
      "llama4"
    ],
    "facts": [
      [
        "Parameters",
        "Scout 109B / 17B active"
      ]
    ],
    "flow": [
      {
        "label": "Text + images",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embed + vision",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Text token embeddings and projected visual features form the input sequence. The displayed layer dimensions refer to the text backbone."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = L",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "gpt2",
    "name": "GPT-2",
    "kind": "transformer",
    "family": "GPT",
    "lede": "A published decoder with learned absolute positions.",
    "description": "GPT-2’s released implementation uses learned token and position embeddings, pre-LayerNorm attention/MLP blocks, GELU, and a tied vocabulary projection. It does not use RoPE or SwiGLU.",
    "operators": [
      "attention",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "A useful historical baseline",
        "The public small model has 12 layers, width 768 and 12 attention heads. The model.py function named conv1d implements a learned linear projection here, not a spatial CNN convolution."
      ]
    ],
    "refs": [
      "gpt2-code"
    ],
    "facts": [
      [
        "Parameters",
        "124M small example"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses learned absolute embeddings positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "MHA",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The MHA block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "GELU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "GELU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 12",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "MHA",
    "pattern": [],
    "config": null
  },
  {
    "id": "gpt3",
    "name": "GPT-3",
    "kind": "transformer",
    "family": "GPT",
    "lede": "Scale a decoder while keeping a documented attention pattern.",
    "description": "The GPT-3 paper describes a GPT-2-style autoregressive architecture with alternating dense and locally banded sparse attention. Its 175B model has 96 layers and hidden width 12288.",
    "operators": [
      "attention",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Published does not mean open weights",
        "The paper supplies architectural details, but the original full GPT-3 checkpoints were not released like GPT-2. Do not infer later GPT architectures from GPT-3’s published dimensions."
      ]
    ],
    "refs": [
      "gpt3-paper"
    ],
    "facts": [
      [
        "Parameters",
        "175B documented example"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses learned positions positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "Dense / local sparse",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The Dense / local sparse block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "LayerNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "GELU",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "GELU expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 96",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "Dense / local sparse",
    "pattern": [],
    "config": null
  },
  {
    "id": "gpt-oss",
    "name": "gpt-oss",
    "kind": "transformer",
    "family": "GPT",
    "lede": "An open-weight GPT with MoE and alternating attention windows.",
    "description": "The 120b checkpoint uses routed expert FFNs, GQA and alternating sliding/full attention. Its released configuration and weights allow a concrete explanation, unlike undisclosed hosted GPT internals.",
    "operators": [
      "attention",
      "moe-routing",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Read explicit head dimensions",
        "The config has hidden width 2880, 64 query heads and head_dim=64. Do not assume head_dim=hidden_size/num_attention_heads: the query projection can expand to a different width."
      ],
      [
        "Precision is selective",
        "The config uses MXFP4 quantization for expert weights while excluding attention, router, token embeddings and output head. This does not make every model tensor four-bit."
      ]
    ],
    "refs": [
      "gptoss-doc",
      "gptoss-config",
      "gptoss-card"
    ],
    "facts": [
      [
        "Parameters",
        "117B / 5.1B active"
      ],
      [
        "Layers × width",
        "36 × 2,880"
      ],
      [
        "Query / KV heads",
        "64 / 8"
      ],
      [
        "Routed experts / selected",
        "128 / 4"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Tokenize the sequence",
        "text": "Token IDs select rows in an embedding table. Padding and attention masks describe which positions participate."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Build token representations",
        "text": "Embed tokens into width D; this blueprint uses RoPE positional handling. Vocabulary size and hidden width are separate dimensions."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize the attention input",
        "text": "A pre-norm sublayer transforms the normalized input while preserving a residual path."
      },
      {
        "label": "GQA + local/full",
        "shape": "T × D",
        "title": "Mix information across positions",
        "text": "The GQA + local/full block combines causal sequence information. Choose its operator view to inspect scores, cache or recurrent-state behavior."
      },
      {
        "label": "+ residual",
        "shape": "T × D",
        "title": "Add the attention residual",
        "text": "Add the attention result to the input residual stream. mHC models instead mix several residual streams; their dedicated view explains the difference."
      },
      {
        "label": "RMSNorm",
        "shape": "T × D",
        "title": "Normalize for channel mixing",
        "text": "The next pre-norm prepares token features for a dense FFN or selected expert FFNs."
      },
      {
        "label": "MoE",
        "shape": "D → F → D",
        "title": "Transform token features",
        "text": "MoE expands and contracts feature dimensions; add its output through the model’s residual rule."
      },
      {
        "label": "Repeat blocks",
        "shape": "L = 36",
        "title": "Repeat the layer stack",
        "text": "Each layer has its own learned weights. Repeating the stack is different from reusing one diffusion denoiser across sampling steps."
      },
      {
        "label": "Norm + LM head",
        "shape": "D → V",
        "title": "Project to vocabulary logits",
        "text": "Final normalization and the vocabulary projection map hidden features to next-token scores. Weight tying is model-specific."
      },
      {
        "label": "Next token",
        "shape": "V → 1",
        "title": "Generate or evaluate a token",
        "text": "Inference samples or selects the next token. Training compares logits with shifted labels; the prompt is not re-generated one token at a time during teacher forcing."
      }
    ],
    "attention": "GQA + local/full",
    "pattern": [
      "SWA",
      "Full"
    ],
    "config": "gptoss-config"
  },
  {
    "id": "hosted-gpt",
    "name": "GPT-4 / 4.1 · public scope",
    "kind": "public",
    "family": "GPT",
    "lede": "Documented capabilities; undisclosed internal architecture.",
    "description": "This page deliberately separates public interface information from internal architecture. The linked GPT-4.1 documentation is not evidence for a particular MoE count, attention layout or parameter total.",
    "operators": [],
    "details": [
      [
        "What can be explained",
        "Autoregressive generation, attention and MoE are useful general concepts, but applying a specific block diagram to an undisclosed model would be speculation. Follow the published GPT model pages for concrete examples."
      ]
    ],
    "refs": [
      "gpt41-doc"
    ],
    "facts": [
      [
        "Architecture details",
        "Not publicly specified"
      ],
      [
        "Evidence",
        "Official API documentation"
      ]
    ],
    "flow": [
      {
        "label": "Text / images",
        "shape": "public inputs",
        "title": "Read the documented interface",
        "text": "The API documents supported inputs and output modalities. Interface support does not disclose an internal block layout."
      },
      {
        "label": "Hosted model",
        "shape": "internals undisclosed",
        "title": "Keep unknown internals unknown",
        "text": "The cited GPT-4.1 documentation does not specify layer count, expert topology, hidden width or KV-head dimensions."
      },
      {
        "label": "Generated text",
        "shape": "output",
        "title": "Read the supported outputs",
        "text": "Published capabilities and limits are distinct from architectural specifications. Use GPT-2, GPT-3 or gpt-oss for concrete published operator layouts."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "rwkv7",
    "name": "RWKV-7 · Goose",
    "kind": "rwkv",
    "family": "Recurrent models",
    "lede": "Dynamic state evolution with a generalized delta rule.",
    "description": "RWKV-7 updates a matrix state with decay, a state-dependent rank-one term and a new KV write. Time mixing and channel mixing remain separate blocks.",
    "operators": [
      "rwkv-state",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "A versioned recurrence",
        "The state-update operator compares RWKV-6 and RWKV-7. The core equation omits some projection, normalization and value-residual details that are present in the cited implementation."
      ]
    ],
    "refs": [
      "rwkv-paper",
      "rwkv7-code"
    ],
    "facts": [
      [
        "Parameters",
        "paper: 0.19B–2.9B"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Read the sequence",
        "text": "Inputs are token IDs during language modeling. The state starts at zero or a previous request checkpoint."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Embed each token",
        "text": "Learned token embeddings produce the features consumed by the first recurrent block."
      },
      {
        "label": "Norm + mix",
        "shape": "T × D",
        "title": "Prepare gated features",
        "text": "Input projections, normalization and short-range mixing prepare keys, values or state-space parameters."
      },
      {
        "label": "RWKV-7",
        "shape": "state S",
        "title": "Update the sequence state",
        "text": "RWKV-7 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys."
      },
      {
        "label": "Read + gate",
        "shape": "T × D",
        "title": "Read the current state",
        "text": "A learned readout and output gate convert memory into token features, then return to the residual stream."
      },
      {
        "label": "Channel mix",
        "shape": "D → F → D",
        "title": "Mix feature channels",
        "text": "Version-specific nonlinear blocks transform each token independently of the sequence-state update."
      },
      {
        "label": "Repeat + head",
        "shape": "L blocks",
        "title": "Run the stack and output head",
        "text": "Repeat the learned blocks and map the final features to vocabulary scores."
      },
      {
        "label": "Token + state",
        "shape": "state carried",
        "title": "Carry state to the next token",
        "text": "Each request keeps its own recurrent state. Training can use parallel/chunked kernels while preserving the recurrence."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "mamba2",
    "name": "Mamba-2",
    "kind": "ssm",
    "family": "Recurrent models",
    "lede": "A structured state-space core designed around efficient matrix operations.",
    "description": "Mamba-2 reformulates selective state spaces through structured state-space duality. It uses a constrained recurrence structure rather than a full dense causal attention matrix.",
    "operators": [
      "state-space",
      "convolution",
      "normalization"
    ],
    "details": [
      [
        "State dimension is a real design choice",
        "Fixed sequence-state size is determined by head/state dimensions and layer count. Efficient chunked kernels and recurrent decoding are two execution paths for the same model dependencies."
      ],
      [
        "Pure Mamba block",
        "The illustrated pure Mamba-2 stack uses input projection, causal depthwise convolution, state-space mixing, gated normalization and output projection. It does not insert a separate Transformer FFN after every SSM. Hybrid backbones can make other choices."
      ]
    ],
    "refs": [
      "mamba2-paper",
      "mamba"
    ],
    "facts": [
      [
        "Backbone",
        "ssm"
      ],
      [
        "Scope",
        "Published architecture"
      ]
    ],
    "flow": [
      {
        "label": "Token IDs",
        "shape": "T",
        "title": "Read the sequence",
        "text": "Inputs are token IDs during language modeling. The state starts at zero or a previous request checkpoint."
      },
      {
        "label": "Embedding",
        "shape": "T × D",
        "title": "Embed each token",
        "text": "Learned token embeddings produce the features consumed by the first recurrent block."
      },
      {
        "label": "Norm + mix",
        "shape": "T × D",
        "title": "Prepare gated features",
        "text": "Input projections, normalization and short-range mixing prepare keys, values or state-space parameters."
      },
      {
        "label": "Mamba-2",
        "shape": "state S",
        "title": "Update the sequence state",
        "text": "Mamba-2 propagates a compact state between positions. Its update is not softmax over a stored list of all historical keys."
      },
      {
        "label": "Read + gate",
        "shape": "T × D",
        "title": "Read the current state",
        "text": "A learned readout and output gate convert memory into token features, then return to the residual stream."
      },
      {
        "label": "Repeat + head",
        "shape": "L blocks",
        "title": "Run the stack and output head",
        "text": "Repeat the learned blocks and map the final features to vocabulary scores."
      },
      {
        "label": "Token + state",
        "shape": "state carried",
        "title": "Carry state to the next token",
        "text": "Each request keeps its own recurrent state. Training can use parallel/chunked kernels while preserving the recurrence."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "stable-diffusion",
    "name": "Stable Diffusion · v1.5",
    "kind": "diffusion",
    "family": "Image models",
    "lede": "A text-conditioned U-Net denoises a compact image latent.",
    "description": "Stable Diffusion v1.5 combines a text encoder, latent-space U-Net with cross-attention, a noise scheduler, and an autoencoder decoder. Later SDXL and SD3 releases use different components.",
    "operators": [
      "diffusion-step",
      "convolution",
      "attention",
      "normalization"
    ],
    "details": [
      [
        "Down path, bottleneck, up path",
        "The U-Net changes spatial resolution while skip connections restore local detail. Text cross-attention uses image features as queries and text features as keys/values. This differs from causal language self-attention."
      ],
      [
        "Training is not a full sampling chain",
        "A typical noise-prediction training step samples a time and predicts noise from one corrupted latent. Generation instead runs many successive scheduler steps."
      ]
    ],
    "refs": [
      "sd-card",
      "diffusion-paper"
    ],
    "facts": [
      [
        "Parameters",
        "v1.5 reference"
      ]
    ],
    "flow": [
      {
        "label": "Text / condition",
        "shape": "conditioning",
        "title": "Encode the condition",
        "text": "A text encoder or another conditioning network produces features that guide generation."
      },
      {
        "label": "Noise latent",
        "shape": "C × H × W",
        "title": "Initialize a latent sample",
        "text": "Start from sampled noise for generation; latent models operate at reduced spatial resolution."
      },
      {
        "label": "Time embedding",
        "shape": "t → D",
        "title": "Tell the network the noise level",
        "text": "A time/noise embedding changes the denoiser’s computation at each sampling step."
      },
      {
        "label": "U-Net",
        "shape": "latent → latent",
        "title": "Predict noise or velocity",
        "text": "The U-Net mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers."
      },
      {
        "label": "Scheduler",
        "shape": "xₜ → xnext",
        "title": "Update the noisy sample",
        "text": "Apply the sampler rule matching the model target and time convention. The operator view contrasts DDPM with flow matching."
      },
      {
        "label": "Repeat steps",
        "shape": "same weights",
        "title": "Reuse the denoiser",
        "text": "Run the same network weights at the next time value. More steps trade compute and latency for the sampler’s behavior."
      },
      {
        "label": "VAE decoder",
        "shape": "latent → RGB",
        "title": "Decode the final image",
        "text": "A learned VAE decoder converts the final latent to pixels in latent-diffusion and latent-flow systems."
      },
      {
        "label": "Image",
        "shape": "H × W × 3",
        "title": "Return the generated image",
        "text": "The output is an image, not vocabulary logits. Denoising-step parallelism differs from autoregressive token dependencies."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  },
  {
    "id": "flux1",
    "name": "FLUX.1",
    "kind": "diffusion",
    "family": "Image models",
    "lede": "A latent flow model with a Transformer denoiser.",
    "description": "FLUX.1 uses a flow-based generation process with a Transformer backbone and text conditioning. Its dual-stream/single-stream structure differs from Stable Diffusion v1.5’s convolutional U-Net.",
    "operators": [
      "diffusion-step",
      "attention",
      "rope",
      "normalization",
      "feed-forward"
    ],
    "details": [
      [
        "Keep the sampler matched to the release",
        "Dev and distilled variants can use different guidance/sampling conventions. The flow animation uses an explicit noise→data time convention and a toy Euler step; it does not claim to reproduce every FLUX sampler."
      ]
    ],
    "refs": [
      "flux"
    ],
    "facts": [
      [
        "Parameters",
        "FLUX.1 family"
      ]
    ],
    "flow": [
      {
        "label": "Text / condition",
        "shape": "conditioning",
        "title": "Encode the condition",
        "text": "A text encoder or another conditioning network produces features that guide generation."
      },
      {
        "label": "Noise latent",
        "shape": "C × H × W",
        "title": "Initialize a latent sample",
        "text": "Start from sampled noise for generation; latent models operate at reduced spatial resolution."
      },
      {
        "label": "Time embedding",
        "shape": "t → D",
        "title": "Tell the network the noise level",
        "text": "A time/noise embedding changes the denoiser’s computation at each sampling step."
      },
      {
        "label": "Dual / single-stream DiT",
        "shape": "latent → latent",
        "title": "Predict noise or velocity",
        "text": "The Dual / single-stream DiT mixes spatial information and conditioning. A U-Net and a diffusion Transformer are alternative backbones, not identical layers."
      },
      {
        "label": "Scheduler",
        "shape": "xₜ → xnext",
        "title": "Update the noisy sample",
        "text": "Apply the sampler rule matching the model target and time convention. The operator view contrasts DDPM with flow matching."
      },
      {
        "label": "Repeat steps",
        "shape": "same weights",
        "title": "Reuse the denoiser",
        "text": "Run the same network weights at the next time value. More steps trade compute and latency for the sampler’s behavior."
      },
      {
        "label": "VAE decoder",
        "shape": "latent → RGB",
        "title": "Decode the final image",
        "text": "A learned VAE decoder converts the final latent to pixels in latent-diffusion and latent-flow systems."
      },
      {
        "label": "Image",
        "shape": "H × W × 3",
        "title": "Return the generated image",
        "text": "The output is an image, not vocabulary logits. Denoising-step parallelism differs from autoregressive token dependencies."
      }
    ],
    "attention": "GQA",
    "pattern": [],
    "config": null
  }
];
const MODEL_SOURCES={
  "openai-models": [
    "openai models",
    "https://developers.openai.com/api/docs/models"
  ],
  "openai-gpt-oss": [
    "openai gpt oss",
    "https://developers.openai.com/api/docs/models/gpt-oss-120b"
  ],
  "openai-gpt41": [
    "openai gpt41",
    "https://developers.openai.com/api/docs/models/gpt-4.1"
  ],
  "ds-v32": [
    "ds v32",
    "https://raw.githubusercontent.com/deepseek-ai/DeepSeek-V3.2/main/README.md"
  ],
  "ds-v3": [
    "ds v3",
    "https://raw.githubusercontent.com/deepseek-ai/DeepSeek-V3/main/README.md"
  ],
  "deepseek-repos": [
    "deepseek repos",
    "https://api.github.com/orgs/deepseek-ai/repos?per_page=100"
  ],
  "qwen-repos": [
    "qwen repos",
    "https://api.github.com/orgs/QwenLM/repos?per_page=100"
  ],
  "qwen35": [
    "qwen35",
    "https://raw.githubusercontent.com/QwenLM/Qwen3.5/main/README.md"
  ],
  "qwen3": [
    "qwen3",
    "https://raw.githubusercontent.com/QwenLM/Qwen3/main/README.md"
  ],
  "qwen38": [
    "qwen38",
    "https://raw.githubusercontent.com/QwenLM/Qwen3.8/main/README.md"
  ],
  "mamba": [
    "mamba",
    "https://raw.githubusercontent.com/state-spaces/mamba/main/README.md"
  ],
  "llama4": [
    "llama4",
    "https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama4/MODEL_CARD.md"
  ],
  "rwkv7": [
    "rwkv7",
    "https://raw.githubusercontent.com/BlinkDL/RWKV-LM/main/README.md"
  ],
  "flux": [
    "FLUX reference repository",
    "https://raw.githubusercontent.com/black-forest-labs/flux/main/README.md"
  ],
  "hf-qwen-list": [
    "hf qwen list",
    "https://huggingface.co/api/models?author=Qwen&search=Qwen3.8&limit=50"
  ],
  "hf-deepseek-list": [
    "hf deepseek list",
    "https://huggingface.co/api/models?author=deepseek-ai&limit=100&sort=lastModified&direction=-1"
  ],
  "ds-v3-config": [
    "DeepSeek-V3 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3/resolve/main/config.json"
  ],
  "ds-v2-config": [
    "DeepSeek-V2 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V2/resolve/main/config.json"
  ],
  "ds-v31-config": [
    "DeepSeek-V3.1 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3.1/resolve/main/config.json"
  ],
  "ds-r1-config": [
    "DeepSeek-R1 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-R1/resolve/main/config.json"
  ],
  "qwen3-moe-config": [
    "Qwen3-235B-A22B · released config",
    "https://huggingface.co/Qwen/Qwen3-235B-A22B/resolve/main/config.json"
  ],
  "qwen25-config": [
    "Qwen2.5 · released config",
    "https://huggingface.co/Qwen/Qwen2.5-7B/resolve/main/config.json"
  ],
  "qwen3-config": [
    "Qwen3 · released config",
    "https://huggingface.co/Qwen/Qwen3-8B/resolve/main/config.json"
  ],
  "ds-v32-config": [
    "ds-v32 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/resolve/main/config.json"
  ],
  "qwen35-code": [
    "Qwen3.5 · reference code",
    "https://raw.githubusercontent.com/huggingface/transformers/main/src/transformers/models/qwen3_5/modeling_qwen3_5.py"
  ],
  "gpt-oss-config": [
    "gpt-oss · released config",
    "https://developers.openai.com/api/docs/models/gpt-oss-120b"
  ],
  "qwen38-config": [
    "Qwen3.8-27B · released config",
    "https://huggingface.co/Qwen/Qwen3.8-27B/resolve/main/config.json"
  ],
  "qwen-next-config": [
    "Qwen3-Next · released config",
    "https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct/resolve/main/config.json"
  ],
  "qwen35-config": [
    "Qwen3.5 · released config",
    "https://huggingface.co/Qwen/Qwen3.5-397B-A17B/resolve/main/config.json"
  ],
  "rwkv7-code": [
    "rwkv7 · reference code",
    "https://raw.githubusercontent.com/BlinkDL/RWKV-LM/main/RWKV-v7/train_temp/src/model.py"
  ],
  "ds-dsa-code": [
    "ds-dsa · reference code",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/resolve/main/inference/model.py"
  ],
  "ds-v41-card": [
    "DeepSeek-V4.1 model card",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/raw/main/README.md"
  ],
  "ds-v4-card": [
    "DeepSeek-V4 model card",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/raw/main/README.md"
  ],
  "ds-v4-pro-config": [
    "DeepSeek-V4-Pro · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/resolve/main/config.json"
  ],
  "ds-v41-config": [
    "DeepSeek-V4.1 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/config.json"
  ],
  "ds-v4-flash-config": [
    "DeepSeek-V4-Flash · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/resolve/main/config.json"
  ],
  "ds-v32-final-card": [
    "DeepSeek-V3.2 model card",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3.2/raw/main/README.md"
  ],
  "gptoss-doc": [
    "OpenAI gpt-oss documentation",
    "https://developers.openai.com/api/docs/models/gpt-oss-120b.md"
  ],
  "qwen38-card": [
    "Qwen3.8-27B model card",
    "https://huggingface.co/Qwen/Qwen3.8-27B/raw/main/README.md"
  ],
  "qwen38-big-config": [
    "qwen38-big · released config",
    "https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/resolve/main/config.json"
  ],
  "ds-v32-final-config": [
    "DeepSeek-V3.2 · released config",
    "https://huggingface.co/deepseek-ai/DeepSeek-V3.2/resolve/main/config.json"
  ],
  "gptoss-card": [
    "gpt-oss-120b · model card",
    "https://huggingface.co/openai/gpt-oss-120b/raw/main/README.md"
  ],
  "gpt2-code": [
    "GPT-2 · reference code",
    "https://raw.githubusercontent.com/openai/gpt-2/master/src/model.py"
  ],
  "gpt41-doc": [
    "OpenAI GPT-4.1 documentation",
    "https://developers.openai.com/api/docs/models/gpt-4.1.md"
  ],
  "llama3-card": [
    "Llama 3 · model card",
    "https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama3_1/MODEL_CARD.md"
  ],
  "gptoss-config": [
    "gpt-oss-120b · released config",
    "https://huggingface.co/openai/gpt-oss-120b/resolve/main/config.json"
  ],
  "qwen-delta-doc": [
    "qwen delta doc",
    "https://raw.githubusercontent.com/fla-org/flash-linear-attention/main/fla/ops/gated_delta_rule/naive.py"
  ],
  "sd-card": [
    "Stable Diffusion · model card",
    "https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/raw/main/README.md"
  ],
  "ds-v4-code": [
    "DeepSeek-V4 · reference code",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash/resolve/main/inference/model.py"
  ],
  "llama2-config": [
    "Llama 2 · released config",
    "https://raw.githubusercontent.com/meta-llama/llama-models/main/models/llama2/MODEL_CARD.md"
  ],
  "ds-v41-code": [
    "DeepSeek-V4.1 · reference code",
    "https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/resolve/main/inference/model.py"
  ],
  "diffusion-paper": [
    "DDPM paper",
    "https://arxiv.org/abs/2006.11239"
  ],
  "mamba-paper": [
    "Mamba paper",
    "https://arxiv.org/abs/2312.00752"
  ],
  "transformer-paper": [
    "Attention Is All You Need",
    "https://arxiv.org/abs/1706.03762"
  ],
  "mamba2-paper": [
    "Mamba-2 / SSD paper",
    "https://arxiv.org/abs/2405.21060"
  ],
  "vit-paper": [
    "Vision Transformer paper",
    "https://arxiv.org/abs/2010.11929"
  ],
  "gpt3-paper": [
    "GPT-3 paper",
    "https://arxiv.org/abs/2005.14165"
  ],
  "rope-paper": [
    "RoFormer / RoPE paper",
    "https://arxiv.org/abs/2104.09864"
  ],
  "rwkv-paper": [
    "RWKV-7 paper",
    "https://arxiv.org/abs/2503.14456"
  ],
  "flash-paper": [
    "FlashAttention paper",
    "https://arxiv.org/abs/2205.14135"
  ]
};
const MODEL_NOTATION=[
  [
    "T, D, F, V",
    "token count, hidden width, FFN inner width, and vocabulary size"
  ],
  [
    "Q, K, V; dₖ",
    "query, key and value tensors; key-head dimension (V in equations is distinguished by context)"
  ],
  [
    "Hq, Hkv; M",
    "query-head count, KV-head count, and attention mask (0 or −∞)"
  ],
  [
    "⊙, Σ, ε",
    "elementwise multiplication, summation, and small numerical stabilizer"
  ]
];
const MODEL_EXTRA_NOTATION={
  "flash": [
    "m, ℓ, u",
    "running maximum, exponential sum and unnormalized weighted-value sum for one query row"
  ],
  "rope": [
    "p, θⱼ, R",
    "position, frequency for feature pair j, and a 2D rotation matrix"
  ],
  "norm": [
    "μ, σ², γ, b",
    "feature mean, variance, learned scale and learned bias"
  ],
  "ffn": [
    "Wg, Wu, Wd",
    "gate, expansion and contraction projection matrices; SiLU(z)=z·sigmoid(z)"
  ],
  "routing": [
    "E, k, gₑ",
    "number of routed experts, selected expert count and output combine weight"
  ],
  "mla": [
    "cKV, WDKV, WUK, WUV",
    "cached KV latent; down-projection and key/value up-projections"
  ],
  "sparse": [
    "Jₜ, TopK",
    "selected causal positions at time t, and selection of the largest k indexer scores"
  ],
  "compressed": [
    "CSA, HCA",
    "Compressed Sparse Attention and Heavily Compressed Attention; groups are illustrative"
  ],
  "hyper": [
    "Hpre, Hres, Hpost",
    "input-stream merge, residual-stream mixing, and sublayer-output distribution matrices"
  ],
  "ssm": [
    "h, Ā, B̄, C, Δ",
    "state, discretized transition/input maps, readout and selected time step"
  ],
  "delta": [
    "S, λ, β, q, k, v",
    "matrix memory, decay, write strength, query, key and value; toy q/k scale is 1"
  ],
  "rwkv": [
    "S, w, a, b, r",
    "matrix state, vector decay, rank-one modifier vectors and state read vector"
  ],
  "conv": [
    "s, u, v, c, o",
    "stride, filter-row/column indices, input channel and output channel"
  ],
  "diffusion": [
    "x₀, xₜ, ε, ᾱₜ, z, t, vθ",
    "clean data, noisy data, Gaussian noise, cumulative noise schedule, initial noise, time and predicted velocity"
  ],
  "crosskv": [
    "KV, Full, Reindex, Reuse",
    "shared attention memory and three static CSA2 layer roles; layer IDs are zero-based"
  ],
  "engram": [
    "n-gram, ID",
    "a short contiguous token sequence and its deterministic memory-row lookup identifier"
  ],
  "speculative": [
    "draft, target, prefix",
    "candidate generator, verifier model, and consecutive accepted tokens before the first rejection"
  ]
};
