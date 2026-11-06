const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const GET_URL = API_URL + '?_limit=5';

const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const postsEl = document.getElementById('posts');
const messageEl = document.getElementById('message');
const httpStatusEl = document.getElementById('http-status');
const loadStatusEl = document.getElementById('load-http-status');
const form = document.getElementById('post-form');
const titleInput = document.getElementById('title');
const bodyInput = document.getElementById('body');

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + (type || '');
}

function showHttpStatus(text, type, el = httpStatusEl) {
  el.textContent = text;
  el.className = 'http-status ' + (type || '');
}

function renderPost(post, isNew) {
  const article = document.createElement('article');
  article.className = isNew ? 'post new' : 'post';

  const h3 = document.createElement('h3');
  h3.textContent = isNew ? `${post.title} (ID: ${post.id})` : post.title;

  const p = document.createElement('p');
  p.textContent = post.body;

  article.append(h3, p);
  return article;
}

async function loadPosts() {
  loadBtn.disabled = true;
  showMessage('Загрузка публикаций...', 'loading');
  showHttpStatus('HTTP: ожидание ответа...', '', loadStatusEl);
  try {
    const response = await fetch(GET_URL);
    showHttpStatus(
      `HTTP ${response.status} ${response.statusText}`.trim(),
      response.ok ? 'ok' : 'fail',
      loadStatusEl
    );
    if (!response.ok) {
      throw new Error(`Ошибка HTTP ${response.status}`);
    }
    const posts = await response.json();

    postsEl.textContent = '';
    posts.forEach((post) => postsEl.append(renderPost(post, false)));
    showMessage(`Загружено публикаций: ${posts.length}`, 'success');
  } catch (error) {
    if (error instanceof TypeError) {
      showHttpStatus('HTTP: нет ответа (сетевая ошибка)', 'fail', loadStatusEl);
    }
    showMessage(`Не удалось загрузить публикации: ${error.message}. Попробуйте ещё раз.`, 'error');
  } finally {
    loadBtn.disabled = false;
  }
}

async function createPost(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  if (!title || !body) {
    showMessage('Заполните заголовок и текст (пробелы не считаются).', 'error');
    showHttpStatus('HTTP: запрос не отправлен (ошибка валидации)', 'fail');
    return;
  }

  submitBtn.disabled = true;
  showMessage('Отправка публикации...', 'loading');
  showHttpStatus('HTTP: ожидание ответа...', '');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, userId: 1 }),
    });
    showHttpStatus(
      `HTTP ${response.status} ${response.statusText}`.trim(),
      response.ok ? 'ok' : 'fail'
    );
    if (!response.ok) {
      throw new Error(`Ошибка HTTP ${response.status}`);
    }
    const created = await response.json();

    postsEl.prepend(renderPost({ title: created.title, body: created.body, id: created.id }, true));
    showMessage(`Публикация «${created.title}» создана (ID: ${created.id}).`, 'success');
    form.reset();
  } catch (error) {
    if (error instanceof TypeError) {
      showHttpStatus('HTTP: нет ответа (сетевая ошибка)', 'fail');
    }
    showMessage(`Не удалось создать публикацию: ${error.message}. Попробуйте ещё раз.`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

loadBtn.addEventListener('click', loadPosts);
form.addEventListener('submit', createPost);
