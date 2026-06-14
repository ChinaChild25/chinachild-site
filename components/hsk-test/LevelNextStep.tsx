/**
 * «Что дальше после HSK N» — standalone green shape. A short forward-looking
 * paragraph on the left and the ready-made ladder+dial image on the right whose
 * white dot already points at this level (one image per level, baked by design).
 * See `.hsk-next*` in globals.css.
 */
export default function LevelNextStep({
  level,
  note,
}: {
  level: number;
  note: string;
}) {
  const imageSize =
    level === 1 ? { width: 2136, height: 1152 } : { width: 2080, height: 1272 };

  return (
    <div className="hsk-next">
      <div className="hsk-next-body">
        <h2 className="hsk-next-title">Переход на новый уровень</h2>
        <p className="hsk-next-text">{note}</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/hsk-test/hsk-ladder-${level}.png`}
        alt=""
        aria-hidden
        width={imageSize.width}
        height={imageSize.height}
        className="hsk-next-ladder"
        loading="eager"
        draggable={false}
      />
    </div>
  );
}
