
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {colors, cardShadow, formatPKR} from '../theme';
import {
  getRecentOrders,
  getDashboardStats,
  getProducts,
} from '../database/database';

export default function DashboardScreen({navigation}) {
const [recent, setRecent] = useState([]);

const [stats, setStats] = useState({
  todaySales: 0,
  todayOrders: 0,
  totalOrders: 0,
  totalProducts: 0,
});

const [lowStock, setLowStock] = useState([]);

  // Load recent orders whenever Dashboard opens
useFocusEffect(
  useCallback(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        const [orders, dashboardStats, products] = await Promise.all([
          getRecentOrders(),
          getDashboardStats(),
          getProducts(),
        ]);

        if (active) {
          setRecent(orders);
          setStats(dashboardStats);

          setLowStock(
            products.filter(
              product =>
                product.quantity <= 5
            ),
          );
        }
      } catch (error) {
        console.log('Dashboard loading error:', error);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []),
);

 const lowStockText =
  lowStock.length > 0
    ? lowStock
        .map(item => `${item.name} (${item.quantity})`)
        .join(', ')
    : 'All products have sufficient stock';
     
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🧁</Text>
          </View>

          <View>
            <Text style={styles.muted}>Good morning, Baker</Text>
            <Text style={styles.title}>SweetCrumbs</Text>
          </View>
        </View>

        <View style={styles.salesCard}>
          <View style={styles.bubbleBig} />
          <View style={styles.bubbleSmall} />

          <Text style={styles.salesLabel}>Today's sales</Text>
         <Text style={styles.salesValue}>
             {formatPKR(stats.todaySales)}
          </Text>
        <Text style={styles.salesLabel}>
            {stats.todayOrders} orders today
        </Text>
        </View>

        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.muted}>Total products</Text>
<Text style={styles.statValue}>{stats.totalProducts}</Text>          </View>

          <View style={styles.statCard}>
            <Text style={styles.muted}>Total orders</Text>
<Text style={styles.statValue}>{stats.totalOrders}</Text>          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertTop}>
            <Text style={styles.alertTitle}>Low-stock alerts</Text>

            <View style={styles.badge}>
<Text style={styles.badgeText}>
  {lowStock.length} items
</Text>
            </View>
          </View>

          <Text style={styles.alertText}>{lowStockText}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.action, {backgroundColor: colors.primary}]}
            onPress={() => navigation.navigate('Order')}>
            <Text style={[styles.actionText, {color: colors.white}]}>
              New order
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.action, {backgroundColor: colors.caramel}]}
            onPress={() => navigation.navigate('Products')}>
            <Text style={styles.actionText}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.action, {backgroundColor: colors.peach}]}
            onPress={() => navigation.navigate('History')}>
            <Text style={styles.actionText}>Sales</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.section}>Recent orders</Text>

        {recent.length === 0 && (
          <Text style={styles.muted}>No orders yet.</Text>
        )}

        {recent.map(o => (
          <View key={o.id} style={styles.orderCard}>
            <View>
              <Text style={styles.orderName}>
                #{o.id} {o.customer || 'Walk-in'}
              </Text>

              <Text style={styles.muted}>
                {new Date(o.created_at).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <Text style={styles.orderAmount}>
              {formatPKR(o.total)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {padding: 18, paddingBottom: 120, gap: 14},
  header: {flexDirection: 'row', alignItems: 'center', gap: 12},
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {fontSize: 26},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted},
  salesCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
  },
  bubbleBig: {
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.caramel,
    opacity: 0.55,
  },
  bubbleSmall: {
    position: 'absolute',
    right: 40,
    bottom: -34,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.blush,
    opacity: 0.4,
  },
  salesLabel: {fontSize: 12, color: colors.peach},
  salesValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    marginVertical: 2,
  },
  row: {flexDirection: 'row', gap: 12},
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  alertCard: {
    backgroundColor: colors.peach,
    borderRadius: 24,
    padding: 14,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.danger,
  },
  alertText: {
    fontSize: 12,
    color: colors.text,
    marginTop: 6,
  },
  action: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  orderName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
