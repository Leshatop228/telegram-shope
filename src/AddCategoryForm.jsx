import { useState } from 'react';

function AddCategoryForm({ apiUrl, initData, onCreated }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');

    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telegram-Init-Data': initData || '',
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Ошибка ${res.status}: ${errorText}`);
      }

      setStatus('success');
      setName('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Ошибка добавления категории:', err);
      setStatus('error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form" style={{ maxWidth: 320 }}>
      <label>
        Название категории
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <button type="submit" className="submit-btn" disabled={status === 'saving'}>
        {status === 'saving' ? 'Сохраняем...' : 'Добавить категорию'}
      </button>
      {status === 'success' && <p className="msg success">Категория добавлена!</p>}
      {status === 'error' && <p className="msg error">Ошибка. Проверь backend.</p>}
    </form>
  );
}

export default AddCategoryForm;
