import { useState } from 'react';

function AddCategoryForm({ apiUrl, onCreated }) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Ошибка сервера');
      setStatus('success');
      setName('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
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