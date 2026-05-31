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
    initModals();
    initChatbot();
    initContactForm();
    initMouseGlow();
    initFAQ();
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
        var mm=document.getElementById('mobileMenu');
        if(mm&&mm.classList.contains('open')){mm.classList.remove('open');mm.setAttribute('aria-hidden','true');document.querySelector('.header__menu-btn').setAttribute('aria-expanded','false')}
      });
    });
  }

  /* Mobile Menu */
  function initMobileMenu(){
    var btn=document.querySelector('.header__menu-btn');
    var menu=document.getElementById('mobileMenu');
    if(!btn||!menu)return;
    btn.addEventListener('click',function(){
      var open=menu.classList.contains('open');
      menu.classList.toggle('open');
      menu.setAttribute('aria-hidden',open?'true':'false');
      btn.setAttribute('aria-expanded',open?'false':'true');
    });
  }

  /* Modals */
  function initModals(){
    var cards=document.querySelectorAll('.card[data-modal]');
    var overlays=document.querySelectorAll('.modal-overlay');
    var closeBtns=document.querySelectorAll('.modal__x');
    var goLinks=document.querySelectorAll('.modal__go');

    cards.forEach(function(card){
      card.addEventListener('click',function(){
        var id=card.dataset.modal;
        var modal=document.getElementById(id);
        if(modal)openModal(modal);
      });
      card.addEventListener('keydown',function(e){
        if(e.key==='Enter'||e.key===' '){e.preventDefault();var id=card.dataset.modal;var modal=document.getElementById(id);if(modal)openModal(modal)}
      });
    });

    closeBtns.forEach(function(b){b.addEventListener('click',function(){var o=b.closest('.modal-overlay');if(o)closeModal(o)})});
    goLinks.forEach(function(l){l.addEventListener('click',function(e){var o=e.target.closest('.modal-overlay');if(o)closeModal(o)})});
    overlays.forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)closeModal(o)})});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'){var o=document.querySelector('.modal-overlay.open');if(o)closeModal(o)}});
  }

  function openModal(m){m.classList.add('open');document.body.style.overflow='hidden';var c=m.querySelector('.modal__x');if(c)setTimeout(function(){c.focus()},100)}
  function closeModal(m){m.classList.remove('open');document.body.style.overflow=''}

  /* Chatbot */
  function initChatbot(){
    var toggle=document.getElementById('chatToggle');
    var win=document.getElementById('chatWin');
    var close=document.getElementById('chatClose');
    var form=document.getElementById('chatForm');
    var inp=document.getElementById('chatIn');
    var msgs=document.getElementById('chatMsgs');
    if(!toggle||!win)return;

    toggle.addEventListener('click',function(){
      var open=!win.hidden;
      win.hidden=open;
      toggle.setAttribute('aria-expanded',!open);
      if(!open&&inp)setTimeout(function(){inp.focus()},300);
    });
    if(close){close.addEventListener('click',function(){win.hidden=true;toggle.setAttribute('aria-expanded','false')})}

    document.querySelectorAll('.qa').forEach(function(b){b.addEventListener('click',function(){var m=b.dataset.m;if(m)sendMsg(m)})});
    if(form){form.addEventListener('submit',function(e){e.preventDefault();var t=inp?inp.value.trim():'';if(t){sendMsg(t);if(inp)inp.value=''}})}

    function sendMsg(text){
      if(!msgs)return;
      var um=document.createElement('div');um.className='cmsg cmsg--user';
      um.innerHTML='<div class="cmsg__b">'+escHtml(text)+'</div>';
      msgs.appendChild(um);msgs.scrollTop=msgs.scrollHeight;
      var ty=document.createElement('div');ty.className='cmsg cmsg--bot typing';
      ty.innerHTML='<div class="cmsg__b"><span class="dots"><span></span><span></span><span></span></span></div>';
      msgs.appendChild(ty);msgs.scrollTop=msgs.scrollHeight;

      setTimeout(function(){
        ty.remove();
        var bm=document.createElement('div');bm.className='cmsg cmsg--bot';
        bm.innerHTML='<div class="cmsg__b">'+escHtml(getReply(text))+'</div>';
        msgs.appendChild(bm);msgs.scrollTop=msgs.scrollHeight;
      },1200);
    }

    function getReply(m){
      var lo=m.toLowerCase();
      if(lo.includes('offer')||lo.includes('service')||lo.includes('automate'))
        return "Ali offers 4 main automations:\n\n1️⃣ Lead Capture & Follow-up\n2️⃣ AI Chatbots\n3️⃣ Inbox Manager\n4️⃣ LinkedIn Content Creation\n\nWant details on any of these?";
      if(lo.includes('price')||lo.includes('cost')||lo.includes('pricing'))
        return "Pricing depends on complexity. Simple automations start at a base rate, complex AI systems are quoted individually. Best to book a call with Ali for an exact quote!";
      if(lo.includes('lead')||lo.includes('capture')||lo.includes('follow'))
        return "Lead Capture automation:\n✅ Captures leads from forms, DMs, landing pages\n✅ Auto-sends personalized follow-up emails\n✅ Tracks everything in Google Sheets\n✅ AI daily summary report\n\nIt's Ali's flagship automation. Want to discuss?";
      if(lo.includes('book')||lo.includes('call')||lo.includes('meeting'))
        return "Reach Ali through the contact form or email him directly. He typically responds within 24 hours and can schedule a call!";
      if(lo.includes('tool')||lo.includes('use')||lo.includes('tech')||lo.includes('stack'))
        return "Ali primarily uses:\n🔧 n8n — core automation engine\n🤖 OpenAI & Claude — AI processing\n📌 Pinecone & Supabase — Vector databases\n📧 Gmail API — Email automation\n📊 Google Sheets — Data tracking\n🔗 LinkedIn API — Content posting\nAnd more tools depending on your needs!";
      if(lo.includes('long')||lo.includes('setup')||lo.includes('time')||lo.includes('take'))
        return "Most automations are built in 3-7 days. Simple ones like lead capture (3-5 days), complex AI chatbots (5-7 days). Timeline agreed before starting.";
      if(lo.includes('hello')||lo.includes('hi')||lo.includes('hey'))
        return "Hey there! 👋 Welcome to Ali Automates. How can I help you today? Ask about automations, pricing, or how to get started!";
      if(lo.includes('thank'))
        return "You're welcome! 😊 Reach out to Ali directly through the contact form if you need anything else.";
      return "Great question! Ali can help with that. Fill out the contact form or reach out directly — he responds within 24 hours!";
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

      /* REPLACE below with your actual n8n webhook URL */
      /* For security: use n8n Basic Auth or a Netlify Function proxy */
      var WH='YOUR_N8N_CONTACT_FORM_WEBHOOK_URL';
      var promise;
      if(WH==='YOUR_N8N_CONTACT_FORM_WEBHOOK_URL'||!WH){promise=new Promise(function(r){setTimeout(r,1500)})}
      else{promise=fetch(WH,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})}

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
