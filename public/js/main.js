(function () {
  const header = document.querySelector('.site-header');
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  const navLinks = nav ? nav.querySelectorAll('a') : [];

  if (burger && header) {
    const setExpanded = (isOpen) => burger.setAttribute('aria-expanded', String(isOpen));
    const openNav = () => { header.classList.add('nav-open'); setExpanded(true); };
    const closeNav = () => { header.classList.remove('nav-open'); setExpanded(false); };
    burger.addEventListener('click', () => header.classList.contains('nav-open') ? closeNav() : openNav());
    navLinks.forEach((a) => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
    document.addEventListener('click', (e) => { if (!header.contains(e.target)) closeNav(); });
  }

  const tableBody = document.querySelector('.catalog-table tbody');
  const select = document.querySelector('select[name="puppy"]');
  const requestForm = document.querySelector('.request-form');

  async function loadPuppies() {
    const res = await fetch('/api/puppies');
    if (!res.ok) throw new Error('Failed to load puppies');
    const payload = await res.json();
    return Array.isArray(payload) ? payload : (payload.data || []);
  }

  function safe(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function publicImageUrl(url) {
    const value = String(url || '').trim();
    if (!value) return '/assets/images/puppy-hero.png';
    if (/^https?:\/\//i.test(value)) return value;
    return value.startsWith('/') ? value : '/' + value;
  }

  function renderPuppies(puppies) {
    if (tableBody) {
      tableBody.innerHTML = '';
      if (!puppies.length) {
        tableBody.innerHTML = '<tr><td colspan="5">Каталог порожній.</td></tr>';
      } else {
        const rows = puppies.map((p) => `
          <tr>
            <td><img src="${safe(publicImageUrl(p.photo_url))}" alt="${safe(p.name)}"></td>
            <td>${safe(p.name)}</td>
            <td>${safe(p.description)}</td>
            <td>${p.age_months ?? ''}</td>
            <td>${Number(p.price_uah || 0).toFixed(2)}</td>
          </tr>`).join('');
        tableBody.insertAdjacentHTML('beforeend', rows);
      }
    }

    if (select) {
      select.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
      puppies.forEach((p) => {
        const opt = document.createElement('option');
        opt.value = String(p.id);
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    }
  }

  function setFormMessage(text, isError) {
    if (!requestForm) return;
    let msg = requestForm.querySelector('[data-role="form-msg"]');
    if (!msg) {
      msg = document.createElement('p');
      msg.dataset.role = 'form-msg';
      msg.style.marginTop = '0.8rem';
      msg.setAttribute('role', 'status');
      requestForm.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.color = isError ? '#b91c1c' : '#065f46';
  }

  async function submitVisitRequest(payload) {
    const res = await fetch('/api/visit_requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to submit');
    return data;
  }

  async function init() {
    try {
      const puppies = await loadPuppies();
      renderPuppies(puppies);
    } catch (e) {
      if (tableBody) tableBody.innerHTML = '<tr><td colspan="5">Каталог не завантажено. Перевірте БД та /api/puppies.</td></tr>';
      if (select) select.querySelectorAll('option:not(:first-child)').forEach((o) => o.remove());
      setFormMessage('Каталог не завантажено. Перевірте підключення до БД та /api/puppies.', true);
    }

    if (requestForm) {
      requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setFormMessage('', false);
        const fd = new FormData(requestForm);
        const name = String(fd.get('name') || '').trim();
        const phone = String(fd.get('phone') || '').trim();
        const puppyId = Number(fd.get('puppy') || 0);
        const datetime = String(fd.get('datetime') || '').trim();
        const note = String(fd.get('note') || '').trim();

        try {
          await submitVisitRequest({ puppy_id: puppyId, visitor_name: name, phone, visit_datetime: datetime, note });
          requestForm.reset();
          setFormMessage('Заявку надіслано. Дякуємо' + (name ? `, ${name}` : '') + '!', false);
        } catch (err) {
          setFormMessage(String(err.message || err), true);
        }
      });
    }
  }

  init();
})();
