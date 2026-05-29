import AudioButton from "@/components/content/AudioButton";

type InlineAudioProps = {
  src: string;
  hanzi: string;
  pinyin: string;
  translation?: string;
};

/**
 * Inline audio sample used inside blog articles — sits at body width, plays a
 * pre-generated MP3 (built by scripts/generate-blog-audio.mjs), and shows the
 * hanzi + pinyin + translation alongside.
 *
 * When `src` is empty (scaffolded but not yet generated), the play button
 * stays disabled but the text still renders — so the article doesn't break
 * before generation runs.
 */
export default function InlineAudio({ src, hanzi, pinyin, translation }: InlineAudioProps) {
  return (
    <div className="article-audio" data-block="audio">
      <AudioButton
        src={src}
        size="md"
        variant="primary"
        ariaLabel={`Прослушать «${hanzi}»`}
      />
      <div className="article-audio__text">
        <span className="article-audio__hanzi" lang="zh">
          {hanzi}
        </span>
        <span className="article-audio__pinyin">{pinyin}</span>
        {translation ? (
          <span className="article-audio__translation">{translation}</span>
        ) : null}
      </div>
    </div>
  );
}
