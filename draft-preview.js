/* Draft preview is opt-in and never changes the public portfolio for other visitors. */
(() => {
  if (new URLSearchParams(location.search).get('preview') !== '1') return;
  let loaded = false;
  try {
    const draft = JSON.parse(localStorage.getItem('portfolio.cms.draft.v1'));
    if (draft?.version === 1 && draft.data && Array.isArray(draft.data.projects) && Array.isArray(draft.data.skills)) {
      window.PORTFOLIO = draft.data;
      window.PREVIEW_IMAGE_URLS = new Set();
      draft.data.projects.forEach(project => {
        const path = String(project.image || '').replace(/^\.\//,'');
        const base64 = draft.media?.[path];
        if (/^assets\/uploads\/[a-z0-9-]+\.webp$/.test(path) && typeof base64 === 'string' && base64.length < 2000000 && /^[A-Za-z0-9+/]+=*$/.test(base64)) {
          const bytes = Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
          window.PREVIEW_IMAGE_URLS.add(url);project.image = url;
        }
      });
      loaded = true;
    }
  } catch { /* The published content remains the fallback. */ }
  const banner=document.createElement('div');banner.className='draft-preview-banner';banner.textContent=loaded?'LOCAL DRAFT PREVIEW · Changes are not published':'PREVIEW · No local draft found';document.body.prepend(banner);
  document.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation();},true);
})();
