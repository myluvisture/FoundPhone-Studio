import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";
function StoryPlayer() {
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const publicEdition = pathSegments.includes("sari-sakuya-phone") && new URLSearchParams(location.search).get("template") !== "blank";
  const publicEditionAtRoot = publicEdition && pathSegments.length === 1;
  const [work, setWork] = useState<Work | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const abort = new AbortController();
    const params = new URLSearchParams(location.search);
    const workFile = publicEdition
      ? publicEditionAtRoot
        ? "./blank-work.json"
        : "../blank-work.json"
      : params.get("preview") === "test"
        ? "./test-work.json"
        : params.get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json";
    fetch(workFile, { signal: abort.signal })
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = publicEdition
          ? "sari-sakuya-phone · 捡手机"
          : w.title === "捡手机"
            ? "捡手机"
            : w.title + " · 捡手机";
        setWork(w);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, [publicEdition, publicEditionAtRoot]);
  return (
    <main className="story-runtime">
      {work ? (
        <Phone work={work} />
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
