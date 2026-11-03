import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { TemplateGenerator } from "@/components/template-generator";

export default async function HomePage() {
  const markup = await readFile(
    join(process.cwd(), "src", "components", "template-generator.html"),
    "utf8",
  );

  return <TemplateGenerator markup={markup} />;
}
