import { spanned } from "@/lib/logger";
import { db } from "../src/server/db";

const logger = spanned("seed");
logger.info("seeding database...");
