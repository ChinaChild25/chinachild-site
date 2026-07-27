const STORED_TEST_AUDIO_URLS: Readonly<Record<string, string>> = Object.freeze({
  "爸": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/4d/4dcbf612b3c32f984e450c3f83b815e5a2a3e6daba9cd7f0412f663226ee33b7.mp3",
  "促": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/d1/d14ce3187ce4e13647281cc19d50961051a189145b9c76b0327b77fe9b23288c.mp3",
  "好": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/95/95c47adaa00ccdd3071e767a36566bafb0adff2ec450ba584ebd0881df9b9d34.mp3",
  "坏": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/e8/e8d0c32f4abaa206ef15e3d6f24217e17dd2a90e60b15cc8c6738dda67485e32.mp3",
  "今天天气很好": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/ba/ba95f3ef369b71fe25e4e3cc70da3303e70048e255ac2ae119177d56d8cead3c.mp3",
  "来": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/d8/d8db46e1860e931843ae23f1b158363dd6693b35f1cecc2d167501cd33d90b09.mp3",
  "了": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/0c/0ce03f5eda6e8cb3fcf851068ba60fa40ba2dbb78425469cbfb166362a84ed83.mp3",
  "妈": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/6c/6c5648520276e5e6151396d3b0b57c246f2403fc034ca02b29b65981631ba265.mp3",
  "马": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/e4/e47f994f2ae601e6fd83f513f0ffe05443ce4df18bce861927b44ddf32b1987f.mp3",
  "买": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/54/54cc5785b3a10c7a967df0d8fa86f2b1a3d77a5e7c80ec739ebd10589a0e7a28.mp3",
  "卖": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/a4/a42d3874119991457643d58b4d09f88bd01e0b6c5417175f3858eb2d5ed5207d.mp3",
  "妹": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/78/78d3de266436d9ca37ca023b0ad6b66e6f8221f8435cee998eb850ff33ccd528.mp3",
  "明天我去北京": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/cf/cf0397708a5ac68406f73ba09ddcbbe543ae16c1ba571e54ad9a69f6883c4bfd.mp3",
  "你": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/59/59b69ee9552641d551b2a9c0874531a9c29d553fecb01ebaf146cd752d61e007.mp3",
  "你好": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/7a/7a1e057ff3b26e7c628ce9b6850e0c575121de75f5b703705b136df58b59c573.mp3",
  "墙": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/a3/a3c09a5222a209bb33f97636f54ca2637c4074c89b598508f5b3c9fb468be064.mp3",
  "请": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/14/146726cc95f652099eb25bb7a1774265913b9c2c30b78ce97f96af11d945fae1.mp3",
  "请把窗户关上": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/5f/5f5ee114deed780183c15077d8ad1c5bc1ba8ac33060bb527e646a008f3ede66.mp3",
  "如果明天下雨，我们就在家复习中文": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/d8/d8b52ef4981fc588da8fcbe53203e81f48f629f6d819623e61f289b03e8cd5af.mp3",
  "书": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/82/82ec08fd23e4de50812ead2d9379d034da8ca166ebedd44cc51bcaede8631a69.mp3",
  "水": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/22/229dd5fa43dcf4f3b22bb00214bed679d4713b0461410ab0a288d753b03d2e95.mp3",
  "虽然这个办法比较麻烦，但是效果很好": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/65/65088319ec1dfba4963f17899563dd18bc27566f29d127fa09943a42e2241484.mp3",
  "随着经济的发展，越来越多的企业开始重视中文人才": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/27/27ee869a24f1c80136178a7dad14c8a122ec3ed175c49088547ce6493f76e89a.mp3",
  "他一边听音乐，一边做饭": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/1e/1e533eb8a1b3926ffc446c6c38e28a9f53f82c59dc77037927cef7095c8a462d.mp3",
  "我把作业写完了": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/d1/d1dfd4c6452ae3f534ed2790936459d5c34c314d298c58f3ba338242bfcc8d34.mp3",
  "我是学生": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/1f/1f4bd07c8706ee1c6a5a8db6bf28cca57528b53bcdae618657043fc131bbc760.mp3",
  "我想买一张去北京的火车票": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/b9/b954749b64fdd53322bd526a7122a7102f8c57691ef31ba300eed3226b98fcca.mp3",
  "无论遇到什么困难，他都不放弃": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/4b/4bf422752331f11bdd0891dd741313476303ebdc268d1aeb65b2f5c452175a07.mp3",
  "险": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/76/768e3d2c5d88782a7e9b403a72629aed2a7ea6d518660b8b6e60a09a7b420ef8.mp3",
  "影": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/0f/0f28fde75f94d25dac3483c643d864d9d7db5d1e2741f58c74e8da0d54ab9b10.mp3",
  "这次会议主要讨论公司明年的发展计划": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/d2/d28835940e1e75423ccd848b6b5a5d9a97ae443a5621d49adf6600e7d8eb0094.mp3",
  "这件衣服多少钱": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/42/42d19db9b1890efe961fdb7c659b152c145de21de92c37930b02cba0324197c0.mp3",
  "只要你每天练习，口语一定会提高": "https://wcucqejmjzxhhkqyqvgo.supabase.co/storage/v1/object/public/vocab-public-audio/tests/ed/edbd49b03e75f3fa7593f9d3d1921551eea6a4b221161602437895651b082037.mp3"
});

export function getStoredTestAudioUrl(text: string): string {
  return STORED_TEST_AUDIO_URLS[text] ?? "";
}
