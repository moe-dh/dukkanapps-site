
var yEl=document.getElementById('y');if(yEl)yEl.textContent=new Date().getFullYear();
(function(){
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches||document.body.getAttribute('data-motion')==='off';
var fine=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
var body=document.body;

/* ---- split headings into words ---- */
function split(el,base){
  var i=0;
  (function walk(node){
    [].slice.call(node.childNodes).forEach(function(n){
      if(n.nodeType===3){
        var parts=n.textContent.split(/(\s+)/),frag=document.createDocumentFragment();
        parts.forEach(function(p){
          if(!p)return;
          if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return}
          var s=document.createElement('span');s.className='w';s.style.setProperty('--i',i++);s.textContent=p;frag.appendChild(s);
        });
        node.replaceChild(frag,n);
      } else if(n.nodeType===1 && n.tagName!=='BR'){ walk(n) }
    });
  })(el);
  el.classList.add('split'); if(base) el.style.setProperty('--base',base+'ms');
}
if(!reduce){
  document.querySelectorAll('h1,.sec-head h2,.final h2,.case h3').forEach(function(h){split(h,h.tagName==='H1'?150:0)});
  /* stagger cards inside grids */
  document.querySelectorAll('.needs .need,.steps .step,details').forEach(function(el,idx,all){
    var sib=[].slice.call(el.parentNode.children).indexOf(el); el.style.transitionDelay=(sib*90)+'ms';
    if(!el.classList.contains('rv')) el.classList.add('rv');
  });
  document.querySelectorAll('.steps').forEach(function(s){s.classList.remove('rv')});
}

/* ---- reveal on scroll ---- */
function reveal(){
  var els=document.querySelectorAll('.rv,.split');
  if(!('IntersectionObserver' in window)||reduce){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.15,rootMargin:'0px 0px -60px 0px'});
  els.forEach(function(e){io.observe(e)});
}

/* ---- cinematic intro ---- */
var intro=document.getElementById('intro'),pct=document.getElementById('pct');
var seen=document.body.getAttribute('data-intro')==='off'; try{if(!seen&&document.body.getAttribute('data-intro')!=='always')seen=sessionStorage.getItem('dk_intro')==='1'}catch(e){}
function endIntro(){
  intro.classList.add('done'); body.classList.remove('locked');
  setTimeout(reveal,250);
  setTimeout(function(){intro.classList.add('gone')},1200);
  try{sessionStorage.setItem('dk_intro','1')}catch(e){}
}
if(reduce||seen){intro.classList.add('gone');body.classList.remove('locked');reveal()}
else{
  var t0=performance.now(),D=1900;
  (function tick(t){var p=Math.min(1,(t-t0)/D);var e=1-Math.pow(1-p,3);pct.textContent=String(Math.round(e*100)).padStart(2,'0')+'%';if(p<1)requestAnimationFrame(tick);else setTimeout(endIntro,180)})(t0);
  setTimeout(function(){if(!intro.classList.contains('done'))endIntro()},4000); /* safety */
}

/* ---- marquee: duplicate content for seamless loop ---- */
['t1','t2'].forEach(function(id){var t=document.getElementById(id);if(t)t.innerHTML+=t.innerHTML});

/* ---- scroll progress ---- */
var bar=document.getElementById('progress'),ticking=false;
function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){var h=document.documentElement;var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);bar.style.transform='scaleX('+p+')';ticking=false})}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

if(reduce||!fine)return;

/* ---- cursor glow ---- */
var glow=document.getElementById('glow'),gx=-999,gy=-999,cx=-999,cy=-999;
window.addEventListener('mousemove',function(e){gx=e.clientX;gy=e.clientY},{passive:true});
(function loop(){cx+=(gx-cx)*.12;cy+=(gy-cy)*.12;glow.style.transform='translate3d('+cx+'px,'+cy+'px,0)';requestAnimationFrame(loop)})();

/* ---- spotlight + tilt on cards ---- */
document.querySelectorAll('.need,.step,.final,.case-media .shot,details').forEach(function(el){el.classList.add('spot')});
function tilt(el,max){
  el.addEventListener('mouseenter',function(){el.style.transitionDelay='0ms';el.classList.add('tilt')});
  el.addEventListener('mousemove',function(e){
    var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.setProperty('--mx',(x*100)+'%');el.style.setProperty('--my',(y*100)+'%');
    el.classList.add('moving');
    el.style.transform='perspective(900px) rotateX('+((.5-y)*max)+'deg) rotateY('+((x-.5)*max)+'deg) translateZ(0)';
  });
  el.addEventListener('mouseleave',function(){el.classList.remove('moving');el.style.transform=''});
}
document.querySelectorAll('.need').forEach(function(el){tilt(el,8)});
document.querySelectorAll('.case-media .shot').forEach(function(el){tilt(el,10)});
document.querySelectorAll('.step,.final,details').forEach(function(el){
  el.addEventListener('mousemove',function(e){var r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left)+'px');el.style.setProperty('--my',(e.clientY-r.top)+'px')});
});

/* ---- hero store mockup 3D ---- */
var stack=document.getElementById('stack'),inner=document.getElementById('stackInner');
document.querySelector('.hero').addEventListener('mousemove',function(e){
  var r=stack.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/window.innerWidth,y=(e.clientY-(r.top+r.height/2))/window.innerHeight;
  inner.style.transform='rotateY('+(x*18)+'deg) rotateX('+(-y*14)+'deg)';
});
document.querySelector('.hero').addEventListener('mouseleave',function(){inner.style.transform=''});

/* ---- magnetic buttons ---- */
document.querySelectorAll('.btn').forEach(function(b){
  b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();var x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.transform='translate('+(x*.18)+'px,'+(y*.28)+'px)'});
  b.addEventListener('mouseleave',function(){b.style.transform=''});
});
})();
