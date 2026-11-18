
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, cardShadow, formatPKR} from '../theme';

export default function ReceiptScreen({navigation, route}) {
  const order = route?.params?.order;

  if (!order) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.content}>
          <Text style={styles.title}>No receipt found</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>Receipt</Text>
          <Text style={styles.muted}>Order saved successfully</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.top}>
            <View style={styles.logo}>
              <Text style={styles.logoEmoji}>🧁</Text>
            </View>

            <Text style={styles.shop}>SweetCrumbs Bakery</Text>

            <Text style={styles.muted}>
              Order #{String(order.id)} · {String(order.date || order.created_at || '')}
            </Text>

            <Text style={styles.muted}>
              Customer: {String(order.customer || 'Walk-in')}
            </Text>
          </View>

          <View style={styles.divider} />

          {(order.items || []).map((it, i) => (
            <View key={i} style={styles.line}>
              <Text style={styles.lineText}>
                {String(it.name)} x{String(it.qty)}
              </Text>

              <Text style={styles.lineText}>
                {formatPKR(Number(it.total) || 0)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.line}>
            <Text style={styles.lineText}>Subtotal</Text>
            <Text style={styles.lineText}>
              {formatPKR(Number(order.subtotal) || 0)}
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineText}>Discount</Text>
            <Text style={styles.lineText}>
              − {formatPKR(Number(order.discount) || 0)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.line}>
            <Text style={styles.grand}>Grand total</Text>
            <Text style={styles.grand}>
              {formatPKR(Number(order.total) || 0)}
            </Text>
          </View>

          <Text style={styles.thanks}>
            Thank you for visiting!
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, {backgroundColor: colors.caramel}]}
          onPress={() =>
            Alert.alert('Share', 'Optional: share the receipt')
          }>
          <Text style={[styles.buttonText, {color: colors.text}]}>
            Share receipt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Tabs')}>
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.cream},
  content: {padding: 18, paddingBottom: 40, gap: 14},
  title: {fontSize: 26, fontWeight: '800', color: colors.primary},
  muted: {fontSize: 12, color: colors.muted},
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  top: {alignItems: 'center', gap: 2},
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoEmoji: {fontSize: 26},
  shop: {fontSize: 18, fontWeight: '800', color: colors.text},
  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C9A98F',
    marginVertical: 12,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  lineText: {fontSize: 14, color: colors.text},
  grand: {fontSize: 20, fontWeight: '800', color: colors.primary},
  thanks: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
    marginTop: 14,
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
