import React from "react";

export interface ConferenceThumbnailProps {
  image: string;
  title?: string;
}

export const ConferenceThumbnail: React.FC<ConferenceThumbnailProps> = ({
  image,
  title,
}) => {
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border bg-card aspect-[21/9]">
      <img
        src={image}
        alt={title || "Conference Thumbnail"}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {title && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end">
          <h3 className="text-white text-lg font-semibold px-6 pb-4">
            {title}
          </h3>
        </div>
      )}
    </div>
  );
};
