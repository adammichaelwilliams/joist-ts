import { EntityManager } from "joist-orm";
import { AuthorCodegen, AuthorOpts } from "./entities";

export class Author extends AuthorCodegen {
  constructor(em: EntityManager, opts: AuthorOpts) {
    super(em, opts);
  }
}