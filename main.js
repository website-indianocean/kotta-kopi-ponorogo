/* Kotta Kopi — compact vanilla JavaScript. No tracking, frameworks or backend. */
(() => {
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const currentPage = document.body.dataset.page || 'index';
  // V3 Motion engine: one continuous visual language for entrances + scroll.
  // Never hide content when motion support is missing or preference is reduced.
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionTargets = [
    'main .inner-hero .eyebrow','main .inner-hero h1','main .inner-hero__lead',
    'main .hero-home__visual','main .section-head','main .section-title',
    'main .space-story__heading','main .space-story__collage',
    'main .menu-page__intro','main .menu-tools','main .menu-card',
    'main .gallery-toolbar','main .gallery-card','main .space-intro',
    'main .space-photos figure','main .values-grid article',
    'main .about-lead h2','main .about-photo','main .about-values__list>div',
    'main .visit-grid__poster','main .visit-fact',
    'main .review-tiles>div','main .testimonials__heading',
    'main .testimonial-marquee','main .testimonials__foot',
    'main .contact-tiles>div','main .faq-item','main .note-panel .container',
    'main .legal-body','main .empty-state',
    '.footer-cta h2','.footer-cta__link'
  ];
  const prepareMotion = () => {
    const targets = new Set($$('[data-reveal]'));
    motionTargets.forEach(selector => $$(selector).forEach(el => targets.add(el)));
    targets.forEach(el => {
      if(el.closest('.mobile-nav,dialog')) return;
      el.setAttribute('data-reveal','');
      if(el.matches('.hero-home__visual, .about-photo, .testimonial-marquee')) el.dataset.motion='scale';
      else if(el.matches('.feature-card:nth-child(2n), .gallery-card:nth-child(2n), .space-story__collage')) el.dataset.motion='right';
      else if(el.matches('.feature-card:nth-child(2n+1), .gallery-card:nth-child(2n+1)')) el.dataset.motion='left';
      const parent=el.parentElement;
      const siblings=parent ? [...parent.children].filter(s=>s.matches('.feature-card,.menu-card,.gallery-card,.review-tiles>div,.values-grid article,.contact-tiles>div,.space-photos figure')) : [];
      if(siblings.length>1) el.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(el)%3,2)*85}ms`);
    });
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, {threshold:0.07,rootMargin:'0px 0px -28px 0px'});
    targets.forEach(el => observer.observe(el));
    // Restore all visibly in the rare case pages are revived by mobile browsers.
    addEventListener('pageshow', e=>{
      if(e.persisted) targets.forEach(el=>{
        if(el.getBoundingClientRect().top<innerHeight+40) el.classList.add('is-visible');
      });
    });
  };
  prepareMotion();

  const header = $('#site-header');
  const menuToggle = $('.nav-toggle');
  const mobile = $('#mobile-navigation');
  let menuOpen = false;
  const setNav = (open, restoreFocus=true) => {
    menuOpen = Boolean(open);
    if (!menuToggle || !mobile) return;
    menuToggle.classList.toggle('is-active', menuOpen);
    mobile.classList.toggle('is-open', menuOpen);
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
    menuToggle.setAttribute('aria-label', menuOpen ? 'Close menu' : 'Open menu');
    mobile.setAttribute('aria-hidden', String(!menuOpen));
    if ('inert' in mobile) mobile.inert = !menuOpen;
    document.body.classList.toggle('nav-open', menuOpen);
    if (!menuOpen && restoreFocus) menuToggle.focus({preventScroll:true});
    else $('.mobile-nav nav a', mobile)?.focus({preventScroll:true});
  };
  if (mobile && 'inert' in mobile) mobile.inert = true;
  menuToggle?.addEventListener('click', () => setNav(!menuOpen));
  $$('.mobile-nav a').forEach(a => a.addEventListener('click', () => setNav(false,false)));
  addEventListener('pagehide',()=>setNav(false,false));
  addEventListener('pageshow',()=>{if(menuOpen) setNav(false,false);});
  addEventListener('resize',()=>{if(innerWidth>960 && menuOpen) setNav(false,false);},{passive:true});
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen) setNav(false);
    if (e.key === 'Tab' && menuOpen) {
      const focusable = $$('.mobile-nav a,.nav-toggle').filter(el => el.offsetParent!==null);
      const first = focusable[0]; const last = focusable.at(-1);
      if (e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
      else if (!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
    }
  });
  const backTop = $('.back-top');
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', scrollY > 24);
    backTop?.classList.toggle('is-visible', scrollY > 560);
  };
  addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  backTop?.addEventListener('click', () => scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
  const setDialogOpen = (state) => document.body.classList.toggle('dialog-open',state);
  if (currentPage==='menu') {
    const items = [
      ['coffee','Coffee selection','Coffee','visual-coffee.webp','Pilihan seduhan kopi untuk beragam suasana.'],
      ['milk','Iced coffee','Coffee','visual-coffee.webp','Pilihan kopi dingin untuk menemani obrolan.'],
      ['matcha','Matcha selection','Non-Coffee','visual-matcha.webp','Kategori minuman matcha yang disebut dalam ulasan publik.'],
      ['tea','Tea & more','Non-Coffee','visual-matcha.webp','Alternatif minuman non-kopi.'],
      ['croissant','Croissant','Pastry','visual-bites.webp','Salah satu jenis pastry yang disebut dalam ulasan publik.'],
      ['cheesecake','Cheesecake','Pastry','visual-matcha.webp','Kategori dessert yang disebut dalam ulasan publik.'],
      ['tiramisu','Tiramisu','Pastry','visual-coffee.webp','Kategori dessert yang disebut dalam ulasan publik.'],
      ['fries','Fries & snacks','Bites','visual-bites.webp','Camilan ringan untuk dinikmati bersama.'],
      ['savory','Savory bites','Bites','visual-food.webp','Pilihan kategori makanan gurih.']
    ].map(([id,title,category,image,detail])=>({id,title,category,image,detail}));
    let active='All';
    const chips = $$('[data-menu-filter]');
    const cards = $$('[data-item]');
    const search = $('#menu-search');
    const apply = () => {
      const term = (search?.value || '').trim().toLocaleLowerCase('id');
      let count=0;
      cards.forEach(card => {
        const item=items.find(i=>i.id===card.dataset.item);
        const show=!!item && (active==='All'||item.category===active) && (`${item.title} ${item.category}`.toLocaleLowerCase('id').includes(term));
        card.hidden=!show;
        if(show) count++;
      });
      $('#menu-empty').hidden=count>0;
    };
    chips.forEach(button => button.addEventListener('click',()=>{
      active=button.dataset.menuFilter;
      chips.forEach(chip=>{const yes=chip===button;chip.classList.toggle('is-active',yes);chip.setAttribute('aria-pressed',String(yes));});
      apply();
    }));
    search?.addEventListener('input',apply);
    const dialog = $('#menu-dialog');
    cards.forEach(card=>card.addEventListener('click',()=>{
      const item=items.find(i=>i.id===card.dataset.item);if(!item||!dialog)return;
      $('#dialog-image').src=item.image;$('#dialog-image').alt=`Foto ilustrasi untuk ${item.title}`;
      $('#dialog-title').textContent=item.title;$('#dialog-detail').textContent=item.detail;
      $('#dialog-category').textContent=item.category.toUpperCase();
      dialog.showModal();setDialogOpen(true);
    }));
    $('[data-dialog-close]')?.addEventListener('click',()=>dialog?.close());
    dialog?.addEventListener('close',()=>setDialogOpen(false));
    dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    const queryCat=new URLSearchParams(location.search).get('category');
    const target=chips.find(b=>b.dataset.menuFilter===queryCat);
    if(target) target.click();else apply();
  }
  if(currentPage==='gallery'){
    const gallery=[
      ['visual-interior-day.webp','The coffee bar','Space'],
      ['visual-coffee.webp','Coffee moments','Coffee'],
      ['visual-lounge.webp','Room to unwind','Space'],
      ['visual-matcha.webp','Beyond coffee','Coffee'],
      ['visual-evening.webp','After hours','Space'],
      ['visual-bites.webp','Something to share','Coffee'],
      ['visual-space.webp','Stay a little longer','Moments'],
      ['visual-ambient.webp','Good conversations','Moments']
    ];
    const cards=$$('[data-gallery-index]');
    const chips=$$('[data-gallery-filter]');
    chips.forEach(button=>button.addEventListener('click',()=>{
      const cat=button.dataset.galleryFilter;
      chips.forEach(chip=>{const yes=chip===button;chip.classList.toggle('is-active',yes);chip.setAttribute('aria-pressed',String(yes));});
      cards.forEach(card=>{card.hidden=cat!=='All'&&card.dataset.galleryCat!==cat;});
    }));
    const dialog=$('#gallery-lightbox');
    let selected=0,touchX=0;
    const visibleIndices=()=>cards.filter(card=>!card.hidden).map(c=>Number(c.dataset.galleryIndex));
    const render=()=>{const item=gallery[selected];$('#lightbox-image').src=item[0];$('#lightbox-image').alt='Foto ilustrasi: '+item[1];$('#lightbox-label').textContent=item[1]+' / CONCEPT VISUAL';$('#lightbox-count').textContent=`${visibleIndices().indexOf(selected)+1} / ${visibleIndices().length}`};
    const move=(direction)=>{const ids=visibleIndices();if(!ids.length)return;const index=ids.indexOf(selected);selected=ids[(index+direction+ids.length)%ids.length];render();};
    cards.forEach(card=>card.addEventListener('click',()=>{selected=Number(card.dataset.galleryIndex);render();dialog?.showModal();setDialogOpen(true);}));
    $('[data-lightbox-close]')?.addEventListener('click',()=>dialog?.close());
    $('[data-lightbox-prev]')?.addEventListener('click',()=>move(-1));
    $('[data-lightbox-next]')?.addEventListener('click',()=>move(1));
    dialog?.addEventListener('close',()=>setDialogOpen(false));
    dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
    dialog?.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}});
    dialog?.addEventListener('touchstart',e=>touchX=e.changedTouches[0].screenX,{passive:true});
    dialog?.addEventListener('touchend',e=>{const delta=e.changedTouches[0].screenX-touchX;if(Math.abs(delta)>55)move(delta<0?1:-1)},{passive:true});
  }
})();
