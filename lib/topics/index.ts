import { KabuMood, TamaMood } from "@/components/cats/CatAvatar";

export interface StepDialogue {
  speaker: "kabu" | "tama";
  mood: KabuMood | TamaMood;
  text: string;
}

export interface TopicStep {
  id: "intuition" | "experience" | "simulation" | "reveal";
  title: string;
  dialogues: StepDialogue[];
  userPrompt?: {
    question: string;
    options: { label: string; value: string; isIntuitiveChoice?: boolean }[];
  };
}

export interface TopicDefinition {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: "初級" | "中級" | "上級";
  summary: string;
  mathTakeaway: string;
  formulaTitle: string;
  formulaDescription: string;
  formulaMath: string;
  steps: TopicStep[];
}

export const TOPICS: TopicDefinition[] = [
  {
    slug: "monty-hall",
    title: "モンティ・ホール問題",
    subtitle: "「扉を変える」と勝率は本当に2倍になる？",
    category: "条件付き確率",
    difficulty: "初級",
    summary:
      "3枚の扉のうち当たりは1つ。あなたが選んだ後、司会者がハズレの扉を1枚開けて見せてくれます。『扉を変えますか？』と聞かれたとき、変えるべきでしょうか？",
    mathTakeaway:
      "最初に選んだ扉が当たっている確率は1/3。残りの2枚の合計確率は2/3です。ハズレの扉が開けられることで、その2/3の確率が残った1枚にすべて集中します！",
    formulaTitle: "ベイズの定理による証明",
    formulaDescription:
      "最初に扉1を選び、司会者が扉3（ヤギ）を開けた条件での、扉2が車である確率:",
    formulaMath: "P(Car=2 | Host Opens 3) = (1 * 1/3) / (1/2 * 1/3 + 1 * 1/3 + 0) = 2/3",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、3つの扉があるよ。1つだけ豪華な高級キャットタワー（当たり）が入っているんだ。",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "わたしは扉1を選ぶにゃ！",
          },
          {
            speaker: "kabu",
            mood: "pointing",
            text: "ここでハズレを知っている私が、ハズレの扉3を開けて見せたよ。残りは扉1と扉2。扉を変えるかい？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "残りは2枚だからどっちも確率50%（1/2）に決まってるにゃ！ 変えても変えなくても同じにゃ！",
          },
        ],
        userPrompt: {
          question: "あなたは扉を変えますか？ それともそのまま維持しますか？",
          options: [
            { label: "変えても維持しても確率は1/2で同じ", value: "same", isIntuitiveChoice: true },
            { label: "扉を変えた方が有利（当たる確率が高い）", value: "switch" },
            { label: "最初に信じた扉を維持した方が有利", value: "stay" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "smiling",
            text: "ふふ、直感ではそう思えるよね。じゃあ実際に自分で扉を選んで、変えた場合と維持した場合を試してみようか。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "何回かやってみるにゃ！ ……あれ？ なんだか変えた時の方がよく当たる気がするような……？",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "10回や100回、さらには10,000回自動でシミュレーションしてみよう。大数の法則で真の確率が見えてくるよ。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "にゃにゃーーっ！？ 変えたら約66.7%（2/3）、維持したら約33.3%（1/3）！？ ちょうど2倍も勝率が違うにゃ！！",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "タマ助手、最初に選んだ扉が当たる確率は『1/3』だね。ということは『選ばなかった残りの2枚』に当たりがある確率は『2/3』だったんだ。",
          },
          {
            speaker: "kabu",
            mood: "pointing",
            text: "司会者がハズレを排除してくれたおかげで、その『2/3の確率』がまるごと残った1枚に流れ込んだんだよ。扉の数を100枚にしてスライダーで試すと一目瞭然だね！",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "なるほどにゃー！ 100枚中98枚ハズレを開けられたら、残った1枚が超怪しいのは当たり前にゃ！ 完全に理解したにゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "birthday",
    title: "誕生日のパラドックス",
    subtitle: "たった23人で誕生日の一致確率が50%超！？",
    category: "数え上げと余事象",
    difficulty: "初級",
    summary:
      "1年は365日もあります。教室に何人集まれば、「同じ誕生日のペアが少なくとも1組いる確率」が50%を超えるでしょうか？ 直感では180人くらい必要に見えますが……？",
    mathTakeaway:
      "直感の罠は『自分と同じ人を探す（22通り）』と錯覚すること。実際は『部屋の全員同士の握手ペア（23×22/2 = 253通り）』で判定されるため、23人で既に50%を超えます！",
    formulaTitle: "余事象による計算式",
    formulaDescription: "N人全員の誕生日がすべて異なる確率の余事象（1 - P(全員異なる)）:",
    formulaMath: "P(一致 >= 1) = 1 - (365/365 * 364/365 * 363/365 * ... * (365-N+1)/365)",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、1年は365日あるね。何人集まれば『同じ誕生日のペアが1組以上いる確率』が半分（50%）を超えると思う？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "365日の半分だから、だいたい180人くらい集まらないと半分にならないにゃ！ 20人や30人じゃ滅多に被らないにゃ！",
          },
        ],
        userPrompt: {
          question: "確率が50%を超える最小の人数は何人だと思いますか？",
          options: [
            { label: "約180人（365日の半分程度）", value: "180", isIntuitiveChoice: true },
            { label: "約100人", value: "100" },
            { label: "たったの23人", value: "23" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "smiling",
            text: "365マスのカレンダーに、生徒を1人ずつ入室させてみよう。衝突したらマスが光るよ。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "えっ！？ まだ20人ちょっとしか入れてないのに、もう光ったにゃ！？ 偶然かにゃ……？",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "10,000回シミュレーションして、人数ごとの一致確率グラフを描いてみよう。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "ひゃーーっ！ 23人の時点で一致確率が 50.7% に達してるにゃ！ 70人いたら 99.9% ほぼ確実に被るにゃ！？",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "人間の直感は『自分と誰か（22通り）』を考えがちだけど、実際は『23人の中の誰と誰でも良い』んだ。23人のペアの数は 23×22÷2 = 253本 もあるんだよ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "握手の本数が253本もあるなら、その中に1つくらい誕生日が被るペアがいても全然不思議じゃないにゃ！ すっきり納得にゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "base-rate",
    title: "検査のパラドックス（基準率の無視）",
    subtitle: "「精度99%の検査」で陽性！ 実際に病気である確率は？",
    category: "ベイズ統計と事前確率",
    difficulty: "中級",
    summary:
      "1,000人に1人（0.1%）がかかる珍しい病気。精度99%（感度99%・特異度99%）の超高精度な検査で「陽性」と判定されました。あなたが本当に病気である確率は何%？",
    mathTakeaway:
      "分母に注目！ 健康な9,990人の1%（約100人）が偽陽性になります。本物の病気の人（約10人）より偽陽性の方が10倍も多いため、陽性でも実際の感染率は約9%にとどまります。",
    formulaTitle: "陽性的中率 (PPV) の計算",
    formulaDescription: "陽性者全体の中で、真の有病者が占める割合:",
    formulaMath: "PPV = (0.001 * 0.99) / (0.001 * 0.99 + 0.999 * 0.01) = 0.00099 / 0.01098 ≈ 9.02%",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、1,000人に1人しかかからない病気の検査があるよ。感度99%・特異度99%の超高精度な検査で『陽性』が出たら、本当に病気である確率は何%だと思う？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "精度99%なんだから、99%病気に決まってるにゃ！ 絶望的にゃ……！",
          },
        ],
        userPrompt: {
          question: "「精度99%の検査で陽性」のとき、実際に病気である確率は？",
          options: [
            { label: "約99%（検査精度と同じ）", value: "99", isIntuitiveChoice: true },
            { label: "約50%", value: "50" },
            { label: "たったの約9%", value: "9" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "10,000人のねこ住民ドットグリッドを見てごらん。病気の猫（赤ドット）はたったの10匹しかいないね。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "健康な猫（緑ドット）が9,990匹もいるにゃ。全員に検査を受けさせてみるにゃ……！",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "検査結果が出たよ。4つの部屋（真陽性・偽陽性・偽陰性・真陰性）にドットを移動させてみよう。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "えええーーっ！？ 『陽性の部屋』に110匹いるのに、本当に病気なのはたった10匹で、残りの100匹は健康な猫（偽陽性）にゃ！？ 割合は 10/110 ≈ 9.1% しかないにゃ！！",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "これが『基準率の無視』の罠だよ。もともとの有病率（0.1%）が非常に低い場合、健康な9,990人のたった1%の誤診（約100匹）が、本物の病気猫（10匹）を圧倒してしまうんだ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "分母（陽性判定された人全体）に偽陽性が大量に混ざるからなんだにゃ！ グラフとドットの分離を見たら一発で理解できたにゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "simpson",
    title: "シンプソンのパラドックス",
    subtitle: "全学科で女性の合格率が高いのに、全体では男性が勝つ！？",
    category: "交絡変数と集計バイアス",
    difficulty: "中級",
    summary:
      "UCバークレー大学院の入試データ。6つの学科ごとに見ると、4つの学科で女性の合格率が男性を上回っています。しかし大学全体で合算すると、なぜか男性の合格率の方が大幅に高くなります！",
    mathTakeaway:
      "交絡変数の正体は『出願先の競争率』！ 女性は競争率が非常に激しい学科に多く出願し、男性は合格率の高い学科に多く出願していたため、単純合算すると比率の重みで全体が歪みます。",
    formulaTitle: "加重平均の歪み",
    formulaDescription: "全体の合格率は各学科の合格率の『出願者数による加重平均』:",
    formulaMath: "Overall Rate = Σ (Dept Rate_i * Applicants_i) / Total Applicants",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、A〜Fの6つの学科があるよ。大半の学科で女性の方が男性より合格率が高いとき、大学全体で合算した合格率はどちらが高くなると思う？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "各学科で女性が勝ってるんだから、全体でも女性の方が高くなるに決まってるにゃ！ 数学の常識にゃ！",
          },
        ],
        userPrompt: {
          question: "各学科で女性の合格率が高い場合、全体の合格率は？",
          options: [
            { label: "当然、女性の合格率の方が高くなる", value: "female", isIntuitiveChoice: true },
            { label: "男性の合格率の方が高くなることがあり得る", value: "male" },
            { label: "必ず同点になる", value: "same" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "smiling",
            text: "実際の1973年バークレー校のデータをバブルチャートで見てみよう。円の大きさが出願者数を表しているよ。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "学科A・B・D・Fで女性の合格率が勝ってるにゃ。でも女性の大きな円が下（合格率の低い学科）に集中してるような……？",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "学科ごとのデータを合算バーアニメーションで一つにまとめてみよう。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "にゃんとーーっ！ 合計すると男性44.5%に対し女性30.4%！ 14%も男性が高くなっちゃったにゃ！ なんで逆転するの！？",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "これが『シンプソンのパラドックス』だよ。女性は倍率の高い人気難関学科（C・E等）に多く出願し、男性は合格率の高い学科（A・B等）に多く出願していたんだ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "グループごとの人数（重み）が違うと、単純に合計したときに数字のトリックが起きるんだにゃ！ データを集計するときは隠れた変数に要注意にゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "nontransitive-dice",
    title: "非推移的サイコロ",
    subtitle: "「後出し」すれば絶対に勝てる魔法のサイコロ！？",
    category: "確率的優位と循環構造",
    difficulty: "初級",
    summary:
      "A, B, C, Dの4つの特製サイコロ（エフロンのサイコロ）。AはBに勝ちやすく、BはCに勝ちやすく、CはDに勝ちやすい……じゃあDとAを戦わせるとどうなる？",
    mathTakeaway:
      "じゃんけんのように『A > B > C > D > A』という強弱のループ（非推移性）が成立しています。どのサイコロを選んでも勝率2/3（約66.7%）で勝てる天敵が存在するため、後出し側が必勝です！",
    formulaTitle: "36通りのマトリクス勝率",
    formulaDescription: "2つのサイコロの各目（6×6=36通り）の勝敗判定:",
    formulaMath: "P(A > B) = 24/36 = 2/3,  P(B > C) = 24/36 = 2/3,  P(C > D) = 2/3,  P(D > A) = 2/3",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、A・B・C・Dの4つのサイコロがあるよ。AはBに勝率2/3で勝ち、BはCに勝率2/3で勝ち、CはDに勝率2/3で勝つんだ。",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "A > B > C > D なんだから、一番強いのはAで、一番弱いのはDに決まってるにゃ！ Aを選べば無敵にゃ！",
          },
        ],
        userPrompt: {
          question: "DとAが戦った場合、どちらが勝ちやすいでしょうか？",
          options: [
            { label: "A（最強のサイコロ）が勝つ", value: "A", isIntuitiveChoice: true },
            { label: "DがAに勝率2/3で勝つ（循環する）", value: "D" },
            { label: "引き分け（50%）になる", value: "tie" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "smiling",
            text: "タマ助手、好きなサイコロを先に選んでいいよ。私は残った3つから選ぶね。",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "じゃあ最強の赤サイコロ(A)にするにゃ！ ……えっ、カブ先生は黄サイコロ(D)を選ぶにゃ？ 勝負だにゃ！",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "1,000回サイコロ対決をしてみよう。6×6（全36通り）のマス目で勝ち数を数えてみるよ。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "ぎゃーーっ！ 黄色(D)に24勝12敗（勝率66.7%）でボロ負けしたにゃ！ DがAに勝っちゃうなんてどういうことにゃ！？",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "じゃんけん（グー＞チョキ＞パー＞グー）と同じで、サイコロの強弱関係も一本道とは限らずループするんだ。だから『後出し』した側が必ず有利（勝率2/3）になるんだよ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "数字の大小関係（推移律）が確率の世界では成り立たないことがあるんだにゃ！ サイクル図を見たら一目でわかったにゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "two-children",
    title: "2人の子供問題",
    subtitle: "「火曜生まれの男の子」で確率が変わる怪奇現象！？",
    category: "標本空間と情報量",
    difficulty: "上級",
    summary:
      "子供が2人いる家庭。「少なくとも1人は男の子」と知ったとき、2人とも男の子である確率は1/3。ところが「火曜日生まれの男の子がいる」と知ると、確率は13/27（約48.1%）に跳ね上がります！",
    mathTakeaway:
      "標本空間の消し込み！ 曜日という余分な情報がつくことで、(男・男) の重複カウントが減少し、分母のサイズが 4 から 196 (14×14) に拡張されて 13/27 に劇的変化します。",
    formulaTitle: "標本空間の数え上げ",
    formulaDescription: "火曜日生まれの男の子がいる条件での両方男の子の確率:",
    formulaMath: "P(Both Boys | At least one Tuesday Boy) = (7 + 7 - 1) / (14 + 14 - 1) = 13 / 27 ≈ 0.4815",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "子供が2人いる家があるよ。『少なくとも1人は男の子』と分かっているとき、2人とも男の子である確率はいくらだと思う？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "もう1人の子は男か女の50%（1/2）に決まってるにゃ！",
          },
          {
            speaker: "kabu",
            mood: "smiling",
            text: "基本版の答えは1/3なんだ。じゃあ『火曜日生まれの男の子がいる』と言われたら確率は変わるかい？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "曜日なんて何の関係もないにゃ！ 確率が変わるわけないにゃ！",
          },
        ],
        userPrompt: {
          question: "「火曜日生まれの男の子がいる」と聞いたとき、両方男の子の確率は？",
          options: [
            { label: "曜日なんて無関係なので 1/3 のまま", value: "same", isIntuitiveChoice: true },
            { label: "13/27（約48.1%）に確率が上がる", value: "13/27" },
            { label: "1/2（50%）になる", value: "1/2" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "まず基本版の標本空間4マス（男男、男女、女男、女女）を見てごらん。『少なくとも1人男』で（女女）が消えるね。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "残った3マスのうち、両方男は（男男）の1マスだけだから 1/3 になるのは分かったにゃ。でも曜日は……？",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "性別×曜日で1人あたり14通り、2人で 14×14 = 196マスのグリッドを作って、棄却サンプリングしてみよう。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "にゃにゃーーっ！？ 条件に合うマスが27個あって、そのうち両方男の子のマスが13個もあるにゃ！ 本当に 13/27（48.15%）になったにゃ！！",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "情報が具体的になるほど、両方がその条件に当てはまる『重複ケース』の割合が減るんだ。無限に細かい情報（例: 生年月日と秒）がつくと、確率は極限で 1/2 に近づくんだよ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "情報が増えると標本空間の削られ方が変わるんだにゃ！ 確率の奥深さに感動したにゃ！",
          },
        ],
      },
    ],
  },
  {
    slug: "parrondo",
    title: "パロンドのパラドックス",
    subtitle: "「負けゲーム」と「負けゲーム」を合わせると勝ち続ける！？",
    category: "マルコフ連鎖とラチェット効果",
    difficulty: "上級",
    summary:
      "単独でプレイすると必ず所持金が減っていく2つのギャンブルゲームAとゲームB。ところがこの2つを「A→B→A→B」と交互にプレイしたり、ランダムに切り替えると……なぜか資産が右肩上がりに増え続けます！",
    mathTakeaway:
      "物理学のブラウン・ラチェット（熱揺らぎから一方向の運動を取り出す仕組み）を数学に応用した現象。ゲームAのランダム性がゲームBの不利な状態（残高が3の倍数）をかき乱し、有利な状態を効率よく引き出します！",
    formulaTitle: "定常分布と期待値の逆転",
    formulaDescription: "ゲームB単独の不利な定常分布をゲームAが撹乱:",
    formulaMath: "E[ΔC_A] < 0,  E[ΔC_B] < 0  ⇒  E[ΔC_{A+B}] > 0",
    steps: [
      {
        id: "intuition",
        title: "1. 直感フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "calm",
            text: "タマ助手、やればやるほど損をする『負けゲームA』と『負けゲームB』があるよ。この2つを交互に遊んだらどうなると思う？",
          },
          {
            speaker: "tama",
            mood: "confident",
            text: "負けと負けを足したら、もっと大損するに決まってるにゃ！ 借金地獄にゃ！",
          },
        ],
        userPrompt: {
          question: "2つの負けゲームを交互（またはランダム）にプレイすると？",
          options: [
            { label: "負けが合わさって当然大損する", value: "lose", isIntuitiveChoice: true },
            { label: "なぜか右肩上がりに資産が増え続ける", value: "win" },
            { label: "±0で現状維持になる", value: "zero" },
          ],
        },
      },
      {
        id: "experience",
        title: "2. 体験フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "smiling",
            text: "ゲームA単独、ゲームB単独でプレイしてみよう。どちらも所持金がじわじわ減っていくね。",
          },
          {
            speaker: "tama",
            mood: "confused",
            text: "ほらやっぱりマイナスにゃ！ こんなの絶対に勝てないにゃ！",
          },
        ],
      },
      {
        id: "simulation",
        title: "3. 試行フェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "pointing",
            text: "では『AABB交互』や『ランダム切り替え』で500回シミュレーションしてグラフを描いてみよう。",
          },
          {
            speaker: "tama",
            mood: "shocked",
            text: "にゃにゃにゃーーっ！？ A単独もB単独も右肩下がりなのに、交互にやった線だけグングン右肩上がりに増えてるにゃ！！ 魔法かにゃ！？",
          },
        ],
      },
      {
        id: "reveal",
        title: "4. 種明かしフェーズ",
        dialogues: [
          {
            speaker: "kabu",
            mood: "explaining",
            text: "ゲームBは『所持金が3の倍数』のときだけ勝率10%という罠があるんだ。ゲームAが適度に所持金を乱してくれるおかげで、ゲームBの罠を踏む確率が下がり、勝率75%のボーナス状態を多く享受できるんだよ。",
          },
          {
            speaker: "tama",
            mood: "excited",
            text: "マイナス×マイナスがプラスになるような奇跡のパラドックスにゃ！ 確率の世界は本当に不思議で面白いにゃ！",
          },
        ],
      },
    ],
  },
];
