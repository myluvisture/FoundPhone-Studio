/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { Fragment, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import { makeItem, type Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
function grouped(items: Item[]) {
  return [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title),
  }));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1],
    dateKey = (time: string) => time.match(/^20xx\.\d{2}\.\d{2}/)?.[0] || "";
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender ||
      dateKey(previous.time) !== dateKey(m.time),
    last:
      !next ||
      next.outgoing !== m.outgoing ||
      next.sender !== m.sender ||
      dateKey(next.time) !== dateKey(m.time),
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
const rikuAvatar = "./story-assets/p3.jpg";
const isRiku = (value: string) => /リク|陸|riku/i.test(value);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const list = grouped(p.items),
    messages = [
      ...p.items.filter((i) => i.title === p.thread),
      ...sent.flatMap((raw, index) => {
        try {
          const entry: unknown = JSON.parse(raw);
          if (
            !Array.isArray(entry) ||
            entry.length !== 3 ||
            !entry.every((v) => typeof v === "string") ||
            entry[0] !== p.thread
          )
            return [];
          return [
            makeItem({
              id: "local-kkt-" + index,
              title: entry[0],
              body: entry[1],
              time: entry[2],
              sender: p.owner || "机主",
              outgoing: true,
              meta: { local: "true" },
            }),
          ];
        } catch {
          return [];
        }
      }),
    ],
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              const dateMatch = m.time.match(/^20xx\.(\d{2})\.(\d{2})/);
              const dateKey = dateMatch ? dateMatch[0] : "";
              const previousTime = i > 0 ? messages[i - 1].time : "";
              const previousDate = previousTime.match(/^20xx\.(\d{2})\.(\d{2})/)?.[0] || "";
              const dateLabel = dateMatch ? `${Number(dateMatch[1])}月${Number(dateMatch[2])}日` : "";
              return (
                <Fragment key={m.id}>
                  {dateKey && dateKey !== previousDate && (
                    <div className="kz-date-separator">{dateLabel}</div>
                  )}
                  <div
                    className={
                      "kzm " +
                      (m.outgoing ? "kzmy" : "kzot") +
                      (run.first ? " first" : "")
                    }
                  >
                    {!m.outgoing && run.first && (
                      <>
                        <div className="kzmav">
                          <Avatar
                            name={m.sender}
                            src={isRiku(p.thread) || isRiku(m.sender) || isRiku(m.title) ? rikuAvatar : ""}
                          />
                        </div>
                        <div className="kzmn">{m.sender}</div>
                      </>
                    )}
                    {m.outgoing && run.last && (
                      <span className="kzt">
                        {m.meta.unread || ""}
                        <br />
                        {m.time.slice(-5)}
                      </span>
                    )}
                    <button
                      className={"kzbub" + (m.media ? " kzimg" : "")}
                      onClick={() => m.meta.local !== "true" && read(p, m)}
                    >
                      {m.media ? <Media item={m} /> : m.body}
                    </button>
                    {!m.outgoing && run.last && (
                      <span className="kzt">{m.time.slice(-5)}</span>
                    )}
                  </div>
                </Fragment>
              );
            })}
            {!messages.length && <Blank />}
          </div>
          <form
            className="kzinp"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) {
                setSent([
                  ...sent,
                  JSON.stringify([
                    p.thread,
                    draft.trim(),
                    p.virtualTime || "09:41",
                  ]),
                ]);
                setDraft("");
              }
            }}
          >
            <button
              type="button"
              aria-label="添加聊天内容"
              onClick={() => (p.creator ? p.onAdd() : setMenu(!menu))}
            >
              <Plus size={21} />
            </button>
            <input
              aria-label="KKT消息"
              placeholder="输入消息"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Smile size={22} />
            <button
              className={draft.trim() ? "go" : ""}
              aria-label="发送KKT消息"
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </form>
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            <div className="kzksec">
              {tab === "好友" ? "好友" : "全部聊天"} {list.length}
            </div>
            {list
              .filter((g) => g.title.includes(query.trim()))
              .map((g) => {
                const last = g.items.at(-1)!;
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar name={last.sender || g.title} src={last.avatar || (isRiku(g.title) || isRiku(last.sender) || isRiku(last.title) ? rikuAvatar : "")} />
                    <span className="kzkn">
                      <b>{g.title}</b>
                      <small>{tab === "好友" ? last.sender : last.body}</small>
                    </span>
                    <span className="kzkmt">
                      {last.time.slice(-5)}
                      {last.meta.unread && (
                        <i className="kzkbd">{last.meta.unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [selectedDm, setSelectedDm] = useState(""),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const [relationshipList, setRelationshipList] = useState<"粉丝" | "关注" | null>(null);
  const [profileUser, setProfileUser] = useState<"sakusakusaku_07" | "ri_ku_03">("sakusakusaku_07");
  const dmJump = typeof p.ui?.dmJump === "string" ? p.ui.dmJump : "";
  useEffect(() => {
    if (!dmJump) return;
    const splitAt = dmJump.lastIndexOf("|");
    const contact = splitAt >= 0 ? dmJump.slice(0, splitAt) : dmJump;
    if (!contact) return;
    setSheet(null);
    setSelected(null);
    setTab("私信");
    setSelectedDm(contact);
    p.onUi?.("dmJump", "");
  }, [dmJump]);
  // Profile records are metadata, not published posts.
  const posts = p.items.filter(
      (i) =>
        !i.id.startsWith("instagram-profile") &&
        i.folder !== "私信" &&
        i.meta.story !== "true",
    ),
    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = p.items.filter((i) => i.folder === "私信"),
    dmContacts = dms.filter(
      (i, index, all) =>
        all.findIndex((candidate) => candidate.title === i.title) === index,
    ),
    dmThread = dms.filter(
      (i) => i.title === selectedDm && i.body.trim() !== "",
    ),
    active = stories[story - 1];
  const accountForItem = (i: Item): "sakusakusaku_07" | "ri_ku_03" =>
    i.meta.account === "ri_ku_03" || i.sender === "ri_ku_03"
      ? "ri_ku_03"
      : "sakusakusaku_07";
  const isRikuProfile = profileUser === "ri_ku_03";
  const profilePosts = posts.filter((i) => accountForItem(i) === profileUser);
  const profileAvatar = isRikuProfile
    ? "./story-assets/riku-avatar.jpg"
    : "./story-assets/instagram-avatar.jpg";
  const relationshipTarget = isRikuProfile ? "sakusakusaku_07" : "ri_ku_03";
  const relationshipTargetAvatar = isRikuProfile
    ? "./story-assets/instagram-avatar.jpg"
    : "./story-assets/riku-avatar.jpg";
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button
            onClick={() => {
              setProfileUser(accountForItem(i));
              setSelected(null);
              setTab("个人主页");
            }}
          >
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={
              selectedDm
                ? "返回Instagram私信列表"
                : selected
                  ? "返回Instagram动态"
                  : tab === "个人主页" && isRikuProfile
                    ? "返回Saku主页"
                    : "关闭当前App"
            }
            onClick={() => {
              if (selectedDm) setSelectedDm("");
              else if (selected) setSelected(null);
              else if (tab === "个人主页" && isRikuProfile)
                setProfileUser("sakusakusaku_07");
              else p.onBack();
            }}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected
              ? "帖子"
              : selectedDm
                ? selectedDm
                : tab === "主页"
                  ? "Instagram"
                  : tab === "个人主页"
                    ? profileUser
                    : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "主页" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={s.avatar} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {posts.map(post)}
              {!posts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name={profileUser} src={profileAvatar} />
                <div className="ps">
                  <div>
                    <b>{profilePosts.length}</b>
                    <small>帖子</small>
                  </div>
                  <button type="button" onClick={() => setRelationshipList("粉丝")}>
                    <b>{isRikuProfile ? 15 : 12}</b>
                    <small>粉丝</small>
                  </button>
                  <button type="button" onClick={() => setRelationshipList("关注")}>
                    <b>{isRikuProfile ? 20 : 19}</b>
                    <small>关注</small>
                  </button>
                </div>
              </div>
              <p className="pn">{isRikuProfile ? "リク" : p.owner}</p>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {profilePosts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && !selectedDm && (
            <>
              {dmContacts.map((contact) => {
                const messages = dms.filter(
                  (item) => item.title === contact.title && item.body.trim() !== "",
                );
                const latest = messages[messages.length - 1];
                return (
                  <button
                    className="kzkr"
                    key={contact.id}
                    onClick={() => setSelectedDm(contact.title)}
                  >
                    <Avatar name={contact.title} src={contact.avatar} />
                    <span className="kzkn">
                      <b>{contact.title}</b>
                      <small>{latest?.body || "点击查看聊天"}</small>
                    </span>
                  </button>
                );
              })}
              {!dmContacts.length && <Blank />}
            </>
          )}
          {!selected && tab === "私信" && !!selectedDm && (
            <section className="mymy-ig-dm-thread" aria-label={selectedDm + "聊天记录"}>
              <div className="mymy-ig-dm-messages">
                {dmThread.map((message) => {
                  const outgoing = message.meta.dmDirection === "outgoing";
                  return (
                    <div
                      key={message.id}
                      className={"mymy-ig-dm-row " + (outgoing ? "outgoing" : "incoming")}
                    >
                      {!outgoing && (
                        <Avatar name={selectedDm} src={message.avatar} />
                      )}
                      <div className="mymy-ig-dm-bubble">{message.body}</div>
                    </div>
                  );
                })}
                {!dmThread.length && <Blank />}
              </div>
            </section>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                setSelectedDm("");
                if (n === 3) setProfileUser("sakusakusaku_07");
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {relationshipList && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭列表"
            onClick={() => setRelationshipList(null)}
          />
          <section className="kzsh" role="dialog" aria-label={"Instagram" + relationshipList}>
            <div className="mymy-sheet-handle" />
            <header>
              <b>{relationshipList}</b>
              <button
                aria-label="关闭列表面板"
                onClick={() => setRelationshipList(null)}
              >
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              <button
                type="button"
                className="kzkr mymy-relationship-row"
                onClick={() => {
                  setRelationshipList(null);
                  setSelected(null);
                  setProfileUser(relationshipTarget);
                  setTab("个人主页");
                }}
              >
                <Avatar name={relationshipTarget} src={relationshipTargetAvatar} />
                <span className="kzkn">
                  <b>{relationshipTarget}</b>
                  <small>{relationshipList === "粉丝" ? "关注了你" : "你正在关注"}</small>
                </span>
              </button>
            </div>
          </section>
        </div>
      )}
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => {
                const rawAuthor = c.startsWith("ri_ku_03回复")
                  ? "ri_ku_03"
                  : c.startsWith("sakusakusaku_07回复")
                    ? "sakusakusaku_07"
                    : c.split(/[：:]/)[0];
                const author = /^(?:Riku|riku|リク)$/i.test(rawAuthor)
                  ? "ri_ku_03"
                  : /^(?:Saku|saku|サクヤ)$/i.test(rawAuthor)
                    ? "sakusakusaku_07"
                    : rawAuthor;
                const avatarSrc =
                  author === "ri_ku_03"
                    ? "./story-assets/riku-avatar.jpg"
                    : author === "sakusakusaku_07"
                      ? "./story-assets/instagram-avatar.jpg"
                      : "";
                return (
                  <p key={n}>
                    <Avatar name={author} src={avatarSrc} />
                    {c}
                  </p>
                );
              })}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="关闭当前App" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="切换X外观" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
