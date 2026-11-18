
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import ProductCard from '../components/ProductCard';
import ProductFormModal from '../components/ProductFormModal';
import {colors} from '../theme';

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../database/database';

const CATEGORIES = [
  'All',
  'Cakes',
  'Cupcakes',
  'Donuts',
  'Bread',
  'Cookies',
  'Pastries',
];

export default function ProductsScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [products, setProducts] = useState([]);

  // Load products whenever this screen becomes active
  const loadProducts = useCallback(async () => {
    try {
      const savedProducts = await getProducts();
      setProducts(savedProducts);
    } catch (error) {
      console.log('Load products error:', error);
      Alert.alert('Error', 'Unable to load products.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  // Search and category filter
  const shown = products.filter(
    p =>
      (category === 'All' || p.category === category) &&
      p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  // Delete product from SQLite
  const handleDelete = product => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete ' + product.name + '?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              await loadProducts();
              Alert.alert('Success', 'Product deleted successfully.');
            } catch (error) {
              console.log('Delete product error:', error);
              Alert.alert('Error', 'Unable to delete product.');
            }
          },
        },
      ],
    );
  };

  // Add or update product in SQLite
  const handleSave = async savedProduct => {
    try {
      if (editing) {
        await updateProduct(editing.id, savedProduct);
      } else {
        await addProduct(savedProduct);
      }

      await loadProducts();

      setFormOpen(false);
      setEditing(null);

      Alert.alert(
        'Success',
        editing
          ? 'Product updated successfully.'
          : 'Product added successfully.',
      );
    } catch (error) {
      console.log('Save product error:', error);
      Alert.alert('Error', 'Unable to save product. Please try again.');
    }
  };

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Products</Text>

      <Text style={styles.muted}>
        {products.length} items in the bakery
      </Text>

      <TextInput
        style={styles.search}
        placeholder="Search products"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map(c => (
          <TouchableOpacity
            key={c}
            style={[styles.chip, category === c && styles.chipOn]}
            onPress={() => setCategory(c)}>
            <Text
              style={[
                styles.chipText,
                category === c && styles.chipTextOn,
              ]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={shown}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>No products found</Text>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditing(null);
              setFormOpen(true);
            }}>
            <Text style={styles.addText}>+ Add new product</Text>
          </TouchableOpacity>
        }
        renderItem={({item}) => (
          <ProductCard
            product={item}
            onEdit={() => {
              setEditing(item);
              setFormOpen(true);
            }}
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <ProductFormModal
        visible={formOpen}
        product={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {padding: 18, paddingBottom: 120},
  columns: {justifyContent: 'space-between'},
  header: {gap: 12, marginBottom: 14},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted, marginTop: -8},
  search: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    fontSize: 14,
    color: colors.text,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  chipTextOn: {color: colors.white},
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginVertical: 30,
  },
  addBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.caramel,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
});
