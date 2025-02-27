export const EventMainImage = ({
  image,
  title,
}: {
  image: any;
  title: string;
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {image?.url && (
        <img
          src={image?.formats?.thumbnail?.url || ""}
          alt={image?.alternativeText || title}
          className="object-cover transform transition-transform h-full w-full"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};
