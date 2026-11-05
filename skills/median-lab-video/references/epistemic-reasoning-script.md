# Epistemic Reasoning & Scriptwriting Engine ("Siêu Suy Luận" @median-lab)

Distilled from a full corpus analysis of 30 `@median-lab` videos (*Bản chất thật của số Pi*, *Tại sao Âm nhân Âm bằng Dương*, *Bản chất của Lượng giác*, *Tại sao 0! = 1*, *0^0 = 1*, *Bản chất của Xác suất*, *Mol*, *Cơ học Newton*, *Toán học sau 30,000 năm*, *Vật lý sau 2,500 năm*).

---

## 0. Mandatory Script & Character Rules (NON-NEGOTIABLE)

1. **100% English Voiceover & English Subtitles (`en-US-AndrewMultilingualNeural`)**:
   - Every script (`SCRIPT_*.md` and `data/script.json`) MUST write all spoken dialogue (`segments[].text`) and on-screen subtitles in **100% English**.
   - Never omit the bottom English subtitle track (`drawSubtitles` at `Y ≈ 998` with word-level highlight).
2. **Normal Pure-White Stickman Presenter (NO Cape, NO Face, NO Props)**:
   - The presenter is a **normal matte-white stick figure (`#f8fafc`)**: solid filled white circle head, curved spine, two 2-segment arms, and two 2-segment legs with foot-locked IK gait.
   - **NEVER include in any script or code**: capes/scarves (`không áo choàng / khăn`), eyes/mouth/face/lip-sync (`không khuôn mặt`), or teaching batons/wands (`không gậy`). Expressiveness comes 100% from body posture (`WAVE_HELLO`, `EXPLAIN_OPEN`, `EXPLAIN_BOTH`, `PRESENT_RIGHT`, `PRESENT_SKY`, `THINK_CHIN`, `SHRUG_WIDE`) and smooth C² walking.

---

## 1. The Core Epistemic Principle

Most educational videos fail because they answer **"What is the rule and how do I use it?"** (procedural knowledge).
`@median-lab` always answers **"Why is this rule logically inescapable once you accept elementary premises, and what is the deeper reality behind the textbook definition?"** (ontological & epistemic understanding).

Every script operates on three cognitive moves:
1. **Separate Measurement/Convention from Essence**: Show that the textbook definition is merely a *way to measure* or a *compressed notation*, not the thing itself.
2. **Expose the Flaw in Naive Intuition**: Present the popular analogies people use to feel comfortable, then gently show where those analogies break down (*"Cảm thấy đúng không phải là chứng minh toán học"*).
3. **Construct the Inevitability**: Start from 2–3 undeniable primary-school axioms and let the conclusion fall out by pure logic or continuous geometric deformation.

---

## 2. The 6-Act Epistemic Script Architecture

Use this exact 6-Act structure for concept explainers (target 8–15 minutes / 1,500–2,800 words, or scaled proportionally to 3–5 minutes / 500–900 words):

### Act 0: The Deceptive Familiarity Hook (0:00 – 0:45, ~5–7% of duration)
- **Starts after `1.0s` of pure silence.**
- **Move 1 (The Grade-School Memory)**: State a formula or fact every viewer learned in middle school and accepts without question (`π = 3.14159...`, `(-1) × (-1) = 1`, `sin = đối / huyền`).
- **Move 2 (The Epistemic Pivot)**: Immediately point out that the textbook definition only tells you *how to calculate it* or *what to memorize*, not *why it must be that way*.
- **Move 3 (The Thesis Questions)**: Pose 3 sharp questions that escalate from concrete to mind-bending (the last question hints at the Act 4 twist).

**Canonical Vietnamese Blueprints:**
- *" [X] là con số / quy tắc bạn học từ lớp sáu... Định nghĩa chuẩn trong sách giáo khoa là [Y]. Định nghĩa đó đúng, nhưng nó không cho bạn biết [X] thực sự là gì. Nó chỉ cho bạn cách đo [X]."*
- *"Chắc chắn bạn biết nó đúng mà không cần phải nghĩ. Nhưng có thể bạn chưa từng dừng lại để hỏi một câu rất đơn giản: Tại sao lại như vậy?"*
- *"Video này sẽ giải thích [X] thật ra là gì, tại sao nó bắt buộc phải bằng [Y], và tại sao trong một bối cảnh khác, quy tắc quen thuộc này không còn đúng nữa."*

**Canonical English Blueprints:**
- *"You learned [X] in sixth grade... The textbook defines it as [Y]. That definition is correct—but it only tells you how to measure [X], not what [X] actually is."*
- *"You know it's true without thinking twice. Yet almost nobody stops to ask a deceptively simple question: Why must it be this way?"*

---

### Act 1: Destabilizing Naive Answers & The Historical Bottleneck (~15% of duration)
- **Move 1 (Refuting Arbitrariness)**: Ask why the value/rule isn't simpler. Why isn't $\pi = 3$ or $4$? Why isn't $(-1) \times (-1) = -1$? Point out that *"Không có hội đồng toán học nào họp lại và quyết định..."* (No committee voted on this). Once basic axioms are fixed, the result is forced.
- **Move 2 (Critiquing Popular Analogies)**: List 2–3 familiar ways people explain it (e.g., "debt of a debt is an asset", "continuing a pattern on a number line", "measuring a physical wheel with a string") and show their exact epistemic limit:
  - Empirical measurement has no theoretical guarantee.
  - Pattern continuation assumes the pattern *must* continue—which begs the question.
  - Real-world analogies (debt, walking backward) are helpful mnemonics, not proofs.
- **Move 3 (Historical Proof of Difficulty)**: Use history not as trivia, but as **evidence of non-obviousness**: *"Nếu quy tắc này hiển nhiên đến mức không cần chứng minh, nhân loại đã không mất hơn 1,000 năm mới chấp nhận được nó."* Introduce key historical figures (Archimedes, Diophantus, Brahmagupta, Hipparchus) at the exact moment they hit the bottleneck.

---

### Act 2: First-Principles Construction (The Mechanism / Proof) (~25% of duration)
- **Move 1 (The Contract of Elementary Premises)**: Before proving or constructing, explicitly ask the viewer to agree to 2–3 simple rules they already use every day. Strip away intimidating jargon:
  - *"Để làm được, mình cần bạn đồng ý ba điều cơ bản trước. Đây là mấy điều bạn dùng từ hồi tiểu học, mình chỉ gọi tên ra thôi... Trong toán hiện đại nó nằm trong khái niệm [Vành / Giới hạn], bạn không cần nhớ tên đó, chỉ cần đồng ý mấy quy tắc cơ bản này."*
- **Move 2 (Step-by-Step Visual & Logical Deduction)**:
  - Walk through Lemma → Step 1 → Step 2 → Destination (*"Xong bước một... Bước thứ hai... Bước thứ ba, đến đích"*).
  - Or for geometric/physical concepts: trap the unmeasurable curved/continuous quantity between two measurable straight/discrete bounds (e.g., Archimedes' inscribed vs. circumscribed polygons $N = 6 \to 12 \to 24 \to 96 \to \infty$, or average velocity over shrinking time intervals $\Delta t \to 0$).
- **Move 3 (Extracting the Ontological Meaning)**:
  - Never end a proof with "Q.E.D." State what the proof *reveals about the nature of the object*:
  - *"Điều quan trọng không phải con số Archimedes tìm ra. Điều quan trọng là ông cho thấy $\pi$ thực sự là gì: $\pi$ là giới hạn của một quá trình—nằm ở ranh giới giữa thẳng và cong. Nó là cái giá bạn phải trả để biến một hình có góc cạnh thành một hình mượt hoàn toàn."*

---

### Act 3: The Paradigm Shift / Deeper Essence ("Cú Bẻ Lái Nhận Thức") (~25% of duration)
- **This is the signature `@median-lab` climax.** Reveal that the object viewers associated with the concept in school is only a surface manifestation of a much deeper universal structure:
  - In *Pi*: *"Ở trường, $\pi$ được giới thiệu qua hình tròn. Nhưng ở tầng sâu hơn, $\pi$ không phải về hình tròn. $\pi$ là về sự quay (Radian)."* Then show how $360^\circ$ is an arbitrary Babylonian calendar convention, whereas Radian is pure intrinsic geometry—explaining why $\pi$ appears in pendulums, sound waves, AC current, Fourier transforms, and quantum mechanics where no physical circle exists!
  - In *Trigonometry*: Right triangles (`sin đi học`) break down past $90^\circ$; the true heart of trigonometry is the **unit circle** converting rotation into periodic waves.
  - In *Probability*: A tossed coin in mid-air is 100% deterministic physics (`F = ma`); probability is not a property of the coin, it is a measure of **epistemic uncertainty** (lack of information).
  - In *Negative × Negative*: Answer the viewer's deepest meta-objection (*"Làm sao biết tính chất phân phối phải đúng với số âm?"*) via Hankel's **Principle of Permanence of Formal Laws**—humanity *chose* to preserve algebraic laws when extending number systems, and that single choice forced $(-a)(-b) = ab$.

---

### Act 4: Breaking the Boundary (Where the Familiar Rule Fails) (~15% of duration)
- Push the concept into a regime where the textbook rule breaks down, revealing the hidden assumption that was silently holding it together all along:
  - In *Pi*: Draw a circle on a curved sphere (Earth) where $C/d < \pi$, on a hyperbolic saddle where $C/d > \pi$, and near a black hole in General Relativity. Reveal that $\pi = 3.14159...$ never changes as a mathematical constant, but $C = \pi d$ is a theorem of **flat Euclidean space**, not a universal law of all physical circles.
  - In *Newtonian Mechanics*: Show how Galilean velocity addition works for cars and trains, then hint at where it breaks near the speed of light $c$.

---

### Act 5: Multi-Layer Synthesis & Lingering Epistemic Outro (~10–13% of duration)
- **Move 1 (The Layered Recap)**: Explicitly gather each layer traversed in the video in crisp, parallel declarative sentences:
  - *"Sau khi đi qua các tầng khác nhau, có thể tóm lại [X] là gì như sau:*
    - *Tầng 1: [X] không đơn giản là [Định nghĩa sách giáo khoa]—đó chỉ là cách đo.*
    - *Tầng 2: [X] là [Giới hạn / Cấu trúc đại số].*
    - *Tầng 3: [X] là đơn vị tự nhiên của [Bản chất sâu hơn].*
    - *Tầng 4: Công thức quen thuộc chỉ đúng khi [Giả thiết ngầm được thỏa mãn]."*
- **Move 2 (The Lingering Lens)**: End with a quiet, memorable thought that permanently upgrades how the viewer perceives the world next time they see the symbol:
  - *"Lần sau khi bạn thấy $\pi$ trong một công thức, hãy để ý thử. Có thể không có hình tròn nào trong bài toán—nhưng nếu $\pi$ có mặt ở đâu đó, chắc chắn trong đó có sự quay, có sóng, hoặc có đối xứng tròn ẩn trong các phép tính."*

---

## 3. Linguistic & Rhetorical Rules (`@median-lab` Prose Style)

1. **Zero Fluff, Zero Hype Adjectives**:
   - Ban words like *"cực kỳ siêu đỉnh"*, *"bí ẩn kinh hoàng"*, *"không thể tin nổi"*, *"mind-blowing"*, *"insane"*.
   - Let intellectual clarity create awe. Use calm, understated transitions: *"Và đó là điều kỳ lạ đầu tiên."*, *"Hình dung thế này."*, *"Thế thôi."*, *"Điều này nói lên điều gì?"*, *"Đến đây có thể bạn sẽ hỏi ngược lại một câu rất hợp lý."*
2. **Short, Breathable Clauses**:
   - Average sentence length: **10–16 words**.
   - Complex derivations are broken into atomic sentences separated by `0.45s–0.65s` pauses so the viewer never has to hold more than one logical operation in working memory at a time.
3. **Self-Interrogation (Socratic Voice)**:
   - Anticipate the exact objection a smart viewer is thinking right at that second, voice it on their behalf, validate it (*"Câu hỏi này rất đúng trọng tâm"*), and answer it cleanly.
4. **Concrete Before Abstract**:
   - Always introduce a concrete visual mental model (*"một hòn đá cộng một hòn đá"*, *"một con kiến bò trên thước thẳng"*, *"vẽ một đa giác 6 cạnh kẹp trong và ngoài hình tròn"*) before writing the symbolic equation.
