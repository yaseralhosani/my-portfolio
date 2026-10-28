/* Only offers an export of this browser's old local draft. No editor or credentials. */
(() => {
  let draft;
  try { draft=JSON.parse(localStorage.getItem('portfolio.cms.draft.v1')); } catch { return; }
  if(!draft?.dirty||!draft.data)return;
  document.querySelector('#draft-migration').hidden=false;
  document.querySelector('#download-draft').addEventListener('click',()=>{
    const backup={version:1,data:draft.data,baseSha:draft.baseSha||null,media:draft.media||{},dirty:true};
    const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='portfolio-draft-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    document.querySelector('#draft-status').textContent='Backup downloaded. Import it after signing in to the private studio.';
  });
})();
