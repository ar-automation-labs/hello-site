  /* ============================================
   ALI AUTOMATES — Interactive JS
   ============================================ */
(function(){
  'use strict';
  document.addEventListener('DOMContentLoaded',function(){
    initScrollReveal();
    initScrollSections();
    initNavScroll();
    initSmoothScroll();
    initMobileMenu();
    initChatbot();
    initContactForm();
    initMouseGlow();
    initFAQ();
    initReveal();
    initScrollProgress();
  });

  /* Scroll Reveal */
  function initScrollReveal(){
    var els=document.querySelectorAll('.reveal-right');
    if(!els.length)return;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var d=parseFloat(e.target.dataset.delay||0);
          setTimeout(function(){e.target.classList.add('revealed')},d*1000);
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.08,rootMargin:'0px 0px -40px 0px'});
    els.forEach(function(el){obs.observe(el)});
  }

  /* Scroll Section Animations */
  function initScrollSections(){
    var sections=document.querySelectorAll('[data-animate]');
    if(!sections.length)return;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    },{threshold:0.08,rootMargin:'0px 0px -30px 0px'});
    sections.forEach(function(s){obs.observe(s)});
  }

  /* Nav scroll */
  function initNavScroll(){
    var nav=document.querySelector('.header');
    if(!nav)return;
    var ticking=false;
    window.addEventListener('scroll',function(){
      if(!ticking){
        window.requestAnimationFrame(function(){
          nav.classList.toggle('scrolled',window.scrollY>50);
          ticking=false;
        });
        ticking=true;
      }
    });
  }

  /* Smooth scroll */
  function initSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(function(link){
      link.addEventListener('click',function(e){
        var href=link.getAttribute('href');
        if(href==='#')return;
        var target=document.querySelector(href);
        if(!target)return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
        var cw=document.getElementById('chatWin');
        if(cw&&!cw.hidden){cw.hidden=true;document.getElementById('chatToggle').setAttribute('aria-expanded','false')}
        if(typeof window.__closeMobileMenu==='function')window.__closeMobileMenu();
      });
    });
  }

  /* Mobile Menu */
  function initMobileMenu(){
    var btn=document.querySelector('.header__menu-btn');
    var menu=document.getElementById('mobileMenu');
    var closeBtn=document.getElementById('mobileMenuClose');
    if(!btn||!menu)return;

    function openMenu(){
      menu.classList.add('open');
      document.body.classList.add('menu-open');
      menu.setAttribute('aria-hidden','false');
      btn.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';
    }
    function closeMenu(){
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      menu.setAttribute('aria-hidden','true');
      btn.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    }
    window.__closeMobileMenu=closeMenu;

    btn.addEventListener('click',function(){
      menu.classList.contains('open')?closeMenu():openMenu();
    });
    if(closeBtn)closeBtn.addEventListener('click',closeMenu);
    menu.addEventListener('click',function(e){if(e.target===menu)closeMenu()});
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&menu.classList.contains('open'))closeMenu();
    });
  }

  /* Chatbot — ARIA */
  function initChatbot(){
    var toggle=document.getElementById('chatToggle');
    var win=document.getElementById('chatWin');
    var backdrop=document.getElementById('chatBackdrop');
    var close=document.getElementById('chatClose');
    var form=document.getElementById('chatForm');
    var inp=document.getElementById('chatIn');
    var nameForm=document.getElementById('chatNameForm');
    var nameIn=document.getElementById('chatNameIn');
    var askName=document.getElementById('chatAskName');
    var qa=document.getElementById('chatQA');
    var msgs=document.getElementById('chatMsgs');
    if(!toggle||!win)return;

    var EMAIL='aiautomationexpert786@gmail.com';
    var userName=safeGet('aria_name')||'';
    var sessionId=safeGet('aria_sid');
    if(!sessionId){sessionId=makeId();safeSet('aria_sid',sessionId)}
    var busy=false;

    if(userName)unlockChat(false);

    function safeGet(k){try{return window.sessionStorage.getItem(k)}catch(e){return null}}
    function safeSet(k,v){try{window.sessionStorage.setItem(k,v)}catch(e){}}
    function makeId(){
      if(window.crypto&&window.crypto.randomUUID)return window.crypto.randomUUID();
      return 'sid-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
    }

    function openChat(){
      win.hidden=false;
      if(backdrop)backdrop.hidden=false;
      toggle.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';
      setTimeout(function(){
        var f=(!userName&&nameIn)?nameIn:inp;
        if(f)f.focus();
      },320);
    }
    function closeChat(){
      win.hidden=true;
      if(backdrop)backdrop.hidden=true;
      toggle.setAttribute('aria-expanded','false');
      document.body.style.overflow='';
    }

    toggle.addEventListener('click',function(){win.hidden?openChat():closeChat()});
    if(close)close.addEventListener('click',closeChat);
    if(backdrop)backdrop.addEventListener('click',closeChat);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!win.hidden)closeChat()});

    function unlockChat(greet){
      if(nameForm)nameForm.hidden=true;
      if(form)form.hidden=false;
      if(qa)qa.hidden=false;
      if(askName)askName.remove();
      if(greet){
        addBot("Great to meet you, "+userName+" 👋\nAsk me anything, or pick one of the quick topics below.");
        if(inp)setTimeout(function(){inp.focus()},120);
      }
    }

    if(nameForm){
      nameForm.addEventListener('submit',function(e){
        e.preventDefault();
        var v=nameIn?nameIn.value.trim():'';
        if(!v){if(nameIn)nameIn.focus();return}
        userName=v.replace(/\s+/g,' ').slice(0,40);
        safeSet('aria_name',userName);
        addUser(userName);
        unlockChat(true);
      });
    }

    document.querySelectorAll('.qa').forEach(function(b){
      b.addEventListener('click',function(){var m=b.dataset.m;if(m)sendMsg(m)});
    });
    if(form){
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var t=inp?inp.value.trim():'';
        if(t){sendMsg(t);if(inp)inp.value=''}
      });
    }

    function stamp(){
      var d=new Date();
      var h=d.getHours(),m=d.getMinutes();
      var ap=h>=12?'PM':'AM';h=h%12||12;
      return h+':'+(m<10?'0':'')+m+' '+ap;
    }
    function scroll(){if(msgs)msgs.scrollTop=msgs.scrollHeight}
    function addUser(text){
      if(!msgs)return;
      var el=document.createElement('div');el.className='cmsg cmsg--user';
      el.innerHTML='<div class="cmsg__b">'+escHtml(text)+'<span class="cmsg__t">'+stamp()+'</span></div>';
      msgs.appendChild(el);scroll();
    }
    function addBot(text,extraHtml){
      if(!msgs)return;
      var el=document.createElement('div');el.className='cmsg cmsg--bot';
      el.innerHTML='<div class="cmsg__b">'+escHtml(text)+(extraHtml||'')+'<span class="cmsg__t">'+stamp()+'</span></div>';
      msgs.appendChild(el);scroll();
    }
    function mailBtn(){
      return '<br><a class="cmsg__mail" href="mailto:'+EMAIL+'">✉ Email Ali directly</a>';
    }

    function sendMsg(text){
      if(!msgs||busy)return;
      if(!userName){if(nameIn)nameIn.focus();return}
      busy=true;
      if(form)form.classList.add('sending');
      addUser(text);

      var ty=document.createElement('div');ty.className='cmsg cmsg--bot typing';
      ty.innerHTML='<div class="cmsg__b"><span class="dots"><span></span><span></span><span></span></span></div>';
      msgs.appendChild(ty);scroll();

      var ctrl=('AbortController' in window)?new AbortController():null;
      var timer=setTimeout(function(){if(ctrl)ctrl.abort()},20000);

      fetch('/api/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        signal:ctrl?ctrl.signal:undefined,
        body:JSON.stringify({
          name:userName,
          message:text,
          sessionId:sessionId,
          timestamp:new Date().toISOString(),
          source:'Website — ARIA Assistant'
        })
      })
      .then(function(r){if(!r.ok)throw new Error('bad status');return r.json()})
      .then(function(data){
        clearTimeout(timer);ty.remove();
        var reply=(data&&(data.reply||data.output||data.text))||'';
        if(reply)addBot(String(reply));
        else addBot("I didn't quite catch that, "+userName+". Could you rephrase it?");
      })
      .catch(function(){
        clearTimeout(timer);ty.remove();
        addBot("Sorry "+userName+", my connection to the assistant is briefly unavailable. Ali replies personally within 24 hours — you can reach him directly below, or use the contact form on this page.",mailBtn());
      })
      .then(function(){
        busy=false;
        if(form)form.classList.remove('sending');
        if(inp)inp.focus();
      });
    }
  }

  function escHtml(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}

  /* Contact Form */
  function initContactForm(){
    var form=document.getElementById('contactForm');
    var status=document.getElementById('formMsg');
    var btn=document.getElementById('submitBtn');
    if(!form||!status||!btn)return;

    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=form.querySelector('#cf-name')?form.querySelector('#cf-name').value.trim():'';
      var email=form.querySelector('#cf-email')?form.querySelector('#cf-email').value.trim():'';
      var who=form.querySelector('#cf-who')?form.querySelector('#cf-who').value:'';
      var service=form.querySelector('#cf-service')?form.querySelector('#cf-service').value:'';

      if(!name||!email||!who||!service){
        status.textContent='Please fill in all required fields.';
        status.className='form-msg form-msg--err';return;
      }
      var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!emailRe.test(email)){status.textContent='Please enter a valid email address.';status.className='form-msg form-msg--err';return}

      btn.classList.add('loading');btn.disabled=true;status.textContent='';

      var data={name:name,email:email,who:who,service:service,message:form.querySelector('#cf-msg')?form.querySelector('#cf-msg').value.trim():'',timestamp:new Date().toISOString(),source:'Website Contact Form'};

      /* Proxy via Netlify Function — real webhook URL never exposed to browser */
      var promise=fetch('/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data)
      }).then(function(r){if(!r.ok)throw new Error('Server error');return r.json()})

      promise.then(function(){
        btn.classList.remove('loading');btn.classList.add('ok');
        status.textContent='Message sent! Ali will get back to you within 24 hours.';
        status.className='form-msg form-msg--ok';form.reset();
        setTimeout(function(){btn.classList.remove('ok');btn.disabled=false},3000);
      }).catch(function(){
        btn.classList.remove('loading');btn.disabled=false;
        status.textContent='Something went wrong. Please try again or email directly.';
        status.className='form-msg form-msg--err';
      });
    });
  }

  /* Mouse Glow */
  function initMouseGlow(){
    if('ontouchstart' in window)return;
    var glow=document.getElementById('mouseGlow');
    if(!glow)return;
    var mx=0,my=0,gx=0,gy=0,active=false;
    document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;if(!active){active=true;glow.classList.add('active')}});
    document.addEventListener('mouseleave',function(){active=false;glow.classList.remove('active')});
    (function anim(){gx+=(mx-gx)*.08;gy+=(my-gy)*.08;glow.style.left=gx+'px';glow.style.top=gy+'px';requestAnimationFrame(anim)})();
  }

  /* Generic scroll reveal + subtle parallax */
  function initReveal(){
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var groups=[
      ['.problem-card','up'],['.solution__side','up'],['.card','zoom'],
      ['.faq-item','up'],['.contact-row','left'],['.contact__form','right'],
      ['.about__photo-wrap','left'],['.about__text','right'],
      ['.demo__player-wrap','up'],['.automations__head','up'],['.faq__head','up'],
      ['.problem__head','up'],['.solution__head','up'],['.demo__head','up'],['.contact__info','up']
    ];
    var targets=[];
    groups.forEach(function(g){
      document.querySelectorAll(g[0]).forEach(function(el){
        if(el.hasAttribute('data-reveal')||el.classList.contains('reveal-right'))return;
        el.setAttribute('data-reveal',g[1]==='up'?'':g[1]);
        targets.push(el);
      });
    });
    if(reduce){targets.forEach(function(el){el.classList.add('in-view')});return}
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(!e.isIntersecting)return;
        var sibs=Array.prototype.slice.call(e.target.parentNode.children).filter(function(n){return n.hasAttribute&&n.hasAttribute('data-reveal')});
        var i=Math.max(0,sibs.indexOf(e.target));
        e.target.style.transitionDelay=Math.min(i*80,320)+'ms';
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      });
    },{threshold:0.12,rootMargin:'0px 0px -60px 0px'});
    targets.forEach(function(el){obs.observe(el)});
  }

  /* Scroll progress bar */
  function initScrollProgress(){
    var bar=document.getElementById('scrollProgress');
    if(!bar)return;
    var ticking=false;
    function update(){
      var h=document.documentElement.scrollHeight-window.innerHeight;
      var pct=h>0?(window.scrollY/h)*100:0;
      bar.style.width=Math.min(100,Math.max(0,pct))+'%';
      ticking=false;
    }
    window.addEventListener('scroll',function(){
      if(!ticking){window.requestAnimationFrame(update);ticking=true}
    },{passive:true});
    update();
  }

  /* FAQ */
  function initFAQ(){
    document.querySelectorAll('.faq-q').forEach(function(btn){
      btn.addEventListener('click',function(){
        var item=btn.closest('.faq-item');
        var wasOpen=item.classList.contains('open');
        /* Close all */
        document.querySelectorAll('.faq-item.open').forEach(function(o){o.classList.remove('open');o.querySelector('.faq-q').setAttribute('aria-expanded','false')});
        /* Toggle current */
        if(!wasOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
      });
    });

    var showMore=document.getElementById('faqShowMore');
    var hidden=document.getElementById('faqHidden');
    if(showMore&&hidden){
      showMore.addEventListener('click',function(){
        var shown=hidden.classList.contains('show');
        hidden.classList.toggle('show');
        showMore.textContent=shown?'Show More Questions':'Show Less';
        showMore.setAttribute('aria-expanded',!shown);
      });
    }
  }

})();
