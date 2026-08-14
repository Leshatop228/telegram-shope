import { useEffect, useState } from 'react';
import './App.css';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error('Ошибка загрузки категорий:', err));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      setProducts([]);
      return;
    }
    fetch(`http://localhost:8080/api/categories/${selectedCategoryId}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, [selectedCategoryId]);

  const filteredProducts = selectedSize
    ? products.filter((p) => p.size === selectedSize)
    : products;

  return (
    <div className="page">
      <header className="header">
        <h1>Мой магазин</h1>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="filter-block">
            <h3>Категория</h3>
            {categories.map((cat) => (
              <label key={cat.id} className="filter-item">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategoryId === cat.id}
                  onChange={() => setSelectedCategoryId(cat.id)}
                />
                {cat.name}
              </label>
            ))}
          </div>

          <div className="filter-block">
            <h3>Размер</h3>
            {SIZES.map((size) => (
              <label key={size} className="filter-item">
                <input
                  type="radio"
                  name="size"
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size)}
                />
                {size}
              </label>
            ))}
            {selectedSize && (
              <button className="reset-btn" onClick={() => setSelectedSize(null)}>
                Сбросить размер
              </button>
            )}
          </div>
        </aside>

        <main className="products">
          {!selectedCategoryId ? (
            <p>Выберите категорию слева</p>
          ) : filteredProducts.length === 0 ? (
            <p>Товаров не найдено</p>
          ) : (
            <div className="grid">
              {filteredProducts.map((p) => (
                <div key={p.id} className="card">
                  {p.photoUrl && <img src={p.photoUrl} alt={p.title} />}
                  <h4>{p.title}</h4>
                  <p className="size">Размер: {p.size}</p>
                  <p className="material">{p.material}</p>
                  <a href={p.avitoUrl} target="_blank" rel="noreferrer" className="buy-btn">
                    Купить
                  </a>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;