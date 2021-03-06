import { Image, ImageType, ImageTypes, PublisherCodegen, publisherConfig } from "./entities";
import { Collection, CustomCollection, getEm, Loaded } from "joist-orm";

const allImagesHint = { images: [], authors: { image: [], books: "image" } } as const;

export class Publisher extends PublisherCodegen {
  readonly allImages: Collection<Publisher, Image> = new CustomCollection(this, {
    load: (entity) => entity.populate(allImagesHint),
    get: (entity) => {
      const loaded = entity as Loaded<Publisher, typeof allImagesHint>;

      return loaded.authors.get
        .reduce(
          (images, author) => {
            images.push(author.image.get!);
            author.books.get.forEach((book) => images.push(book.image.get!));
            return images;
          },
          [...loaded.images.get],
        )
        .filter((imageOrUndefined) => imageOrUndefined !== undefined)
        .sort((a, b) => ImageTypes.findByCode(a.type)!.sortOrder - ImageTypes.findByCode(b.type)!.sortOrder);
    },
    add: (entity, value) => {
      const allImages = (entity as Loaded<Publisher, "allImages">).allImages;
      if (!allImages.get.includes(value)) {
        value.type = ImageType.PublisherImage;
        value.author.set(undefined);
        value.book.set(undefined);
        value.publisher.set(entity);
      }
    },
    remove: (entity, value) => {
      const allImages = (entity as Loaded<Publisher, "allImages">).allImages;
      if (allImages.get.includes(value)) {
        getEm(entity).delete(value);
      }
    },
  });
}

publisherConfig.addRule("authors", (p) => {
  if (p.authors.get.length === 13) {
    return "Cannot have 13 authors";
  }
});
