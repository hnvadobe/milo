var C=window.adobeid?.authorize?.(),f={Authorization:`Bearer ${C}`,pragma:"no-cache","cache-control":"no-cache"};async function T({path:e,query:t}){let r={};e&&(r.path=e),t&&(r.fullText={text:encodeURIComponent(t),queryMode:"EXACT_WORDS"});let s=new URLSearchParams({query:JSON.stringify({filter:r})}).toString();return fetch(`${this.cfSearchUrl}?${s}`,{headers:f}).then(c=>c.json()).then(({items:c})=>c.map(o=>{let n=o.fields.reduce((i,{name:h,multiple:E,values:u})=>(i[h]=E?u:u[0],i),{});return n.path=o.path,n.model=o.model,n}))}async function _(e){return fetch(`${this.cfFragmentsUrl}?path=${e}`,{headers:f}).then(t=>t.json()).then(({items:[t]})=>t)}async function x(e){return await fetch(`${this.cfFragmentsUrl}/${e.id}`,{method:"PUT",headers:{"Content-Type":"application/json","If-Match":"string",...f},body:JSON.stringify({fields:[]})})}var l=class{sites={cf:{fragments:{search:T.bind(this),getCfByPath:_.bind(this),save:x.bind(this)}}};constructor(t){let s=`${`https://${t}.adobeaemcloud.com`}/adobe/sites`;this.cfFragmentsUrl=`${s}/cf/fragments`,this.cfSearchUrl=`${this.cfFragmentsUrl}/search`}};function a(e,t={},r){let s=document.createElement(e);r instanceof HTMLElement?s.appendChild(r):s.innerHTML=r;for(let[c,o]of Object.entries(t))s.setAttribute(c,o);return s}var m="aem-bucket",N={catalog:{name:"catalog",title:{tag:"h3",slot:"heading-xs"},prices:{tag:"h3",slot:"heading-xs"},description:{tag:"div",slot:"body-xs"},ctas:{size:"l"}},ah:{name:"ah",title:{tag:"h3",slot:"heading-xxs"},prices:{tag:"h3",slot:"heading-xs"},description:{tag:"div",slot:"body-xxs"},ctas:{size:"s"}},"ccd-action":{name:"ccd-action",title:{tag:"h3",slot:"heading-xs"},prices:{tag:"h3",slot:"heading-xs"},description:{tag:"div",slot:"body-xs"},ctas:{size:"l"}}};async function A(e,t,r){let{variant:s="ccd-action"}=e;r.setAttribute("variant",s);let c=N[s];if(e.icon?.forEach(o=>{let n=a("merch-icon",{slot:"icons",src:o,alt:"",href:"",size:"l"});t(n)}),e.title&&t(a(c.title.tag,{slot:c.title.slot},e.title)),e.prices){let o=e.prices,n=a(c.prices.tag,{slot:c.prices.slot},o);t(n)}if(e.description){let o=a(c.description.tag,{slot:c.description.slot},e.description);t(o)}if(e.ctas){let o=e.ctas,n=a("div",{slot:"footer"},o);[...n.querySelectorAll('[is="checkout-link"]')].forEach(i=>{let h=a("sp-button",{},i);h.addEventListener("click",E=>{E.stopPropagation(),i.click()}),n.appendChild(h)}),t(n)}}var d=class{#t=new Map;clear(){this.#t.clear()}add(...t){t.forEach(r=>{let{path:s}=r;s&&this.#t.set(s,r)})}has(t){return this.#t.has(t)}get(t){return this.#t.get(t)}remove(t){this.#t.delete(t)}},g=new d,p=class extends HTMLElement{#t;cache=g;refs=[];path;static get observedAttributes(){return["source","path"]}attributeChangedCallback(t,r,s){this[t]=s}connectedCallback(){let t=this.getAttribute(m)??document.querySelector("mas-studio")?.getAttribute(m);this.#t=new l(t),this.fetchData()}refresh(t=!0){this.refs.forEach(r=>r.remove()),this.refs=[],t&&this.cache.remove(this.path),this.fetchData()}async fetchData(){let t=g.get(this.path);if(t||(t=await this.#t.sites.cf.fragments.getCfByPath(this.path)),t){A(t,s=>{this.parentElement.appendChild(s),this.refs.push(s)},this.parentElement);return}}};customElements.define("merch-datasource",p);export{p as MerchDataSource};
//# sourceMappingURL=merch-datasource.js.map
