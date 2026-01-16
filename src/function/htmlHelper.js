import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

const md = new MarkdownIt({
  linkify: true,   
  breaks: true,    
});
function renderReplyMarkdown(text) {
  const raw = md.render(text || "");
  return DOMPurify.sanitize(raw);
}

// function videoEmbedHTML(url) { if (!url) return ""; // YouTube const yt = /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/i.exec( url ); if (yt && yt[1]) { const id = yt[1]; const src = https://www.youtube.com/embed/${id}; return <div class="video-embed"> <iframe src="${src}" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"> </iframe> </div>; } // Vimeo const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url); if (vimeo && vimeo[1]) { const id = vimeo[1]; const src = https://player.vimeo.com/video/${id}; return <div class="video-embed"> <iframe src="${src}" title="Vimeo video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen> </iframe> </div>; } // Dailymotion const dm = /dailymotion\.com\/video\/([A-Za-z0-9]+)/i.exec(url) || /dai\.ly\/([A-Za-z0-9]+)/i.exec(url); if (dm && dm[1]) { const id = dm[1]; const src = https://www.dailymotion.com/embed/video/${id}; return <div class="video-embed"> <iframe src="${src}" title="Dailymotion video" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen> </iframe> </div>; } // Fichier direct (mp4/webm/ogg) if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) { return <div class="src-video"> <video controls preload="metadata" src="${url}"></video> </div>; } // Sinon: lien cliquable (on ne sait pas l'intégrer) return <div class="src-video"> <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a> </div>; }

function videoEmbedHTML(url) {
  if (!url) return "";

  const wrapConsent = (src, { title = "Contenu embarqué", ratio = "16x9", sandbox } = {}) => `
    <div class="embed-consent card" data-src="${src}" data-title="${title}" data-sandbox="${sandbox || ""}" data-ratio="${ratio}">
      <div class="card-body">
        <p class="mb-2 text-muted">Ce contenu intègre une vidéo externe.</p>
        <button type="button" class="btn btn-primary embed-load">Afficher le contenu</button>
      </div>
    </div>
  `;

  // YouTube 
  const yt = /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/i.exec(url);
  if (yt && yt[1]) {
    const id = yt[1];
    const params = "modestbranding=1&rel=0&iv_load_policy=3&playsinline=1";
    const src = `https://www.youtube-nocookie.com/embed/${id}?${params}`;
    const sandbox = "allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox";
    return wrapConsent(src, { title: "YouTube (privacy)", sandbox });
  }

  // Vimeo 
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/i.exec(url);
  if (vimeo && vimeo[1]) {
    const id = vimeo[1];
    const src = `https://player.vimeo.com/video/${id}?dnt=1`;
    const sandbox = "allow-scripts allow-same-origin allow-presentation";
    return wrapConsent(src, { title: "Vimeo (dnt=1)", sandbox });
  }

  // Dailymotion
  const dm = /dailymotion\.com\/video\/([A-Za-z0-9]+)/i.exec(url) || /dai\.ly\/([A-Za-z0-9]+)/i.exec(url);
  if (dm && dm[1]) {
    const id = dm[1];
    const src = `https://www.dailymotion.com/embed/video/${id}`;
    const sandbox = "allow-scripts allow-same-origin allow-presentation";
    return wrapConsent(src, { title: "Dailymotion", sandbox });
  }

  // Fichier direct
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
    return `
      <div class="src-video">
        <video controls preload="metadata" src="${url}" style="max-width:100%;height:auto"></video>
      </div>`;
  }

  // Sinon: lien
  return `
    <div class="src-video">
      <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>
    </div>`;
}



export function buildApiPayload({ user, groups, history, question }) {
    return {
        user: {
            client: user?.client,
            email: user?.email,
            user: user?.sub,
            username: user?.name || user?.username,
            createdAt: user?.createdAt,
            givenName: user?.givenName,
            familyName: user?.familyName,
            groups: groups || [],
            emailConfirmed: true,
            ageConfirmed: true,
        },
        messages: history.map(m => ({ role: m.role, content: m.content })),
        question,
    };
}

export function buildAssistantHTML({ reply, sources }) {
    const mediaBlocks = [];

    (sources || []).forEach(page => {
        const pageUrl = page?.url ? `<a href="${page.url}" target="_blank" rel="noopener noreferrer">${page.url}</a>` : "";
        const bdc = (page?.breadcrumbs || []).join(" › ");
        const header =
            pageUrl || bdc
                ? `<div class="src-meta">
             ${bdc ? `<div class="src-bdc">${bdc}</div>` : ""}
             ${pageUrl ? `<div class="src-url">${pageUrl}</div>` : ""}
           </div>`
                : "";

        const imgs = (page?.images || [])
            .map(img => `
        <figure class="src-figure">
          <img src="${img.url}" alt="${img.caption || ""}" />
          ${img.caption ? `<figcaption>${img.caption}</figcaption>` : ""}
        </figure>
      `).join("");

        const gifs = (page?.gifs || [])
            .map(g => `<div class="src-gif"><img src="${g.url}" alt="gif"/></div>`)
            .join("");

        const vids = (page?.videos || [])
    .map(v => videoEmbedHTML(v.url))
    .join("");

        if (imgs || gifs || vids || header) {
            mediaBlocks.push(`
        <section class="src-block">
          ${header}
          <div class="src-grid">
            ${imgs}${gifs}${vids}
          </div>
        </section>
      `);
        }
    });

    const replyHTML = renderReplyMarkdown(reply);

    return `
    <div data-rich="1" class="assistant-rich">
    <article class="assistant-reply">
    ${replyHTML || ""}
    </article>
    ${mediaBlocks.join("\n")}
    </div>
  `;
}

export function attachEmbedHandlers(root = document) {
  if (root.__embedHandlersBound) return;
  root.__embedHandlersBound = true;

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".embed-load");
    if (!btn) return;
    const wrap = btn.closest(".embed-consent");
    if (!wrap) return;

    const src = wrap.getAttribute("data-src");
    const title = wrap.getAttribute("data-title") || "Contenu embarqué";
    const ratio = wrap.getAttribute("data-ratio") || "16x9";
    const sandbox = wrap.getAttribute("data-sandbox") || "";

    wrap.outerHTML = `
      <div class="ratio ratio-${ratio}">
        <iframe
          title="${title}"
          src="${src}"
          loading="lazy"
          allowfullscreen
          frameborder="0"
          referrerpolicy="no-referrer-when-downgrade"
          ${sandbox ? `sandbox="${sandbox}"` : ""}
          style="border:0"></iframe>
      </div>`;
  });
}
