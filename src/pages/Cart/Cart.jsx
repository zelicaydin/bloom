import { useCart } from '../../store/CartContext';
import { useProducts } from '../../store/ProductsContext';
import QuantityPicker from '../../components/ui/QuantityPicker';

const Cart = ({ navigate }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { products } = useProducts();

  // Get full product details for cart items
  const getProductDetails = (item) => {
    return products.find((p) => p.id === item.id) || item;
  };

  if (cartItems.length === 0) {
    return (
      <section style={styles.container}>
        <h1 style={styles.title}>Cart</h1>
        <div style={styles.emptyCart}>
          <div style={styles.emptyIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.6 13.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
          </div>
          <p style={styles.emptyText}>Your cart is empty</p>
          <button
            onClick={() => navigate('/catalogue')}
            style={styles.shopButton}
          >
            Continue Shopping
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.container}>
      <h1 style={styles.title}>Cart</h1>

      <div style={styles.table}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.columnProduct}>Product</div>
          <div style={styles.columnQuantity}>Quantity</div>
          <div style={styles.columnTotal}>Total</div>
        </div>

        {/* Items */}
        {cartItems.map((item, index) => {
          const product = getProductDetails(item);
          const itemTotal = product.price * item.quantity;
          const isLastItem = index === cartItems.length - 1;

          return (
            <div key={item.id} style={{
              ...styles.row,
              borderBottom: isLastItem ? 'none' : '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={styles.columnProduct}>
                <h3 style={styles.productName}>{product.name}</h3>
                <p style={styles.productDescription}>
                  {product.brand} • {product.type}
                </p>
                <p style={styles.productPrice}>${product.price}</p>
              </div>

              <div style={styles.columnQuantity}>
                <QuantityPicker
                  value={item.quantity}
                  onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                  onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                />
              </div>

              <div style={styles.columnTotal}>
                <p style={styles.totalPrice}>${itemTotal.toFixed(2)}</p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={styles.removeButton}
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <div style={styles.footer}>
        <div style={styles.grandTotal}>
          <p style={styles.grandTotalLabel}>Grand Total:</p>
          <p style={styles.grandTotalAmount}>${getCartTotal().toFixed(2)}</p>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          style={styles.checkoutButton}
        >
          Checkout
        </button>
      </div>
    </section>
  );
};

const styles = {
  container: {
    paddingTop: '160px',
    paddingInline: '80px',
    paddingBottom: '80px',
    backgroundColor: '#141414',
    color: '#fff',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#fff',
    marginBottom: '60px',
    letterSpacing: '-0.04em',
  },
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 0',
    gap: '32px',
  },
  emptyIcon: {
    color: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  shopButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 24px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 0,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '40px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '32px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '40px',
    padding: '32px 0',
    alignItems: 'center',
  },
  columnProduct: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  columnQuantity: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  columnTotal: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '12px',
  },
  productName: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  productDescription: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  productPrice: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  totalPrice: {
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  removeButton: {
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '6px 12px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  footer: {
    marginTop: '60px',
    paddingTop: '40px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotal: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  grandTotalLabel: {
    fontSize: '1.2rem',
    color: 'rgba(255,255,255,0.8)',
    margin: 0,
    fontWeight: 500,
  },
  grandTotalAmount: {
    fontSize: '1.8rem',
    fontWeight: 600,
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  checkoutButton: {
    background: '#fff',
    color: '#000',
    border: 'none',
    padding: '14px 32px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    borderRadius: 0,
  },
};

export default Cart;
