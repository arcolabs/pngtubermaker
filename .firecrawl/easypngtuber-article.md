[![桜のイラスト](https://assets.st-note.com/poc-image/navbar/production/e855e0c39d8a16c0)](https://note.com/info/n/n316bf060cd5d)

[投稿](https://note.com/signup)

[ログイン](https://note.com/login?redirectPath=https%3A%2F%2Fnote.com%2Fkazuya_bros%2Fn%2Fn03d5d80c8fdf)

[会員登録](https://note.com/signup)

[![見出し画像](https://assets.st-note.com/production/uploads/images/250959944/rectangle_large_type_2_0049e63b9bdb8d73e38e165c274dfd3e.jpeg?width=1280)](https://assets.st-note.com/production/uploads/images/250959944/rectangle_large_type_2_0049e63b9bdb8d73e38e165c274dfd3e.jpeg?width=2000&height=2000&fit=bounds&quality=85)

# 【MotionPNGTuber】私的素材の作り方【差分生成からループ動画作成まで】

31


[![カズヤ弟＠ゲーム実況＆生成AI](https://assets.st-note.com/production/uploads/images/134886236/profile_ac158ac10acd006bd0c5a7f27e822c20.png?width=60)](https://note.com/kazuya_bros)

[カズヤ弟＠ゲーム実況＆生成AI](https://note.com/kazuya_bros)

2026年2月11日 06:45
フォローしました


**■記事の対象ユーザ**

１．MotionPNGTuberを作ってみたい人

２．誰かの作り方を参考にしたい人

３．ループ動画生成に課金を許せる人

[![画像](https://assets.st-note.com/img/1770622717-HFSofwxJERN9Ota8Ii53hd1e.png)](https://assets.st-note.com/img/1770622717-HFSofwxJERN9Ota8Ii53hd1e.png?width=2000&height=2000&fit=bounds&quality=85) 動画については有償サービスを使っている

**■ようするに？**

こんな感じのMotionPNGTuberの素材となるループ動画を作ります。

VIDUで作ったハウラちゃんのループ動画 - YouTube

Tap to unmute

[VIDUで作ったハウラちゃんのループ動画](https://www.youtube.com/shorts/xQegf0VlR6s) [カズヤ弟ゲームCH](https://www.youtube.com/channel/UCoXTRja1-6lCpgYc1SffmqA)

カズヤ弟ゲームCH620 subscribers

## 目次

1. はじめに
2. STEP０：ベースとなる画像を１枚用意する
3. STEP１：背景を透過させて緑背景にする
4. STEP２：口パク＋瞬きの表情差分の作成
5. STEP3：ループ動画の生成
6. おわりに

## はじめに

こんにちは、カズヤ弟です。みなさんはMotionPNGTuber作ってますか？

PNGTuber関連の個人開発をしている私ですが、先日のMotionPNGTuberの登場で「その手があったか！」と足元にウロコが溜まって困っています。

本記事はろてじんさん(@rotejin)の開発したMotionPNGTuberを利用するための素材の作成方法について紹介する記事となります。

そもそもMotionPNGTuberってなんぞや？って方はぜひぜひ本家の紹介noteをご覧くださいませ。

[動くPNGTuber（MotionPNGTuber）プログラム操作方法と調整の手順](https://note.com/rotejin/n/n2b12c9be0b81)

![](https://assets.st-note.com/production/uploads/images/239874438/rectangle_large_type_2_d37785280f4da3343f8eae9e89d0cf85.png?fit=bounds&format=jpeg&quality=85&width=300)

動くPNGTuber（MotionPNGTuber）プログラム操作方法と調整の手順

はじめに 「PNGTuber」は手軽だけど、もう少し動きが欲しい。「Live2D」はヌルヌル動くけど、制作や導入のハードルが高い。そんな「アナタの心の隙間をお埋めします・・・」と言う事で、少しリッチな動きを表現できる「MotionPNGTuber」を作りました。このツールは、主にループ動画（MP4）に口パク…

207

[![ろてじん](https://assets.st-note.com/production/uploads/images/123438449/profile_1f92017fcd34b5fec956ac64478bb387.png?fit=bounds&format=jpeg&quality=85&width=330)](https://note.com/rotejin)

[ろてじん](https://note.com/rotejin)

[2025/12/29 20:47](https://note.com/rotejin/n/n2b12c9be0b81)

[note](https://note.com/)

* * *

## STEP０：ベースとなる画像を１枚用意する

最終的にMotionPNGTuberにしたい画像を１枚用意します。

用意する画像は瞳のデザインとか口内の色とかを維持するのに「目が開いている」＋「口が開いている」画像が良いと思います。

今回はハウラちゃんのデフォルメ画像と、リアル画像をそれぞれ用意してみました。

[![画像](https://assets.st-note.com/img/1770777414-PMwLiq9skZutAQyf5r2Y80FV.png?width=1200)](https://assets.st-note.com/img/1770777414-PMwLiq9skZutAQyf5r2Y80FV.png?width=2000&height=2000&fit=bounds&quality=85) デフォルメ[![画像](https://assets.st-note.com/img/1770788572-UzBqS5MvElTcIfpjh01An2Lb.png?width=1200)](https://assets.st-note.com/img/1770788572-UzBqS5MvElTcIfpjh01An2Lb.png?width=2000&height=2000&fit=bounds&quality=85) リアル

* * *

## STEP１：背景を透過させて緑背景にする

これはPhotoShopをはじめ色々な方法で出来るのですが、私の知ってる範囲で簡単だった方法をご紹介します。

- **ブラウザで手っ取り早く**


ぬこぬこさん（@schroneko）がHuggingFaceに上げている透過ツール。

アップロードして１ボタンでWebp形式で出力されます。かんたん！

（※画像が2Kとか4Kとか大きすぎると縮小されるけど、後続処理考えるとそんなに問題にはならないよ）

[**Transparent Background - a Hugging Face Space by schroneko** _Upload an image, and the app will remove its background, leav_ _huggingface.co_](https://huggingface.co/spaces/schroneko/transparent-background)

- **ComfyUIの背景透過ノード**


ComfyUI-Easy-UseというノードにRMBG-1.4を使った背景透過処理ノードがあります。ComfyUI使っている人なら1ノード挟むだけなので簡単です。

[yolain/ComfyUI-Easy-Use: In order to make it easier to use the ComfyUI, I have made some optimizations and integrations to some commonly...](https://github.com/yolain/ComfyUI-Easy-Use?tab=readme-ov-file)

In order to make it easier to use the ComfyUI, I have made some optimizations and integrations to some commonly used nodes. - yolain/ComfyUI-Easy-Use

[GitHubgithub.com](https://github.com/)

[![画像](https://assets.st-note.com/img/1770782808-UVAKbjoSf6FZhe2RBypTdwEG.png?width=1200)](https://assets.st-note.com/img/1770782808-UVAKbjoSf6FZhe2RBypTdwEG.png?width=2000&height=2000&fit=bounds&quality=85) こんな感じ

- **Canvaの背景透過機能**


メジャーどころだとCanvaの背景透過機能も簡単です。有償プランですが、「背景透過」ボタン１つで背景透過できます。トライアルで0円で使える期間があるので比較的試しやすいのが良し。

[![画像](https://assets.st-note.com/img/1770782312-FlMq5xG8hWuTcOrntZ3JwdvE.png?width=1200)](https://assets.st-note.com/img/1770782312-FlMq5xG8hWuTcOrntZ3JwdvE.png?width=2000&height=2000&fit=bounds&quality=85) 背景透過ボタン押す前[![画像](https://assets.st-note.com/img/1770783068-kHZgcOv5qyoIMeWD6sbraTA2.png?width=1200)](https://assets.st-note.com/img/1770783068-kHZgcOv5qyoIMeWD6sbraTA2.png?width=2000&height=2000&fit=bounds&quality=85) 押した後

- **一括処理したいならこういうツールも**


2022年から使っている「transparent-background」というツール。フォルダに入れたものをまとめて透過処理させることができるので重宝しています。黒い画面を触る必要があるので他に比べると敷居は少し高め。

[plemeri/transparent-background: This is a background removing tool powered by InSPyReNet (ACCV 2022)](https://github.com/plemeri/transparent-background)

This is a background removing tool powered by InSPyReNet (ACCV 2022) - plemeri/transparent-background

[GitHubgithub.com](https://github.com/)

上記のようなツールで背景を透過させた画像を作ったら、レイヤーが扱えるペイントソフト（Win11標準のペイントアプリとか、無料で使えるAffinityとかが敷居低いかも）を使って緑背景の上にのせれば完成です。

[![画像](https://assets.st-note.com/img/1770788696-D79L6XTgOR2VJyQKutaiP0xc.png?width=1200)](https://assets.st-note.com/img/1770788696-D79L6XTgOR2VJyQKutaiP0xc.png?width=2000&height=2000&fit=bounds&quality=85) できあがり：デフォルメなすがた

[![画像](https://assets.st-note.com/img/1770788718-mpqXUFMudoT0RfxJNLnkalwP.png?width=1200)](https://assets.st-note.com/img/1770788718-mpqXUFMudoT0RfxJNLnkalwP.png?width=2000&height=2000&fit=bounds&quality=85) できあがり：リアルなすがた

* * *

## STEP２：口パク＋瞬きの表情差分の作成

グリーンバックの素材をベースに口パク＋瞬きの表情差分を作っていきます。

2024年頃は以下の様な手順で口パク素材を作っていたのですが･･･。

有償のペイントソフトや複数のAIツールを利用してる上、手修正するシーンも結構あって、AIの力を借りてなおそれなりにコストがかかっていました。

> ①元絵をとりにくさんツール（AI-Assistant）で線画化
>
> ②PhotoShopで口や線画から口や目を手で消してのっぺらぼうにする
>
> ③線画をStableDiffusionのControlNet×AnyTest-v3に入れて線画を強力に維持しながら表情差分を生成
>
> ④作成された表情差分の中から自然なものを選ぶ
>
> ⑤必要に応じてペイントソフトで細部を修正する

従来の手法。とても他人に勧められない･･･ッ！

この初心者お断り的な作業も、Nano-bananaやQwen-Image-Editの登場でかなりお手軽に実現できるようになりました。

例えばNano-bananaの活用事例のリポジトリを見ると、表情の画像とキャラクターの画像を渡して表情差分を作るサンプル(@emakiscrollさん)があり

[Awesome-Nano-Banana-images/README\_ja.md at 7d344750a40e9061821d4fdf1ef22bdc3a970ead · PicoTrex/Awesome-Nano-Banana-images](https://github.com/PicoTrex/Awesome-Nano-Banana-images/blob/7d344750a40e9061821d4fdf1ef22bdc3a970ead/README_ja.md#%E4%BE%8B90vtuber%E3%81%AB%E3%81%AA%E3%82%8Bby-ai_kei75)

A curated collection of fun and creative examples generated with Nano Banana &amp; Nano Banana Pro🍌, Gemini-2.5-flash-image based model. We also release Nano-consistent-150K openly to support t...

[GitHubgithub.com](https://github.com/)

[![画像](https://assets.st-note.com/img/1770640505-iHSegzw6uh5o01TAOjQyWakl.png?width=1200)](https://assets.st-note.com/img/1770640505-iHSegzw6uh5o01TAOjQyWakl.png?width=2000&height=2000&fit=bounds&quality=85) 表情キャラクターシートとキャラを渡して表情差分を作る例

試してみるとこんな感じになります。

[![画像](https://assets.st-note.com/img/1770640551-Q0CFmz2ikI6qYD1bM84r7JUE.png?width=1200)](https://assets.st-note.com/img/1770640551-Q0CFmz2ikI6qYD1bM84r7JUE.png?width=2000&height=2000&fit=bounds&quality=85) デフォルメ画像

なるほど表情は描き分けてくれますが、キャラクターシート側に寄ってしまうので、素材としてはちょっと微妙です。プロンプトを修正して以下の様にすると使えそうな感じになりますね。

[![画像](https://assets.st-note.com/img/1770619001-RI9OjEGm5McSkYHyfVXCaTUF.png)](https://assets.st-note.com/img/1770619001-RI9OjEGm5McSkYHyfVXCaTUF.png?width=2000&height=2000&fit=bounds&quality=85) 依頼内容

> 表情差分を作ってください。
>
> 1\. 元画像
>
> 2\. 目を閉じた差分
>
> 3\. 口を閉じた差分
>
> 4\. 目と口両方を閉じた差分
>
> この4つを1つの画像として出力して下さい。
>
> 表情以外は一切変更しないようにしてください。

コピペ用[![画像](https://assets.st-note.com/img/1770619005-XqsE0bTVHA4167FrwyzptcdG.png?width=1200)](https://assets.st-note.com/img/1770619005-XqsE0bTVHA4167FrwyzptcdG.png?width=2000&height=2000&fit=bounds&quality=85) 納品物[![画像](https://assets.st-note.com/img/1770810081-pUjwuyz9iaYMOZgsmEWfNKIx.png?width=1200)](https://assets.st-note.com/img/1770810081-pUjwuyz9iaYMOZgsmEWfNKIx.png?width=2000&height=2000&fit=bounds&quality=85) あ、耳が･･･

Nano-bananaのいいところはGoogle AI Studioを使って簡単にアプリ化できるところで、工夫されたプロンプト＋WebのUIの組み合わせで便利なツールが作りやすいところですよね。

Nano-bananaを使った表情差分作成ツールもいくつかあるので、そちらも試していきます。

- **「キャラクター表情チェンジャー」**


ジロウ(@jiro\_favorite)さんが公開されている表情差分メーカーのv2.0。

（※2026/2/11現在、有料公開ですがv3.0もリリースされているようです）

画像をアップロードして、表情とその強さ。口と目の開き具合をスライダーで設定してニュアンスを調整できるというもの。

[![画像](https://assets.st-note.com/img/1770793040-8QejtDz0rsHWCbxd2ylmAq1w.png)](https://assets.st-note.com/img/1770793040-8QejtDz0rsHWCbxd2ylmAq1w.png?width=2000&height=2000&fit=bounds&quality=85)[![画像](https://assets.st-note.com/img/1770793117-1OisdJPnDe8TLZ4V975AXfhx.png)](https://assets.st-note.com/img/1770793117-1OisdJPnDe8TLZ4V975AXfhx.png?width=2000&height=2000&fit=bounds&quality=85) できあがり

表情だけをピンポイントで調整してくれますが、顔全体を調整するので

目はそのままで口だけ閉じる。といった差分はちょっと苦手。

同じ設定で口だけ-100にしても以下の様に眉毛も少し変わってしまいます。

（Google AI Studioで眉毛も制御できるように改造すればいいだけなんですけどね）

[![画像](https://assets.st-note.com/img/1770793169-cZpYT7rgGBDMWACSvEwjy6qQ.png)](https://assets.st-note.com/img/1770793169-cZpYT7rgGBDMWACSvEwjy6qQ.png?width=2000&height=2000&fit=bounds&quality=85) 口だけ-100

他にも複数の表情パターンを混ぜたりもできるので、複雑な表情を作りたい場合はオススメです。

- **EasyPNGTuber**


ドウモ、ロテジン＝サン。

こちらはMotionPNGTuberのろてじんさんが「表情差分作るの敷居高いじゃろ？」と整備してくれたNano-bananaを利用した表情差分作成ツール。

使い方についてはご本人様が解説記事を（略

[rotejin/EasyPNGTuber: AI表情差分からPNGTuber用4パターン画像を自動生成 / Auto-generate 4-pattern PNGTuber images from AI expression sheets](https://github.com/rotejin/EasyPNGTuber)

AI表情差分からPNGTuber用4パターン画像を自動生成 / Auto-generate 4-pattern PNGTuber images from AI expression sheets - rotejin/EasyPNGTuber

[GitHubgithub.com](https://github.com/)

まずは下準備として、1枚の画像をNano-bananaに渡すように2x2または3x3のグリッド画像にするツール。画像をアップロードして実行すると

[![画像](https://assets.st-note.com/img/1770794503-5yxwXCGbs9OQronTaeVNKzMf.png)](https://assets.st-note.com/img/1770794503-5yxwXCGbs9OQronTaeVNKzMf.png?width=2000&height=2000&fit=bounds&quality=85)

こんな感じで同じ画像を4枚並べた画像が出力されます。

[![画像](https://assets.st-note.com/img/1770795630-FS7qQa48WGJvoyej3XRrlAgC.png?width=1200)](https://assets.st-note.com/img/1770795630-FS7qQa48WGJvoyej3XRrlAgC.png?width=2000&height=2000&fit=bounds&quality=85)

この画像をNano-bananaに渡して修正するように指示をだします。

ろてじんさんの解説にある英語のプロンプトでも良いのですが、以下の様に日本語の指示でも普通にできますので、工夫してみてください。

Nano-bananaへの指示だしのポイントは

**「どこを修正して、どこを修正してほしくないのかを定義する」** ことです。

> この画像の左上のキャラクターの画像を参考に、右上、左下、右下の画像を編集してください。
>
> 編集にあたり画風を変更しないでください。
>
> 指示していない部分は一切変更しないでください。
>
> 左上：ベース画像。一切変更しない。
>
> 左下：目を閉じる。口の形は変更しない。
>
> 右上：口を閉じる。目の形は変更しない。
>
> 右下：目と口を閉じる。目の形は左下と合わせる。口の形は右上と合わせる。

今回はベース画像が口を開けているのでこういう指示

このプロンプトで出来上がった画像がこちら。

[![画像](https://assets.st-note.com/img/1770798866-3OaVlAmNpxrW1njLHiSo6UXu.png?width=1200)](https://assets.st-note.com/img/1770798866-3OaVlAmNpxrW1njLHiSo6UXu.png?width=2000&height=2000&fit=bounds&quality=85) ちゃんと口の形や目の形が維持されている

ちなみに･･･。Nano-bananaさんはGeminiのアプリ画面から作る場合は高額なUltraプランじゃないとウォーターマークが消えない＋アップロードした画像が学習に使われる。という定めがあるので、収益が発生しそうな素材を作る場合は有償のAPIを利用できるプラットフォームなり、ComfyUIのAPIノードから実行しましょうね。規定警察との約束だよ。

このあたりの詳しい事は過去の記事でまとめていますでよければ見てやってください。（宣伝

差分画像ができたら、ろてじんさんのもう１つのツールに渡して仕上げを行います。

[![画像](https://assets.st-note.com/img/1770795837-FGIs2u9V6BY7WcahRLbCfKpo.png?width=1200)](https://assets.st-note.com/img/1770795837-FGIs2u9V6BY7WcahRLbCfKpo.png?width=2000&height=2000&fit=bounds&quality=85) 起動したところ

**①左上から表情差分のファイルをアップロード**

まずは先ほどの画像を左上の「ファイルを選択」から選びます

**②「分割＆位置合わせ」ボタンをクリック**

クリックすると画面右側に何か出てきます。

[![画像](https://assets.st-note.com/img/1770799550-6S7hj9tZpfiTMlgR23ukCXyo.png?width=1200)](https://assets.st-note.com/img/1770799550-6S7hj9tZpfiTMlgR23ukCXyo.png?width=2000&height=2000&fit=bounds&quality=85)

プレビューエリアの「フィット」ボタンを押すと画像全体が表示されます。

[![画像](https://assets.st-note.com/img/1770799591-ogObX9YJTCyVwuRAmLQ4zPr1.png)](https://assets.st-note.com/img/1770799591-ogObX9YJTCyVwuRAmLQ4zPr1.png?width=2000&height=2000&fit=bounds&quality=85)

**③画像選択の設定**

最初は少し「？」となる項目ですが

**ベース：左上の画像を選択（今回は目open / 口open）**

**目ソース：ベースと目だけ違う画像（目close / 口open ＝ 今回は左下）**

**口ソース：ベースと口だけ違う画像（目open / 口close = 今回は右上）** をそれぞれ選択します。

指定できたら画面中央のマスク描画エリアがこんな感じになります。

[![画像](https://assets.st-note.com/img/1770800137-eBbnywKETQLfVrmGO2Mu4Nzt.png?width=1200)](https://assets.st-note.com/img/1770800137-eBbnywKETQLfVrmGO2Mu4Nzt.png?width=2000&height=2000&fit=bounds&quality=85) それぞれの差分が半透明に重なっている状態

**④マスクの設定**

差分表示されたマスクエリアで目パーツの方は目の部分（眉毛を含めるかは自由）、口パーツの方は口の部分だけをブラシ塗りつぶします。

すると右側のプレビューエリアに反映されてこんな感じになります。

[![画像](https://assets.st-note.com/img/1770800324-uIopKQA760mhkJg81BVfSURy.png?width=1200)](https://assets.st-note.com/img/1770800324-uIopKQA760mhkJg81BVfSURy.png?width=2000&height=2000&fit=bounds&quality=85) 今回は眉毛を含めない＝ベースに合わせる

ベース画像（今回は左上）にマスクしたところだけ差分の画像を適用するわけですね。

**⑤ファイル出力**「4パターン一括保存」で4枚の画像が指定したフォルダに出力されます。

[![画像](https://assets.st-note.com/img/1770800435-xCNJnQ8fGszA3FgVhvIlKpXa.png)](https://assets.st-note.com/img/1770800435-xCNJnQ8fGszA3FgVhvIlKpXa.png?width=2000&height=2000&fit=bounds&quality=85)[![画像](https://assets.st-note.com/img/1770801345-GaZCE0vVjsYwUzdcfkRbnWIJ.png)](https://assets.st-note.com/img/1770801345-GaZCE0vVjsYwUzdcfkRbnWIJ.png?width=2000&height=2000&fit=bounds&quality=85) うーん、PhotShop使わなくていいのはラクチン

Nano-bananaさんは賢いので、ひょっとしたら背景切り抜かなくても1枚絵からグリーンバックにして４つに分割して表情差分もつけてって1発で出来るかもしれません。どなたか頑張ってみてくれませんか\_(:3 」∠)\_

[![画像](https://assets.st-note.com/img/1770810044-bXt472Q8zxTeKDopGvmylMIE.png?width=1200)](https://assets.st-note.com/img/1770810044-bXt472Q8zxTeKDopGvmylMIE.png?width=2000&height=2000&fit=bounds&quality=85) 他力本願寺西別院

* * *

## STEP3：ループ動画の生成

> やぁ、ようこそ沼へ(´・ω・\`)
>
> このクレジットはサービスだから2-3動画作って落ち着ていほしい

久々のバーボン

ループ動画の生成は最近だとLTX-2みたいなローカルでも作れるのかもしれませんが、ろてじんさんにオススメされたViduが個人的にいい感じだったので今回はこちらの方法で紹介したいと思います。

ちなみにViduは初回特典で80クレジットついてくるので無料でも8-10秒のループ動画が2-3個つくれます。

> おおお、動かしていただきありがとうございます。ループ動画は色々なAI動画サービスで作れますよ（サブスクで月8～10ドルくらいかかってしまいますが）viduで作るのが今のところはクオリティが高いと思います。
>
> — ろてじん (@rotejin) [January 13, 2026](https://twitter.com/rotejin/status/2010990003032358939?ref_src=twsrc%5Etfw)

[**AI動画生成 - 想像するものがViduで実現 \| Vidu AI \| Vidu AI** _Viduは、安定した品質と滑らかな2Dアニメーションで知られるAI動画生成ツールです。アニメや広告、映像制作などに最適で_ _www.vidu.com_](https://www.vidu.com/ja?)

Viduにログインしたら「画像から動画」からループ動画を生成していきます。

[![画像](https://assets.st-note.com/img/1770804212-ab0wflKcVkSqgBRZhyLEYGDr.png)](https://assets.st-note.com/img/1770804212-ab0wflKcVkSqgBRZhyLEYGDr.png?width=2000&height=2000&fit=bounds&quality=85)

ループ動画を作るのに「最初の画像」「2枚目の画像」･･･「最初の画像」という形で最初と最後の画像は同じものを指定する必要があるため「Vidu Q2」など、3枚以上画像を指定できるモデルを選択してください。

プロンプトについては私も全然研究が足りていないので適当なんですが、以下の様なプロンプトで待機アニメーションを作ってもらっています。

> 動画には、黒い髪と黒い狐耳、ターコイズ色の目をしたキャラクターが登場し、ターコイズ色のネクタイと黒のブレザー、灰色のスカートを着ています。キャラクターは瞬き、呼吸などのアイドルアニメーションをしており、加えて「身体を大きく弾ませる」「軽く微笑む」というアクションを加えます。
>
> 環境: 背景は緑色で、無地で単色です。明るい緑色は、ビデオ制作におけるデジタル合成や特殊効果によく使用されるクロマキーの背景として機能します。

全て同じプロンプトにしています

今回、リアル頭身のハウラちゃんの動画作ったら、解像度がついてこなくてこんな仕上がりに･･･

バストアップくらいの大きさなら割とキレイに出力されました( ;∀;)

[![画像](https://assets.st-note.com/img/1770806767-jg2SH7eE0Xq4DCM8sW9ZbTFG.png)](https://assets.st-note.com/img/1770806767-jg2SH7eE0Xq4DCM8sW9ZbTFG.png?width=2000&height=2000&fit=bounds&quality=85)

デフォルメ版もこんな感じに。

と、こんな感じで口パク画像が2枚あればクロマキー背景のループ動画ができてしまいます。かがくのちからってすげー！案件です。

１つだけ試行錯誤で得た知見を共有しておくと、登録する画像が表情差分だけだと、デフォルメハウラちゃんみたいに表情だけ変わって **身体が微動だにしない** 動画ができやすいです。なので、画像を登録するときに多少なりとも上下左右にズラしておくと待機モーションっぽくなります。

[![画像](https://assets.st-note.com/img/1770810241-jO7UhiCcfZVTswgtX6RyEmq2.png?width=1200)](https://assets.st-note.com/img/1770810241-jO7UhiCcfZVTswgtX6RyEmq2.png?width=2000&height=2000&fit=bounds&quality=85)

Viduは1回20-40クレジットで作れますが、試行錯誤するとみるみるうちに溶けていくので、$10のスタンダードプラン（800クレジット。これでも20-40個程度）を使うことになるかもしれません･･･。

* * *

## おわりに

この記事では「ループ動画素材を作るところまで」が対象なので、この動画を使ってMotionPNGTuberを作る場合はろてじんさんの解説記事や私の関連ツールの記事なども参考にして作ってみてください！

それでは、よいMotionPNGTuberライフを

ちなみに私の作ったWebVoiceAnimatorというChrome拡張でもMotionPNGTuberが動くので、興味があれば使ってみてください。

無料です！( ・∀・)

copy

## いいなと思ったら応援しよう！

チップで応援する

- [#生成AI](https://note.com/hashtag/%E7%94%9F%E6%88%90AI)
- [#nanobanana](https://note.com/hashtag/nanobanana)
- [#NanoBananaPro](https://note.com/hashtag/NanoBananaPro)
- [#Vidu](https://note.com/hashtag/Vidu)
- [#ループ動画](https://note.com/hashtag/%E3%83%AB%E3%83%BC%E3%83%97%E5%8B%95%E7%94%BB)
- [#MotionPNGTuber](https://note.com/hashtag/MotionPNGTuber)

31


[![カズヤ弟＠ゲーム実況＆生成AI](data:image/svg+xml;charset=utf8,%3Csvg%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22a%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%2233%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%2250%25%22%20stop-color%3D%22%23fff%22%2F%3E%3Cstop%20offset%3D%2267%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23f7f9f9%22%2F%3E%3CanimateTransform%20attributeName%3D%22gradientTransform%22%20type%3D%22translate%22%20from%3D%22-1%200%22%20to%3D%221%200%22%20begin%3D%220s%22%20dur%3D%221.5s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20class%3D%22rect%22%20fill%3D%22url(%23a)%22%20d%3D%22M-100-100h300v300h-300z%22%2F%3E%3C%2Fsvg%3E)](https://note.com/kazuya_bros)

[カズヤ弟＠ゲーム実況＆生成AI](https://note.com/kazuya_bros)

フォロー


ゲーム実況活動に使えそうな生成AI関係の技術を色々試してる人。
備忘も兼ねて調べた内容をなるべくカロリー使わず読めるように書き残しています。
Youtubeではひっそりとゲーム実況をやっています。

- [Xアカウント](https://twitter.com/dodo_ria)
- [YouTubeページ](https://www.youtube.com/channel/UCoXTRja1-6lCpgYc1SffmqA)
- [RSSのURL](https://note.com/kazuya_bros/rss)

31


31


[![カズヤ弟＠ゲーム実況＆生成AI](https://assets.st-note.com/production/uploads/images/134886236/profile_ac158ac10acd006bd0c5a7f27e822c20.png?fit=bounds&format=jpeg&quality=85&width=330)](https://note.com/kazuya_bros)[カズヤ弟＠ゲーム実況＆生成AI](https://note.com/kazuya_bros "カズヤ弟＠ゲーム実況＆生成AI")

ゲーム実況活動に使えそうな生成AI関係の技術を色々試してる人。
備忘も兼ねて調べた内容をなるべくカロリー使わず読めるように書き残しています。
Youtubeではひっそりとゲーム実況をやっています。

フォロー


- [noteプレミアム](https://premium.lp-note.com/)
- [note pro](https://pro.lp-note.com/?utm_source=notecom&utm_medium=footer)
- [ヘルプ](https://help-note.com/hc/ja)
- [プライバシー](https://terms.help-note.com/hc/ja/articles/44948981050649)
- [クリエイターへのお問い合わせ](https://note.com/kazuya_bros/message)
- [フィードバック](https://help-note.com/hc/ja/requests/new?ticket_form_id=360000081181)
- [ご利用規約](https://terms.help-note.com/hc/ja/articles/44943817565465)
- [通常ポイント利用特約](https://note.com/terms/paid_point)
- [加盟店規約](https://note.com/terms/seller_creators)
- [資金決済法に基づく表示](https://note.com/terms/payment_service_act)
- [特商法表記](https://note.com/kazuya_bros/terms/specified)
- [投資情報の免責事項](https://note.com/terms/investment_disclaimer)

【MotionPNGTuber】私的素材の作り方【差分生成からループ動画作成まで】｜カズヤ弟＠ゲーム実況＆生成AI

Twitter Widget Iframe