import {parseSource,serialize,validate} from './model.mjs';
export const REPO = 'yaseralhosani/my-portfolio';
export const BRANCH = 'main';
const BASE = `https://api.github.com/repos/${REPO}`;
export function githubClient(token, fetcher = fetch) {
  async function api(path, method = 'GET', body) {
    let response;
    try { response = await fetcher(BASE + path, {
      method, cache:'no-store', credentials:'omit', redirect:'error',
      headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10', ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(body ? {'Content-Type':'application/json'} : {})},
      ...(body ? {body:JSON.stringify(body)} : {})
    }); } catch { throw new Error(method === 'PATCH' ? 'Publishing could not be confirmed. Keep your draft and check GitHub Actions before retrying.' : 'Could not reach GitHub. Your draft is unchanged; check your connection and try again.'); }
    if (!response.ok) {
      const messages = {401:'GitHub authorization expired. Reconnect with a valid token.',403:'GitHub denied access. Check the token has Contents: read and write for this repository, or try again after the rate limit resets.',404:'Repository or branch unavailable. Check the token can access my-portfolio.',409:'The repository changed while publishing. Reload the published content before trying again.',422:'GitHub rejected this update. The branch may have changed or have protection rules. Reload the published content and check repository access.'};
      throw new Error(messages[response.status] || `GitHub request failed (${response.status}). Your draft is unchanged.`);
    }
    return response.json();
  }
  async function load() {
    const file = await api(`/contents/portfolio.js?ref=${BRANCH}`);
    const bytes = Uint8Array.from(atob(file.content.replace(/\s/g,'')), c=>c.charCodeAt(0));
    const data = parseSource(new TextDecoder().decode(bytes));
    const errors = validate(data); if (errors.length) throw new Error('Published content has an unsupported format. Download your draft before updating the source manually.');
    return {data,sha:file.sha};
  }
  return {
    load,
    async connect() {
      const repository = await api('');
      if (repository.permissions && !repository.permissions.push) throw new Error('This account does not have write access to the portfolio repository.');
      return load();
    },
    async publish(data,baseSha,media = {}) {
      if (!token) throw new Error('Connect GitHub before publishing.');
      const errors = validate(data); if (errors.length) throw new Error(errors[0]);
      const ref = await api(`/git/ref/heads/${BRANCH}`);
      const head = ref.object.sha;
      const file = await api(`/contents/portfolio.js?ref=${head}`);
      if (!baseSha || file.sha !== baseSha) throw new Error('Published content has changed since this draft started. Download a backup, then reload published content and reapply your changes.');
      const commit = await api(`/git/commits/${head}`);
      const entries = [{path:'portfolio.js',mode:'100644',type:'blob',content:serialize(data)}];
      for (const [path, image] of Object.entries(media)) {
        if (!data.projects.some(project=>project.image===`./${path}`)) continue;
        if (!/^assets\/uploads\/[a-z0-9-]+\.webp$/.test(path) || !/^[A-Za-z0-9+/]+=*$/.test(image) || image.length > 2000000) throw new Error('An uploaded image is invalid or too large. Remove it and upload it again.');
        const blob = await api('/git/blobs','POST',{content:image,encoding:'base64'});
        entries.push({path,mode:'100644',type:'blob',sha:blob.sha});
      }
      const tree = await api('/git/trees','POST',{base_tree:commit.tree.sha,tree:entries});
      const contentSha = tree.tree?.find(entry=>entry.path==='portfolio.js')?.sha;
      if (!contentSha) throw new Error('GitHub did not return the new content file. Your branch has not been changed.');
      const created = await api('/git/commits','POST',{message:'Update portfolio from admin',tree:tree.sha,parents:[head]});
      await api(`/git/refs/heads/${BRANCH}`,'PATCH',{sha:created.sha,force:false});
      return {sha:contentSha,commit:created.sha,url:created.html_url};
    }
  };
}
