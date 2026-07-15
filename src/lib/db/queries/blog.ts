import { db } from "../client";
import { createSlugRepo } from "../helpers";
import type { BlogPost } from "../types";

export const blogRepo = createSlugRepo<BlogPost>(db, "blog_posts", ["tags"]);
