
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {colors, cardShadow, formatPKR} from '../theme';
import {
  getAllOrders,
  getDashboardStats,
} from '../database/database';

export default function SalesHistoryScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadHistory = async () => {
        try {
          const [allOrders, stats] = await Promise.all([
            getAllOrders(),
            getDashboardStats(),
          ]);

          if (active) {
            setOrders(allOrders);
            setTodayTotal(stats.todaySales);
            setTodayOrders(stats.todayOrders);
          }
        } catch (error) {
          console.log('Sales history error:', error);
        }
      };

      loadHistory();

      return () => {
        active = false;
      };
    }, []),
  );

  const openOrder = order => {
    navigation.navigate('Receipt', {order});
  };

  const header = (
    <View style={styles.header}>
      <Text style={styles.title}>Sales history</Text>
      <Text style={styles.muted}>Previous orders</Text>

      <View style={styles.totalCard}>
        <View style={styles.bubble} />

        <Text style={styles.totalLabel}>Total sales · Today</Text>
        <Text style={styles.totalValue}>
          {formatPKR(todayTotal)}
        </Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {todayOrders} orders
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <FlatList
        data={orders}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>No orders yet</Text>
        }
        renderItem={({item}) => {
          const itemCount = item.items?.length || 0;

          const orderDate = item.created_at
            ? new Date(item.created_at).toLocaleString([], {
                day: 'numeric',
                month: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })
            : item.date;

          return (
            <View style={styles.row}>
              <View style={{flex: 1}}>
                <Text style={styles.name}>
                  #{item.id} {item.customer || 'Walk-in'}
                </Text>

                <Text style={styles.muted}>
                  {orderDate} · {itemCount}{' '}
                  {itemCount === 1 ? 'item' : 'items'}
                </Text>
              </View>

              <View style={styles.right}>
                <Text style={styles.amount}>
                  {formatPKR(item.total)}
                </Text>

                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => openOrder(item)}>
                  <Text style={styles.detailText}>
                    View details
                  </Text>
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
  header: {gap: 10, marginBottom: 14},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted},
  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    marginTop: 4,
  },
  bubble: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.caramel,
    opacity: 0.55,
  },
  totalLabel: {fontSize: 12, color: colors.peach},
  totalValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    marginVertical: 4,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.caramel,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {fontSize: 11, fontWeight: '800', color: colors.text},
  empty: {textAlign: 'center', color: colors.muted, marginVertical: 30},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  name: {fontSize: 14, fontWeight: '800', color: colors.text},
  right: {alignItems: 'flex-end', gap: 2},
  amount: {fontSize: 14, fontWeight: '800', color: colors.primary},
  detailBtn: {minHeight: 36, justifyContent: 'center'},
  detailText: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: 'underline',
  },
});
