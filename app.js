(function(){
const $=id=>document.getElementById(id);
const BOL={testler:{ad:'Testlər',data:TESTLER,yol:'t'},kurslar:{ad:'Kurslar',data:KURSLAR,yol:'k'},aletler:{ad:'Alətlər',data:KOMEKCI,yol:'a'}};
const state={bolme:'testler',qrup:'hamisi',q:''};
const qad=id=>(QRUPLAR.find(x=>x.id===id)||{}).ad||'';

function el(tag,attrs,kids){
  const e=document.createElement(tag);
  for(const k in attrs||{}){
    if(k==='class')e.className=attrs[k];
    else if(k==='text')e.textContent=attrs[k];
    else e.setAttribute(k,attrs[k]);
  }
  (kids||[]).forEach(c=>c&&e.appendChild(typeof c==='string'?document.createTextNode(c):c));
  return e;
}
const norm=s=>String(s).toLocaleLowerCase('az').replace(/[əǝ]/g,'e').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ç/g,'c').replace(/ğ/g,'g');
function haystack(x){return norm([x.ad,x.alt,x.tip,x.ne,x.niye,x.hedef,(x.terkib||[]).join(' '),qad(x.qrup)].join(' '))}
const uygun=(x,q)=>{const h=' '+haystack(x).replace(/[^a-z0-9]+/g,' ');return q.split(/\s+/).filter(Boolean).every(w=>h.includes(' '+w))};
function filtr(arr){
  const q=norm(state.q.trim());
  return arr.filter(x=>(state.qrup==='hamisi'||x.qrup===state.qrup)&&(!q||uygun(x,q)));
}

function card(x,yol){
  const meta=el('div',{class:'meta'},[el('span',{class:'tag t',text:x.tip})]);
  if(x.yas)meta.appendChild(el('span',{class:'tag',text:x.yas.length>34?x.yas.slice(0,31).replace(/\s+\S*$/,'')+'…':x.yas}));
  return el('a',{class:'card',href:'#/'+yol+'/'+x.id},[
    el('h3',{text:x.ad}),el('p',{class:'alt',text:x.alt}),
    el('p',{class:'ne',text:x.ne}),meta,el('span',{class:'more',text:'Ətraflı →'})
  ]);
}

function renderTabs(){
  const t=$('tabs');t.textContent='';
  for(const k in BOL){
    const b=el('button',{class:'tab',role:'tab',type:'button','aria-selected':String(state.bolme===k)},[BOL[k].ad,el('span',{text:String(BOL[k].data.length)})]);
    b.onclick=()=>{state.bolme=k;state.qrup='hamisi';renderHome()};
    t.appendChild(b);
  }
}
function renderChips(){
  const c=$('chips');c.textContent='';
  if(state.bolme!=='testler'){c.hidden=true;return}
  c.hidden=false;
  const mk=(id,ad)=>{const b=el('button',{class:'chip',type:'button','aria-pressed':String(state.qrup===id),text:ad});b.onclick=()=>{state.qrup=id;renderHome()};c.appendChild(b)};
  mk('hamisi','Hamısı');QRUPLAR.forEach(g=>mk(g.id,g.ad));
}
function renderList(){
  const b=BOL[state.bolme],box=$('list');box.textContent='';
  if(state.q.trim()){
    let n=0;
    for(const k in BOL){
      const arr=BOL[k].data.filter(x=>uygun(x,norm(state.q.trim())));
      if(!arr.length)continue;n+=arr.length;
      box.appendChild(el('h2',{class:'grp',text:BOL[k].ad}));
      box.appendChild(el('div',{class:'grid'},arr.map(x=>card(x,BOL[k].yol))));
    }
    if(!n)box.appendChild(el('p',{class:'empty',text:'Heç nə tapılmadı. Başqa söz yoxla.'}));
    return;
  }
  const items=filtr(b.data);
  if(!items.length){box.appendChild(el('p',{class:'empty',text:'Heç nə tapılmadı. Başqa söz yoxla.'}));return}
  if(state.bolme==='testler'){
    QRUPLAR.forEach(g=>{
      const arr=items.filter(x=>x.qrup===g.id);if(!arr.length)return;
      box.appendChild(el('h2',{class:'grp',text:g.ad}));
      box.appendChild(el('div',{class:'grid'},arr.map(x=>card(x,b.yol))));
    });
  }else box.appendChild(el('div',{class:'grid'},items.map(x=>card(x,b.yol))));
}
function renderHome(){
  $('home').hidden=false;$('detail').hidden=true;
  renderTabs();renderChips();renderList();
  $('chips').hidden=$('chips').hidden||!!state.q.trim();
}

function sec(title,body,cls){
  const s=el('section',{class:'sec'+(cls?' '+cls:'')},[el('h2',{text:title})]);
  if(Array.isArray(body))s.appendChild(el('ul',{},body.map(t=>el('li',{text:t}))));
  else s.appendChild(el('p',{text:body}));
  return s;
}
function renderDetail(yol,id){
  const key=Object.keys(BOL).find(k=>BOL[k].yol===yol),x=key&&BOL[key].data.find(i=>i.id===id);
  if(!x){location.hash='#/';return}
  $('home').hidden=true;const d=$('detail');d.hidden=false;d.textContent='';
  document.title=x.ad+' · AN Psixoloji';
  d.appendChild(el('a',{class:'back',href:'#/'},['← Kataloqa qayıt']));
  d.appendChild(el('div',{class:'dh'},[el('span',{class:'tag t',text:x.tip}),el('h1',{text:x.ad}),el('p',{text:x.alt})]));
  const facts=[];
  if(x.yas)facts.push(['Yaş həddi',x.yas]);
  if(x.hedef)facts.push(['Kimlər üçündür',x.hedef]);
  if(x.kim)facts.push(['Kim tətbiq edir',x.kim]);
  if(x.muddet)facts.push(['Müddət',x.muddet]);
  if(x.qrup)facts.push(['Qrup',qad(x.qrup)]);
  d.appendChild(el('dl',{class:'facts'},facts.map(f=>el('div',{class:'fact'},[el('dt',{text:f[0]}),el('dd',{text:f[1]})]))));
  d.appendChild(sec(yol==='t'?'Nəyi ölçür':'Nədir',x.ne));
  if(x.niye)d.appendChild(sec('Niyə keçirilir',x.niye));
  if(x.terkib)d.appendChild(sec(yol==='t'?'Nədən ibarətdir':'Məzmun',x.terkib));
  if(x.netice)d.appendChild(sec('Nəticə necə oxunur',x.netice));
  if(x.mehdud)d.appendChild(sec('Nəzərə alın',x.mehdud,'warn'));
  if(x.qeyd)d.appendChild(sec('Qeyd',x.qeyd));
  d.appendChild(el('div',{class:'acts'},(x.linkler||[]).map((l,i)=>el('a',{class:'btn'+(i?' ghost':''),href:l.u,target:'_blank',rel:'noopener',text:l.t}))));
  const eyni=BOL[key].data.filter(i=>i.id!==x.id&&(x.qrup?i.qrup===x.qrup:true)).slice(0,3);
  if(eyni.length){
    const r=el('div',{class:'rel'},[el('h2',{text:'Bu bölmədən digərləri'}),el('div',{class:'grid'},eyni.map(i=>card(i,yol)))]);
    d.appendChild(r);
  }
  window.scrollTo(0,0);
}

function route(){
  const m=location.hash.match(/^#\/([tka])\/([\w-]+)$/);
  if(m)return renderDetail(m[1],m[2]);
  document.title='AN Psixoloji · Test və kurs kataloqu';
  renderHome();
}
$('q').addEventListener('input',e=>{
  state.q=e.target.value;
  if(location.hash!==''&&location.hash!=='#/'){location.hash='#/';return}
  renderHome();
});
window.addEventListener('hashchange',route);
route();
})();
