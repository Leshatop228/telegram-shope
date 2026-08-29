import { useEffect, useState } from 'react';
import './App.css';
import AddProductForm from './AddProductForm.jsx';

const API_URL = 'http://189.74.120.149:8080';
const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function getPhotoList(photoUrl) {
  if (!photoUrl) return [];
  return photoUrl.split(',').map((p) => p.trim()).filter(Boolean);
}

function ProductCard({ product, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const photos = getPhotoList(product.photoUrl);
  const firstPhoto = photos[0];
  const showImage = firstPhoto && !imgError;

  return (
    <article className="product-card" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
      <div className="product-image">
        {showImage ? (
          <img
            src={firstPhoto}
            alt={product.title}
            onError={() => setImgError(true)}
          />
        ) : (
          <span>Нет фото</span>
        )}
      </div>

      <div className="product-info">
        <h3>{product.title}</h3>
        {product.price && <div className="product-price">{product.price.toLocaleString('ru-RU')} ₽</div>}
        <p>{product.material}</p>
        <div className="product-footer">
          <span>Размер {product.size}</span>
          <span className="open-link">Подробнее</span>
        </div>
      </div>
    </article>
  );
}

function ProductDetailView({ product, onBack }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = getPhotoList(product.photoUrl);

  return (
    <main className="shop-page">
      <header className="shop-header">
        <button className="brand-button" onClick={onBack}>
          ← Магазин
        </button>
      </header>

      <section className="product-gallery">
        <div className="product-gallery-main">
          {photos.length > 0 ? (
            <img src={photos[activePhoto]} alt={product.title} />
          ) : (
            <span>Нет фото</span>
          )}
        </div>

        {photos.length > 1 && (
          <div className="product-gallery-thumbs">
            {photos.map((photo, index) => (
              <button
                key={index}
                className={index === activePhoto ? 'thumb active' : 'thumb'}
                onClick={() => setActivePhoto(index)}
              >
                <img src={photo} alt="" />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="product-detail">
        <h1>{product.title}</h1>
        {product.price && (
          <div className="product-detail-price">
            {product.price.toLocaleString('ru-RU')} ₽
          </div>
        )}
        <p className="product-detail-size">Размер: {product.size}</p>
        <p className="product-detail-material">{product.material}</p>
        {product.description && (
          <p className="product-detail-description">{product.description}</p>
        )}

        {product.avitoUrl && (
          <a
            href={product.avitoUrl}
            target="_blank"
            rel="noreferrer"
            className="buy-btn"
          >
            Открыть на Avito
          </a>
        )}
      </section>
    </main>
  );
}

function App() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => console.error('Ошибка загрузки категорий:', err));
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) {
      fetch(`${API_URL}/api/categories/products/all`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error('Ошибка загрузки товаров:', err));
      return;
    }

    fetch(`${API_URL}/api/categories/${selectedCategoryId}/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error('Ошибка загрузки товаров:', err));
  }, [selectedCategoryId]);

  const filteredProducts = selectedSize
    ? products.filter((product) => product.size === selectedSize)
    : products;

  // Экран карточки товара
  if (selectedProduct) {
    return <ProductDetailView product={selectedProduct} onBack={() => setSelectedProduct(null)} />;
  }

  // Экран админки
  if (showAdmin) {
    return (
      <main className="shop-page">
        <header className="shop-header">
          <button className="brand-button" onClick={() => setShowAdmin(false)}>
            ← Магазин
          </button>
          <span className="header-label">Админка</span>
        </header>

        <AddProductForm apiUrl={API_URL} />
      </main>
    );
  }

  // Главный экран каталога
  return (
    <main className="shop-page">
      <header className="shop-header">
        <button
          className="brand-button"
          onClick={() => {
            setSelectedCategoryId(null);
            setSelectedSize(null);
          }}
        >
          Heylo store
        </button>

        <button
          className="admin-button"
          aria-label="Открыть админку"
          onClick={() => setShowAdmin(true)}
        >
          +
        </button>
      </header>

      <section className="hero">
        <img src="/hero.jpg" alt="Коллекция одежды" />
      </section>

      <nav className="catalog-menu" aria-label="Категории">
        <button
          className={!selectedCategoryId ? 'active' : ''}
          onClick={() => {
            setSelectedCategoryId(null);
            setSelectedSize(null);
          }}
        >
          Все
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={selectedCategoryId === category.id ? 'active' : ''}
            onClick={() => {
              setSelectedCategoryId(category.id);
              setSelectedSize(null);
            }}
          >
            {category.name}
          </button>
        ))}
      </nav>

      <section className="filters">
        <p className="section-title">Размер</p>

        <div className="size-list">
          {SIZES.map((size) => (
            <button
              key={size}
              className={selectedSize === size ? 'selected' : ''}
              onClick={() =>
                setSelectedSize(selectedSize === size ? null : size)
              }
            >
              {size}
            </button>
          ))}
        </div>
      </section>

      <section className="products">
        {filteredProducts.length === 0 ? (
          <p className="empty-message">Товаров не найдено</p>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))
        )}
      </section>
    </main>
  );
}

export default App;
