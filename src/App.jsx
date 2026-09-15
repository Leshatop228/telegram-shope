import { useEffect, useState } from 'react';
import './App.css';
import AddProductForm from './addProductForm.jsx';

const API_URL = '';

// Ваши с партнёром Telegram ID:
const ADMIN_IDS = [817016114, 432903498];

// Юзернейм для кнопки "Написать продавцу" (без @):
const SELLER_USERNAME = 'your_telegram_username';

// Секретный ключ для входа через ссылку:
const ADMIN_SECRET_KEY = 'gogaclo2026';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function getPhotoList(photoUrl) {
  if (!photoUrl) return [];
  return photoUrl.split(',').map((p) => p.trim()).filter(Boolean);
}

function ProductCard({ product, onSelect, isLiked, onToggleLike }) {
  const [imgError, setImgError] = useState(false);
  const photos = getPhotoList(product.photoUrl);
  const firstPhoto = photos[0];
  const showImage = firstPhoto && !imgError;

  return (
    <article className="product-card" onClick={() => onSelect(product)}>
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
        <button
          type="button"
          className={`card-heart-btn ${isLiked ? 'liked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike(product.id);
          }}
        >
          {isLiked ? '♥' : '♡'}
        </button>
      </div>

      <div className="product-info">
        <h3>{product.title}</h3>
        {product.price && (
          <div className="product-price">
            {product.price.toLocaleString('ru-RU')} ₽
          </div>
        )}
        <p>{product.material}</p>
        <div className="product-footer">
          <span>Размер {product.size}</span>
          <span className="open-link">Подробнее</span>
        </div>
      </div>
    </article>
  );
}

function ProductDetailView({ product, onBack, onAddToCart, isLiked, onToggleLike }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = getPhotoList(product.photoUrl);

  const nextPhoto = () => {
    if (photos.length > 1) {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (photos.length > 1) {
      setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);
    }
  };

  const handleContactSeller = () => {
    const tg = window.Telegram?.WebApp;
    const directUrl = `https://t.me/${SELLER_USERNAME}`;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(directUrl);
    } else {
      window.open(directUrl, '_blank');
    }
  };

  return (
    <main className="shop-page product-detail-screen">
      <header className="detail-top-nav">
        <button className="back-arrow-btn" onClick={onBack}>
          ← НАЗАД
        </button>
        <button
          type="button"
          className={`detail-heart-btn ${isLiked ? 'liked' : ''}`}
          onClick={() => onToggleLike(product.id)}
        >
          {isLiked ? '♥' : '♡'}
        </button>
      </header>

      <section className="detail-gallery">
        {photos.length > 0 ? (
          <div className="detail-gallery-main">
            <img src={photos[activePhoto]} alt={product.title} />

            {photos.length > 1 && (
              <>
                <button type="button" className="gallery-arrow prev" onClick={prevPhoto}>
                  ‹
                </button>
                <button type="button" className="gallery-arrow next" onClick={nextPhoto}>
                  ›
                </button>
                <div className="gallery-dots">
                  {photos.map((_, idx) => (
                    <span
                      key={idx}
                      className={`dot ${idx === activePhoto ? 'active' : ''}`}
                      onClick={() => setActivePhoto(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="no-photo-box">Нет фото</div>
        )}
      </section>

      <section className="detail-info-block">
        <h1 className="detail-title">{product.title}</h1>

        <div className="detail-price">
          {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена по запросу'}
        </div>

        <div className="spec-table">
          {product.material && (
            <div className="spec-row">
              <span className="spec-label">СОСТАВ / МАТЕРИАЛ</span>
              <span className="spec-value">{product.material.toUpperCase()}</span>
            </div>
          )}
          {product.size && (
            <div className="spec-row">
              <span className="spec-label">РАЗМЕР</span>
              <span className="spec-value">{product.size}</span>
            </div>
          )}
        </div>

        {product.description && (
          <div className="detail-description">
            {product.description.split('\n').map((line, i) => (
              <p key={i}>• {line.replace(/^[•\-]\s*/, '')}</p>
            ))}
          </div>
        )}

        <div className="detail-buttons">
          <button className="buy-btn" onClick={() => onAddToCart(product)}>
            Добавить в корзину
          </button>
          <button className="contact-seller-btn" onClick={handleContactSeller}>
            Написать продавцу
          </button>
        </div>
      </section>
    </main>
  );
}

function CartView({ cart, onBack, onUpdateCount, onRemove, onCheckout }) {
  const totalPrice = cart.reduce((sum, item) => sum + (item.price || 0) * item.count, 0);

  return (
    <main className="shop-page">
      <header className="shop-header">
        <button className="brand-button" onClick={onBack}>
          ← Каталог
        </button>
        <span className="header-label">Корзина</span>
      </header>

      <section className="cart-content" style={{ padding: '16px' }}>
        {cart.length === 0 ? (
          <p className="empty-message">Корзина пуста</p>
        ) : (
          <div>
            <div className="cart-items" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '10px',
                    background: '#1a1a1a',
                    border: '1px solid #2e2e2e',
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 4px 0' }}>{item.title}</h4>
                    <p style={{ margin: '0', fontSize: '14px', color: '#888' }}>
                      Размер: {item.size} • {item.price?.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      style={{ padding: '4px 10px', borderRadius: '6px' }}
                      onClick={() => onUpdateCount(item.id, item.count - 1)}
                    >
                      -
                    </button>
                    <span>{item.count}</span>
                    <button
                      style={{ padding: '4px 10px', borderRadius: '6px' }}
                      onClick={() => onUpdateCount(item.id, item.count + 1)}
                    >
                      +
                    </button>
                    <button
                      style={{ marginLeft: '8px', color: '#ff4d4f', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onClick={() => onRemove(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', borderTop: '1px solid #333', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                <span>Итого:</span>
                <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
              </div>

              <button
                className="buy-btn"
                style={{ marginTop: '16px', width: '100%' }}
                onClick={onCheckout}
              >
                Оформить заказ
              </button>
            </div>
          </div>
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
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog'); // 'home' | 'catalog' | 'likes'
  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gogaclo_likes') || '[]');
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('gogaclo_admin') === 'true';
  });

  // Авторизация админа: по Telegram ID или по секретной ссылке (?key=...)
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const currentUserId = tg.initDataUnsafe?.user?.id;
      if (currentUserId && ADMIN_IDS.includes(currentUserId)) {
        setIsAdmin(true);
        localStorage.setItem('gogaclo_admin', 'true');
      }
    }

    const tgStartParam = tg?.initDataUnsafe?.start_param;
    const urlParams = new URLSearchParams(window.location.search);
    const browserKey = urlParams.get('key');

    if (tgStartParam === ADMIN_SECRET_KEY || browserKey === ADMIN_SECRET_KEY) {
      setIsAdmin(true);
      localStorage.setItem('gogaclo_admin', 'true');
      alert('Режим администратора активирован!');
    }
  }, []);

  const toggleLike = (productId) => {
    setLikedIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('gogaclo_likes', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
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

  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { ...product, count: 1 }];
    });
    setSelectedProduct(null);
    setShowCart(true);
  };

  const handleUpdateCount = (productId, newCount) => {
    if (newCount <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, count: newCount } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    const tg = window.Telegram?.WebApp;
    const orderData = {
      items: cart.map((i) => ({
        id: i.id,
        title: i.title,
        price: i.price,
        size: i.size,
        count: i.count,
      })),
      totalPrice: cart.reduce((sum, item) => sum + (item.price || 0) * item.count, 0),
    };

    if (tg && tg.sendData) {
      tg.sendData(JSON.stringify(orderData));
      alert('Заказ отправлен боту!');
      setCart([]);
      setShowCart(false);
    } else {
      alert(`Заказ оформлен на сумму ${orderData.totalPrice} ₽!`);
    }
  };

  const displayedProducts = products
    .filter((p) => (activeTab === 'likes' ? likedIds.includes(p.id) : true))
    .filter((p) => (selectedSize ? p.size === selectedSize : true));

  const totalCartCount = cart.reduce((sum, item) => sum + item.count, 0);

  if (showCart) {
    return (
      <CartView
        cart={cart}
        onBack={() => setShowCart(false)}
        onUpdateCount={handleUpdateCount}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetailView
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isLiked={likedIds.includes(selectedProduct.id)}
        onToggleLike={toggleLike}
      />
    );
  }

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

  return (
    <main className="shop-page with-bottom-bar">
      <header className="shop-header">
        <button
          className="brand-button"
          onClick={() => {
            setSelectedCategoryId(null);
            setSelectedSize(null);
          }}
        >
          GOGACLO
        </button>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            className="brand-button"
            onClick={() => setShowCart(true)}
            style={{ fontSize: '14px', padding: '6px 12px' }}
          >
            Корзина {totalCartCount > 0 ? `(${totalCartCount})` : ''}
          </button>

          {isAdmin && (
            <button
              className="admin-button"
              aria-label="Открыть админку"
              onClick={() => setShowAdmin(true)}
            >
              +
            </button>
          )}
        </div>
      </header>

      {/* Экран Главная: баннер и инфо */}
      {activeTab === 'home' && (
        <section className="home-screen">
          <div className="hero">
            <img src="/hero.jpg" alt="Коллекция одежды" />
          </div>
          <div className="home-manifesto">
            <h2>NEW DROP</h2>
            <p>Новая коллекция базовой и уличной одежды. Минимализм, плотные ткани и идеальная посадка.</p>
            <button className="buy-btn" onClick={() => setActiveTab('catalog')}>
              Перейти в каталог →
            </button>
          </div>
        </section>
      )}

      {/* Экран Каталог или Лайки */}
      {activeTab !== 'home' && (
        <>
          {activeTab === 'catalog' && (
            <>
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
            </>
          )}

          {activeTab === 'likes' && (
            <div className="likes-header">
              <h2>ИЗБРАННОЕ ({likedIds.length})</h2>
            </div>
          )}

          <section className="products">
            {displayedProducts.length === 0 ? (
              <p className="empty-message">
                {activeTab === 'likes' ? 'В избранном пока ничего нет' : 'Товаров не найдено'}
              </p>
            ) : (
              displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={(p) => setSelectedProduct(p)}
                  isLiked={likedIds.includes(product.id)}
                  onToggleLike={toggleLike}
                />
              ))
            )}
          </section>
        </>
      )}

      {/* Нижняя панель как на макете */}
      <nav className="bottom-bar">
        <button
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            setSelectedProduct(null);
          }}
        >
          <span className="tab-icon">⌂</span>
          <span className="tab-label">ГЛАВНАЯ</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('catalog');
            setSelectedProduct(null);
          }}
        >
          <span className="tab-icon">▤</span>
          <span className="tab-label">КАТАЛОГ</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('likes');
            setSelectedProduct(null);
          }}
        >
          <span className="tab-icon">♥</span>
          <span className="tab-label">ЛАЙКИ</span>
        </button>
      </nav>
    </main>
  );
}

export default App;
