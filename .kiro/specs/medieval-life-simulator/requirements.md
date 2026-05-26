# Requirements Document

## Introduction

本ドキュメントは、ウェブブラウザ上で動作する中世剣と魔法の生活シミュレーターゲーム「Medieval Life Simulator」の要件を定義する。プレイヤーは中世世界のどこかの国の農村に生まれた青年として、現実時間と完全同期したリアルタイムの世界で生活を営む。農業・戦闘・交易・魔法など、あらゆる行動は現実時間を消費してバックグラウンドで進行する。世界は複数の国家・村・NPC・魔物で構成され、プレイヤー間のインタラクションも存在する。キャラクターは老化し、死亡すると人生記録が残り、新たな人生を始められる。各プレイヤーは1アカウントのみ保有でき、デバイス情報によってサブアカウントの作成を防止する。

---

## Glossary

- **System**: ゲーム全体のバックエンドおよびフロントエンドを含むシステム全体
- **Game_Server**: ゲームのバックエンドAPIサーバー。世界の状態計算・管理を担う
- **World_Engine**: 国家・村・個人の状態をリアルタイムで計算するAPIモジュール
- **Player**: ゲームに登録・参加しているユーザー
- **Character**: プレイヤーが操作する中世世界内のキャラクター
- **NPC**: ゲームが制御する非プレイヤーキャラクター（村人、商人、騎士など）
- **Village**: キャラクターが所属する農村。複数のCharacterとNPCが共存する
- **Nation**: 複数の村を内包する国家。複数の国家が世界に存在する
- **Action**: Characterが実行する行動。現実時間を消費してバックグラウンドで進行する
- **Action_Queue**: Characterが実行中または予約中のActionのリスト
- **Monster**: 世界に存在する魔物。地域・国家状況によって種類と強さが変化する
- **Item**: 武器・防具・魔法道具・農作物・素材などのゲーム内オブジェクト
- **Market**: 村または町に存在する売買場所。価格は需要と供給で変動する
- **Reputation**: CharacterのVillageおよびNationにおける評判値
- **Device_Fingerprint**: プレイヤーのデバイスを一意に識別するための情報の集合
- **Account_Manager**: アカウント登録・認証・デバイス管理を担うモジュール
- **Event_Engine**: 村・個人・国家レベルのイベントを生成・管理するAPIモジュール
- **Diplomacy_Engine**: 国家間の外交・戦争・貿易を計算するAPIモジュール
- **Real_Time_Clock**: 現実の時刻と同期してゲーム内時間を管理するモジュール
- **Session**: プレイヤーがゲームにアクセスしている期間
- **Life_Record**: Characterの死亡後に保存される人生の記録
- **Skill**: Characterの内部能力値。プレイヤーには数値として表示されず、行動の結果やテキストの質として間接的に表現される
- **Skill_Growth**: 繰り返し行動・実戦・師匠からの指導によって蓄積されるSkillの成長量。成長速度・上限ともにプレイヤーには非公開
- **Mentor**: 他のCharacterまたはNPCのうち、特定Skillの指導行動を提供できる存在
- **Apprentice**: MentorからSkill指導を受けているCharacter
- **Quest**: NPCまたはシステムが提供する依頼。達成すると報酬を得られる
- **Land**: Characterが所有または借用できる土地。農地・住居用地などの種別がある
- **Housing**: Characterが所有または借用する住居。Village内に存在する
- **Hunger**: Characterの空腹度パラメーター。食事行動で回復し、限界に達すると体力が減少する
- **Thirst**: Characterの水分パラメーター。飲水行動で回復し、Hungerより速く減少する。限界に達するとHungerより速く体力が減少する
- **Crime**: Characterが行った違法行為の記録。Nationの法律体系に基づいて判定される
- **Faith**: CharacterのNation内の宗教・神殿に対する信仰値
- **Injury**: 戦闘・事故によるCharacterの負傷状態。治療行動で回復する
- **Day_Night_Cycle**: 現実時間に同期したゲーム内の昼夜サイクル
- **Knowledge**: Characterが習得した知識・情報。書物の執筆や地図作成に使用できる
- **Fatigue**: Characterの疲労度パラメーター。行動するたびに蓄積し、睡眠で回復する
- **Sleep**: Characterの睡眠状態。一定時間の睡眠行動でFatigueを回復する
- **Body_Temperature**: Characterの体温パラメーター。環境・装備・天気によって変動する
- **Stress**: Characterの精神的ストレスパラメーター。過酷な体験で蓄積し、社交・信仰・休暇で回復する
- **Tax**: NationがCharacterに課す定期的な金銭的義務
- **Rumor**: Village・Nation内を伝播する情報。NPCを通じて広まり、プレイヤーも売買できる
- **Will**: Characterが死亡前に作成できる遺言。財産の相続先を指定する
- **Terrain**: 地形の種類（山岳・森・川・平野・砂漠など）。移動速度・魔物出現・農業適性に影響する
- **Ecosystem**: 地域の魔物・動物の個体数バランス。狩猟・放置によって変動する
- **Contagion**: 病気の感染リスク。病気状態のCharacter・NPCへの接触で発生する
- **Dream**: 睡眠中にCharacterが見るビジョン。世界の謎や伏線のヒントを含む
- **Grave**: Characterの死亡地点または住居跡に設置される墓碑。他プレイヤーが参拝できる

---

## Requirements

### Requirement 1: プレイヤー登録とアカウント管理

**User Story:** プレイヤーとして、アカウントを作成してゲームを開始したい。そうすることで、自分だけのキャラクターを持ち、ゲームの世界に参加できる。

#### Acceptance Criteria

1. WHEN プレイヤーが新規登録を行う, THE Account_Manager SHALL プレイヤーのデバイスからDevice_Fingerprintを収集し、収集完了後に既存のDevice_Fingerprintと照合する
2. IF 同一のDevice_Fingerprintが既存アカウントに紐付いている場合, THEN THE Account_Manager SHALL 新規アカウントの作成を拒否し、既存アカウントへのログインを案内するメッセージを返す
3. WHEN 新規登録が承認される, THE Account_Manager SHALL プレイヤーIDを生成し、Device_FingerprintとプレイヤーIDを永続ストレージに保存する
4. THE Account_Manager SHALL Device_Fingerprintの収集にあたり、ブラウザのUser-Agent、画面解像度、タイムゾーン、インストール済みフォント一覧、WebGLレンダラー情報、およびIPアドレスのすべてを組み合わせたハッシュ値を使用する。いずれかのシグナルが取得不可能な場合は、取得可能なシグナルのみでハッシュを生成する
5. WHEN プレイヤーが既存アカウントでログインする, THE Account_Manager SHALL Device_Fingerprintを再収集し、収集した全シグナルが登録済みDevice_Fingerprintと同一のハッシュ値を生成する場合のみSessionを発行する
6. IF Device_Fingerprintが登録済みのものと一致しない場合, THEN THE Account_Manager SHALL プレイヤーのメールアドレス宛に送信した確認コードの入力を要求し、確認コードが一致した場合のみSessionを発行する
7. IF 確認コードの入力が3回連続で失敗する場合, THEN THE Account_Manager SHALL そのSessionリクエストを拒否し、プレイヤーにサポートへの問い合わせを案内するメッセージを返す
8. WHEN 新規登録時にDevice_Fingerprintの収集に失敗する場合, THE Account_Manager SHALL 登録処理を中断し、プレイヤーにブラウザの設定確認を促すエラーメッセージを返す

---

### Requirement 2: キャラクター生成・老化・死亡・転生

**User Story:** プレイヤーとして、中世世界に生まれ、老いて死ぬキャラクターを持ちたい。そうすることで、一度きりの人生に緊張感を持ってプレイできる。

#### Acceptance Criteria

1. WHEN アカウント登録が完了する、またはCharacterが死亡して転生を選択する, THE Game_Server SHALL 世界に存在するNationの中からランダムに1つを選択し、そのNation内のVillageにCharacterを配置する
2. WHEN Characterが生成される, THE Game_Server SHALL Characterの初期パラメーター（年齢: 16〜20歳の整数、体力: 1〜100の整数）および各Skill（農業・戦闘・社交・魔法）の初期Skill_Growthをそれぞれ独立したランダム値として内部生成する。これらの数値はプレイヤーに表示しない
3. THE Game_Server SHALL 1プレイヤーにつき1つのアクティブなCharacterのみを保持する
4. WHEN Characterが生成される, THE Game_Server SHALL CharacterのIDと所属VillageのIDおよびNationのIDを永続ストレージに保存する
5. WHEN Characterが生成される, THE Game_Server SHALL Characterの初期所持金を、配置されたVillageの経済レベル（低: 10〜50、中: 51〜150、高: 151〜300の単位通貨）に基づいてランダムに決定する
6. WHEN Real_Time_Clockが現実365時間（ゲーム内365日＝1年）を刻む, THE Game_Server SHALL Characterの年齢を1歳加算する
7. WHEN Characterの年齢が60歳を超える, THE Game_Server SHALL Characterの体力上限を毎年内部的に減少させる。この減少量はプレイヤーに数値として表示せず、行動結果のテキストで「体が以前より疲れやすくなった」などの形で表現する
8. IF Characterの体力パラメーターが0になる場合, THEN THE Event_Engine SHALL Characterの死亡イベントを生成し、CharacterをINACTIVE状態に移行し、Life_Recordを永続ストレージに保存する。通知が成功した場合はプレイヤーに死亡を通知し、転生オプションを提示する
9. WHEN Characterが死亡する, THE Game_Server SHALL Life_Record（キャラクター名、生存期間、最終年齢、所属Nation・Village、主な実績、死因）を生成して永続ストレージに保存する
10. IF プレイヤーが既にアクティブなCharacterを保持している状態で新規Character生成リクエストを送信する場合, THEN THE Game_Server SHALL リクエストを拒否し、既存Characterの情報を含むエラーレスポンスを返す


---

### Requirement 3: リアルタイム行動システム

**User Story:** プレイヤーとして、農作業・戦闘・移動などの行動を選択し、現実時間をかけて結果を得たい。そうすることで、リアルな生活感と達成感を味わえる。

#### Acceptance Criteria

1. WHEN プレイヤーが行動を選択する, THE Game_Server SHALL その行動をAction_Queueに登録し、行動の種別に応じた現実時間の所要時間（例: 畑を耕す: 現実2時間、町まで移動: 現実30分、ゴブリンと戦闘: 現実5分）を計算して完了予定時刻をプレイヤーに返す
2. WHEN 行動がAction_Queueに登録される, THE Game_Server SHALL Characterの状態をACTIVE_ACTION状態に設定し、完了予定時刻を永続ストレージに保存する
3. WHILE CharacterがACTIVE_ACTION状態である, THE Game_Server SHALL 同一Characterに対する新規行動登録リクエストを拒否し、現在実行中の行動と完了予定時刻を含むエラーレスポンスを返す
4. WHEN 行動の完了予定時刻が到来する, THE World_Engine SHALL バックグラウンドで行動結果を計算し、Characterのパラメーター・所持品・スキル値を更新する
5. WHEN プレイヤーがゲームにアクセスし、かつ行動が完了している場合, THE Game_Server SHALL 完了した行動の結果をテキスト形式でプレイヤーに返す
6. WHEN プレイヤーがゲームを閉じた後も行動の完了予定時刻が到来する, THE World_Engine SHALL バックグラウンドで行動結果を計算し、次回アクセス時にプレイヤーへ結果を通知する
7. WHEN 行動が完了する, THE Game_Server SHALL Characterの状態をIDLE状態に戻し、新規行動の登録を受け付ける

---

### Requirement 4: 農業システム

**User Story:** プレイヤーとして、畑を耕し、種をまき、水をやり、収穫するという農業サイクルを体験したい。そうすることで、中世農民の生活をリアルに感じながら収入を得られる。

#### Acceptance Criteria

1. THE Game_Server SHALL 農業を「畑を耕す（現実2時間）→ 種をまく（現実1時間）→ 水やり（現実30分/回、複数回必要）→ 収穫（現実1時間）」の順序が必須のステップとして定義する
2. WHEN プレイヤーが「畑を耕す」行動を選択する, THE Game_Server SHALL Characterが農地を所有または借用している場合のみAction_Queueに登録し、所有・借用していない場合はエラーレスポンスを返す
3. WHEN 「種をまく」行動が完了する, THE Game_Server SHALL 選択した作物の種類（ジャガイモ、小麦、ニンジンなど）と現在の季節を記録し、季節が合わない作物の場合は収穫量を内部的に減少させる
4. WHEN 「収穫」行動が完了する, THE Game_Server SHALL 作物の種類・水やり回数・季節・天気履歴・農業Skill_Growthに基づいて収穫量を内部計算し、収穫物をCharacterのインベントリに追加する。収穫量の数値はプレイヤーに直接表示せず、「豊作だった」「去年より実りが良かった」「少し物足りない出来だった」などのテキストで表現する
5. WHEN 農業行動（耕す・種まき・水やり・収穫）が完了するたびに, THE Game_Server SHALL Characterの農業Skill_Growthを内部的に蓄積する。蓄積量・上限・現在値はプレイヤーに表示しない
6. WHEN 農業Skill_Growthが一定の閾値を超える, THE Game_Server SHALL 農業行動の結果テキストの質を向上させる（例:「ぎこちなく鍬を振った」→「慣れた手つきで畑を耕した」→「土の状態を見極めながら丁寧に耕した」）

---

### Requirement 5: 天気システム

**User Story:** プレイヤーとして、天気が農業や移動・戦闘に影響する世界を体験したい。そうすることで、自然環境を考慮した行動選択が生まれる。

#### Acceptance Criteria

1. WHEN Real_Time_Clockがゲーム内1日（現実1時間）を刻む, THE World_Engine SHALL 各Villageの天気（晴れ、曇り、雨、嵐、雪）を季節・地域パラメーターに基づいてランダムに計算する
2. WHEN 天気が「雨」の場合, THE Game_Server SHALL 農業の水やり行動を自動的に1回分完了済みとして扱う
3. WHEN 天気が「嵐」の場合, THE Game_Server SHALL 移動・戦闘・農業行動の所要時間を50%増加させ、農作物の収穫量を10〜30%減少させる
4. WHEN 天気が「雪」の場合, THE Game_Server SHALL 農業行動の登録を拒否し、移動行動の所要時間を30%増加させる
5. WHEN プレイヤーがゲームにアクセスする, THE Game_Server SHALL 現在のVillageの天気と今後3日分の天気予報をプレイヤーに返す

---

### Requirement 6: 魔物・戦闘システム

**User Story:** プレイヤーとして、魔物と戦い、テキストで展開される戦闘を体験したい。そうすることで、冒険の緊張感と報酬を得られる。

#### Acceptance Criteria

1. THE World_Engine SHALL 各地域（Village周辺フィールド、森、山、ダンジョン）に魔物（ゴブリン、オーク、ドラゴンなど）を配置し、国家の治安レベルと戦争状態に基づいて出現数と強さを計算する
2. WHEN プレイヤーが「戦闘」行動を選択する, THE Game_Server SHALL 対象の魔物の強さとCharacterの戦闘Skill_Growth・装備に基づいて戦闘所要時間（現実3〜30分）を計算しAction_Queueに登録する
3. WHEN 戦闘行動が完了する, THE World_Engine SHALL 戦闘の勝敗・経過をテキスト形式で生成し、勝利の場合はドロップアイテムをCharacterに付与する。戦闘テキストの質（「なんとか倒した」→「鮮やかな一撃で仕留めた」）はCharacterの戦闘Skill_Growthに応じて変化する
4. WHEN 戦闘に敗北する, THE Game_Server SHALL Characterの体力を0にし、死亡処理を実行する
5. WHEN 戦闘行動が完了するたびに, THE Game_Server SHALL Characterの戦闘Skill_Growthを内部的に蓄積する。蓄積量・上限・現在値はプレイヤーに表示しない
6. WHEN 素振り行動（現実30分）が完了するたびに, THE Game_Server SHALL 実戦より少量の戦闘Skill_Growthを内部的に蓄積する
7. THE World_Engine SHALL 魔物の強さをCharacterの戦闘Skill_Growth・装備・所属Nationの治安レベルに基づいて動的に調整し、一方的な戦闘にならないよう設計する
8. WHEN 村への魔物の襲撃イベントが発生する, THE Event_Engine SHALL Village内のACTIVE_ACTION状態でないCharacterに対して自動的に防衛戦闘行動を登録する


---

### Requirement 7: 装備・アイテムシステム

**User Story:** プレイヤーとして、武器・防具・魔法道具を入手・装備し、キャラクターを強化したい。そうすることで、戦闘や冒険の幅が広がる。

#### Acceptance Criteria

1. THE Game_Server SHALL Itemを「武器（剣、弓、杖など）」「防具（鎧、盾、兜など）」「魔法道具（魔法書、魔法石など）」「消耗品（食料、薬草など）」「素材（鉄鉱石、魔物の素材など）」「農作物」のカテゴリに分類して管理する
2. WHEN Characterが装備可能なItemを所持している場合, THE Game_Server SHALL プレイヤーの装備変更リクエストを受け付け、装備スロット（武器、防具、アクセサリー）に反映する
3. THE Game_Server SHALL 装備中のItemのパラメーター（攻撃力、防御力、魔法力など）をCharacterの戦闘・魔法スキル計算に加算する
4. WHEN Itemが使用または戦闘で使われるたびに, THE Game_Server SHALL そのItemの耐久度を1〜5ポイント減少させ、耐久度が0になったItemを装備不可状態にする
5. WHEN プレイヤーが「鍛冶屋に行く」行動を選択する, THE Game_Server SHALL 耐久度が0のItemの修理、または素材を消費したItem強化をAction_Queueに登録する
6. WHEN 戦闘に勝利する, THE World_Engine SHALL 魔物の種類に応じたドロップテーブルに基づいてItemをランダムに生成し、Characterのインベントリに追加する
7. THE Game_Server SHALL Characterのインベントリ上限を50スロットとし、上限に達した場合は新規Item取得リクエストを拒否してプレイヤーに通知する

---

### Requirement 8: 魔法システム

**User Story:** プレイヤーとして、魔法書を入手して魔法を習得し、戦闘や日常生活で使いたい。そうすることで、剣と魔法の世界を体験できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 魔法を「攻撃魔法（火球、雷撃など）」「回復魔法（治癒、解毒など）」「補助魔法（強化、弱体化など）」「生活魔法（天気予測、作物成長促進など）」のカテゴリに分類して管理する
2. WHEN Characterが魔法書Itemを所持している場合, THE Game_Server SHALL 「魔法を学ぶ」行動（現実2〜8時間）をAction_Queueに登録できる
3. WHEN 「魔法を学ぶ」行動が完了する, THE Game_Server SHALL 魔法書の種類に対応した魔法をCharacterの習得魔法リストに追加し、魔法Skill_Growthを内部的に蓄積する
4. WHEN 魔法を実際に使用するたびに, THE Game_Server SHALL 魔法Skill_Growthを内部的に蓄積する。蓄積量・上限・現在値はプレイヤーに表示しない
5. WHEN 魔法Skill_Growthが一定の閾値を超える, THE Game_Server SHALL 魔法行動の結果テキストの質を向上させる（例:「呪文を唱えたが炎は小さかった」→「安定した炎が敵を包んだ」→「詠唱と同時に完璧な火球が放たれた」）
6. WHEN プレイヤーが戦闘中に魔法を使用する, THE Game_Server SHALL Characterの魔法Skill_Growthと装備中の魔法道具のパラメーターに基づいて魔法の効果量を内部計算する
7. THE Game_Server SHALL 魔法の使用にMPコスト（魔力ポイント）を設定し、MP不足の場合は魔法使用を拒否してプレイヤーに通知する
8. WHEN Characterが休息行動を完了する, THE Game_Server SHALL CharacterのMPを最大値まで回復させる

---

### Requirement 9: 市場・経済システム

**User Story:** プレイヤーとして、収穫物や戦利品を市場で売買し、需要と供給で価格が変動する経済を体験したい。そうすることで、経済活動が世界のリアリティを高める。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageのMarketにItemの基準価格を設定し、Village内の在庫量と直近の取引量に基づいて現在価格を基準価格の50%〜200%の範囲で動的に計算する
2. WHEN プレイヤーが「市場で売る」行動を選択する, THE Game_Server SHALL 選択したItemの現在価格でCharacterの所持金を増加させ、Itemをインベントリから削除し、Market在庫を更新する
3. WHEN プレイヤーが「市場で買う」行動を選択する, THE Game_Server SHALL Characterの所持金が現在価格以上の場合のみ取引を完了し、所持金を減少させてItemをインベントリに追加する
4. WHEN 複数のプレイヤーが同一Villageで同じItemを大量に売却する, THE Game_Server SHALL そのItemの現在価格を需要過多として低下させる
5. THE Diplomacy_Engine SHALL 国家間の貿易協定・戦争状態に基づいて、関連するVillageのMarket基準価格を±20%の範囲で調整する
6. WHEN プレイヤーが市場を参照する, THE Game_Server SHALL 現在のItem価格一覧と直近7日間の価格推移をプレイヤーに返す

---

### Requirement 10: NPC・人間関係・評判システム

**User Story:** プレイヤーとして、村人NPCと関係を築き、評判が行動の結果に影響する世界を体験したい。そうすることで、社会的なリアリティが生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageにNPC（農民、商人、鍛冶屋、騎士、魔法使いなど）を配置し、NPCごとにCharacterとの関係値（-100〜100）を管理する
2. WHEN Characterが善行（村の防衛、困っているNPCを助けるなど）を行う, THE Game_Server SHALL 関与したNPCとの関係値および村全体のReputationを1〜20ポイント増加させる
3. WHEN Characterが悪行（盗み、NPCへの攻撃など）を行う, THE Game_Server SHALL 関与したNPCとの関係値および村全体のReputationを10〜50ポイント減少させる
4. IF CharacterのVillage全体のReputationが-50を下回る場合, THEN THE Game_Server SHALL そのVillageのMarketでのItem売買を拒否し、Village内のNPCとの取引を不可能にする
5. IF CharacterのNPCとの関係値が80以上の場合, THEN THE Game_Server SHALL そのNPCから特別な依頼・情報・割引価格での取引をプレイヤーに提供する
6. WHEN プレイヤーが「NPCと話す」行動を選択する, THE Game_Server SHALL NPCの種類・関係値・現在のVillage状況に基づいてテキスト形式の会話内容を生成し返す

---

### Requirement 11: プレイヤー間インタラクション

**User Story:** プレイヤーとして、同じ村に住む他のプレイヤーと協力・取引・競争したい。そうすることで、世界に生きている感覚が増す。

#### Acceptance Criteria

1. THE Game_Server SHALL 同一VillageのCharacter同士がお互いの存在（キャラクター名、現在の行動状態）を確認できるプレイヤーリストを提供する
2. WHEN プレイヤーが他のCharacterに「取引を申し込む」行動を選択する, THE Game_Server SHALL 相手プレイヤーに取引リクエストを通知し、相手が承認した場合のみItem・所持金の交換を実行する
3. WHEN 複数のCharacterが同一の戦闘・農業・採掘行動に「協力する」を選択する, THE Game_Server SHALL 行動の所要時間を参加人数に応じて短縮し（最大50%短縮）、報酬を参加者で分配する
4. THE Game_Server SHALL 他のプレイヤーのCharacterへの攻撃行動を禁止し、PvP（プレイヤー対プレイヤー）戦闘リクエストを拒否する
5. WHEN プレイヤーが他のCharacterに「メッセージを送る」行動を選択する, THE Game_Server SHALL テキストメッセージを相手プレイヤーの次回アクセス時に届くよう保存する

---

### Requirement 12: 村の発展・衰退システム

**User Story:** プレイヤーとして、自分の行動が村の発展や衰退に影響する世界を体験したい。そうすることで、コミュニティへの帰属意識が生まれる。

#### Acceptance Criteria

1. THE World_Engine SHALL 各Villageの発展レベル（1〜10）を人口・食料備蓄・治安レベル・経済レベルの複合スコアとして計算し、ゲーム内7日（現実7時間）ごとに更新する
2. WHEN VillageのCharacterたちが農業・交易・建設行動を継続的に行う, THE World_Engine SHALL Villageの食料備蓄・経済レベルを増加させ、発展レベルを向上させる
3. WHEN Villageの発展レベルが上昇する, THE Game_Server SHALL 新しい施設（鍛冶屋、魔法店、宿屋など）をVillageに追加し、プレイヤーが利用可能な行動の種類を増やす
4. WHEN Villageが戦争・疫病・魔物の大規模襲撃を受ける, THE World_Engine SHALL Villageの治安レベルと食料備蓄を減少させ、発展レベルを低下させる
5. IF Villageの発展レベルが1まで低下し、かつ人口が0になる場合, THEN THE World_Engine SHALL そのVillageを廃村状態に設定し、所属CharacterをNationの別のVillageに強制移住させる

---

### Requirement 13: 世界地図・移動システム

**User Story:** プレイヤーとして、世界地図を見て他の村や町へ移動したい。そうすることで、世界の広がりを感じながら冒険できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 世界地図データ（Nation・Village・ダンジョン・フィールドの位置と接続関係）を管理し、プレイヤーのリクエストに応じてJSON形式で返す
2. WHEN プレイヤーが「移動する」行動を選択する, THE Game_Server SHALL 現在地から目的地までの距離に基づいた現実時間の所要時間（例: 隣村: 現実30分、他国の都市: 現実6時間）を計算しAction_Queueに登録する
3. WHEN 移動行動が完了する, THE Game_Server SHALL CharacterのVillage所属を目的地に更新する
4. WHEN 移動中に天気が「嵐」の場合, THE Game_Server SHALL 移動所要時間を50%増加させ、移動中に魔物との遭遇イベントが発生する確率を20%増加させる
5. WHEN 移動中に魔物との遭遇イベントが発生する, THE Event_Engine SHALL 移動行動を中断し、戦闘行動をAction_Queueの先頭に挿入する

---

### Requirement 14: 人生記録システム

**User Story:** プレイヤーとして、死亡したキャラクターの人生を振り返りたい。そうすることで、一度きりの人生の重みを感じられる。

#### Acceptance Criteria

1. WHEN Characterが死亡する, THE Game_Server SHALL Life_Record（キャラクター名、生存期間、最終年齢、所属Nation・Village履歴、主な実績、死因、累計獲得所持金、倒した魔物数、収穫した作物量）を生成して永続ストレージに保存する
2. WHEN プレイヤーが人生記録一覧を参照する, THE Game_Server SHALL そのプレイヤーの全Life_Recordを新しい順に返す
3. THE Game_Server SHALL Life_Recordをプレイヤーアカウントに永続的に紐付け、新しいCharacterを生成した後もアクセス可能な状態を維持する
4. WHEN プレイヤーが特定のLife_Recordを参照する, THE Game_Server SHALL その人生の主要なイベントをタイムライン形式のテキストで返す

---

### Requirement 18: 師匠・弟子システム

**User Story:** プレイヤーとして、熟練したNPCや他のプレイヤーに弟子入りしてスキルを学びたい。また、自分が熟練したら弟子を取って授業料を得たい。そうすることで、プレイヤー間の経済と社会関係が生まれる。

#### Acceptance Criteria

1. WHEN プレイヤーが「弟子入りを申し込む」行動を選択する, THE Game_Server SHALL 対象（NPCまたは他のCharacter）が指導可能な状態かを確認し、可能な場合はMentor・Apprentice関係を登録する
2. WHEN Characterが他のCharacterのMentorになる場合, THE Game_Server SHALL Mentorとなる側のCharacterのSkill_Growthが内部的に一定の閾値を超えていることを条件とし、閾値未満の場合は指導行動の登録を拒否する。この閾値はプレイヤーに数値として表示しない
3. WHEN プレイヤーが「指導を受ける」行動を選択する（現実1〜4時間）, THE Game_Server SHALL MentorのSkill_Growthに基づいてApprenticeの該当Skill_Growthを、独学より多く蓄積する
4. WHEN Mentorが他のCharacterであり、「指導する」行動が完了する, THE Game_Server SHALL Apprenticeから事前に合意した授業料をMentorの所持金に移転し、MentorのReputationを増加させる
5. WHEN MentorがNPCである場合, THE Game_Server SHALL 授業料をNPCとの関係値に基づいて決定し、Characterの所持金から差し引く
6. WHEN 「指導を受ける」行動が完了するたびに, THE Game_Server SHALL 指導の成果をテキストで表現する（例:「師匠の動きを真似ながら剣を振った。何かが少し掴めた気がする」→「師匠の教えが体に染み込んできた」）。成長量は数値で表示しない
7. THE Game_Server SHALL 1人のMentorが同時に指導できるApprenticeの上限を5人とし、上限に達した場合は新規弟子入りリクエストを拒否する
8. WHEN Mentor・Apprentice関係が登録されてから現実30日が経過する, THE Game_Server SHALL 関係を自動的に解消し、双方に通知する。プレイヤーは任意のタイミングで関係を解消することもできる

---

**User Story:** プレイヤーとして、現実の時間と同期したゲーム世界を体験したい。そうすることで、ゲームにアクセスしていない間も世界が進行し、リアルな生活感を得られる。

#### Acceptance Criteria

1. THE Real_Time_Clock SHALL ゲームサービス開始時刻（エポック）を基準として現実の経過時間からゲーム内の日付・時刻を計算し、全プレイヤーに対して同一のゲーム内時刻を提供する
2. THE Real_Time_Clock SHALL ゲームサービス開始時刻（エポック）をシステム設定として永続ストレージに保存し、全プレイヤーの時刻計算に使用する
3. WHEN Real_Time_Clockがゲーム内1日（現実1時間）を刻む, THE World_Engine SHALL 世界の状態（Village・Nation・Characterの状態）を1回計算する
4. WHEN Real_Time_Clockが現実3時間（ゲーム内3日）を刻む, THE Real_Time_Clock SHALL ゲーム内の季節を次の季節（春→夏→秋→冬→春）に進行させる

---

### Requirement 16: 国家間イベント（外交・戦争・貿易）

**User Story:** プレイヤーとして、自分が所属する国家が他国と外交・戦争・貿易を行う世界を体験したい。そうすることで、個人の生活が国家の動向に影響される中世的なリアリティを感じられる。

#### Acceptance Criteria

1. WHEN Real_Time_Clockがゲーム内7日（現実7時間）を刻む, THE Diplomacy_Engine SHALL 全Nationの組み合わせに対して外交状態（同盟、中立、敵対、戦争）を計算する
2. WHEN 2つのNation間で戦争状態が発生する, THE Diplomacy_Engine SHALL 両Nationに属するVillageの治安レベルを10〜30ポイント低下させ、Event_Engineに戦争関連イベントの生成を指示する
3. WHEN Real_Time_Clockがゲーム内1日（現実1時間）を刻む, THE Diplomacy_Engine SHALL 各Nationの経済状態（農業生産量、交易量、税収）を計算する
4. WHEN 2つのNation間で貿易協定が成立する, THE Diplomacy_Engine SHALL 両Nationに属するVillageの経済レベルを5〜15ポイント向上させる
5. THE Diplomacy_Engine SHALL 各Nationの外交行動をNationのパラメーター（軍事力、経済力、外交スキル、隣接するNationとの関係値）に基づいて計算する
6. WHEN 戦争が終結する, THE Diplomacy_Engine SHALL 勝敗に基づいて領土・賠償金・外交関係を段階的に更新し、影響を受けるVillageの状態に反映する

---

### Requirement 17: データ永続化と整合性

**User Story:** プレイヤーとして、ゲームのデータが安全に保存され、アクセスするたびに正確な状態が反映されることを期待する。そうすることで、プレイの継続性が保証される。

#### Acceptance Criteria

1. WHEN Real_Time_Clockがゲーム内1日（現実1時間）を刻む, THE Game_Server SHALL 全CharacterおよびVillageおよびNationの状態をデータベースに永続化する。システム設定によって最大現実2時間ごとの間隔での永続化も許容する
2. IF Game_Serverが予期せず停止する場合, THEN THE System SHALL 再起動後60秒以内に最後の永続化時点の状態からゲームを再開し、進行中のAction_Queueの残り時間を再計算する
3. IF 同一Characterに対する複数の同時更新リクエストをGame_Serverが受け取る場合, THEN THE Game_Server SHALL 楽観的ロックを使用して最初のリクエストのみを適用し、競合したリクエストには409 Conflictレスポンスを返す
4. WHEN World_EngineがCharacterの状態を更新する, THE Game_Server SHALL 更新前後の状態差分（CharacterID、更新日時、変更フィールド名、変更前の値、変更後の値）をイベントログとして保存する
5. THE Game_Server SHALL プレイヤーのアカウントデータ（Device_Fingerprint、プレイヤーID、Characterデータ）をデータベースに保存する際にAES-256以上の強度で暗号化する

---

### Requirement 19: クエスト・依頼システム

**User Story:** プレイヤーとして、NPCから依頼を受けて達成したい。そうすることで、何をすればいいかが分かり、報酬と達成感を得られる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageのNPCが現在のVillage状況（食料不足、魔物の脅威、建設需要など）に基づいてQuestを生成し、プレイヤーが「NPCと話す」行動を選択した際に提示する
2. WHEN プレイヤーがQuestを受諾する, THE Game_Server SHALL QuestをCharacterのアクティブQuestリストに登録し、達成条件（例:「ゴブリンを3体倒す」「ジャガイモを10個届ける」）と期限をテキスト形式でプレイヤーに返す
3. WHEN Questの達成条件がすべて満たされる, THE Game_Server SHALL Questを完了状態に更新し、報酬（所持金・Item・Reputation増加）をCharacterに付与する
4. THE Game_Server SHALL Characterが同時に保持できるアクティブQuestの上限を10件とし、上限に達した場合は新規Quest受諾を拒否する
5. IF Questの期限が到来し、かつ達成条件が未達の場合, THEN THE Game_Server SHALL QuestをFAILED状態に更新し、依頼NPCとの関係値を5〜15ポイント減少させる
6. THE Game_Server SHALL Quest難易度をCharacterのSkill_Growthと現在のVillage状況に基づいて動的に調整し、達成不可能なQuestが提示されないよう設計する

---

### Requirement 20: 土地・住居システム

**User Story:** プレイヤーとして、土地を購入または借用し、住居を持ちたい。そうすることで、農地の確保や生活の拠点が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageにLand区画（農地用・住居用・商業用）を設定し、各区画の所有状態（未所有・所有者あり・借用中）を管理する
2. WHEN プレイヤーが「土地を購入する」行動を選択する, THE Game_Server SHALL 対象区画が未所有の場合のみCharacterの所持金から購入価格を差し引き、所有権をCharacterに付与する
3. WHEN プレイヤーが「土地を借りる」行動を選択する, THE Game_Server SHALL 対象区画の所有者（NPCまたは他のCharacter）との賃貸契約を登録し、現実24時間ごとに賃料をCharacterの所持金から自動的に差し引く
4. IF Characterの所持金が賃料を支払えない状態が現実48時間継続する場合, THEN THE Game_Server SHALL 賃貸契約を解除し、Characterを土地から退去させる
5. WHEN プレイヤーが「住居を建てる」行動を選択する（現実8時間）, THE Game_Server SHALL Characterが住居用Landを所有していること、および必要素材（木材・石材など）をインベントリに所持していることを確認し、条件を満たす場合のみAction_Queueに登録する
6. WHEN 住居が建設される, THE Game_Server SHALL CharacterのHousingを登録し、住居内にインベントリとは別の保管庫（上限100スロット）を提供する
7. WHEN Characterが自身のHousingに滞在している場合, THE Game_Server SHALL 休息行動の効果（体力・MP回復速度）を野宿と比較して向上させる

---

### Requirement 21: 食料・水分・生存システム

**User Story:** プレイヤーとして、食事と水分補給をしなければキャラクターが弱っていく世界を体験したい。そうすることで、農業・採集・交易の動機が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL CharacterのHungerとThirstパラメーターを内部的に管理し、現実1時間（ゲーム内1日）ごとにHungerを減少させ、現実30分ごとにThirstを減少させる。両パラメーターの数値はプレイヤーに表示せず、「喉が渇いている」「かなり腹が減っている」「限界に近い」などのテキストで状態を表現する
2. WHEN プレイヤーが「食事をする」行動を選択する（現実15〜30分）, THE Game_Server SHALL インベントリまたは住居保管庫内の食料Itemを消費し、Hungerを回復させる
3. WHEN プレイヤーが「水を飲む」行動を選択する（現実5分）, THE Game_Server SHALL 近くに水源（井戸・川・宿屋など）が存在する場合のみThirstを回復させる。水源がない場合は水Itemをインベントリから消費する
4. IF CharacterのHungerが一定の閾値を下回る場合, THEN THE Game_Server SHALL すべての行動の所要時間を内部的に増加させ、行動結果テキストに空腹・疲労の描写を追加する
5. IF CharacterのThirstが一定の閾値を下回る場合, THEN THE Game_Server SHALL HungerよりもCharacterの体力減少速度を速め、行動結果テキストに口の渇き・めまいの描写を追加する
6. IF CharacterのHungerまたはThirstが最低値に達する場合, THEN THE Game_Server SHALL 現実1時間ごとにCharacterの体力を減少させ、体力が0になった場合は死亡処理を実行する
7. THE Game_Server SHALL 食料Itemの種類によってHunger回復量を異なる値に設定する（例:パンより肉料理の方が回復量が高い）
8. WHEN 天気が「嵐」または「雪」の場合, THE Game_Server SHALL 屋外にいるCharacterのThirst減少速度を通常より遅くし、Hunger減少速度を通常より速くする
9. WHEN Characterが激しい行動（戦闘・採掘・農作業など）を行う場合, THE Game_Server SHALL 休息行動と比較してThirstの減少速度を内部的に増加させる

---

### Requirement 22: 採掘・素材収集システム

**User Story:** プレイヤーとして、山や森で素材を採集し、装備の強化や建設に使いたい。そうすることで、自給自足の生活が実現できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各地域（森・山・川・洞窟）に採集可能な素材（木材、鉄鉱石、薬草、魚など）を配置し、採集量を地域の資源残量と季節に基づいて計算する
2. WHEN プレイヤーが「採掘する」「木を切る」「薬草を摘む」などの採集行動を選択する, THE Game_Server SHALL 行動種別に応じた現実時間（現実30分〜3時間）をAction_Queueに登録する
3. WHEN 採集行動が完了する, THE Game_Server SHALL 採集した素材をCharacterのインベントリに追加し、地域の資源残量を減少させる
4. WHEN 地域の資源残量が0になる, THE Game_Server SHALL その地域での該当採集行動を拒否し、現実24時間後に資源を一定量回復させる
5. WHEN 採集行動が完了するたびに, THE Game_Server SHALL 該当採集Skill_Growthを内部的に蓄積し、成長に応じて採集量と結果テキストの質を向上させる

---

### Requirement 23: 犯罪・法律システム

**User Story:** プレイヤーとして、盗みや暴力などの行為が法的な結果をもたらす世界を体験したい。そうすることで、行動の選択に重みが生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各NationにCrimeの種別（窃盗、暴行、不法侵入など）と対応する罰則（罰金、投獄、追放）を定義し、Nationのパラメーターとして管理する
2. WHEN Characterが犯罪行為（他のCharacterまたはNPCへの盗み・暴行など）を行う, THE Game_Server SHALL CrimeをCharacterの犯罪記録に追加し、Village治安レベルを低下させる
3. WHEN Characterの犯罪記録が一定の閾値を超える, THE Game_Server SHALL Village内のNPC騎士がCharacterを逮捕する行動を自動的に開始する
4. WHEN Characterが逮捕される, THE Game_Server SHALL 罰則の種別に応じて所持金の一部を没収（罰金）、または現実1〜24時間の行動不能状態（投獄）をCharacterに適用する
5. IF CharacterがNationから追放される場合, THEN THE Game_Server SHALL CharacterをそのNationの全Village・施設から利用不可状態にし、国境外のVillageに強制移動させる
6. WHEN Characterが投獄状態の場合, THE Game_Server SHALL 「脱獄を試みる」行動をAction_Queueに登録できる。成功確率はCharacterの戦闘Skill_Growthと牢の警備レベルに基づいて計算する

---

### Requirement 24: 宗教・信仰システム

**User Story:** プレイヤーとして、神殿に参拝し、信仰を深めることで恩恵を受けたい。そうすることで、中世世界の宗教的な側面を体験できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各NationまたはVillageに神殿を配置し、それぞれ異なる神格（豊穣の神、戦の神、癒しの神など）を設定する
2. WHEN プレイヤーが「神殿に参拝する」行動を選択する（現実30分）, THE Game_Server SHALL CharacterのFaithを増加させ、参拝した神格に応じたテキスト（祈りの言葉、神官との会話）を返す
3. WHEN CharacterのFaithが一定の閾値を超える, THE Game_Server SHALL 神格に応じた恩恵（豊穣の神:農業収穫量向上、戦の神:戦闘結果テキストの質向上、癒しの神:体力回復速度向上）を内部的に適用する。恩恵の内容はプレイヤーに直接数値で示さず、行動結果テキストの変化で表現する
4. WHEN Characterが悪行を行う, THE Game_Server SHALL 参拝している神格の種別に応じてFaithを減少させる
5. THE Game_Server SHALL 神殿での寄付行動（所持金を消費）によってFaithを増加させる手段を提供する
6. WHEN Village内の神殿が戦争・魔物の襲撃で破壊される, THE Game_Server SHALL そのVillage内のCharacterのFaithを減少させ、恩恵を一時的に停止する

---

### Requirement 25: 病気・怪我・治療システム

**User Story:** プレイヤーとして、怪我や病気になり、治療しなければ悪化する世界を体験したい。そうすることで、生存への緊張感が増す。

#### Acceptance Criteria

1. WHEN Characterが戦闘で負傷する, THE Game_Server SHALL Injuryの種別（軽傷、重傷、骨折など）をCharacterに付与し、行動結果テキストに負傷の描写を追加する
2. WHEN CharacterがInjuryを持つ場合, THE Game_Server SHALL Injuryの種別に応じてすべての行動の所要時間を内部的に増加させる
3. IF CharacterがInjuryを持ったまま現実24時間以上治療を受けない場合, THEN THE Game_Server SHALL Injuryを悪化させ、体力を継続的に減少させる
4. WHEN プレイヤーが「治療を受ける」行動を選択する（現実1〜4時間）, THE Game_Server SHALL Village内の医師NPCまたは回復魔法を持つCharacterが存在する場合のみAction_Queueに登録し、Injuryを回復させる
5. WHEN 疫病イベントが発生したVillageにCharacterが滞在している場合, THE Game_Server SHALL 一定確率でCharacterに病気状態を付与し、行動結果テキストに体調不良の描写を追加する
6. WHEN Characterが病気状態の場合, THE Game_Server SHALL 薬草Itemの使用または医師NPCへの受診行動によって病気を回復させる手段を提供する

---

### Requirement 26: 昼夜サイクルシステム

**User Story:** プレイヤーとして、昼と夜で世界の様子が変わる環境を体験したい。そうすることで、時間帯を意識した行動選択が生まれる。

#### Acceptance Criteria

1. THE Real_Time_Clock SHALL 現実の時刻（UTC）を基準にゲーム内の昼夜を定義し、現実6:00〜18:00をゲーム内昼、現実18:00〜6:00をゲーム内夜として全プレイヤーに同一の昼夜状態を提供する
2. WHEN ゲーム内が夜の場合, THE World_Engine SHALL 各地域での魔物の出現数を昼の2倍に増加させ、移動行動中の魔物遭遇確率を増加させる
3. WHEN ゲーム内が夜の場合, THE Game_Server SHALL 市場・神殿・鍛冶屋などの施設を閉鎖状態に設定し、これらの施設を利用する行動の登録を拒否する
4. WHEN ゲーム内が夜の場合, THE Game_Server SHALL 休息・睡眠行動の体力・MP回復効率を昼の休息と比較して向上させる
5. WHEN プレイヤーがゲームにアクセスする, THE Game_Server SHALL 現在の昼夜状態と次の昼夜切り替えまでの現実時間をプレイヤーに返す

---

### Requirement 27: 知識・書物システム

**User Story:** プレイヤーとして、知識を蓄え、本や地図を書いて売りたい。そうすることで、戦闘や農業以外の生き方が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL Characterが経験した出来事（訪れた地域、倒した魔物、習得した魔法など）をKnowledgeとして内部的に蓄積する
2. WHEN プレイヤーが「本を書く」行動を選択する（現実2〜8時間）, THE Game_Server SHALL CharacterのKnowledgeの量と種別に基づいて執筆可能な書物の種類（冒険記、農業指南書、魔法解説書など）を決定し、Action_Queueに登録する
3. WHEN 「本を書く」行動が完了する, THE Game_Server SHALL 書物ItemをCharacterのインベントリに追加する。書物の品質はCharacterのKnowledge量に基づいて内部計算し、品質は数値で表示せず市場での売値に反映する
4. WHEN プレイヤーが「地図を作る」行動を選択する（現実1〜4時間）, THE Game_Server SHALL CharacterがKnowledgeとして保持している訪問済み地域の情報を地図Itemとして生成し、インベントリに追加する
5. WHEN 他のCharacterまたはNPCが書物・地図Itemを購入する, THE Game_Server SHALL その書物・地図に記載されたKnowledgeの一部を購入者のKnowledgeに追加する

---

### Requirement 28: 結婚・家族システム

**User Story:** プレイヤーとして、NPCと結婚し、家族を持ちたい。そうすることで、世界への愛着と継続的なプレイ動機が生まれる。

#### Acceptance Criteria

1. WHEN CharacterとNPCの関係値が90以上になる, THE Game_Server SHALL プレイヤーに「求婚する」行動の選択肢を提示する
2. WHEN 「求婚する」行動が完了する, THE Game_Server SHALL NPCの性格パラメーターと現在のVillage状況に基づいて承諾・拒否を決定し、結果をテキスト形式でプレイヤーに返す
3. WHEN 結婚が成立する, THE Game_Server SHALL 配偶者NPCをCharacterのHousingに紐付け、配偶者NPCが毎日一定量の家事（食料消費の軽減、住居の維持）を行うよう設定する
4. WHEN Characterが結婚状態にある場合, THE Game_Server SHALL 配偶者NPCとの会話行動を通じて村の情報・Quest・感情的なテキストを提供する
5. WHEN Characterが結婚後に現実180時間（ゲーム内180日）以上経過する, THE Game_Server SHALL 子供NPCが誕生するイベントを生成し、子供NPCをVillageの住民として登録する
6. WHEN Characterが死亡する, THE Game_Server SHALL 配偶者NPCと子供NPCをVillageのNPCとして存続させ、転生後の新Characterが同じVillageに生まれた場合に遭遇できる状態を維持する

---

### Requirement 29: 政治参加システム

**User Story:** プレイヤーとして、村長選挙や国王への請願など、政治的な活動に参加したい。そうすることで、世界の動向に影響を与えられる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageにNPCの村長を設定し、現実720時間（ゲーム内720日＝約2年）ごとに村長選挙イベントを発生させる
2. WHEN 村長選挙イベントが発生する, THE Game_Server SHALL Village内のCharacterおよびNPCが候補者に投票できる期間（現実24時間）を設定する
3. WHEN プレイヤーが「村長に立候補する」行動を選択する, THE Game_Server SHALL CharacterのVillage内Reputationが一定値以上の場合のみ立候補を受理し、選挙期間中に他のCharacter・NPCが投票できる状態にする
4. WHEN Characterが村長に選出される, THE Game_Server SHALL CharacterにVillageの税率・建設優先度・NPC配置を変更できる権限を付与する
5. WHEN プレイヤーが「国王に請願する」行動を選択する（現実4時間の移動+現実2時間の謁見）, THE Game_Server SHALL CharacterのNation内Reputationと請願内容（減税、戦争停止、道路建設など）に基づいて承認・却下を決定し、承認された場合はNationのパラメーターに反映する
6. WHEN Characterが村長職に就いている場合, THE Game_Server SHALL 毎日一定の税収をCharacterの所持金に加算し、村の施設維持コストを差し引く


---

### Requirement 30: 疲労・睡眠システム

**User Story:** プレイヤーとして、行動し続けると疲れ、睡眠を取らないとパフォーマンスが落ちる世界を体験したい。そうすることで、生活リズムを意識したプレイが生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL CharacterのFatigueパラメーターを内部的に管理し、行動（戦闘・農作業・移動など）が完了するたびに行動の強度に応じて蓄積する。Fatigueの数値はプレイヤーに表示せず、「少し疲れている」「かなり疲弊している」「限界だ」などのテキストで表現する
2. IF CharacterのFatigueが一定の閾値を超える場合, THEN THE Game_Server SHALL すべての行動の所要時間を内部的に増加させ、戦闘・採集などの行動結果に失敗描写が混じる確率を上げる
3. WHEN プレイヤーが「睡眠を取る」行動を選択する（現実6〜8時間）, THE Game_Server SHALL CharacterのFatigueを大幅に回復させ、体力・MPも一定量回復させる
4. WHEN プレイヤーが「仮眠を取る」行動を選択する（現実1〜2時間）, THE Game_Server SHALL CharacterのFatigueを部分的に回復させる
5. IF CharacterのFatigueが最高値に達する場合, THEN THE Game_Server SHALL 新規行動の登録を拒否し、「倒れ込んで眠ってしまった」テキストとともに強制的に現実4時間の睡眠行動をAction_Queueに登録する
6. WHEN 「睡眠を取る」行動が完了する, THE Game_Server SHALL Dream判定を行い、一定確率でDreamイベントを生成してプレイヤーに返す

---

### Requirement 31: 体温システム

**User Story:** プレイヤーとして、環境や装備によって体温が変化し、極端な状況では命に関わる世界を体験したい。そうすることで、装備選択と環境への対応が重要になる。

#### Acceptance Criteria

1. THE Game_Server SHALL CharacterのBody_Temperatureパラメーターを内部的に管理し、現在の地形・天気・季節・装備に基づいて現実30分ごとに更新する。数値はプレイヤーに表示せず、「肌寒い」「凍えそうだ」「汗が止まらない」などのテキストで表現する
2. WHEN 天気が「雪」または季節が「冬」かつCharacterが防寒装備を着用していない場合, THE Game_Server SHALL Body_Temperatureを低下させ、一定閾値を下回ると体力を現実30分ごとに減少させる
3. WHEN 季節が「夏」かつCharacterが砂漠・平野地形で長時間行動する場合, THE Game_Server SHALL Body_Temperatureを上昇させ、一定閾値を超えるとThirstの減少速度を増加させ体力を減少させる
4. WHEN Characterが住居内または焚き火の近くにいる場合, THE Game_Server SHALL Body_Temperatureを適正範囲に維持する
5. THE Game_Server SHALL 防寒装備（毛皮の外套など）および冷却装備（薄手の衣服など）をItemとして定義し、装備中はBody_Temperatureへの環境影響を軽減する
6. WHEN プレイヤーが「焚き火をする」行動を選択する（現実15分）, THE Game_Server SHALL 燃料Itemを消費して焚き火状態を現実2時間維持し、周囲のCharacterのBody_Temperatureを適正範囲に保つ

---

### Requirement 32: 精神状態・ストレスシステム

**User Story:** プレイヤーとして、過酷な体験がキャラクターの精神に影響する世界を体験したい。そうすることで、戦闘や孤独の重みがリアルに感じられる。

#### Acceptance Criteria

1. THE Game_Server SHALL CharacterのStressパラメーターを内部的に管理する。数値はプレイヤーに表示せず、「少し気が滅入っている」「心が疲弊している」「精神的に限界だ」などのテキストで表現する
2. WHEN Characterが戦闘・仲間の死の目撃・投獄・疫病などの過酷な体験をする, THE Game_Server SHALL Stressを体験の深刻度に応じて蓄積する
3. WHEN CharacterのStressが一定の閾値を超える場合, THE Game_Server SHALL 行動結果テキストに精神的疲弊の描写を追加し、社交行動・農業行動の結果品質を内部的に低下させる
4. WHEN プレイヤーが「友人と話す」「酒場で過ごす」「祭りに参加する」などの社交行動を完了する, THE Game_Server SHALL Stressを減少させる
5. WHEN CharacterのFaithが高い状態で「神殿に参拝する」行動を完了する, THE Game_Server SHALL Stressを追加で減少させる
6. IF CharacterのStressが最高値に達する場合, THEN THE Game_Server SHALL 行動結果テキストに錯乱・幻覚の描写を追加し、一部の行動が意図しない結果になる確率を上げる

---

### Requirement 33: 税金システム

**User Story:** プレイヤーとして、国家に税を納める義務を持ちたい。そうすることで、経済活動の動機と国家への帰属意識が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各NationのTax率（所持金の5〜20%）をNationのパラメーターとして管理し、現実168時間（ゲーム内7日）ごとにCharacterの所持金からTaxを自動的に徴収する
2. IF CharacterのTax徴収時に所持金が不足する場合, THEN THE Game_Server SHALL 不足分をCharacterの負債として記録し、次回徴収時に合算して請求する
3. IF CharacterのTax負債が現実336時間（ゲーム内14日）以上解消されない場合, THEN THE Game_Server SHALL NPC徴税官がCharacterのインベントリからItemを差し押さえるイベントを生成する
4. WHEN Characterが村長職に就いている場合, THE Game_Server SHALL 徴収したTaxの一部（10〜30%）をVillageの運営資金として管理し、残りをNationに送金する
5. WHEN 国家間で戦争が発生する, THE Game_Server SHALL 戦争中のNationのTax率を最大5%増加させ、プレイヤーに増税の通知をテキスト形式で返す

---

### Requirement 34: 噂・情報伝播システム

**User Story:** プレイヤーとして、NPCを通じて世界の情報が広まる環境を体験したい。そうすることで、情報収集と情報売買が意味を持つ。

#### Acceptance Criteria

1. THE Game_Server SHALL 世界で発生したイベント（疫病・戦争・魔物の大量発生・豊作など）をRumorとして生成し、発生地点から隣接VillageへNPCの移動に伴って現実6〜24時間かけて伝播させる
2. WHEN プレイヤーが「NPCと話す」行動を選択する, THE Game_Server SHALL そのNPCが保持しているRumorの一部をテキスト形式でプレイヤーに返す
3. WHEN プレイヤーが「情報を売る」行動を選択する, THE Game_Server SHALL CharacterのKnowledgeに含まれる情報をRumorとしてNPCまたは他のCharacterに販売し、所持金を増加させる
4. THE Game_Server SHALL Rumorが伝播するにつれて内容が変化する可能性を持たせ（例:「ゴブリンが10体出た」→「ゴブリンの大群が村を襲った」）、情報の信頼性をプレイヤーが判断する必要がある設計にする
5. WHEN CharacterがRumorの発生地点に実際に訪れる, THE Game_Server SHALL 正確な情報をCharacterのKnowledgeに追加する

---

### Requirement 35: 遺言・相続システム

**User Story:** プレイヤーとして、死ぬ前に財産を誰かに残したい。そうすることで、人生の終わりに意味が生まれる。

#### Acceptance Criteria

1. WHEN プレイヤーが「遺言を書く」行動を選択する（現実30分）, THE Game_Server SHALL Willを作成し、相続先（NPC・他のCharacter・Village）と相続するItem・所持金・Landを指定できる
2. WHEN Characterが死亡する, THE Game_Server SHALL 有効なWillが存在する場合、指定された相続先にItem・所持金・Landを移転する
3. IF Characterが死亡時にWillを持っていない場合, THEN THE Game_Server SHALL 所持金の50%をVillageの共有資金に移転し、残りのItem・Landを未所有状態に戻す
4. WHEN 他のCharacterがWillで財産を相続する, THE Game_Server SHALL 相続内容をテキスト形式でそのプレイヤーに通知する
5. THE Game_Server SHALL Willをいつでも上書き・削除できる手段をプレイヤーに提供する

---

### Requirement 36: 地形影響システム

**User Story:** プレイヤーとして、地形によって移動速度や危険度が変わる世界を体験したい。そうすることで、経路選択と装備準備が重要になる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各地域にTerrain種別（平野・森・山岳・川・砂漠・雪原）を設定し、移動行動の所要時間計算にTerrain補正を適用する（例:山岳は平野の2倍、川は橋なしで渡ると1.5倍）
2. WHEN Characterが「川を渡る」行動を選択する, THE Game_Server SHALL 橋が存在する場合は通常移動として処理し、橋がない場合は水泳行動として処理してThirstを増加させる
3. THE Game_Server SHALL 森・山岳・洞窟地形での魔物出現確率を平野と比較して高く設定し、砂漠・雪原ではBody_Temperatureへの影響を強化する
4. WHEN Characterが山岳地形を移動する場合, THE Game_Server SHALL Fatigueの蓄積速度を平野の1.5倍に増加させる
5. THE Game_Server SHALL 農業適性をTerrain種別ごとに設定し（平野:高、森:中、山岳:低）、農業行動の収穫量計算にTerrain補正を適用する

---

### Requirement 37: 生態系システム

**User Story:** プレイヤーとして、魔物を狩りすぎると数が減り、放置すると増えすぎる世界を体験したい。そうすることで、自然のバランスを意識した行動が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各地域のEcosystemを魔物・動物の種別ごとの個体数として管理し、現実24時間ごとに自然増減を計算する
2. WHEN Characterが魔物・動物を狩る, THE Game_Server SHALL 対象地域のEcosystemの該当種別個体数を1減少させる
3. IF 特定地域の魔物個体数が一定の閾値を下回る場合, THEN THE Game_Server SHALL その地域での該当魔物との戦闘行動を拒否し、「この辺りでは最近見かけない」テキストをプレイヤーに返す
4. IF 特定地域の魔物個体数が一定の閾値を超える場合, THEN THE Event_Engine SHALL 魔物の大規模Village襲撃イベントを生成する確率を増加させる
5. THE Game_Server SHALL 魔物の個体数が減少した地域では現実72時間後に個体数を自然回復させ、Ecosystemのバランスを維持する

---

### Requirement 38: 感染・疫病伝播システム

**User Story:** プレイヤーとして、病気が人から人へ感染する世界を体験したい。そうすることで、疫病への対応と予防行動が意味を持つ。

#### Acceptance Criteria

1. THE Game_Server SHALL 疫病イベント発生時に、発生Village内の病気状態のNPC・CharacterへのContagionリスクを設定し、同一Village内に滞在するCharacterに対して現実1時間ごとに感染判定を行う
2. WHEN Characterが病気状態のNPCまたはCharacterと「話す」「治療する」などの近接行動を行う, THE Game_Server SHALL Contagionリスクに基づいて感染判定を行い、感染した場合は病気状態をCharacterに付与する
3. WHEN Characterが感染した場合, THE Game_Server SHALL 現実2〜6時間の潜伏期間後に症状テキストをプレイヤーに返す
4. WHEN Characterが「村を隔離する」政治行動を村長として選択する, THE Game_Server SHALL 発症Village内外への移動行動を一時的に制限し、Contagionの他Villageへの伝播を防ぐ
5. THE Game_Server SHALL 薬草・回復魔法・医師NPCによる治療がContagionリスクを低減する手段として機能するよう設定する

---

### Requirement 39: 夢・幻視システム

**User Story:** プレイヤーとして、睡眠中に謎めいたビジョンを見たい。そうすることで、世界の深みと探索への動機が生まれる。

#### Acceptance Criteria

1. WHEN 「睡眠を取る」行動が完了する, THE Game_Server SHALL 一定確率（現実1回の睡眠につき約30%）でDreamイベントを生成し、テキスト形式でプレイヤーに返す
2. THE Game_Server SHALL Dreamの内容をCharacterの現在の状況（所属Nation・Village・進行中のQuest・Stress・Faith）に基づいて生成し、世界の謎・伝説・未来の出来事のヒントを含める
3. WHEN CharacterのStressが高い場合, THE Game_Server SHALL Dreamの内容を悪夢寄りに変化させ、睡眠後もFatigueが完全に回復しない状態を生成する
4. THE Game_Server SHALL Dreamの内容をCharacterのKnowledgeに「夢の記憶」として追加し、書物執筆の素材として使用できるようにする
5. WHEN CharacterのFaithが高い場合, THE Game_Server SHALL 信仰する神格に関連したDreamが生成される確率を増加させる

---

### Requirement 40: 老人の知恵・年齢ボーナスシステム

**User Story:** プレイヤーとして、年齢を重ねるほど若いキャラクターへの指導効果が上がる世界を体験したい。そうすることで、長く生き残ることに意味が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL CharacterのMentor行動における指導効果をCharacterの年齢に基づいて補正し、年齢が高いほどApprenticeのSkill_Growth蓄積量を増加させる（40歳以上で+20%、60歳以上で+40%）
2. WHEN 年齢が高いCharacterが「NPCと話す」行動を選択する, THE Game_Server SHALL 若いCharacterと比較してより多くのRumorと深い情報をNPCから引き出せるよう設計する
3. WHEN CharacterがQuestを受諾する, THE Game_Server SHALL 年齢が高いほどNPCからの信頼度が高く、より報酬の良いQuestが提示される確率を増加させる
4. THE Game_Server SHALL 年齢ボーナスの具体的な数値をプレイヤーに表示せず、「長年の経験が滲み出ている」「老練な雰囲気がある」などのテキストで間接的に表現する

---

### Requirement 41: 墓・記念碑システム

**User Story:** プレイヤーとして、死んだキャラクターの墓が世界に残り、他のプレイヤーが参拝できる世界を体験したい。そうすることで、一度きりの人生の重みが世界に刻まれる。

#### Acceptance Criteria

1. WHEN Characterが死亡する, THE Game_Server SHALL 死亡地点または最後に所属していたVillageにGraveを設置し、キャラクター名・生没年・死因・一言（プレイヤーが任意で設定可能）を刻む
2. WHEN プレイヤーが「墓を参拝する」行動を選択する（現実5分）, THE Game_Server SHALL 墓に刻まれた情報をテキスト形式で返し、参拝したCharacterのFaithを微増させる
3. THE Game_Server SHALL Graveを永続的に世界に残し、Village内の景観の一部として他のプレイヤーが発見・参拝できる状態を維持する
4. WHEN Villageが廃村になる, THE Game_Server SHALL そのVillage内のGraveを廃墟の遺跡として保存し、後に別のCharacterが探索で発見できる状態にする
5. WHEN プレイヤーが転生後の新Characterで以前のCharacterのGraveを発見する, THE Game_Server SHALL 特別なテキスト（「見覚えのある名前が刻まれている…」）を返す

---

### Requirement 42: ギルド・組合システム

**User Story:** プレイヤーとして、冒険者ギルドや農民組合に加入し、仲間と共に活動したい。そうすることで、コミュニティへの帰属意識と専用の活動機会が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageまたはNationに複数のギルド・組合（冒険者ギルド、農民組合、商人ギルド、魔法師協会など）を設定し、それぞれ加入条件（Skill_Growth閾値・Reputation・推薦状など）を管理する
2. WHEN プレイヤーが「ギルドに加入申請する」行動を選択する, THE Game_Server SHALL 加入条件を満たしている場合のみCharacterをギルドメンバーとして登録し、加入証明Itemをインベントリに追加する
3. THE Game_Server SHALL ギルド専用のQuestを定期的に生成し、メンバーのみが受諾できる状態で提示する。ギルドQuestの報酬は通常Questより高く設定する
4. WHEN ギルドメンバーが協力行動を行う, THE Game_Server SHALL ギルド全体の貢献度を蓄積し、貢献度に応じてギルドランクを向上させる
5. WHEN ギルドランクが上昇する, THE Game_Server SHALL メンバー全員に新しい特典（専用施設の利用、特殊Itemの購入権、行動所要時間の短縮など）を付与する
6. IF Characterがギルドの規則に違反する行動（他メンバーへの裏切り・Quest放棄の繰り返しなど）を行う場合, THEN THE Game_Server SHALL ギルドからの除名処理を実行し、加入証明Itemを無効化する

---

### Requirement 43: ダンジョン探索システム

**User Story:** プレイヤーとして、複数フロアのダンジョンを探索し、罠や宝箱を発見したい。そうすることで、高リスク高リターンの冒険が体験できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 世界各地にダンジョン（廃坑、古代遺跡、魔王の城など）を配置し、各ダンジョンに複数のフロア（1〜10階層）と難易度を設定する
2. WHEN プレイヤーが「ダンジョンに入る」行動を選択する, THE Game_Server SHALL ダンジョンの現在フロアをCharacterの位置として登録し、フロアの状況（魔物・罠・宝箱の配置）をテキスト形式で返す
3. WHEN Characterがダンジョン内を移動する, THE Game_Server SHALL 各フロアの移動に現実15〜60分を要する行動としてAction_Queueに登録し、移動完了時に遭遇イベント（魔物・罠・宝箱・何もなし）をランダムに生成する
4. WHEN Characterがダンジョン内で宝箱を発見する, THE Game_Server SHALL 宝箱の中身（レアItem・所持金・罠）をダンジョンの難易度に基づいてランダムに生成する
5. WHEN Characterがダンジョン内で死亡する, THE Game_Server SHALL 通常の死亡処理に加えてCharacterのインベントリの一部（50%）をダンジョン内に残し、他のCharacterが後に発見できる状態にする
6. WHEN 複数のCharacterが同一ダンジョンに同時に入る, THE Game_Server SHALL パーティー探索として処理し、戦闘行動の所要時間を短縮し、宝箱の報酬を参加者で分配する

---

### Requirement 44: 料理・醸造システム

**User Story:** プレイヤーとして、素材を組み合わせて料理や酒を作りたい。そうすることで、食事の質を高め、交易品としても活用できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 料理・醸造行動を「素材Itemの組み合わせ」として定義し、組み合わせの種類（パン、シチュー、薬草茶、麦酒など）と必要素材・所要時間（現実30分〜4時間）を管理する
2. WHEN プレイヤーが「料理をする」行動を選択する, THE Game_Server SHALL 必要素材がインベントリまたは住居保管庫に存在する場合のみAction_Queueに登録し、完成品Itemをインベントリに追加する
3. WHEN 料理行動が完了する, THE Game_Server SHALL 完成品の品質をCharacterの料理Skill_Growthと使用素材の品質に基づいて内部計算し、品質は数値で表示せず「素朴な味だ」「絶品だ」などのテキストと市場売値に反映する
4. WHEN Characterが高品質な料理Itemを食事行動で消費する, THE Game_Server SHALL 通常の食料と比較してHunger回復量を増加させ、Fatigue・Stressも一定量回復させる
5. WHEN 料理行動が完了するたびに, THE Game_Server SHALL 料理Skill_Growthを内部的に蓄積する
6. THE Game_Server SHALL 醸造行動（麦酒・ワインなど）を料理の一種として定義し、完成品を消費するとStressを減少させる一方でFatigueを増加させる効果を持たせる

---

### Requirement 45: 建築・インフラシステム

**User Story:** プレイヤーとして、橋を架けたり道を整備したりして村のインフラを改善したい。そうすることで、コミュニティへの貢献と移動効率の向上が実現できる。

#### Acceptance Criteria

1. THE Game_Server SHALL 建築・インフラ行動（橋の建設、道の整備、井戸の掘削、柵の設置など）を定義し、各行動に必要素材・所要時間（現実4〜24時間）・複数人での協力可否を設定する
2. WHEN プレイヤーが建築行動を選択する, THE Game_Server SHALL 必要素材の所持と対象地点の建設権限（土地所有または村長承認）を確認し、条件を満たす場合のみAction_Queueに登録する
3. WHEN 橋の建設が完了する, THE Game_Server SHALL 対象の川地形に橋を設置し、以降その地点を通過するすべてのCharacterの移動所要時間を通常移動と同等に短縮する
4. WHEN 道の整備が完了する, THE Game_Server SHALL 対象地点間の移動所要時間を10〜20%短縮し、Village全体の経済レベルを向上させる
5. WHEN 井戸の建設が完了する, THE Game_Server SHALL Village内のCharacterが水源なしで「水を飲む」行動を実行できるようにする
6. WHEN 建築物が戦争・魔物の襲撃・天災によって破壊される, THE Game_Server SHALL 建築物を破壊状態に設定し、修復行動が完了するまで効果を停止する

---

### Requirement 46: ペット・家畜システム

**User Story:** プレイヤーとして、馬や牛・犬などを飼いたい。そうすることで、移動効率の向上や食料生産の手段が増える。

#### Acceptance Criteria

1. THE Game_Server SHALL 家畜・ペットの種別（馬、牛、羊、鶏、犬など）を定義し、各種別の入手方法（市場での購入・野生の捕獲）と飼育コスト（現実24時間ごとの飼料消費）を管理する
2. WHEN Characterが馬を所有している場合, THE Game_Server SHALL 移動行動の所要時間を30〜50%短縮する
3. WHEN Characterが牛・羊・鶏を所有している場合, THE Game_Server SHALL 現実24時間ごとに乳・羊毛・卵などの生産物Itemを自動的にCharacterの住居保管庫に追加する
4. WHEN Characterが犬を所有している場合, THE Game_Server SHALL ダンジョン探索・移動中の魔物遭遇時に犬が警戒行動を取り、奇襲される確率を低下させる
5. IF Characterが飼料を現実48時間以上補充しない場合, THEN THE Game_Server SHALL 家畜・ペットの健康状態を低下させ、生産物の品質・量を減少させる。現実96時間以上放置した場合は家畜・ペットが逃走または死亡するイベントを生成する
6. WHEN Characterが野生動物を「捕獲する」行動を選択する（現実1〜4時間）, THE Game_Server SHALL 対象地域のEcosystemの個体数と戦闘Skill_Growthに基づいて捕獲成否を判定する

---

### Requirement 47: 天災システム

**User Story:** プレイヤーとして、地震・洪水・干ばつなどの天災が世界に影響する環境を体験したい。そうすることで、自然の脅威への備えと対応が重要になる。

#### Acceptance Criteria

1. THE Game_Server SHALL 天災イベント（地震、洪水、干ばつ、嵐、火災）を定義し、各Nationの地形・季節パラメーターに基づいて現実720時間（ゲーム内約2年）に1回程度の頻度でランダムに発生させる
2. WHEN 地震イベントが発生する, THE Game_Server SHALL 影響範囲内のVillageの建築物を一定確率で破壊状態にし、Characterに負傷Injuryを付与する確率を発生させる
3. WHEN 洪水イベントが発生する, THE Game_Server SHALL 影響範囲内の農地の作物を全滅させ、川・平野地形の移動行動を現実48時間不可能にする
4. WHEN 干ばつイベントが発生する, THE Game_Server SHALL 影響範囲内のVillageの食料備蓄を減少させ、農業収穫量を現実168時間（ゲーム内7日）にわたって低下させる
5. WHEN 天災イベントが発生する, THE Game_Server SHALL 影響範囲内のすべてのCharacterに天災発生をテキスト形式で通知し、Rumorとして周辺Villageに伝播させる
6. WHEN Villageが天災から復興する, THE Game_Server SHALL 復興作業（建築・農地整備）に参加したCharacterのReputationを増加させる

---

### Requirement 48: 伝説・神話システム

**User Story:** プレイヤーとして、世界に古代の伝説があり、遺跡を探索すると断片が見つかる世界を体験したい。そうすることで、世界への探索意欲と謎解きの楽しみが生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL ゲーム世界の創世・古代の出来事・伝説の英雄・封印された魔王などの神話体系を生成し、断片化された情報（石板、古文書、老人の語り、Dreamなど）として世界各地に配置する
2. WHEN Characterが遺跡・ダンジョンを探索する, THE Game_Server SHALL 一定確率で伝説の断片（古文書・石板・遺物Itemなど）を発見し、CharacterのKnowledgeに追加する
3. WHEN CharacterのKnowledgeに伝説の断片が一定数蓄積される, THE Game_Server SHALL 断片を組み合わせた伝説の全容テキストをプレイヤーに返し、関連する特別Questを解放する
4. THE Game_Server SHALL 伝説に関連する特別なItemや場所（伝説の武器、封印の祭壇など）を世界に配置し、伝説の全容を知ったCharacterのみがアクセスできる状態にする
5. WHEN 伝説に関連する特別Questが完了する, THE Game_Server SHALL 達成したCharacterの名前をLife_Recordに「伝説の継承者」として記録し、Village・Nation全体に偉業をRumorとして伝播させる

---

### Requirement 49: 季節の祭りシステム

**User Story:** プレイヤーとして、季節ごとの祭りに参加し、特別なイベントを体験したい。そうすることで、季節の移り変わりに意味が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 季節ごとに祭りイベント（春祭り、夏の収穫祭、秋の感謝祭、冬の祈願祭）を定義し、各季節の開始から現実24時間を祭り期間として設定する
2. WHEN 祭り期間が開始する, THE Game_Server SHALL Village内のすべてのCharacterとNPCに祭り開始をテキスト形式で通知する
3. WHEN プレイヤーが「祭りに参加する」行動を選択する（現実2時間）, THE Game_Server SHALL Stressを大幅に減少させ、Faithを増加させ、Village内のReputationを向上させる
4. WHEN 祭り期間中, THE Game_Server SHALL 市場での特産品の取引・屋台での食事・祭り限定Questなどの特別行動を提供する
5. WHEN 祭り期間中に複数のCharacterが同じVillageで「祭りに参加する」行動を完了する, THE Game_Server SHALL 参加人数に応じてVillage全体の発展レベルへのボーナスを付与する
6. IF 戦争中または疫病発生中のVillageでは, THE Game_Server SHALL 祭りイベントを中止し、代わりに「祭りが中止になった」テキストをCharacterに返す

---

### Requirement 50: 借金・ローンシステム

**User Story:** プレイヤーとして、金貸しNPCから借金して資金を調達したい。そうすることで、土地購入や装備強化の選択肢が広がる一方でリスクも生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageまたはNationに金貸しNPCを配置し、貸付可能額（Characterの所持資産に基づく上限）と利率（現実168時間ごとに元本の5〜15%）を管理する
2. WHEN プレイヤーが「借金をする」行動を選択する, THE Game_Server SHALL 貸付可能額の範囲内で指定額をCharacterの所持金に追加し、借金額と利率を永続ストレージに記録する
3. THE Game_Server SHALL 現実168時間（ゲーム内7日）ごとに利息を借金残高に加算し、Characterに返済を促すテキストを返す
4. WHEN プレイヤーが「借金を返済する」行動を選択する, THE Game_Server SHALL 指定額をCharacterの所持金から差し引き、借金残高を減少させる
5. IF 借金残高が現実720時間（ゲーム内30日）以上返済されない場合, THEN THE Game_Server SHALL 金貸しNPCが取り立てイベントを生成し、CharacterのインベントリからItemを差し押さえる。差し押さえ後も残高が残る場合はNationの犯罪記録に債務不履行を追加する
6. IF CharacterがNationから追放される場合, THEN THE Game_Server SHALL 借金残高をWillの相続財産から優先的に差し引く

---

### Requirement 51: 商人・行商システム

**User Story:** プレイヤーとして、村から村へ商品を運んで差額で稼ぎたい。そうすることで、移動と経済活動を組み合わせた生き方が生まれる。

#### Acceptance Criteria

1. THE Game_Server SHALL 各VillageのMarket価格の差異を利用した行商が成立するよう、Village間でItemの基準価格に差を設ける（例:農村では食料が安く、都市では高い）
2. WHEN プレイヤーが「行商に出る」行動を選択する, THE Game_Server SHALL 目的地VillageへのItemの運搬を移動行動と組み合わせてAction_Queueに登録し、運搬量に応じて移動所要時間を増加させる
3. WHEN 行商行動が完了する, THE Game_Server SHALL 目的地VillageのMarket現在価格でItemを自動的に売却し、差益をCharacterの所持金に加算する
4. WHEN 行商中に魔物との遭遇イベントが発生する, THE Game_Server SHALL 戦闘に敗北した場合に運搬中のItemの一部（20〜50%）を失うリスクを設定する
5. THE Game_Server SHALL 行商Skill_Growthを内部的に管理し、成長に応じて運搬可能量の増加・交渉による売値向上・魔物遭遇確率の低下などの効果を行動結果テキストの変化で表現する
6. WHEN CharacterがNation間の行商を行う場合, THE Game_Server SHALL 国境通過時に関税（運搬Itemの価値の5〜15%）を自動的に徴収する
