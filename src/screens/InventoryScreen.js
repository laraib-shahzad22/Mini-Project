
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {colors, cardShadow} from '../theme';
import {
  getProducts,
  changeProductStock,
} from '../database/database';

function getStatus(quantity) {
  if (quantity === 0) {
    return {
      label: 'Out of stock',
      badgeStyle: styles.outBadge,
      textStyle: styles.outText,
    };
  }

  if (quantity <= 5) {
    return {
      label: 'Low stock',
      badgeStyle: styles.lowBadge,
      textStyle: styles.lowText,
    };
  }

  return {
    label: 'In stock',
    badgeStyle: styles.okBadge,
    textStyle: styles.okText,
  };
}

export default function InventoryScreen() {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts();
      setItems(data);
    } catch (error) {
      console.log('Inventory loading error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts]),
  );

  const changeStock = async (id, amount) => {
    try {
      await changeProductStock(id, amount);
      await loadProducts();
    } catch (error) {
      console.log('Stock update error:', error);
    }
  };

  const shown = items.filter(item =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const inStock = items.filter(item => item.quantity > 5).length;

  const low = items.filter(
    item => item.quantity > 0 && item.quantity <= 5,
  ).length;

  const out = items.filter(item => item.quantity === 0).length;

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.muted}>Track and update stock</Text>

      <TextInput
        style={styles.search}
        placeholder="Search inventory"
        placeholderTextColor={colors.muted}
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.muted}>In stock</Text>
          <Text style={styles.summaryValue}>{inStock}</Text>
        </View>

        <View style={[styles.summaryCard, {backgroundColor: colors.peach}]}>
          <Text style={[styles.muted, {color: colors.text}]}>Low</Text>
          <Text style={styles.summaryValue}>{low}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.muted}>Out</Text>
          <Text style={styles.summaryValue}>{out}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={shown}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>No items found</Text>
        }
        renderItem={({item}) => {
          const status = getStatus(item.quantity);

          return (
            <View style={styles.row}>
              <View style={styles.tile}>
                <Text style={styles.emoji}>{item.emoji}</Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>

                <View style={[styles.badge, status.badgeStyle]}>
                  <Text style={[styles.badgeText, status.textStyle]}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <View style={styles.stepper}>
                <TouchableOpacity
                  accessibilityLabel="Decrease stock"
                  style={styles.minus}
                  onPress={() => changeStock(item.id, -1)}>
                  <Text style={styles.minusText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qty}>{item.quantity}</Text>

                <TouchableOpacity
                  accessibilityLabel="Increase stock"
                  style={styles.plus}
                  onPress={() => changeStock(item.id, 1)}>
                  <Text style={styles.plusText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  list: {padding: 18, paddingBottom: 120},
  header: {gap: 12, marginBottom: 14},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted},
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
  summaryRow: {flexDirection: 'row', gap: 10},
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  summaryValue: {fontSize: 24, fontWeight: '800', color: colors.primary},
  empty: {textAlign: 'center', color: colors.muted, marginVertical: 30},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 10,
    marginBottom: 12,
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
  info: {flex: 1, marginLeft: 12, gap: 4},
  name: {fontSize: 14, fontWeight: '800', color: colors.text},
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {fontSize: 11, fontWeight: '800'},
  okBadge: {backgroundColor: '#E6EFD8'},
  okText: {color: '#2F4A12'},
  lowBadge: {backgroundColor: colors.peach},
  lowText: {color: colors.danger},
  outBadge: {backgroundColor: colors.danger},
  outText: {color: colors.white},
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
    minWidth: 26,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
});
