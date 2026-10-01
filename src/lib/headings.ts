import GithubSlugger from "github-slugger";
export function getHeadings(content: string) {
  const slugger = new GithubSlugger();
  const headings: { text: string; id: string }[] = [];
  let fence: string | undefined;
  for (const line of content.split("\n")) {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length)
        fence = undefined;
      continue;
    }
    if (fence) continue;
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (!heading) continue;
    const text = heading[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_`]/g, "");
    const id = slugger.slug(text);
    if (heading[1].length === 2) headings.push({ text, id });
  }
  return headings;
}
