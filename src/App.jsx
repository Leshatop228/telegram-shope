import { useEffect, useState } from 'react';
import './App.css';
import AddProductForm from './AddProductForm.jsx';

const API_URL = '';


const ADMIN_IDS = [817016114, 432903498];

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

function ProductDetailView({ product, onBack, onAddToCart }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const photos = getPhotoList(product.photoUrl);

  return (
    <main className="shop-page">
      <header className="shop-header">
        <button className="brand-button" onClick={onBack}>
          ← Назад
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

        <button
          className="buy-btn"
          onClick={() => {
            onAddToCart(product);
          }}
        >
          Добавить в корзину
        </button>
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const currentUserId = tg.initDataUnsafe?.user?.id;
      if (currentUserId && ADMIN_IDS.includes(currentUserId)) {
        setIsAdmin(true);
      }
    }
  }, []);

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
      alert(`Заказ оформлен на сумму ${orderData.totalPrice} ₽! В браузере отправка в Telegram отключена.`);
    }
  };

  const filteredProducts = selectedSize
    ? products.filter((product) => product.size === selectedSize)
    : products;

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

        <AddProductForm apiUrl={API_URL} initData={window.Telegram?.WebApp?.initData ?? ""}/>

      </main>
    );
  }

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
