const TweetImages = ({ tweet }) => {
  const images = tweet.imageContents?.length
    ? tweet.imageContents
    : tweet.imageContent
      ? [tweet.imageContent]
      : [];

  if (!images.length) return null;

  return (
    <div
      className={`mt-3 grid gap-1 overflow-hidden rounded-lg ${
        images.length === 1 ? "grid-cols-1" : "grid-cols-2"
      }`}
    >
      {images.map((image, index) => {
        const crop = tweet.imageCrops?.[index];
        return (
          <img
            key={`${image}-${index}`}
            src={image}
            alt={`Post image ${index + 1}`}
            className={`w-full object-cover ${
              images.length === 1 ? "max-h-[32rem]" : "aspect-square"
            }`}
            style={{
              objectPosition: `${crop?.x ?? 50}% ${crop?.y ?? 50}%`,
            }}
          />
        );
      })}
    </div>
  );
};

export default function TweetCard({ tweet }) {
  const createdAt = tweet.createdAt
    ? new Date(tweet.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";

  return (
    <article className="surface p-4">
      <p className="whitespace-pre-wrap text-sm">{tweet.caption}</p>
      <TweetImages tweet={tweet} />
      <p className="mt-2 text-xs text-black/50 dark:text-white/50">
        {createdAt}
      </p>
    </article>
  );
}
