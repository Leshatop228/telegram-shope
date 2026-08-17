import { useEffect, useState } from 'react';
import './AddProductForm.css';
import AddCategoryForm from './AddCategoryForm';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function AddProductForm({ apiUrl }) {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('M');
  const [material, setMaterial] = useState('');
  const [avitoUrl, setAvitoUrl] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const loadCategories = () => {
    fetch(`${apiUrl}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      })
      .catch((err) => console.error('Ошибка загрузки категорий:', err));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await fetch(`${apiUrl}/api/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Ошибка загрузки файла');
        const data = await res.json();
        setPhotoUrls((prev) => [...prev, data.url]);
      } catch (err) {
        console.error('Ошибка загрузки фото:', err);
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('saving');

    const combinedPhotoUrl = photoUrls.join(',');

    try {
      const res = await fetch(`${apiUrl}/api/categories/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: Number(categoryId),
          title,
          description,
          size,
          material,
          avitoUrl,
          photoUrl: combinedPhotoUrl,
        }),
      });

      if (!res.ok) throw new Error('Сервер вернул ошибку');

      setStatus('success');
      setTitle('');
      setDescription('');
      setMaterial('');
      setAvitoUrl('');
      setPhotoUrls([]);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <div className="admin-form-wrap">
      <h2>Категории</h2>
      <AddCategoryForm apiUrl={apiUrl} onCreated={loadCategories} />

      <h2>Добавить товар</h2>
      <form onSubmit={handleSubmit} className="admin-form">
        <label>
          Категория
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label>
          Название товара
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>

        <label>
          Описание
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>

        <label>
          Размер
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>
          Материал
          <input value={material} onChange={(e) => setMaterial(e.target.value)} />
        </label>

        <label>
          Ссылка на Avito (необязательно)
          <input value={avitoUrl} onChange={(e) => setAvitoUrl(e.target.value)} />
        </label>

        <label>
          Фото товара
          <input type="file" accept="image/*" multiple onChange={handleFileSelect} disabled={uploading} />
        </label>

        {uploading && <p className="msg">Загрузка фото...</p>}

        {photoUrls.length > 0 && (
          <div className="photo-preview-row">
            {photoUrls.map((url, index) => (
              <div key={index} className="photo-preview-item">
                <img src={`${apiUrl}${url}`} alt="" />
                <button type="button" onClick={() => removePhoto(index)} className="remove-photo-btn">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={status === 'saving' || uploading}>
          {status === 'saving' ? 'Сохраняем...' : 'Сохранить товар'}
        </button>

        {status === 'success' && <p className="msg success">Товар добавлен!</p>}
        {status === 'error' && <p className="msg error">Ошибка при сохранении. Проверь backend.</p>}
      </form>
    </div>
  );
}

export default AddProductForm;