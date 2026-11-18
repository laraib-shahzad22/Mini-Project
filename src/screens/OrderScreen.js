
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {colors, cardShadow, formatPKR} from '../theme';
import {
  saveOrder,
  getProducts,
  changeProductStock,
} from '../database/database';

export default function OrderScreen({navigation}) {
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState('');
  const [discount, setDiscount] = useState('');
  const [cart, setCart] = useState({});
  const [saving, setSaving] = useState(false);

  // Load products from SQLite
  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadProducts = async () => {
        try {
          const data = await getProducts();

          if (active) {
            setProducts(data);
          }
        } catch (error) {
          console.log('Order products loading error:', error);
        }
      };

      loadProducts();

      return () => {
        active = false;
      };
    }, []),
  );

  // Get product quantity
  const qtyOf = product => cart[product.id] || 0;

  // Increase quantity
  const increase = product => {
    setCart(prev => {
      const currentQty = prev[product.id] || 0;

      if (currentQty >= product.quantity) {
        Alert.alert('Stock limit', 'No more stock available!');
        return prev;
      }

      return {
        ...prev,
        [product.id]: currentQty + 1,
      };
    });
  };

  // Decrease quantity
  const decrease = product => {
    setCart(prev => {
      const currentQty = prev[product.id] || 0;

      if (currentQty <= 1) {
        const updatedCart = {...prev};
        delete updatedCart[product.id];
        return updatedCart;
      }

      return {
        ...prev,
        [product.id]: currentQty - 1,
      };
    });
  };

  // Calculate subtotal
  const subtotal = products.reduce((sum, product) => {
    return sum + Number(product.price) * qtyOf(product);
  }, 0);

  // Calculate discount
  const discountAmount = Math.min(
    Math.max(0, Number(discount) || 0),
    subtotal,
  );

  // Calculate total
  const total = subtotal - discountAmount;

  // Generate bill
  const handleGenerateBill = async () => {
    if (saving) {
      return;
    }

    const selectedProducts = products.filter(
      product => qtyOf(product) > 0,
    );

    if (selectedProducts.length === 0) {
      Alert.alert('Empty order', 'Please select at least one product.');
      return;
    }

    // Check available stock again
    const insufficient = selectedProducts.find(
      product => qtyOf(product) > product.quantity,
    );

    if (insufficient) {
      Alert.alert(
        'Stock limit',
        `${insufficient.name} does not have enough stock.`,
      );
      return;
    }

    const items = selectedProducts.map(product => ({
      name: product.name,
      qty: qtyOf(product),
      total: Number(product.price) * qtyOf(product),
    }));

    const order = {
      id: Date.now().toString().slice(-6),
      date: new Date().toLocaleString(),
      customer: customer.trim(),
      items,
      subtotal,
      discount: discountAmount,
      total,
    };

    try {
      setSaving(true);

      // Save order in SQLite
      await saveOrder(order);

      // Reduce stock in SQLite
      for (const product of selectedProducts) {
        await changeProductStock(
          product.id,
          -qtyOf(product),
        );
      }

      setCart({});
      setCustomer('');
      setDiscount('');

      navigation.navigate('Receipt', {order});
    } catch (error) {
      console.log('Order save error:', error);

      Alert.alert(
        'Save failed',
        'Unable to complete your order. Please check the database.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">

        <View>
          <Text style={styles.title}>New order</Text>
          <Text style={styles.muted}>
            Select products and quantities
          </Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Customer name (optional)"
          placeholderTextColor={colors.muted}
          value={customer}
          onChangeText={setCustomer}
        />

        {products.map(p => (
          <View key={p.id} style={styles.row}>
            <View style={styles.tile}>
              <Text style={styles.emoji}>{p.emoji || '🍰'}</Text>
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>{p.name}</Text>

              <Text style={styles.muted}>
                {formatPKR(Number(p.price))} each · {p.quantity} in stock
              </Text>
            </View>

            <View style={styles.stepper}>
              <TouchableOpacity
                accessibilityLabel={'Remove one ' + p.name}
                style={styles.minus}
                onPress={() => decrease(p)}>
                <Text style={styles.minusText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.qty}>{qtyOf(p)}</Text>

              <TouchableOpacity
                accessibilityLabel={'Add one ' + p.name}
                style={styles.plus}
                onPress={() => increase(p)}
                disabled={p.quantity <= 0}>
                <Text style={styles.plusText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {products.length === 0 && (
          <Text style={styles.muted}>
            No products available. Please add products first.
          </Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Discount (PKR)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={discount}
          onChangeText={setDiscount}
        />

        <View style={styles.summary}>
          <View style={styles.line}>
            <Text style={styles.lineText}>Subtotal</Text>
            <Text style={styles.lineText}>
              {formatPKR(subtotal)}
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineText}>Discount</Text>
            <Text style={styles.lineText}>
              − {formatPKR(discountAmount)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.line}>
            <Text style={styles.totalText}>Final amount</Text>
            <Text style={styles.totalText}>
              {formatPKR(total)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerateBill}
          disabled={saving || products.length === 0}>
          <Text style={styles.buttonText}>
            {saving ? 'Saving order...' : 'Generate bill'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {padding: 18, paddingBottom: 120, gap: 12},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted},
  input: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    fontSize: 14,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  tile: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFE3CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {fontSize: 28},
  info: {flex: 1, marginLeft: 12},
  name: {fontSize: 14, fontWeight: '800', color: colors.text},
  stepper: {flexDirection: 'row', alignItems: 'center', gap: 8},
  minus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusText: {fontSize: 20, fontWeight: '800', color: colors.text},
  plus: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {fontSize: 20, fontWeight: '800', color: colors.white},
  qty: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  lineText: {fontSize: 14, color: colors.text},
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C9A98F',
    marginVertical: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...cardShadow,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
});
