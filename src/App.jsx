import { useEffect, useState } from 'react';
import './App.css';
import AddProductForm from './AddProductForm';

const API_URL = 'https://telegram-clothing-store-eiow.onrender.com';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const showImage = product.photoUrl && !imgError;

  return (
    <div className="card">
      <div className="card-image-wrap">
        {showImage ? (
          <img
            src={product.photoUrl}
            alt={product.title}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="card-image-placeholder">Нет фото</span>
        )}
      </div>
      <h4>{product.title}</h4>
      <p className="size">Размер: {product.size}</p>
      <p className="material">{product.material}</p>
      <a href={product.avitoUrl} target="_blank" rel="noreferrer" className="buy-btn">
        Купить
      </a>
    </div>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setSelectedCategoryId(data[0].id);
      })
      .catch((err) => console.error('Ошибка загрузки категорий:', err));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }
    fetch(`${API_URL}/api/categories/${selectedCategoryId}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, [selectedCategoryId]);

  const filteredProducts = selectedSize
    ? products.filter((p) => p.size === selectedSize)
    : products;

  return (
    <div className="tg-page">
      {!showAdmin && (
        <>
          <header className="tg-header">
            <h1>Мой магазин</h1>
            <button className="admin-toggle-btn" onClick={() => setShowAdmin(true)}>
              +
            </button>
          </header>

          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="size-chips">
            {SIZES.map((size) => (
              <button
                key={size}
                className={`chip ${selectedSize === size ? 'active' : ''}`}
                onClick={() => setSelectedSize(selectedSize === size ? null : size)}
              >
                {size}
              </button>
            ))}
            {selectedSize && (
              <button className="chip reset-chip" onClick={() => setSelectedSize(null)}>
                Сбросить
              </button>
            )}
          </div>

          <main className="product-feed">
            {!selectedCategoryId ? (
              <p className="empty-msg">Выберите категорию</p>
            ) : filteredProducts.length === 0 ? (
              <p className="empty-msg">Товаров не найдено</p>
            ) : (
              filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)
            )}
          </main>
        </>
      )}

      {showAdmin && (
        <>
          <header className="tg-header">
            <h1>Админка</h1>
            <button className="admin-toggle-btn" onClick={() => setShowAdmin(false)}>
              ×
            </button>
          </header>
          <AddProductForm apiUrl={API_URL} />
        </>
      )}
    </div>
  );
}

export default App;